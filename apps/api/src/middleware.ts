import { NextResponse, type NextRequest } from "next/server";

// Native mobile requests aren't subject to CORS, but the Expo web target (and any future
// browser-based client) needs these headers to call the API cross-origin during development.
export function middleware(req: NextRequest) {
  if (req.method === "OPTIONS") {
    return withCors(new NextResponse(null, { status: 204 }));
  }
  return withCors(NextResponse.next());
}

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-cron-secret");
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
