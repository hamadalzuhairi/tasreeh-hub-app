import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["journalist", "spokesperson", "admin"]);

export const requestTypeEnum = pgEnum("request_type", [
  "statement",
  "inquiry",
  "interview",
  "other",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "submitted",
  "routed",
  "in_progress",
  "awaiting_reply",
  "closed",
]);

export const priorityEnum = pgEnum("priority", ["normal", "urgent"]);

export const timelineEventTypeEnum = pgEnum("timeline_event_type", [
  "submitted",
  "routed",
  "in_progress",
  "awaiting_reply",
  "closed",
  "escalated",
  "note_added",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "status_update",
  "urgent_overdue",
  "general",
]);

export const departments = pgTable("departments", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  slaTargetHours: integer("sla_target_hours"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  departmentId: uuid("department_id").references(() => departments.id),
  phone: text("phone"),
  organization: text("organization"),
  nafathVerified: boolean("nafath_verified").default(false).notNull(),
  // Small square JPEG stored as a data URI (the MVP has no object storage).
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const requests = pgTable(
  "requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestNumber: integer("request_number")
      .generatedAlwaysAsIdentity({ startWith: 1200 })
      .notNull()
      .unique(),
    requesterId: uuid("requester_id")
      .notNull()
      .references(() => users.id),
    departmentId: uuid("department_id").references(() => departments.id),
    type: requestTypeEnum("type").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    status: requestStatusEnum("status").default("submitted").notNull(),
    priority: priorityEnum("priority").default("normal").notNull(),
    classificationConfidence: numeric("classification_confidence"),
    classificationRaw: jsonb("classification_raw"),
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }).notNull(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    isArchived: boolean("is_archived").default(false).notNull(),
    isOverdueEscalated: boolean("is_overdue_escalated").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("requests_status_idx").on(table.status),
    departmentIdx: index("requests_department_idx").on(table.departmentId),
    slaDueIdx: index("requests_sla_due_idx").on(table.slaDueAt),
    archivedIdx: index("requests_archived_idx").on(table.isArchived),
  })
);

export const requestTimelineEvents = pgTable("request_timeline_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  eventType: timelineEventTypeEnum("event_type").notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const requestAttachments = pgTable("request_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestId: uuid("request_id").references(() => requests.id),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userReadIdx: index("notifications_user_read_idx").on(table.userId, table.isRead),
  })
);

export const escalations = pgTable("escalations", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  escalatedBy: uuid("escalated_by").references(() => users.id),
  escalatedTo: uuid("escalated_to")
    .notNull()
    .references(() => users.id),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
