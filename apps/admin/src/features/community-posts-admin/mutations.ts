import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { communityPostsAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Community posts mutations per ADMIN_FEATURE_QUERY_PLAN line 44:
 * "post moderation + topic management + analytics tracking"
 */

export interface CreateTopicInput {
  name: string;
  slug: string;
  description: string;
  status: "ACTIVE" | "ARCHIVED";
}

export interface ModerateCommunityPostInput {
  postId: string;
  action: "APPROVE" | "HIDE" | "DELETE";
  reason?: string;
}

/**
 * Create topic
 */
export function useCreateCommunityTopicMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTopicInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/community-posts/topics", input),
    onSuccess: () => {
      toast.success("✅ Chủ đề cộng đồng đã được tạo");
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.topics.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update topic
 */
export function useUpdateCommunityTopicMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateTopicInput> & { publicId: string }) =>
      adminClient.patch(`/admin/community-posts/topics/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Chủ đề cộng đồng đã được cập nhật");
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.topics.detail(publicId) });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.topics.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Moderate community post (approve/hide/delete)
 */
export function useModeratePostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ModerateCommunityPostInput) =>
      adminClient.post(`/admin/community-posts/${input.postId}/moderate`, {
        action: input.action,
        reason: input.reason,
      }),
    onSuccess: (_data, { postId }) => {
      toast.success("✅ Bài đăng đã được xử lý");
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.detail(postId) });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.lists() });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.overview() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.pendingModeration() });
    },
    onError: handleApiError,
  });
}

/**
 * Hide community post
 */
export function useHideCommunityPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/community-posts/${publicId}/hide`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài đăng đã bị ẩn");
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.detail(publicId) });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Unhide community post
 */
export function useUnhideCommunityPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/community-posts/${publicId}/unhide`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài đăng đã được hiển thị lại");
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.detail(publicId) });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete community post
 */
export function useDeleteCommunityPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/community-posts/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Bài đăng đã được xóa");
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.lists() });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Batch moderate posts
 */
export function useBatchModerateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { postIds: string[]; action: "APPROVE" | "HIDE" | "DELETE"; reason?: string }) =>
      adminClient.post("/admin/community-posts/batch-moderate", input),
    onSuccess: () => {
      toast.success("✅ Bài đăng đã được xử lý hàng loạt");
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.posts.lists() });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.moderation.lists() });
      void qc.invalidateQueries({ queryKey: communityPostsAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Export community data
 */
export function useExportCommunityDataMutation() {
  return useMutation({
    mutationFn: () =>
      adminClient.post<{ downloadUrl: string }>("/admin/community-posts/export"),
    onSuccess: (response) => {
      toast.success("✅ Dữ liệu cộng đồng đã sẵn sàng tải xuống");
      if (response.downloadUrl) {
        window.location.href = response.downloadUrl;
      }
    },
    onError: handleApiError,
  });
}
