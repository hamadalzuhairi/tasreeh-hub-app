import { db } from "@/lib/db/client";
import { departments } from "@/lib/db/schema";
import { handleRouteError, ok } from "@/lib/http/respond";
import { serializeDepartment } from "@/lib/serializers";
import type { Department } from "@tasreeh/shared";

// No request-scoped data is read here, so without this Next.js would try to statically
// prerender the route at build time and execute a real DB query in the process.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(departments);
    return ok<Department[]>(rows.map(serializeDepartment));
  } catch (error) {
    return handleRouteError(error);
  }
}
