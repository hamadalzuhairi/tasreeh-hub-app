import { useQuery } from "@tanstack/react-query";
import type { DepartmentPerformance, ReportSummary, TrendPoint } from "@tasreeh/shared";
import { api } from "../client";

interface Options {
  enabled?: boolean;
}

// Reports endpoints are spokesperson/admin-only server-side; callers on the journalist role
// must pass { enabled: false } so these don't fire (and 403) for a role that can't see them.
export function useReportSummary(period: string, options?: Options) {
  return useQuery({
    queryKey: ["reports", "summary", period],
    queryFn: () => api.get<ReportSummary>(`/api/reports/summary?period=${period}`),
    enabled: options?.enabled ?? true,
  });
}

export function useDepartmentPerformance(period: string, options?: Options) {
  return useQuery({
    queryKey: ["reports", "departments", period],
    queryFn: () => api.get<DepartmentPerformance[]>(`/api/reports/departments?period=${period}`),
    enabled: options?.enabled ?? true,
  });
}

export function useReportTrend(period: string, options?: Options) {
  return useQuery({
    queryKey: ["reports", "trend", period],
    queryFn: () => api.get<TrendPoint[]>(`/api/reports/trend?period=${period}`),
    enabled: options?.enabled ?? true,
  });
}
