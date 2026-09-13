import type { NextRequest } from "next/server";
import { and, eq, lt, ne } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { requests } from "@/lib/db/schema";
import { createEscalation } from "@/lib/sla/escalate";
import { ApiHttpError, handleRouteError, ok } from "@/lib/http/respond";

// Called by Vercel Cron (see vercel.json) or manually during a demo to force an
// overdue-request sweep without waiting on real cron timing.
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    const header = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");
    if (secret && header !== secret) {
      throw new ApiHttpError(401, "unauthorized", "غير مصرح بتشغيل هذه المهمة");
    }

    const overdue = await db
      .select()
      .from(requests)
      .where(
        and(
          ne(requests.status, "closed"),
          eq(requests.isOverdueEscalated, false),
          lt(requests.slaDueAt, new Date())
        )
      );

    for (const request of overdue) {
      await createEscalation({
        requestId: request.id,
        escalatedBy: null,
        reason: "تجاوز الطلب المدة المحددة للرد (SLA) دون رد",
      });
    }

    return ok({ escalatedCount: overdue.length });
  } catch (error) {
    return handleRouteError(error);
  }
}
