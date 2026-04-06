import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { mediaLibraryAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Media library mutations per ADMIN_FEATURE_QUERY_PLAN line 38:
 * "collection-based structure with media items"
 */

export interface CreateCollectionInput {
  name: string;
  slug: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateMediaItemInput {
  title: string;
  collectionId: string;
  mimeType: string;
  url: string;
  duration?: number;
  status: "DRAFT" | "PUBLISHED";
}

/**
 * Create collection
 */
export function useCreateMediaLibraryCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/media-library/collections", input),
    onSuccess: () => {
      toast.success("✅ Bộ sưu tập đã được tạo");
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.collections.lists() });
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update collection
 */
export function useUpdateMediaLibraryCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateCollectionInput> & { publicId: string }) =>
      adminClient.patch(`/admin/media-library/collections/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Bộ sưu tập đã được cập nhật");
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.collections.detail(publicId) });
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.collections.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish collection
 */
export function usePublishMediaLibraryCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/media-library/collections/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bộ sưu tập đã được xuất bản");
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.collections.detail(publicId) });
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.collections.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}

/**
 * Create media item
 */
export function useCreateMediaLibraryItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMediaItemInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/media-library/media", input),
    onSuccess: () => {
      toast.success("✅ Tệp phương tiện đã được tạo");
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.media.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update media item
 */
export function useUpdateMediaLibraryItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateMediaItemInput> & { publicId: string }) =>
      adminClient.patch(`/admin/media-library/media/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Tệp phương tiện đã được cập nhật");
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.media.detail(publicId) });
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.media.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete media item
 */
export function useDeleteMediaLibraryItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/media-library/media/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Tệp phương tiện đã được xóa");
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.media.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish entire media library workspace
 */
export function usePublishMediaLibraryWorkspaceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post("/admin/media-library/publish"),
    onSuccess: () => {
      toast.success("✅ Thư viện phương tiện đã được xuất bản");
      void qc.invalidateQueries({ queryKey: mediaLibraryAdminKeys.all });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}
