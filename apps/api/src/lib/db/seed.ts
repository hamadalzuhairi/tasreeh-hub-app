import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  departments,
  notifications,
  requestTimelineEvents,
  requests,
  users,
} from "./schema";
import { hashPassword } from "../auth/password";
import { computeSlaDueAt } from "../sla/compute";
import type { RequestType } from "@tasreeh/shared";

const DEMO_PASSWORD = "Demo1234!";

// One per seeded department, in department order.
const SPOKESPERSON_NAMES = ["خالد الشهري", "فهد الدوسري", "عبدالله المطيري", "ريم الحربي", "ماجد الغامدي"];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

const REQUEST_TYPES: RequestType[] = ["statement", "inquiry", "interview", "other"];

const SUBJECTS: Record<RequestType, string[]> = {
  statement: [
    "طلب تصريح حول مشروع تطوير المحتوى الرقمي",
    "تصريح بخصوص مبادرات التحول الوطني",
    "طلب تصريح رسمي حول نتائج الربع الأول",
    "تصريح حول الخطة الإعلامية الجديدة للجهة",
  ],
  inquiry: [
    "استفسار حول آلية الحصول على الخدمات الإلكترونية",
    "استفسار إعلامي حول إحصائيات الأداء السنوي",
    "استفسار حول تفاصيل مبادرة رقمية جديدة",
    "استفسار حول الموارد البشرية والتوظيف",
  ],
  interview: [
    "طلب مقابلة مع المتحدث الرسمي للجهة",
    "طلب لقاء مع نائب الوزير حول التحول الرقمي",
    "طلب مقابلة تلفزيونية حول الخدمات الجديدة",
    "طلب مقابلة صحفية حول خطط التوسع",
  ],
  other: [
    "طلب مواد إعلامية وصور رسمية للجهة",
    "طلب حضور مؤتمر صحفي قادم",
    "طلب توضيح بخصوص خبر متداول",
  ],
};

const REQUEST_BODY = "نص تفصيلي للطلب يوضح خلفية الموضوع والمعلومات المطلوبة من الجهة المختصة للرد عليه ضمن المدة النظامية.";

async function main() {
  console.log("Seeding Tasreeh Hub demo data...");

  // Wipe existing data (idempotent local/dev seeding).
  await db.delete(notifications);
  await db.delete(requestTimelineEvents);
  await db.delete(requests);
  await db.delete(users);
  await db.delete(departments);

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const deptSeeds = [
    { nameAr: "وزارة الصحة", nameEn: "Ministry of Health", targetCompliance: 0.98 },
    { nameAr: "وزارة الإعلام", nameEn: "Ministry of Media", targetCompliance: 0.94 },
    { nameAr: "وزارة الداخلية", nameEn: "Ministry of Interior", targetCompliance: 0.87 },
    { nameAr: "هيئة الحكومة الرقمية", nameEn: "Digital Government Authority", targetCompliance: 0.82 },
    { nameAr: "جهات أخرى", nameEn: "Other Entities", targetCompliance: 0.76 },
  ];

  const insertedDepartments = await db
    .insert(departments)
    .values(deptSeeds.map((d) => ({ nameAr: d.nameAr, nameEn: d.nameEn })))
    .returning();

  const admin = (
    await db
      .insert(users)
      .values({
        name: "سلطان القحطاني",
        email: "admin@tasreeh.sa",
        organization: "مكتب الاتصال الحكومي",
        passwordHash,
        role: "admin",
      })
      .returning()
  )[0];

  const spokespeople = await db
    .insert(users)
    .values(
      insertedDepartments.map((dept, i) => ({
        name: SPOKESPERSON_NAMES[i] ?? `متحدث ${dept.nameAr}`,
        organization: dept.nameAr,
        email: `spokesperson${i + 1}@tasreeh.sa`,
        passwordHash,
        role: "spokesperson" as const,
        departmentId: dept.id,
      }))
    )
    .returning();

  const journalists = await db
    .insert(users)
    .values([
      {
        name: "أحمد العتيبي",
        email: "journalist@tasreeh.sa",
        passwordHash,
        role: "journalist",
        organization: "صحيفة الرياض",
        phone: "+966501234567",
        nafathVerified: true,
      },
      {
        name: "نورة الدوسري",
        email: "journalist2@tasreeh.sa",
        passwordHash,
        role: "journalist",
        organization: "قناة الإخبارية",
        phone: "+966559876543",
      },
    ])
    .returning();

  const primaryJournalist = journalists[0];
  const now = new Date();

  async function createSeededRequest(opts: {
    requesterId: string;
    department: (typeof insertedDepartments)[number];
    createdAt: Date;
    outcome: "closed_met" | "closed_missed" | "in_progress" | "overdue_open";
  }) {
    const type = pick(REQUEST_TYPES);
    const subject = pick(SUBJECTS[type]);
    const slaDueAt = computeSlaDueAt(opts.createdAt, type, opts.department.slaTargetHours);

    let status: (typeof requests.$inferInsert)["status"] = "routed";
    let respondedAt: Date | null = null;
    let closedAt: Date | null = null;
    let isArchived = false;
    let isOverdueEscalated = false;

    const slaHours = (slaDueAt.getTime() - opts.createdAt.getTime()) / (1000 * 60 * 60);

    if (opts.outcome === "closed_met") {
      respondedAt = addHours(opts.createdAt, slaHours * (0.4 + Math.random() * 0.4));
      closedAt = addHours(respondedAt, randomInt(1, 6));
      status = "closed";
      isArchived = true;
    } else if (opts.outcome === "closed_missed") {
      respondedAt = addHours(opts.createdAt, slaHours * (1.1 + Math.random() * 0.4));
      closedAt = addHours(respondedAt, randomInt(1, 6));
      status = "closed";
      isArchived = true;
    } else if (opts.outcome === "in_progress") {
      status = pick(["routed", "in_progress", "awaiting_reply"] as const);
    } else if (opts.outcome === "overdue_open") {
      status = "in_progress";
    }

    const [created] = await db
      .insert(requests)
      .values({
        requesterId: opts.requesterId,
        departmentId: opts.department.id,
        type,
        subject,
        body: REQUEST_BODY,
        status,
        priority: opts.outcome === "overdue_open" ? "urgent" : "normal",
        slaDueAt,
        respondedAt,
        closedAt,
        isArchived,
        isOverdueEscalated,
        createdAt: opts.createdAt,
        updatedAt: closedAt ?? respondedAt ?? opts.createdAt,
      })
      .returning();

    const events: (typeof requestTimelineEvents.$inferInsert)[] = [
      { requestId: created.id, eventType: "submitted", actorId: opts.requesterId, createdAt: opts.createdAt },
      { requestId: created.id, eventType: "routed", actorId: null, createdAt: opts.createdAt },
    ];
    if (status === "in_progress" || status === "awaiting_reply" || status === "closed") {
      events.push({ requestId: created.id, eventType: "in_progress", actorId: null, createdAt: respondedAt ?? opts.createdAt });
    }
    if (status === "closed") {
      events.push({ requestId: created.id, eventType: "closed", actorId: null, createdAt: closedAt! });
    }
    await db.insert(requestTimelineEvents).values(events);

    return created;
  }

  // Historical requests per department to make SLA-compliance reports realistic.
  for (const dept of insertedDepartments) {
    const targetCompliance = deptSeeds.find((d) => d.nameAr === dept.nameAr)!.targetCompliance;
    const closedCount = 20;
    const metClosedCount = Math.round(closedCount * targetCompliance);

    for (let i = 0; i < closedCount; i++) {
      const createdAt = new Date(now.getTime() - randomInt(1, 30) * 24 * 60 * 60 * 1000);
      const requesterId = pick(journalists).id;
      await createSeededRequest({
        requesterId,
        department: dept,
        createdAt,
        outcome: i < metClosedCount ? "closed_met" : "closed_missed",
      });
    }
  }

  // Primary journalist's own request list (~24 total: 8 in-progress, 16 closed) to match the mockup tabs.
  for (let i = 0; i < 16; i++) {
    const createdAt = new Date(now.getTime() - randomInt(1, 25) * 24 * 60 * 60 * 1000);
    await createSeededRequest({
      requesterId: primaryJournalist.id,
      department: pick(insertedDepartments),
      createdAt,
      outcome: Math.random() < 0.85 ? "closed_met" : "closed_missed",
    });
  }
  for (let i = 0; i < 7; i++) {
    const createdAt = new Date(now.getTime() - randomInt(0, 5) * 24 * 60 * 60 * 1000);
    await createSeededRequest({
      requesterId: primaryJournalist.id,
      department: pick(insertedDepartments),
      createdAt,
      outcome: "in_progress",
    });
  }

  // One deliberately overdue, not-yet-escalated request to demo the escalation flow live.
  const overdueDept = insertedDepartments[3]; // هيئة الحكومة الرقمية, matches mockup's #1285 example
  const overdueCreatedAt = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const overdueRequest = await createSeededRequest({
    requesterId: primaryJournalist.id,
    department: overdueDept,
    createdAt: overdueCreatedAt,
    outcome: "overdue_open",
  });
  // Force it clearly into the past relative to its own SLA target.
  await db
    .update(requests)
    .set({ slaDueAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) })
    .where(eq(requests.id, overdueRequest.id));

  // A few pre-seeded notifications so the Notifications screen isn't empty on first look.
  await db.insert(notifications).values([
    {
      userId: primaryJournalist.id,
      type: "status_update",
      title: "تحديث حالة طلبك",
      body: "تم الرد على طلبك من قبل الجهة المختصة",
      isRead: false,
    },
    {
      userId: primaryJournalist.id,
      type: "urgent_overdue",
      title: "طلب متأخر",
      body: `الطلب #${overdueRequest.requestNumber} لم يتم الرد عليه خلال المدة المحددة`,
      requestId: overdueRequest.id,
      isRead: false,
    },
    {
      userId: spokespeople[0].id,
      type: "general",
      title: "طلب إعلامي جديد",
      body: "تم توجيه طلب جديد إليك",
      isRead: false,
    },
  ]);

  console.log("Seed complete.");
  console.log("Demo accounts (password for all: %s):", DEMO_PASSWORD);
  console.log("  admin:        admin@tasreeh.sa");
  console.log("  spokesperson: spokesperson1@tasreeh.sa (وزارة الصحة)");
  console.log("  journalist:   journalist@tasreeh.sa");
  console.log(`  overdue request seeded: #${overdueRequest.requestNumber} (${overdueDept.nameAr})`);
  console.log(`  admin id: ${admin.id}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
