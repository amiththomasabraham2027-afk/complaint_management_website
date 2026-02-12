import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "@/lib/auth/cookies";
import { UserRole } from "@/types";

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  const user = await validateToken(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", error: "Invalid or missing token" },
      { status: 401 }
    );
  }

  return handler(request, user);
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  const user = await validateToken(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", error: "Invalid or missing token" },
      { status: 401 }
    );
  }

  if (user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { success: false, message: "Access forbidden", error: "Admin access required" },
      { status: 403 }
    );
  }

  return handler(request, user);
}

export function withErrorHandling(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      return await handler(request);
    } catch (error: any) {
      console.error("API Error:", error);

      if (error.name === "ValidationError") {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            error: error.message,
          },
          { status: 422 }
        );
      }

      if (error.name === "MongoError" || error.name === "MongooseError") {
        return NextResponse.json(
          {
            success: false,
            message: "Database error",
            error: error.message,
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Internal server error",
          error: error.message || "Unknown error occurred",
        },
        { status: 500 }
      );
    }
  };
}
