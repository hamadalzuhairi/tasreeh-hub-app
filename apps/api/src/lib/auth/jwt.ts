import jwt from "jsonwebtoken";
import { JWT_EXPIRY, type Role } from "@tasreeh/shared";

export interface JwtPayload {
  sub: string;
  role: Role;
  departmentId: string | null;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
