import type { NextRequest } from "next/server";
import { gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { requests } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { handleRouteError, ok } from "@/lib/http/respond";
import { getPeriodBounds, hoursBetween, parsePeriodDays } from "@/lib/reports/period";
import { scopeRequests } from "@/lib/reports/scope";
import type { TrendPoint } from "@tasreeh/shared";

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const days = parsePeriodDays(searchParams.get("period"));
    const { start } = getPeriodBounds(days);

    const rows = scopeRequests(auth, await db.select().from(requests).where(gte(requests.createdAt, start)));

    const buckets = new Map<string, number[]>();
    for (let i = 1; i <= days; i++) {
      const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      buckets.set(date.toISOString().slice(0, 10), []);
    }

    for (const request of rows) {
      if (!request.respondedAt) continue;
      const key = request.respondedAt.toISOString().slice(0, 10);
      buckets.get(key)?.push(hoursBetween(request.respondedAt, request.createdAt));
    }

    const trend: TrendPoint[] = [...buckets.entries()].map(([date, hours]) => ({
      date,
      avgResponseHours: hours.length ? Math.round((hours.reduce((a, b) => a + b, 0) / hours.length) * 10) / 10 : 0,
    }));

    return ok<TrendPoint[]>(trend);
  } catch (error) {
    return handleRouteError(error);
  }
}
