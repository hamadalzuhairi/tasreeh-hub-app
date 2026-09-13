import type { NextRequest } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { handleRouteError, ok } from "@/lib/http/respond";
import { serializeNotification } from "@/lib/serializers";
import type { Notification } from "@tasreeh/shared";

// Reads auth headers per request; never prerender at build time.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // all | important | alerts | updates

    const conditions = [eq(notifications.userId, auth.sub)];
    if (filter === "important") {
      conditions.push(eq(notifications.type, "urgent_overdue"));
    } else if (filter === "alerts") {
      conditions.push(eq(notifications.type, "general"));
    } else if (filter === "updates") {
      conditions.push(eq(notifications.type, "status_update"));
    }

    const rows = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    return ok<Notification[]>(rows.map(serializeNotification));
  } catch (error) {
    return handleRouteError(error);
  }
}
