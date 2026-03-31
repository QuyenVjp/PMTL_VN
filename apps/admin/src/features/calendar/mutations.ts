import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { eventKeys } from "./queries.js";

export interface CreateEventInput {
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: string;
  eventType: string;
  coverImagePublicId?: string;
  posterImagePublicId?: string;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  location?: string;
  eventType?: string;
  coverImagePublicId?: string | null;
  posterImagePublicId?: string | null;
}

/** Create a new calendar event */
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      adminClient.post("/admin/calendar/events", input),
    onSuccess: () => {
      toast.success("Đã tạo sự kiện mới.");
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Update an existing calendar event */
export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: UpdateEventInput }) =>
      adminClient.patch(`/admin/calendar/events/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật sự kiện.");
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Delete a calendar event */
export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/calendar/events/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá sự kiện.");
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Publish a calendar event */
export function usePublishEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/calendar/events/${publicId}/publish`),
    onSuccess: () => {
      toast.success("Đã xuất bản sự kiện.");
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}
