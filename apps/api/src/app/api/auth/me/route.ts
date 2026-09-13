import type { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { ApiHttpError, handleRouteError, ok } from "@/lib/http/respond";
import { serializeUser } from "@/lib/serializers";
import type { User } from "@tasreeh/shared";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
    if (!user) throw new ApiHttpError(404, "not_found", "المستخدم غير موجود");
    return ok<User>(serializeUser(user));
  } catch (error) {
    return handleRouteError(error);
  }
}

// Nafath integration is mocked for the MVP: this just flips a boolean flag, standing in for
// a real Nafath identity-verification round trip.
const MAX_AVATAR_CHARS = 400_000; // ~300KB of image data once base64-decoded

const patchSchema = z
  .object({
    nafathVerified: z.boolean().optional(),
    avatarUrl: z
      .string()
      .max(MAX_AVATAR_CHARS, "الصورة كبيرة جداً")
      .refine((v) => /^data:image\/(jpeg|png|webp);base64,/.test(v), "صيغة الصورة غير مدعومة")
      .nullable()
      .optional(),
  })
  .refine((v) => v.nafathVerified !== undefined || v.avatarUrl !== undefined, "لا توجد بيانات للتحديث");

export async function PATCH(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ApiHttpError(400, "invalid_input", parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
    }

    const { nafathVerified, avatarUrl } = parsed.data;
    const [updated] = await db
      .update(users)
      .set({
        ...(nafathVerified !== undefined ? { nafathVerified } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      })
      .where(eq(users.id, auth.sub))
      .returning();

    return ok<User>(serializeUser(updated));
  } catch (error) {
    return handleRouteError(error);
  }
}
