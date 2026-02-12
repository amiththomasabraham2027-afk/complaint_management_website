import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Complaint } from "@/models/Complaint";
import { ComplaintSchema } from "@/lib/validation/schemas";
import { validateToken } from "@/lib/auth/cookies";
import { withErrorHandling } from "@/lib/middleware/api";

async function handler(request: NextRequest) {
  if (request.method === "GET") {
    try {
      // Connect to MongoDB
      try {
        await connectDB();
      } catch (dbError: any) {
        console.error("MongoDB connection error:", dbError.message);
        return NextResponse.json(
          {
            success: false,
            message: "Database connection failed",
            error: dbError.message,
          },
          { status: 503 }
        );
      }

      // Validate user
      const user = await validateToken(request);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      // Parse query parameters
      const { searchParams } = new URL(request.url);
      const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
      const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
      const status = searchParams.get("status");
      const priority = searchParams.get("priority");
      const category = searchParams.get("category");
      const search = searchParams.get("search");

      const skip = (page - 1) * limit;

      let query: any = {};
      
      // Role-based filtering
      if (user.role === "user") {
        query.userId = user.userId;
      }

      // Add optional filters
      if (status && status !== "all") query.status = status;
      if (priority && priority !== "all") query.priority = priority;
      if (category && category !== "all") query.category = category;
      if (search && search.trim()) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Fetch complaints
      const complaints = await Complaint.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();
      
      const total = await Complaint.countDocuments(query);

      return NextResponse.json({
        success: true,
        message: "Complaints fetched successfully",
        data: {
          complaints,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error: any) {
      console.error("Fetch complaints error:", error.message || error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch complaints",
          error: error.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  if (request.method === "POST") {
    try {
      await connectDB();

      const user = await validateToken(request);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const body = await request.json();
      const validatedData = ComplaintSchema.parse(body);

      const complaint = await Complaint.create({
        ...validatedData,
        userId: user.userId,
        status: "Pending",
      });

      return NextResponse.json(
        {
          success: true,
          message: "Complaint submitted successfully",
          data: complaint,
        },
        { status: 201 }
      );
    } catch (error: any) {
      if (error.errors) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: error.errors[0]?.message,
          },
          { status: 422 }
        );
      }

      console.error("Create complaint error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create complaint",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { success: false, message: "Method not allowed" },
    { status: 405 }
  );
}

export const GET = withErrorHandling(handler);
export const POST = withErrorHandling(handler);
