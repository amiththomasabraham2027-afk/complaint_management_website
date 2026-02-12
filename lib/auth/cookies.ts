import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function extractTokenFromHeader(
  request: NextRequest
): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export function extractTokenFromCookie(
  request: NextRequest
): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split("; ");
  const authCookie = cookies.find((c) => c.startsWith("authToken="));
  
  if (!authCookie) return null;
  return authCookie.substring(10);
}

export async function validateToken(request: NextRequest) {
  const token = extractTokenFromHeader(request) || extractTokenFromCookie(request);
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  return payload;
}

export function setAuthCookie(token: string): string {
  return `authToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`;
}

export function clearAuthCookie(): string {
  return `authToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}
