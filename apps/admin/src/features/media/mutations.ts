import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { buildCsrfHeader } from "@/lib/csrf.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { mediaKeys } from "./queries.js";
import { dashboardKeys } from "@/features/dashboard/queries.js";

export function useUploadMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

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
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
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
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
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
