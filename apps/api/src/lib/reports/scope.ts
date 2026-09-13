import type { JwtPayload } from "../auth/jwt";
import type { requests } from "../db/schema";

type DbRequest = typeof requests.$inferSelect;

// Reports are available to every role, scoped to what that role may see:
// journalists their own requests, spokespersons their department, admins everything.
export function scopeRequests(auth: JwtPayload, rows: DbRequest[]): DbRequest[] {
  if (auth.role === "journalist") return rows.filter((r) => r.requesterId === auth.sub);
  if (auth.role === "spokesperson") return rows.filter((r) => r.departmentId === auth.departmentId);
  return rows;
}
