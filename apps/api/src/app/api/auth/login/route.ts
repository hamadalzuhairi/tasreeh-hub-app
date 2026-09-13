import type { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { ApiHttpError, handleRouteError, ok } from "@/lib/http/respond";
import { serializeUser } from "@/lib/serializers";
import type { AuthResult } from "@tasreeh/shared";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ApiHttpError(400, "invalid_input", "الرجاء إدخال البريد الإلكتروني وكلمة المرور");
    }
    const { email, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiHttpError(401, "invalid_credentials", "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }

    const token = signToken({ sub: user.id, role: user.role, departmentId: user.departmentId });

    return ok<AuthResult>({ user: serializeUser(user), token });
  } catch (error) {
    return handleRouteError(error);
  }
}
