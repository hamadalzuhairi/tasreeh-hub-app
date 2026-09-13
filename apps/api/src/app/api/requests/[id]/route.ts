import type { NextRequest } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  departments,
  requestAttachments,
  requestTimelineEvents,
  requests,
} from "@/lib/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/middleware";
import { ApiHttpError, handleRouteError, ok } from "@/lib/http/respond";
import { serializeRequest } from "@/lib/serializers";
import { createNotification } from "@/lib/notifications/create";
import { REQUEST_STATUS_LABELS_AR, type MediaRequest } from "@tasreeh/shared";

async function loadRequestOr404(id: string) {
  const [request] = await db.select().from(requests).where(eq(requests.id, id)).limit(1);
  if (!request) throw new ApiHttpError(404, "not_found", "الطلب غير موجود");
  return request;
}

function assertCanView(auth: ReturnType<typeof requireAuth>, request: Awaited<ReturnType<typeof loadRequestOr404>>) {
  if (auth.role === "admin") return;
  // Archived requests form the shared, searchable knowledge base, so any signed-in user may read them.
  if (request.isArchived) return;
  if (auth.role === "journalist" && request.requesterId === auth.sub) return;
  if (auth.role === "spokesperson" && request.departmentId === auth.departmentId) return;
  throw new ApiHttpError(403, "forbidden", "لا تملك صلاحية عرض هذا الطلب");
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    const request = await loadRequestOr404(params.id);
    assertCanView(auth, request);

    const [department, timeline, attachments] = await Promise.all([
      request.departmentId
        ? db.select().from(departments).where(eq(departments.id, request.departmentId)).limit(1)
        : Promise.resolve([]),
      db
        .select()
        .from(requestTimelineEvents)
        .where(eq(requestTimelineEvents.requestId, request.id))
        .orderBy(asc(requestTimelineEvents.createdAt)),
      db
        .select()
        .from(requestAttachments)
        .where(eq(requestAttachments.requestId, request.id)),
    ]);

    return ok<MediaRequest>(
      serializeRequest(request, {
        department: department[0] ?? null,
        timeline,
        attachments,
      })
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

const patchSchema = z.object({
  status: z.enum(["submitted", "routed", "in_progress", "awaiting_reply", "closed"]),
  note: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    requireRole(auth, ["spokesperson", "admin"]);

    const request = await loadRequestOr404(params.id);
    if (auth.role === "spokesperson" && request.departmentId !== auth.departmentId) {
      throw new ApiHttpError(403, "forbidden", "لا تملك صلاحية تحديث هذا الطلب");
    }

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ApiHttpError(400, "invalid_input", "بيانات غير صالحة");
    }
    const { status, note } = parsed.data;

    const now = new Date();
    const isClosing = status === "closed";

    const [updated] = await db
      .update(requests)
      .set({
        status,
        updatedAt: now,
        respondedAt: request.respondedAt ?? (status !== "submitted" && status !== "routed" ? now : request.respondedAt),
        closedAt: isClosing ? now : request.closedAt,
        isArchived: isClosing ? true : request.isArchived,
      })
      .where(eq(requests.id, request.id))
      .returning();

    await db.insert(requestTimelineEvents).values({
      requestId: request.id,
      eventType: status,
      actorId: auth.sub,
      note: note ?? null,
    });

    await createNotification({
      userId: request.requesterId,
      type: "status_update",
      title: "تحديث حالة طلبك",
      body: `طلبك #${request.requestNumber} أصبح الآن: ${REQUEST_STATUS_LABELS_AR[status]}`,
      requestId: request.id,
    });

    return ok<MediaRequest>(serializeRequest(updated));
  } catch (error) {
    return handleRouteError(error);
  }
}
