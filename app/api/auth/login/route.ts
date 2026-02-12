import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/models/User";
import { comparePasswords } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";

// Validation schema for login
const ApiLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

async function handler(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.json(
      { success: false, message: "Method not allowed" },
      { status: 405 }
    );
  }

  try {
    // Connect to database
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

    const body = await request.json();
    
    // Validate request body
    const validatedData = ApiLoginSchema.parse(body);

    // Find user
    const user = await User.findOne({ email: validatedData.email }).select("+password");
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
          error: "Email or password is incorrect",
        },
        { status: 401 }
      );
    }

    // Compare password
    const isPasswordValid = await comparePasswords(
      validatedData.password,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
          error: "Email or password is incorrect",
        },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          token,
        },
      },
      { status: 200 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: error.errors[0]?.message || "Invalid input",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export const POST = handler;
