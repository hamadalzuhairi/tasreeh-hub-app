import type { NextRequest } from "next/server";
import { gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { requests } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { handleRouteError, ok } from "@/lib/http/respond";
import { getPeriodBounds, hoursBetween, parsePeriodDays, pctDelta } from "@/lib/reports/period";
import { scopeRequests } from "@/lib/reports/scope";
import type { ReportSummary } from "@tasreeh/shared";

// Reads auth headers per request; never prerender at build time.
export const dynamic = "force-dynamic";

type Row = typeof requests.$inferSelect;

function avgResponseHours(set: Row[]) {
  const responded = set.filter((r) => r.respondedAt);
  if (responded.length === 0) return 0;
  const total = responded.reduce((sum, r) => sum + hoursBetween(r.respondedAt!, r.createdAt), 0);
  return Math.round((total / responded.length) * 10) / 10;
}

function slaCompliance(set: Row[]) {
  const responded = set.filter((r) => r.respondedAt);
  if (responded.length === 0) return 0;
  const met = responded.filter((r) => r.respondedAt! <= r.slaDueAt).length;
  return Math.round((met / responded.length) * 1000) / 10;
}

function breaches(set: Row[], now: Date) {
  return set.filter((r) => (r.respondedAt ?? now) > r.slaDueAt).length;
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const days = parsePeriodDays(searchParams.get("period"));
    const now = new Date();
    const { start, prevStart } = getPeriodBounds(days, now);

    const allRows = scopeRequests(auth, await db.select().from(requests));
    const recent = allRows.filter((r) => r.createdAt >= prevStart);
    const current = recent.filter((r) => r.createdAt >= start);
    const previous = recent.filter((r) => r.createdAt < start);

    const overdueCount = allRows.filter((r) => r.status !== "closed" && r.slaDueAt < now).length;
    const closedCurrent = allRows.filter((r) => r.closedAt && r.closedAt >= start).length;
    const closedPrevious = allRows.filter((r) => r.closedAt && r.closedAt >= prevStart && r.closedAt < start).length;

    const summary: ReportSummary = {
      avgResponseHours: avgResponseHours(current),
      avgResponseDeltaPct: pctDelta(avgResponseHours(current), avgResponseHours(previous)),
      slaCompliancePct: slaCompliance(current),
      slaComplianceDeltaPct: pctDelta(slaCompliance(current), slaCompliance(previous)),
      totalRequests: current.length,
      totalRequestsDeltaPct: pctDelta(current.length, previous.length),
      overdueCount,
      overdueDeltaPct: pctDelta(breaches(current, now), breaches(previous, now)),
      closedCount: closedCurrent,
      closedDeltaPct: pctDelta(closedCurrent, closedPrevious),
    };

    return ok<ReportSummary>(summary);
  } catch (error) {
    return handleRouteError(error);
  }
}
