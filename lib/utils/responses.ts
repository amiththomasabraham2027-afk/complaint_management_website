import { ApiResponse } from "@/types";

export function successResponse<T = any>(
  message: string,
  data?: T,
  statusCode: number = 200
): { response: ApiResponse<T>; status: number } {
  return {
    response: {
      success: true,
      message,
      data,
    },
    status: statusCode,
  };
}

export function errorResponse(
  message: string,
  error?: string,
  statusCode: number = 400
): { response: ApiResponse; status: number } {
  return {
    response: {
      success: false,
      message,
      error,
    },
    status: statusCode,
  };
}

export function notFoundResponse(resource: string = "Resource") {
  return errorResponse(`${resource} not found`, undefined, 404);
}

export function unauthorizedResponse(message: string = "Unauthorized access") {
  return errorResponse(message, undefined, 401);
}

export function forbiddenResponse(message: string = "Access forbidden") {
  return errorResponse(message, undefined, 403);
}

export function validationErrorResponse(error: string) {
  return errorResponse("Validation failed", error, 422);
}

export function internalServerErrorResponse() {
  return errorResponse(
    "Internal server error",
    "An unexpected error occurred",
    500
  );
}
