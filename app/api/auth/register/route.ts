import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { z } from "zod";

// Validation schema for API request (without confirmPassword)
const ApiRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
    const validatedData = ApiRegisterSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
          error: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: "user",
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          userId: user._id,
          email: user.email,
          name: user.name,
          token,
        },
      },
      { status: 201 }
    );

    response.cookies.set("authToken", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);

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
        message: "Registration failed",
        error: error.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

export const POST = handler;
