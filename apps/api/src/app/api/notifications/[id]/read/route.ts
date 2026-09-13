import type { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { handleRouteError, ok } from "@/lib/http/respond";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, params.id), eq(notifications.userId, auth.sub)));
    return ok({ read: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
