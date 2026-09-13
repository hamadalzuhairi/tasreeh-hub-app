import type { NotificationType, Priority, RequestStatus, RequestType, Role } from "./types";

// Default SLA target (hours) per request type, used when a department has no override.
export const DEFAULT_SLA_HOURS: Record<RequestType, number> = {
  interview: 72,
  statement: 24,
  inquiry: 48,
  other: 48,
};

export const REQUEST_TYPE_LABELS_AR: Record<RequestType, string> = {
  statement: "تصريح",
  inquiry: "استفسار",
  interview: "مقابلة",
  other: "أخرى",
};

export const REQUEST_STATUS_LABELS_AR: Record<RequestStatus, string> = {
  submitted: "تم التقديم",
  routed: "تم التوجيه للجهة",
  in_progress: "قيد المعالجة",
  awaiting_reply: "بانتظار الرد",
  closed: "مغلقة",
};

export const PRIORITY_LABELS_AR: Record<Priority, string> = {
  normal: "عادي",
  urgent: "عاجل",
};

export const ROLE_LABELS_AR: Record<Role, string> = {
  journalist: "إعلامي",
  spokesperson: "المتحدث الرسمي",
  admin: "مشرف",
};

export const NOTIFICATION_TYPE_LABELS_AR: Record<NotificationType, string> = {
  status_update: "تحديث حالة",
  urgent_overdue: "طلب متأخر",
  general: "عام",
};

export const GENERAL_DEPARTMENT_NAME_AR = "جهات أخرى";

export const JWT_EXPIRY = "7d";
