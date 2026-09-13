// Exercises the core API flow against a running dev server (pnpm api:dev) with seeded data.
// Usage: BASE_URL=http://localhost:3000 pnpm --filter @tasreeh/api smoke-test

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DEMO_PASSWORD = "Demo1234!";

async function call(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(`${path} -> ${res.status}: ${JSON.stringify(json)}`);
  }
  return json.data;
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function main() {
  console.log(`Smoke-testing ${BASE_URL} ...`);

  const login = await call("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "journalist@tasreeh.sa", password: DEMO_PASSWORD }),
  });
  const journalistToken = login.token;
  console.log("✓ journalist login");

  const departments = await call("/api/departments");
  assert(departments.length > 0, "departments seeded");
  console.log(`✓ departments (${departments.length})`);

  const created = await call("/api/requests", {
    method: "POST",
    headers: { Authorization: `Bearer ${journalistToken}` },
    body: JSON.stringify({
      type: "inquiry",
      subject: "استفسار تجريبي عن آلية الرد على الطلبات",
      body: "هذا نص تجريبي لاختبار مسار إنشاء الطلب والتصنيف الآلي والتوجيه للجهة المختصة.",
    }),
  });
  assert(created.status === "routed", "new request is routed");
  assert(created.departmentId, "new request has a department");
  console.log(`✓ created request #${created.requestNumber} -> department ${created.departmentId}`);

  const spokesLogin = await call("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "spokesperson1@tasreeh.sa", password: DEMO_PASSWORD }),
  });
  const spokesToken = spokesLogin.token;

  const queue = await call("/api/requests", { headers: { Authorization: `Bearer ${spokesToken}` } });
  console.log(`✓ spokesperson1 queue has ${queue.length} requests`);

  const detail = await call(`/api/requests/${created.id}`, {
    headers: { Authorization: `Bearer ${journalistToken}` },
  });
  assert(detail.timeline && detail.timeline.length >= 2, "timeline has submitted+routed events");
  console.log("✓ request detail + timeline");

  const cronResult = await call("/api/cron/sla-check", {
    headers: process.env.CRON_SECRET ? { "x-cron-secret": process.env.CRON_SECRET } : {},
  });
  console.log(`✓ cron sweep ran, escalated ${cronResult.escalatedCount} overdue request(s)`);

  const adminLogin = await call("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@tasreeh.sa", password: DEMO_PASSWORD }),
  });
  const adminNotifications = await call("/api/notifications", {
    headers: { Authorization: `Bearer ${adminLogin.token}` },
  });
  console.log(`✓ admin has ${adminNotifications.length} notifications`);

  const summary = await call("/api/reports/summary?period=30d", {
    headers: { Authorization: `Bearer ${adminLogin.token}` },
  });
  console.log("✓ reports/summary:", summary);

  const archive = await call("/api/archive", {
    headers: { Authorization: `Bearer ${adminLogin.token}` },
  });
  assert(archive.length > 0, "closed requests appear in the archive");
  console.log(`✓ archive has ${archive.length} closed requests`);

  console.log("\nAll smoke tests passed.");
}

main().catch((err) => {
  console.error("Smoke test FAILED:", err);
  process.exit(1);
});
