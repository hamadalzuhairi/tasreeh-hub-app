import { ok } from "@/lib/http/respond";

export const dynamic = "force-dynamic";

// Lightweight liveness probe for deploy checks; also reports whether AI classification is configured.
export async function GET() {
  return ok({ status: "ok", classification: Boolean(process.env.GEMINI_API_KEY) });
}
