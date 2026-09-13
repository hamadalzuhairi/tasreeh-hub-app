import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EscalateRequestInput, MediaRequest, UpdateRequestStatusInput } from "@tasreeh/shared";
import { api } from "../client";

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: ["requests", id],
    queryFn: () => api.get<MediaRequest>(`/api/requests/${id}`),
    enabled: !!id,
  });
}

export function useUpdateRequestStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateRequestStatusInput) => api.patch<MediaRequest>(`/api/requests/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["requests", id] });
    },
  });
}

export function useEscalateRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EscalateRequestInput) => api.post(`/api/requests/${id}/escalate`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["requests", id] });
    },
  });
}
