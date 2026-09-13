import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { escalations, requestTimelineEvents, requests, users } from "../db/schema";
import { createNotification } from "../notifications/create";
import { ApiHttpError } from "../http/respond";

export async function createEscalation(params: {
  requestId: string;
  escalatedBy: string | null;
  reason?: string;
}) {
  const [request] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, params.requestId))
    .limit(1);

  if (!request) {
    throw new ApiHttpError(404, "not_found", "الطلب غير موجود");
  }

  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (!admin) {
    throw new ApiHttpError(500, "no_admin", "لا يوجد مشرف لتصعيد الطلب إليه");
  }

  await db.insert(escalations).values({
    requestId: request.id,
    escalatedBy: params.escalatedBy,
    escalatedTo: admin.id,
    reason: params.reason ?? null,
  });

  await db
    .update(requests)
    .set({ priority: "urgent", isOverdueEscalated: true, updatedAt: new Date() })
    .where(eq(requests.id, request.id));

  await db.insert(requestTimelineEvents).values({
    requestId: request.id,
    eventType: "escalated",
    actorId: params.escalatedBy,
    note: params.reason ?? null,
  });

  await createNotification({
    userId: admin.id,
    type: "urgent_overdue",
    title: "طلب متأخر يحتاج تصعيد",
    body: `الطلب #${request.requestNumber} تجاوز المدة المحددة للرد (SLA)`,
    requestId: request.id,
  });

  if (request.departmentId) {
    const spokespeople = await db
      .select()
      .from(users)
      .where(
        and(eq(users.departmentId, request.departmentId), eq(users.role, "spokesperson"))
      );

    for (const spokesperson of spokespeople) {
      await createNotification({
        userId: spokesperson.id,
        type: "urgent_overdue",
        title: "طلب متأخر",
        body: `الطلب #${request.requestNumber} تم تصعيده لتجاوزه المدة المحددة للرد`,
        requestId: request.id,
      });
    }
  }
}
