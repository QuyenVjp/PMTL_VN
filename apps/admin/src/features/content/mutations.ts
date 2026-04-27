import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { postKeys } from "./queries.js";
import { dashboardKeys } from "@/features/dashboard/queries.js";

interface CreatePostInput {
  title: string;
  slug?: string;
  postType?: string;
  sourceRef?: string;
  excerpt?: string;
  featuredImageId?: string;
  content?: unknown;
  primaryCategoryId?: string;
  tagIds?: string[];
  featured?: boolean;
  allowComments?: boolean;
}

interface UpdatePostInput {
  title?: string;
  slug?: string;
  postType?: string;
  sourceRef?: string | null;
  excerpt?: string | null;
  featuredImageId?: string | null;
  content?: unknown;
  primaryCategoryId?: string | null;
  tagIds?: string[];
  featured?: boolean;
  allowComments?: boolean;
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) =>
      adminClient.post("/content/posts", input),
    onSuccess: () => {
      toast.success("Đã tạo bài viết.");
      void qc.invalidateQueries({ queryKey: postKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
    onError: handleApiError,
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdatePostInput & { publicId: string }) =>
      adminClient.patch(`/content/posts/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("Đã cập nhật bài viết.");
      void qc.invalidateQueries({ queryKey: postKeys.lists() });
      void qc.invalidateQueries({ queryKey: postKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
    onError: handleApiError,
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/content/posts/${publicId}/publish`),
    onSuccess: () => {
      toast.success("Đã xuất bản bài viết.");
      void qc.invalidateQueries({ queryKey: postKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
    onError: handleApiError,
  });
}

export function useUnpublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, mode }: { publicId: string; mode: "keepDraft" | "replaceDraftWithPublished" }) =>
      adminClient.post(`/content/posts/${publicId}/unpublish`, { mode }),
    onSuccess: (_data, { publicId }) => {
      toast.success("Đã gỡ xuất bản bài viết.");
      void qc.invalidateQueries({ queryKey: postKeys.lists() });
      void qc.invalidateQueries({ queryKey: postKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
    onError: handleApiError,
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/content/posts/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá bài viết.");
      void qc.invalidateQueries({ queryKey: postKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
    onError: handleApiError,
  });
}
