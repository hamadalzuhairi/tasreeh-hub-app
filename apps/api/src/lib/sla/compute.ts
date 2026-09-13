import { DEFAULT_SLA_HOURS, type RequestType } from "@tasreeh/shared";

export function resolveSlaHours(
  type: RequestType,
  departmentSlaTargetHours: number | null | undefined
): number {
  return departmentSlaTargetHours ?? DEFAULT_SLA_HOURS[type];
}

export function computeSlaDueAt(
  createdAt: Date,
  type: RequestType,
  departmentSlaTargetHours: number | null | undefined
): Date {
  const hours = resolveSlaHours(type, departmentSlaTargetHours);
  return new Date(createdAt.getTime() + hours * 60 * 60 * 1000);
}
