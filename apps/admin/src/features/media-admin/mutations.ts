import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { mediaAdminKeys } from "./queries.js";

/**
 * Media mutations per ADMIN_FEATURE_QUERY_PLAN line 41:
 * "asset list/detail + embedding workspace keys"
 */

export interface UploadMediaInput {
  file: File;
  metadata?: Record<string, unknown>;
}

export interface UpdateMediaAssetInput {
  fileName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Upload a new media asset
 */
export function useUploadMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, metadata }: UploadMediaInput) => {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata) {
        formData.append("metadata", JSON.stringify(metadata));
      }

      return adminClient.post<{ data: { publicId: string; url: string } }>(
        "/admin/media/upload",
        formData
      );
    },
    onSuccess: () => {
      toast.success("✅ Tệp media đã được tải lên");
      void queryClient.invalidateQueries({ queryKey: mediaAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update media asset metadata
 */
export function useUpdateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateMediaAssetInput & { publicId: string }) =>
      adminClient.patch(`/admin/media/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Tệp media đã được cập nhật");
      void queryClient.invalidateQueries({ queryKey: mediaAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: mediaAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete a media asset
 */
export function useDeleteMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/media/${publicId}`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Tệp media đã được xóa");
      void queryClient.invalidateQueries({ queryKey: mediaAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: mediaAdminKeys.lists() });
      // Invalidate embedding workspace keys that reference this asset
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: handleApiError,
  });
}
