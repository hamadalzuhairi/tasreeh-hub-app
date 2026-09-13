import type { NextRequest } from "next/server";
import { db } from "@/lib/db/client";
import { departments, requests } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { handleRouteError, ok } from "@/lib/http/respond";
import { scopeRequests } from "@/lib/reports/scope";
import type { DepartmentPerformance } from "@tasreeh/shared";

// Reads auth headers per request; never prerender at build time.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);

    const [allDepartments, allRequests] = await Promise.all([
      db.select().from(departments),
      db.select().from(requests),
    ]);
    const scoped = scopeRequests(auth, allRequests);

    const performance: DepartmentPerformance[] = allDepartments
      .map((dept) => {
        const responded = scoped.filter((r) => r.departmentId === dept.id && r.respondedAt);
        const met = responded.filter((r) => r.respondedAt! <= r.slaDueAt).length;
        return {
          departmentId: dept.id,
          departmentName: dept.nameAr,
          slaCompliancePct: responded.length ? Math.round((met / responded.length) * 1000) / 10 : 0,
          sampleSize: responded.length,
        };
      })
      .filter((d) => d.sampleSize > 0)
      .sort((a, b) => b.slaCompliancePct - a.slaCompliancePct)
      .map(({ sampleSize: _sampleSize, ...rest }) => rest);

    return ok<DepartmentPerformance[]>(performance);
  } catch (error) {
    return handleRouteError(error);
  }
}
