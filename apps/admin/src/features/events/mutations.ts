import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { eventKeys } from "./queries.js";
import type { DeliveryMode, EventType } from "./types.js";

export interface CreateEventInput {
  titleVi: string;
  eventType: EventType;
  deliveryMode: DeliveryMode;
  startAt: string;
  locationName?: string;
  description?: string;
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventInput) => adminClient.post("/events", data),
    onSuccess: () => {
      toast.success("Đã tạo sự kiện.");
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: Record<string, unknown> }) =>
      adminClient.patch(`/events/${publicId}`, data),
    onSuccess: (_, { publicId }) => {
      toast.success("Đã cập nhật sự kiện.");
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
      void qc.invalidateQueries({ queryKey: eventKeys.detail(publicId) });
    },
    onError: handleApiError,
  });
}

export function useCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventPublicId, userId }: { eventPublicId: string; userId: string }) =>
      adminClient.post(`/events/${eventPublicId}/check-in`, { userId }),
    onSuccess: (_, { eventPublicId }) => {
      toast.success("Đã check-in thành viên.");
      void qc.invalidateQueries({ queryKey: eventKeys.registrations(eventPublicId) });
    },
    onError: handleApiError,
  });
}
