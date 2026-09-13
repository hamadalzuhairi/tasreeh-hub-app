import { useQuery } from "@tanstack/react-query";
import type { Department } from "@tasreeh/shared";
import { api } from "../client";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<Department[]>("/api/departments"),
  });
}
