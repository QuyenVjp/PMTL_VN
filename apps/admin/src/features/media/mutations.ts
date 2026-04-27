import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { buildCsrfHeader } from "@/lib/csrf.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { mediaKeys } from "./queries.js";
import { dashboardKeys } from "@/features/dashboard/queries.js";

export interface UploadMediaAssetInput {
  file: File;
  folderPublicId?: string | null;
}

export function useUploadMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: File | UploadMediaAssetInput) => {
      const file = input instanceof File ? input : input.file;
      const folderPublicId = input instanceof File ? undefined : input.folderPublicId;
      const formData = new FormData();
      formData.append("file", file);
      if (folderPublicId) formData.append("folderPublicId", folderPublicId);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        headers: buildCsrfHeader("POST"),
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(json?.error?.message ?? "Upload thất bại");
      }
      return res.json() as Promise<Record<string, unknown>>;
    },
    onSuccess: () => {
      toast.success("Upload thành công.");
      void qc.invalidateQueries({ queryKey: mediaKeys.lists() });
      void qc.invalidateQueries({ queryKey: mediaKeys.folders() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useCreateMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string }) =>
      adminClient.post<{ data: { publicId: string; name: string } }>("/admin/media/folders", body),
    onSuccess: () => {
      toast.success("Đã tạo thư mục media.");
      void qc.invalidateQueries({ queryKey: mediaKeys.folders() });
    },
    onError: handleApiError,
  });
}

export function useUpdateMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, name }: { publicId: string; name: string }) =>
      adminClient.patch<{ data: { publicId: string; name: string } }>(`/admin/media/folders/${publicId}`, { name }),
    onSuccess: () => {
      toast.success("Đã cập nhật thư mục media.");
      void qc.invalidateQueries({ queryKey: mediaKeys.folders() });
    },
    onError: handleApiError,
  });
}

export function useDeleteMediaFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/media/folders/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá thư mục media.");
      void qc.invalidateQueries({ queryKey: mediaKeys.folders() });
      void qc.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useMoveMediaAssetToFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, folderPublicId }: { publicId: string; folderPublicId?: string | null }) =>
      adminClient.patch<void>(`/admin/media/${publicId}/folder`, { folderPublicId: folderPublicId ?? null }),
    onSuccess: () => {
      toast.success("Đã chuyển media vào thư mục.");
      void qc.invalidateQueries({ queryKey: mediaKeys.lists() });
      void qc.invalidateQueries({ queryKey: mediaKeys.folders() });
    },
    onError: handleApiError,
  });
}

export function useDeleteMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/media/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá media asset.");
      void qc.invalidateQueries({ queryKey: mediaKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
    onError: handleApiError,
  });
}

export function useUpdateMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...body }: { publicId: string; altText?: string; caption?: string; description?: string }) =>
      adminClient.patch<void>(`/admin/media/${publicId}`, body),
    onSuccess: () => {
      toast.success("Đã cập nhật thông tin.");
      void qc.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
    onError: handleApiError,
  });
}
