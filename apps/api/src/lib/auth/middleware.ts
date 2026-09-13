import type { NextRequest } from "next/server";
import type { Role } from "@tasreeh/shared";
import { ApiHttpError } from "../http/respond";
import { verifyToken, type JwtPayload } from "./jwt";

export function requireAuth(req: NextRequest): JwtPayload {
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiHttpError(401, "unauthorized", "الرجاء تسجيل الدخول");
  }

  try {
    return verifyToken(token);
  } catch {
    throw new ApiHttpError(401, "unauthorized", "جلسة الدخول غير صالحة أو منتهية");
  }
}

export function requireRole(user: JwtPayload, roles: Role[]): void {
  if (!roles.includes(user.role)) {
    throw new ApiHttpError(403, "forbidden", "لا تملك صلاحية القيام بهذا الإجراء");
  }
}
