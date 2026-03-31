import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { mediaLibraryKeys } from "./queries.js";
import type { CollectionType, ItemType } from "./queries.js";

// ── Collection mutations ───────────────────────────────────────────────

export interface CreateCollectionInput {
  title:              string;
  slug:               string;
  collectionType:     CollectionType;
  description?:       string;
  sourceNote?:        string;
  coverMediaPublicId?: string;
  featured?:          boolean;
  sortOrder?:         number;
}

export interface UpdateCollectionInput {
  title?:              string;
  slug?:               string;
  description?:        string | null;
  sourceNote?:         string | null;
  coverMediaPublicId?: string | null;
  featured?:           boolean;
  sortOrder?:          number;
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCollectionInput) =>
      adminClient.post<{ publicId: string }>("/admin/content/media-library/collections", body),
    onSuccess: () => {
      toast.success("Đã tạo collection.");
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
    },
    onError: handleApiError,
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...body }: UpdateCollectionInput & { publicId: string }) =>
      adminClient.patch<void>(`/admin/content/media-library/collections/${publicId}`, body),
    onSuccess: () => {
      toast.success("Đã cập nhật collection.");
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
    },
    onError: handleApiError,
  });
}

export function usePublishCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post<void>(`/admin/content/media-library/collections/${publicId}/publish`),
    onSuccess: () => {
      toast.success("Đã xuất bản collection.");
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
    },
    onError: handleApiError,
  });
}

export function useUnpublishCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post<void>(`/admin/content/media-library/collections/${publicId}/unpublish`),
    onSuccess: () => {
      toast.success("Đã gỡ xuất bản collection.");
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
    },
    onError: handleApiError,
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete<void>(`/admin/content/media-library/collections/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá collection.");
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
    },
    onError: handleApiError,
  });
}

// ── Item mutations ────────────────────────────────────────────────────

export interface AddItemInput {
  itemType:            ItemType;
  mediaAssetPublicId?: string;
  externalUrl?:        string;
  title?:              string;
  caption?:            string;
  ownerModule?:        string;
  ownerPublicRef?:     string;
  sortOrder?:          number;
}

export function useAddCollectionItem(collectionPublicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddItemInput) => {
      if (!collectionPublicId) {
        throw new Error("Collection ID is required to add items");
      }
      return adminClient.post<void>(
        `/admin/content/media-library/collections/${collectionPublicId}/items`,
        body,
      );
    },
    onSuccess: () => {
      toast.success("Đã thêm item.");
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.items(collectionPublicId) });
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
    },
    onError: handleApiError,
  });
}

export function useRemoveCollectionItem(collectionPublicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemPublicId: string) => {
      if (!collectionPublicId) {
        throw new Error("Collection ID is required to remove items");
      }
      return adminClient.delete<void>(
        `/admin/content/media-library/collections/${collectionPublicId}/items/${itemPublicId}`,
      );
    },
    onSuccess: () => {
      toast.success("Đã xoá item.");
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.items(collectionPublicId) });
      void qc.invalidateQueries({ queryKey: mediaLibraryKeys.collections() });
    },
    onError: handleApiError,
  });
}
