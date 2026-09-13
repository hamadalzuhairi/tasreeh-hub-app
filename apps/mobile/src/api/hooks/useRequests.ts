import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateRequestInput, MediaRequest } from "@tasreeh/shared";
import { api } from "../client";

export function useRequests(params?: { status?: "in_progress" | "closed"; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString();

  return useQuery({
    queryKey: ["requests", params ?? {}],
    queryFn: () => api.get<MediaRequest[]>(`/api/requests${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => api.post<MediaRequest>("/api/requests", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}
