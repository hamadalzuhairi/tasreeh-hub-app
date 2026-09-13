import type {
  Department,
  Escalation,
  MediaRequest,
  Notification,
  RequestAttachment,
  TimelineEvent,
  User,
} from "@tasreeh/shared";
import type {
  departments,
  escalations,
  notifications,
  requestAttachments,
  requestTimelineEvents,
  requests,
  users,
} from "./db/schema";

type DbUser = typeof users.$inferSelect;
type DbDepartment = typeof departments.$inferSelect;
type DbRequest = typeof requests.$inferSelect;
type DbTimelineEvent = typeof requestTimelineEvents.$inferSelect;
type DbAttachment = typeof requestAttachments.$inferSelect;
type DbNotification = typeof notifications.$inferSelect;
type DbEscalation = typeof escalations.$inferSelect;

export function serializeUser(row: DbUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    departmentId: row.departmentId,
    phone: row.phone,
    organization: row.organization,
    nafathVerified: row.nafathVerified,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeDepartment(row: DbDepartment): Department {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn,
    slaTargetHours: row.slaTargetHours,
  };
}

export function serializeTimelineEvent(row: DbTimelineEvent): TimelineEvent {
  return {
    id: row.id,
    eventType: row.eventType,
    note: row.note,
    actorId: row.actorId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeAttachment(row: DbAttachment): RequestAttachment {
  return {
    id: row.id,
    fileName: row.fileName,
    fileSizeBytes: row.fileSizeBytes,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeRequest(
  row: DbRequest,
  extras?: {
    department?: DbDepartment | null;
    timeline?: DbTimelineEvent[];
    attachments?: DbAttachment[];
  }
): MediaRequest {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    requesterId: row.requesterId,
    departmentId: row.departmentId,
    department: extras?.department ? serializeDepartment(extras.department) : undefined,
    type: row.type,
    subject: row.subject,
    body: row.body,
    status: row.status,
    priority: row.priority,
    classificationConfidence: row.classificationConfidence
      ? Number(row.classificationConfidence)
      : null,
    slaDueAt: row.slaDueAt.toISOString(),
    respondedAt: row.respondedAt ? row.respondedAt.toISOString() : null,
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    timeline: extras?.timeline?.map(serializeTimelineEvent),
    attachments: extras?.attachments?.map(serializeAttachment),
  };
}

export function serializeNotification(row: DbNotification): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    isRead: row.isRead,
    requestId: row.requestId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeEscalation(row: DbEscalation): Escalation {
  return {
    id: row.id,
    requestId: row.requestId,
    escalatedBy: row.escalatedBy,
    escalatedTo: row.escalatedTo,
    reason: row.reason,
    createdAt: row.createdAt.toISOString(),
  };
}
