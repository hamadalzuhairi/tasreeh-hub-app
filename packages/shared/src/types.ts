// Shared contract between apps/api and apps/mobile. Keep in sync with the Drizzle schema
// at apps/api/src/lib/db/schema.ts.

export type Role = "journalist" | "spokesperson" | "admin";

export type RequestType = "statement" | "inquiry" | "interview" | "other";

export type RequestStatus =
  | "submitted"
  | "routed"
  | "in_progress"
  | "awaiting_reply"
  | "closed";

export type Priority = "normal" | "urgent";

export type TimelineEventType =
  | "submitted"
  | "routed"
  | "in_progress"
  | "awaiting_reply"
  | "closed"
  | "escalated"
  | "note_added";

export type NotificationType = "status_update" | "urgent_overdue" | "general";

export interface Department {
  id: string;
  nameAr: string;
  nameEn: string;
  slaTargetHours: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
  phone: string | null;
  organization: string | null;
  nafathVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface RequestAttachment {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  note: string | null;
  actorId: string | null;
  createdAt: string;
}

export interface MediaRequest {
  id: string;
  requestNumber: number;
  requesterId: string;
  departmentId: string | null;
  department?: Department | null;
  type: RequestType;
  subject: string;
  body: string;
  status: RequestStatus;
  priority: Priority;
  classificationConfidence: number | null;
  slaDueAt: string;
  respondedAt: string | null;
  closedAt: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  timeline?: TimelineEvent[];
  attachments?: RequestAttachment[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  requestId: string | null;
  createdAt: string;
}

export interface Escalation {
  id: string;
  requestId: string;
  escalatedBy: string | null;
  escalatedTo: string;
  reason: string | null;
  createdAt: string;
}

export interface ReportSummary {
  avgResponseHours: number;
  avgResponseDeltaPct: number;
  slaCompliancePct: number;
  slaComplianceDeltaPct: number;
  totalRequests: number;
  totalRequestsDeltaPct: number;
  overdueCount: number;
  overdueDeltaPct: number;
  closedCount: number;
  closedDeltaPct: number;
}

export interface DepartmentPerformance {
  departmentId: string;
  departmentName: string;
  slaCompliancePct: number;
}

export interface TrendPoint {
  date: string;
  avgResponseHours: number;
}

// ---- API envelope ----

export interface ApiError {
  code: string;
  message: string;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// ---- Request/response DTOs ----

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  organization?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface CreateRequestInput {
  type: RequestType;
  subject: string;
  body: string;
  attachments?: { fileName: string; fileSizeBytes: number }[];
}

export interface UpdateRequestStatusInput {
  status: RequestStatus;
  note?: string;
}

export interface EscalateRequestInput {
  reason?: string;
}
