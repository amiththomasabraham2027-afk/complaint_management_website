import jwt from "jsonwebtoken";
import { JwtPayload } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export function generateToken(payload: Omit<JwtPayload, "iat" | "exp">) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}
