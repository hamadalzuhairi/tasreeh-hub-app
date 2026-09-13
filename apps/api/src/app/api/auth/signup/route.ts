import type { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { ApiHttpError, handleRouteError, ok } from "@/lib/http/respond";
import { serializeUser } from "@/lib/serializers";
import type { AuthResult } from "@tasreeh/shared";

const bodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  organization: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ApiHttpError(400, "invalid_input", parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
    }
    const { name, email, password, organization, phone } = parsed.data;

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      throw new ApiHttpError(409, "email_taken", "البريد الإلكتروني مستخدم مسبقاً");
    }

    const passwordHash = await hashPassword(password);

    // Self-signup is journalist-only; spokesperson/admin accounts are seeded only.
    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "journalist",
        organization,
        phone,
      })
      .returning();

    const token = signToken({ sub: created.id, role: created.role, departmentId: created.departmentId });

    return ok<AuthResult>({ user: serializeUser(created), token }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
