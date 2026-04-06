import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { notificationsAdminKeys } from "./queries.js";

/**
 * Notifications mutations per ADMIN_FEATURE_QUERY_PLAN line 41:
 * "type management + template editing + schedule control"
 */

export interface CreateNotificationTypeInput {
  name: string;
  slug: string;
  category: string;
  enabled: boolean;
}

export interface CreateTemplateInput {
  typeId: string;
  name: string;
  language: string;
  subject: string;
  body: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateScheduleInput {
  name: string;
  typeId: string;
  cronExpression: string;
  active: boolean;
}

/**
 * Create notification type
 */
export function useCreateNotificationTypeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNotificationTypeInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/notifications/types", input),
    onSuccess: () => {
      toast.success("✅ Loại thông báo đã được tạo");
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.types.lists() });
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update notification type
 */
export function useUpdateNotificationTypeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateNotificationTypeInput> & { publicId: string }) =>
      adminClient.patch(`/admin/notifications/types/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Loại thông báo đã được cập nhật");
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.types.detail(publicId) });
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.types.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create template
 */
export function useCreateNotificationTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTemplateInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/notifications/templates", input),
    onSuccess: () => {
      toast.success("✅ Mẫu thông báo đã được tạo");
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.templates.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update template
 */
export function useUpdateNotificationTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateTemplateInput> & { publicId: string }) =>
      adminClient.patch(`/admin/notifications/templates/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Mẫu thông báo đã được cập nhật");
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.templates.detail(publicId) });
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.templates.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish template
 */
export function usePublishNotificationTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/notifications/templates/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Mẫu thông báo đã được xuất bản");
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.templates.detail(publicId) });
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.templates.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create schedule
 */
export function useCreateNotificationScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScheduleInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/notifications/schedules", input),
    onSuccess: () => {
      toast.success("✅ Lịch thông báo đã được tạo");
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.schedules.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update schedule
 */
export function useUpdateNotificationScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateScheduleInput> & { publicId: string }) =>
      adminClient.patch(`/admin/notifications/schedules/${publicId}`, input),
    onSuccess: () => {
      toast.success("✅ Lịch thông báo đã được cập nhật");
      void qc.invalidateQueries({ queryKey: notificationsAdminKeys.schedules.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Send test notification
 */
export function useSendTestNotificationMutation() {
  return useMutation({
    mutationFn: (templateId: string) =>
      adminClient.post(`/admin/notifications/templates/${templateId}/test`),
    onSuccess: () => {
      toast.success("✅ Thông báo thử nghiệm đã được gửi");
    },
    onError: handleApiError,
  });
}
