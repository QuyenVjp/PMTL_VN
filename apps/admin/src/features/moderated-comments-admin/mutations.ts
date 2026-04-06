import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { moderatedCommentsAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Moderated comments mutations per ADMIN_FEATURE_QUERY_PLAN line 46:
 * "comment moderation + thread management + batch operations"
 */

export interface ModerateCommentInput {
  commentId: string;
  action: "APPROVE" | "HIDE" | "DELETE";
  reason?: string;
}

/**
 * Moderate comment (approve/hide/delete)
 */
export function useModerateCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ModerateCommentInput) =>
      adminClient.post(`/admin/moderated-comments/${input.commentId}/moderate`, {
        action: input.action,
        reason: input.reason,
      }),
    onSuccess: (_data, { commentId }) => {
      toast.success("✅ Bình luận đã được xử lý");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.detail(commentId) });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.overview() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.pendingModeration() });
    },
    onError: handleApiError,
  });
}

/**
 * Approve comment
 */
export function useApproveCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/moderated-comments/${publicId}/approve`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bình luận đã được phê duyệt");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.detail(publicId) });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Reject/hide comment
 */
export function useRejectCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/moderated-comments/${publicId}/reject`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bình luận đã bị từ chối");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.detail(publicId) });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.moderation.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete comment
 */
export function useDeleteCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/moderated-comments/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Bình luận đã được xóa");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Batch moderate comments
 */
export function useBatchModerateCommentsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { commentIds: string[]; action: "APPROVE" | "REJECT" | "DELETE"; reason?: string }) =>
      adminClient.post("/admin/moderated-comments/batch-moderate", input),
    onSuccess: () => {
      toast.success("✅ Bình luận đã được xử lý hàng loạt");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Close comment thread
 */
export function useCloseThreadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) =>
      adminClient.post(`/admin/moderated-comments/threads/${threadId}/close`),
    onSuccess: (_data, threadId) => {
      toast.success("✅ Luồng bình luận đã bị đóng");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.threads.detail(threadId) });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.threads.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Reopen comment thread
 */
export function useReopenThreadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) =>
      adminClient.post(`/admin/moderated-comments/threads/${threadId}/reopen`),
    onSuccess: (_data, threadId) => {
      toast.success("✅ Luồng bình luận đã mở lại");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.threads.detail(threadId) });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.threads.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Pin comment
 */
export function usePinCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/moderated-comments/${publicId}/pin`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bình luận đã được ghim");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.detail(publicId) });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Unpin comment
 */
export function useUnpinCommentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/moderated-comments/${publicId}/unpin`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bình luận đã bỏ ghim");
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.detail(publicId) });
      void qc.invalidateQueries({ queryKey: moderatedCommentsAdminKeys.comments.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Export comments data
 */
export function useExportCommentsDataMutation() {
  return useMutation({
    mutationFn: () =>
      adminClient.post<{ downloadUrl: string }>("/admin/moderated-comments/export"),
    onSuccess: (response) => {
      toast.success("✅ Dữ liệu bình luận đã sẵn sàng tải xuống");
      if (response.downloadUrl) {
        window.location.href = response.downloadUrl;
      }
    },
    onError: handleApiError,
  });
}
