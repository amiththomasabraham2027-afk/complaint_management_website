import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { Complaint } from "@/models/Complaint";
import { validateToken } from "@/lib/auth/cookies";
import { UpdateComplaintStatusSchema, AddAdminNotesSchema } from "@/lib/validation/schemas";
import { UserRole } from "@/types";

async function handler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (request.method === "GET") {
    try {
      await connectDB();

      const user = await validateToken(request);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      const complaint = await Complaint.findById(id).populate("userId", "name email");

      if (!complaint) {
        return NextResponse.json(
          { success: false, message: "Complaint not found" },
          { status: 404 }
        );
      }

      // Check authorization
      if (
        user.role !== UserRole.ADMIN &&
        complaint.userId._id.toString() !== user.userId
      ) {
        return NextResponse.json(
          { success: false, message: "Access forbidden" },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Complaint fetched successfully",
        data: complaint,
      });
    } catch (error: any) {
      console.error("Fetch complaint error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch complaint",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  if (request.method === "PUT") {
    try {
      await connectDB();

      const user = await validateToken(request);
      if (!user || user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Access forbidden" },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = UpdateComplaintStatusSchema.parse(body);

      const complaint = await Complaint.findByIdAndUpdate(
        id,
        { status: validatedData.status },
        { new: true, runValidators: true }
      );

      if (!complaint) {
        return NextResponse.json(
          { success: false, message: "Complaint not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Complaint status updated successfully",
        data: complaint,
      });
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

      console.error("Update complaint error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update complaint",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  if (request.method === "PATCH") {
    try {
      await connectDB();

      const user = await validateToken(request);
      if (!user || user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Access forbidden" },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validatedData = AddAdminNotesSchema.parse(body);

      const complaint = await Complaint.findByIdAndUpdate(
        id,
        { adminNotes: validatedData.adminNotes },
        { new: true, runValidators: true }
      );

      if (!complaint) {
        return NextResponse.json(
          { success: false, message: "Complaint not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Admin notes updated successfully",
        data: complaint,
      });
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

      console.error("Update admin notes error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update admin notes",
          error: error.message,
        },
        { status: 500 }
      );
    }
  }

  if (request.method === "DELETE") {
    try {
      await connectDB();

      const user = await validateToken(request);
      if (!user || user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Access forbidden" },
          { status: 403 }
        );
      }

      const complaint = await Complaint.findByIdAndDelete(id);

      if (!complaint) {
        return NextResponse.json(
          { success: false, message: "Complaint not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Complaint deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete complaint error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete complaint",
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

export const GET = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
