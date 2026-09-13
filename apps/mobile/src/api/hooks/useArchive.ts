import { useQuery } from "@tanstack/react-query";
import type { MediaRequest } from "@tasreeh/shared";
import { api } from "../client";

export type ArchiveContentFilter = "all" | "statement" | "interview" | "inquiry" | "other";

export interface ArchiveFilters {
  q?: string;
  year?: string;
  departmentId?: string;
  filter?: ArchiveContentFilter;
}

export function useArchive(filters: ArchiveFilters) {
  const query = new URLSearchParams();
  if (filters.q) query.set("q", filters.q);
  if (filters.year) query.set("year", filters.year);
  if (filters.departmentId) query.set("departmentId", filters.departmentId);
  if (filters.filter && filters.filter !== "all") query.set("filter", filters.filter);
  const qs = query.toString();

  return useQuery({
    queryKey: ["archive", filters],
    queryFn: () => api.get<MediaRequest[]>(`/api/archive${qs ? `?${qs}` : ""}`),
  });
}
