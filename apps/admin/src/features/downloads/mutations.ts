import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { downloadKeys } from "./queries.js";
import { dashboardKeys } from "@/features/dashboard/queries.js";

// ── Inputs ──────────────────────────────────────────────────────────

interface CreateDownloadInput {
  title: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

interface UpdateDownloadInput {
  title?: string;
  description?: string;
  category?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  status?: string;
}

// ── Mutations ───────────────────────────────────────────────────────

export function useCreateDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDownloadInput) =>
      adminClient.post("/admin/content/downloads", input),
    onSuccess: () => {
      toast.success("Đã tạo tài liệu.");
      void qc.invalidateQueries({ queryKey: downloadKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateDownloadInput & { publicId: string }) =>
      adminClient.patch(`/admin/content/downloads/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("Đã cập nhật tài liệu.");
      void qc.invalidateQueries({ queryKey: downloadKeys.lists() });
      void qc.invalidateQueries({ queryKey: downloadKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/content/downloads/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá tài liệu.");
      void qc.invalidateQueries({ queryKey: downloadKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function usePublishDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/content/downloads/${publicId}/publish`),
    onSuccess: () => {
      toast.success("Đã xuất bản tài liệu.");
      void qc.invalidateQueries({ queryKey: downloadKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUnpublishDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.patch(`/admin/content/downloads/${publicId}`, { status: "DRAFT" }),
    onSuccess: (_data, publicId) => {
      toast.success("Đã gỡ xuất bản tài liệu.");
      void qc.invalidateQueries({ queryKey: downloadKeys.lists() });
      void qc.invalidateQueries({ queryKey: downloadKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}
