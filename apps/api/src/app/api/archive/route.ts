import type { NextRequest } from "next/server";
import { and, desc, eq, gte, ilike, lt, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { departments, requests } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { handleRouteError, ok } from "@/lib/http/respond";
import { serializeRequest } from "@/lib/serializers";
import type { MediaRequest } from "@tasreeh/shared";

// Reads auth headers per request; never prerender at build time.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const year = searchParams.get("year");
    const departmentId = searchParams.get("departmentId");
    const filter = searchParams.get("filter"); // interview | statement | most_discussed | all

    const conditions = [eq(requests.isArchived, true)];

    if (q) {
      conditions.push(or(ilike(requests.subject, `%${q}%`), ilike(requests.body, `%${q}%`))!);
    }
    if (departmentId) {
      conditions.push(eq(requests.departmentId, departmentId));
    }
    if (year) {
      conditions.push(gte(requests.createdAt, new Date(`${year}-01-01`)));
      conditions.push(lt(requests.createdAt, new Date(`${Number(year) + 1}-01-01`)));
    }
    if (filter === "interview") {
      conditions.push(eq(requests.type, "interview"));
    } else if (filter === "statement") {
      conditions.push(eq(requests.type, "statement"));
    } else if (filter === "inquiry") {
      conditions.push(eq(requests.type, "inquiry"));
    } else if (filter === "other") {
      conditions.push(eq(requests.type, "other"));
    }

    const rows = await db
      .select()
      .from(requests)
      .where(and(...conditions))
      .orderBy(desc(requests.createdAt))
      .limit(200);

    const departmentIds = [...new Set(rows.map((r) => r.departmentId).filter(Boolean))] as string[];
    const departmentRows = departmentIds.length ? await db.select().from(departments) : [];
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
