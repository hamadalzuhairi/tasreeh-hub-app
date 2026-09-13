import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@tasreeh/shared";
import { api } from "../client";

export type NotificationFilter = "all" | "important" | "alerts" | "updates";

export function useNotifications(filter: NotificationFilter = "all") {
  return useQuery({
    queryKey: ["notifications", filter],
    queryFn: () => api.get<Notification[]>(`/api/notifications?filter=${filter}`),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
