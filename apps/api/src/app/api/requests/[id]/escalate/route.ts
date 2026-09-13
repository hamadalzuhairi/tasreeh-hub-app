import type { NextRequest } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { requests } from "@/lib/db/schema";
import { requireAuth, requireRole } from "@/lib/auth/middleware";
import { ApiHttpError, handleRouteError, ok } from "@/lib/http/respond";
import { createEscalation } from "@/lib/sla/escalate";

const bodySchema = z.object({ reason: z.string().max(500).optional() });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireAuth(req);
    requireRole(auth, ["spokesperson", "admin"]);

    const [request] = await db.select().from(requests).where(eq(requests.id, params.id)).limit(1);
    if (!request) throw new ApiHttpError(404, "not_found", "الطلب غير موجود");

    if (auth.role === "spokesperson" && request.departmentId !== auth.departmentId) {
      throw new ApiHttpError(403, "forbidden", "لا تملك صلاحية تصعيد هذا الطلب");
    }

    let reason: string | undefined;
    try {
      const parsed = bodySchema.safeParse(await req.json());
      reason = parsed.success ? parsed.data.reason : undefined;
    } catch {
      reason = undefined;
    }

    await createEscalation({ requestId: request.id, escalatedBy: auth.sub, reason });

    return ok({ escalated: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
