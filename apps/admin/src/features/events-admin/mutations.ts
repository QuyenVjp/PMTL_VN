import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { eventKeys } from "./queries.js";

/**
 * Events mutations per ADMIN_FEATURE_QUERY_PLAN line 51:
 * "event list/detail + touched child keys + override list/detail + calendar status + inspect keys"
 */

export interface CreateEventInput {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl?: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateAgendaItemInput {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  speakerId?: string;
  order: number;
}

export interface CreateSpeakerInput {
  eventId: string;
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
}

export interface CreateEventCtaInput {
  eventId: string;
  title: string;
  url: string;
  position: number;
}

export interface CreateLunarOverrideInput {
  date: string;
  lunarDate: string;
  overrideType: string;
}

/**
 * Create event
 */
export function useCreateEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/events", input),
    onSuccess: () => {
      toast.success("✅ Sự kiện đã được tạo");
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update event
 */
export function useUpdateEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateEventInput> & { publicId: string }) =>
      adminClient.patch(`/admin/events/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Sự kiện đã được cập nhật");
      void qc.invalidateQueries({ queryKey: eventKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish event
 */
export function usePublishEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/events/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Sự kiện đã được xuất bản");
      void qc.invalidateQueries({ queryKey: eventKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
      void qc.invalidateQueries({ queryKey: eventKeys.status() });
    },
    onError: handleApiError,
  });
}

/**
 * Reschedule event
 */
export function useRescheduleEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      startTime,
      endTime,
    }: {
      publicId: string;
      startTime: string;
      endTime: string;
    }) =>
      adminClient.post(`/admin/events/${publicId}/reschedule`, { startTime, endTime }),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Sự kiện đã được lên lịch lại");
      void qc.invalidateQueries({ queryKey: eventKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: eventKeys.status() });
    },
    onError: handleApiError,
  });
}

/**
 * Cancel event
 */
export function useCancelEventMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/events/${publicId}/cancel`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Sự kiện đã được hủy");
      void qc.invalidateQueries({ queryKey: eventKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: eventKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create agenda item
 */
export function useCreateAgendaItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAgendaItemInput) =>
      adminClient.post(`/admin/events/${input.eventId}/agenda`, input),
    onSuccess: (_data, { eventId }) => {
      toast.success("✅ Mục chương trình đã được tạo");
      void qc.invalidateQueries({ queryKey: eventKeys.agenda.list(eventId) });
      void qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
    onError: handleApiError,
  });
}

/**
 * Create speaker
 */
export function useCreateSpeakerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSpeakerInput) =>
      adminClient.post(`/admin/events/${input.eventId}/speakers`, input),
    onSuccess: (_data, { eventId }) => {
      toast.success("✅ Diễn giả đã được tạo");
      void qc.invalidateQueries({ queryKey: eventKeys.speakers.list(eventId) });
      void qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
    onError: handleApiError,
  });
}

/**
 * Create event CTA
 */
export function useCreateEventCtaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventCtaInput) =>
      adminClient.post(`/admin/events/${input.eventId}/ctas`, input),
    onSuccess: (_data, { eventId }) => {
      toast.success("✅ CTA đã được tạo");
      void qc.invalidateQueries({ queryKey: eventKeys.ctas.list(eventId) });
      void qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
    onError: handleApiError,
  });
}

/**
 * Create lunar calendar override
 */
export function useCreateLunarOverrideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLunarOverrideInput) =>
      adminClient.post("/admin/calendar/overrides", input),
    onSuccess: () => {
      toast.success("✅ Ghi đè lịch đã được tạo");
      void qc.invalidateQueries({ queryKey: eventKeys.overrides.lists() });
      void qc.invalidateQueries({ queryKey: eventKeys.status() });
    },
    onError: handleApiError,
  });
}

/**
 * Refresh personal practice calendar for all users
 */
export function useRefreshPersonalPracticeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post("/admin/calendar/refresh-practice"),
    onSuccess: () => {
      toast.success("✅ Lịch thực hành cá nhân đã được làm mới");
      void qc.invalidateQueries({ queryKey: eventKeys.status() });
    },
    onError: handleApiError,
  });
}
