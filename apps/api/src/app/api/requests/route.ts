import type { NextRequest } from "next/server";
import { z } from "zod";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { departments, requestTimelineEvents, requests, users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { ApiHttpError, handleRouteError, ok } from "@/lib/http/respond";
import { serializeRequest } from "@/lib/serializers";
import { classifyRequest } from "@/lib/classification/classify";
import { computeSlaDueAt } from "@/lib/sla/compute";
import { createNotification } from "@/lib/notifications/create";
import { GENERAL_DEPARTMENT_NAME_AR, type MediaRequest } from "@tasreeh/shared";

// Reads auth headers per request; never prerender at build time.
export const dynamic = "force-dynamic";

const createSchema = z.object({
  type: z.enum(["statement", "inquiry", "interview", "other"]),
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) {
      throw new ApiHttpError(400, "invalid_input", parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
    }
    const { type, subject, body } = parsed.data;

    const allDepartments = await db.select().from(departments);
    const generalDept =
      allDepartments.find((d) => d.nameAr === GENERAL_DEPARTMENT_NAME_AR) ?? allDepartments[0];
    if (!generalDept) {
      throw new ApiHttpError(500, "no_departments", "لا توجد جهات مسجلة في النظام بعد");
    }

    const classification = await classifyRequest(
      {
        subject,
        body,
        userSelectedType: type,
        departments: allDepartments.map((d) => ({ id: d.id, nameAr: d.nameAr })),
      },
      generalDept.id
    );

    const targetDepartment =
      allDepartments.find((d) => d.id === classification.departmentId) ?? generalDept;

    const now = new Date();
    const slaDueAt = computeSlaDueAt(now, classification.type, targetDepartment.slaTargetHours);

    const [created] = await db
      .insert(requests)
      .values({
        requesterId: auth.sub,
        departmentId: targetDepartment.id,
        type: classification.type,
        subject,
        body,
        status: "routed",
        classificationConfidence: classification.confidence.toString(),
        classificationRaw: classification,
        slaDueAt,
      })
      .returning();

    await db.insert(requestTimelineEvents).values([
      { requestId: created.id, eventType: "submitted", actorId: auth.sub },
      { requestId: created.id, eventType: "routed", actorId: null },
    ]);

    const spokespeople = await db
      .select()
      .from(users)
      .where(and(eq(users.departmentId, targetDepartment.id), eq(users.role, "spokesperson")));

    for (const spokesperson of spokespeople) {
      await createNotification({
        userId: spokesperson.id,
        type: "general",
        title: "طلب إعلامي جديد",
        body: `تم توجيه الطلب #${created.requestNumber} إليك: ${subject}`,
        requestId: created.id,
      });
    }

    return ok<MediaRequest>(
      serializeRequest(created, { department: targetDepartment }),
      201
    );
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const conditions = [];

    if (auth.role === "journalist") {
      conditions.push(eq(requests.requesterId, auth.sub));
    } else if (auth.role === "spokesperson") {
      if (!auth.departmentId) {
        return ok<MediaRequest[]>([]);
      }
      conditions.push(eq(requests.departmentId, auth.departmentId));
    }
    // admin: no scoping, sees all

    if (status === "in_progress") {
      conditions.push(
        or(eq(requests.status, "in_progress"), eq(requests.status, "awaiting_reply"), eq(requests.status, "routed"))
      );
    } else if (status === "closed") {
      conditions.push(eq(requests.status, "closed"));
    }

    if (search) {
      conditions.push(
        or(ilike(requests.subject, `%${search}%`), ilike(requests.body, `%${search}%`))
      );
    }

    const rows = await db
      .select()
      .from(requests)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(requests.createdAt))
      .limit(200);

    const departmentIds = [...new Set(rows.map((r) => r.departmentId).filter(Boolean))] as string[];
    const departmentRows = departmentIds.length
      ? await db.select().from(departments)
      : [];
    const departmentMap = new Map(departmentRows.map((d) => [d.id, d]));

    return ok<MediaRequest[]>(
      rows.map((row) =>
        serializeRequest(row, {
          department: row.departmentId ? departmentMap.get(row.departmentId) ?? null : null,
        })
      )
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
