import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { guestbookAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Guestbook mutations per ADMIN_FEATURE_QUERY_PLAN line 45:
 * "entry moderation + sentiment analysis + batch operations"
 */

export interface ModerateGuestbookEntryInput {
  entryId: string;
  action: "APPROVE" | "HIDE" | "DELETE";
  reason?: string;
}

/**
 * Moderate guestbook entry (approve/hide/delete)
 */
export function useModerateGuestbookEntryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ModerateGuestbookEntryInput) =>
      adminClient.post(`/admin/guestbook/entries/${input.entryId}/moderate`, {
        action: input.action,
        reason: input.reason,
      }),
    onSuccess: (_data, { entryId }) => {
      toast.success("✅ Bài nhập guestbook đã được xử lý");
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.detail(entryId) });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.overview() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.pendingModeration() });
    },
    onError: handleApiError,
  });
}

/**
 * Approve guestbook entry
 */
export function useApproveGuestbookEntryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/guestbook/entries/${publicId}/approve`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài nhập guestbook đã được phê duyệt");
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.detail(publicId) });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Reject/hide guestbook entry
 */
export function useRejectGuestbookEntryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/guestbook/entries/${publicId}/reject`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài nhập guestbook đã bị từ chối");
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.detail(publicId) });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.moderation.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete guestbook entry
 */
export function useDeleteGuestbookEntryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/guestbook/entries/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Bài nhập guestbook đã được xóa");
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Batch moderate entries
 */
export function useBatchModerateGuestbookMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { entryIds: string[]; action: "APPROVE" | "REJECT" | "DELETE"; reason?: string }) =>
      adminClient.post("/admin/guestbook/batch-moderate", input),
    onSuccess: () => {
      toast.success("✅ Bài nhập guestbook đã được xử lý hàng loạt");
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Mark as featured
 */
export function useMarkGuestbookFeaturedMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/guestbook/entries/${publicId}/feature`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài nhập guestbook đã được đánh dấu là nổi bật");
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.detail(publicId) });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Unmark as featured
 */
export function useUnmarkGuestbookFeaturedMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/guestbook/entries/${publicId}/unfeature`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài nhập guestbook đã bỏ đánh dấu nổi bật");
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.detail(publicId) });
      void qc.invalidateQueries({ queryKey: guestbookAdminKeys.entries.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Export guestbook data
 */
export function useExportGuestbookDataMutation() {
  return useMutation({
    mutationFn: () =>
      adminClient.post<{ downloadUrl: string }>("/admin/guestbook/export"),
    onSuccess: (response) => {
      toast.success("✅ Dữ liệu guestbook đã sẵn sàng tải xuống");
      if (response.downloadUrl) {
        window.location.href = response.downloadUrl;
      }
    },
    onError: handleApiError,
  });
}
