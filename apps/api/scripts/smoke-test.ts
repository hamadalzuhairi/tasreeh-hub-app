// Exercises the core API flow against a running dev server (pnpm api:dev) with seeded data.
// Usage: BASE_URL=http://localhost:3000 pnpm --filter @tasreeh/api smoke-test
import "dotenv/config";

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

async function expectStatus(path: string, status: number, opts: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  if (res.status !== status) throw new Error(`${path} expected ${status}, got ${res.status}`);
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

async function login(email: string) {
  const data = await call("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: DEMO_PASSWORD }),
  });
  return data.token as string;
}

async function main() {
  console.log(`Smoke-testing ${BASE_URL} ...`);

  const health = await call("/api/health");
  console.log(`✓ health (classification configured: ${health.classification})`);

  await expectStatus("/api/auth/login", 401, {
    method: "POST",
    body: JSON.stringify({ email: "journalist@tasreeh.sa", password: "wrong-password" }),
  });
  await expectStatus("/api/requests", 401);
  console.log("✓ bad password and missing token are rejected");

  const signupEmail = `smoke-${Date.now()}@example.com`;
  const signup = await call("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name: "صحفي تجريبي", email: signupEmail, password: DEMO_PASSWORD, organization: "صحيفة تجريبية" }),
  });
  assert(signup.user.role === "journalist", "self-signup creates a journalist");
  const me = await call("/api/auth/me", { method: "PATCH", headers: bearer(signup.token), body: JSON.stringify({ nafathVerified: true }) });
  assert(me.nafathVerified === true, "nafath flag updates");
  console.log("✓ signup + profile update");

  const journalistToken = await login("journalist@tasreeh.sa");
  console.log("✓ journalist login");

  const departments = await call("/api/departments");
  assert(departments.length > 0, "departments seeded");
  const health_dept = departments.find((d: { nameAr: string }) => d.nameAr === "وزارة الصحة");
  console.log(`✓ departments (${departments.length})`);

  const created = await call("/api/requests", {
    method: "POST",
    headers: bearer(journalistToken),
    body: JSON.stringify({
      type: "inquiry",
      subject: "استفسار عن حملة التطعيم الموسمية",
      body: "نرغب في معرفة تفاصيل حملة التطعيم ضد الإنفلونزا الموسمية وأماكن مراكز التطعيم في المستشفيات.",
    }),
  });
  assert(created.status === "routed", "new request is routed");
  assert(created.departmentId, "new request has a department");
  const routedName = departments.find((d: { id: string }) => d.id === created.departmentId)?.nameAr;
  console.log(`✓ created request #${created.requestNumber} -> ${routedName} (confidence ${created.classificationConfidence})`);
  if (health_dept && created.departmentId !== health_dept.id) {
    console.warn("  ! AI routing did not pick وزارة الصحة (fallback or misclassification)");
  }

  const detail = await call(`/api/requests/${created.id}`, { headers: bearer(journalistToken) });
  assert(detail.timeline && detail.timeline.length >= 2, "timeline has submitted+routed events");
  console.log("✓ request detail + timeline");

  const adminToken = await login("admin@tasreeh.sa");
  await expectStatus(`/api/requests/${created.id}`, 403, { method: "PATCH", headers: bearer(journalistToken), body: JSON.stringify({ status: "closed" }) });
  console.log("✓ journalist cannot change status");

  const spokesToken = await login("spokesperson1@tasreeh.sa");
  const queue = await call("/api/requests", { headers: bearer(spokesToken) });
  console.log(`✓ spokesperson1 queue has ${queue.length} requests`);

  await call(`/api/requests/${created.id}/escalate`, { method: "POST", headers: bearer(adminToken), body: JSON.stringify({ reason: "اختبار التصعيد" }) });
  console.log("✓ manual escalation");

  await call(`/api/requests/${created.id}`, { method: "PATCH", headers: bearer(adminToken), body: JSON.stringify({ status: "in_progress" }) });
  const closed = await call(`/api/requests/${created.id}`, { method: "PATCH", headers: bearer(adminToken), body: JSON.stringify({ status: "closed", note: "تم الرد" }) });
  assert(closed.isArchived, "closing archives the request");
  console.log("✓ status in_progress -> closed (archived)");

  const found = await call(`/api/archive?q=${encodeURIComponent("حملة التطعيم")}`, { headers: bearer(signup.token) });
  assert(found.some((r: { id: string }) => r.id === created.id), "archive search finds the closed request");
  const archived = await call(`/api/requests/${created.id}`, { headers: bearer(signup.token) });
  assert(archived.id === created.id, "any user can open an archived request");
  console.log(`✓ archive search (${found.length} hit(s)) + archived detail visible to other users`);

  const journalistNotifications = await call("/api/notifications", { headers: bearer(journalistToken) });
  const statusNote = journalistNotifications.find((n: { requestId: string | null }) => n.requestId === created.id);
  assert(statusNote, "journalist is notified about status changes");
  await call(`/api/notifications/${statusNote.id}/read`, { method: "POST", headers: bearer(journalistToken) });
  console.log(`✓ journalist notifications (${journalistNotifications.length}) + mark read`);

  await expectStatus("/api/cron/sla-check", 401);
  const cronResult = await call("/api/cron/sla-check", {
    headers: process.env.CRON_SECRET ? { "x-cron-secret": process.env.CRON_SECRET } : {},
  });
  console.log(`✓ cron sweep ran, escalated ${cronResult.escalatedCount} overdue request(s)`);

  const adminNotifications = await call("/api/notifications", { headers: bearer(adminToken) });
  console.log(`✓ admin has ${adminNotifications.length} notifications`);

  for (const token of [adminToken, spokesToken, journalistToken]) {
    await call("/api/reports/summary?period=30d", { headers: bearer(token) });
    await call("/api/reports/trend?period=7d", { headers: bearer(token) });
    await call("/api/reports/departments?period=30d", { headers: bearer(token) });
  }
  const summary = await call("/api/reports/summary?period=30d", { headers: bearer(adminToken) });
  console.log("✓ reports for all roles; admin summary:", summary);

  await cleanup(created.id, signupEmail);
  console.log("\nAll smoke tests passed.");
}

// The API has no delete endpoints, so remove this run's request and signup user directly so
// repeated runs don't clutter the demo accounts.
async function cleanup(requestId: string, email: string) {
  if (!process.env.DATABASE_URL) return;
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL);
  await sql`DELETE FROM notifications WHERE request_id = ${requestId}`;
  await sql`DELETE FROM requests WHERE id = ${requestId}`;
  await sql`DELETE FROM users WHERE email = ${email}`;
  console.log("✓ cleaned up test request and user");
}

main().catch((err) => {
  console.error("Smoke test FAILED:", err);
  process.exit(1);
});
