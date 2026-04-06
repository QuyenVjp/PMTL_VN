import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { postAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Post mutations per ADMIN_PAGE_API_MAPPING line 33:
 * "posts list/detail invalidation + root dashboard aggregate if contentOpsSummary touched + public cache owner"
 */

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  status: "DRAFT" | "PUBLISHED";
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
}

export interface PublishPostInput {
  publicId: string;
  publishedAt?: string;
}

/**
 * Create a new post
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/posts", input),
    onSuccess: () => {
      toast.success("✅ Bài viết đã được tạo");
      // Invalidate posts list
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.lists() });
      // Invalidate dashboard contentOpsSummary if new post published
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.contentOpsSummary(),
      });
    },
    onError: handleApiError,
  });
}

/**
 * Update post details
 */
export function useUpdatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdatePostInput & { publicId: string }) =>
      adminClient.patch(`/admin/posts/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Bài viết đã được cập nhật");
      // Invalidate specific post detail
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.detail(publicId) });
      // Invalidate posts list (may affect filtering/sorting)
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish a post
 */
export function usePublishPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId }: PublishPostInput) =>
      adminClient.post(`/admin/posts/${publicId}/publish`),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Bài viết đã được xuất bản");
      // Invalidate post detail
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.detail(publicId) });
      // Invalidate posts list (status changed)
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.lists() });
      // Invalidate dashboard contentOpsSummary
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.contentOpsSummary(),
      });
      // Notify public cache invalidation owner if needed
      // This would be handled by backend outbox/event system
    },
    onError: handleApiError,
  });
}

/**
 * Unpublish a post (move back to draft)
 */
export function useUnpublishPostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/posts/${publicId}/unpublish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài viết đã được đưa về nháp");
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.contentOpsSummary(),
      });
    },
    onError: handleApiError,
  });
}

/**
 * Archive a post
 */
export function useArchivePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/posts/${publicId}/archive`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bài viết đã được ẩn");
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: postAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}
