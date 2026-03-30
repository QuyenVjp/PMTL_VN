import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { communityPostKeys } from "./queries.js";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-api-error.js";

export function useUpdateCommunityPostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: string }) =>
      adminClient.patch(`/admin/community/posts/${publicId}`, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
      toast.success("Đã cập nhật trạng thái bài đăng");
    },
    onError: handleApiError,
  });
}

export function useDeleteCommunityPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/community/posts/${publicId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
      toast.success("Đã xoá bài đăng");
    },
    onError: handleApiError,
  });
}

export function useHidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/community/posts/${publicId}/hide`),
    onSuccess: () => {
      toast.success("Đã ẩn bài đăng.");
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useRestorePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/community/posts/${publicId}/restore`),
    onSuccess: () => {
      toast.success("Đã khôi phục bài đăng.");
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function usePinPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/community/posts/${publicId}/pin`),
    onSuccess: () => {
      toast.success("Đã ghim bài đăng.");
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useUnpinPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/community/posts/${publicId}/unpin`),
    onSuccess: () => {
      toast.success("Đã bỏ ghim bài đăng.");
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
    },
    onError: handleApiError,
  });
}
