import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { guideKeys } from "./queries.js";
import { dashboardKeys } from "@/features/dashboard/queries.js";

// ── Inputs ──────────────────────────────────────────────────────────

interface CreateGuideInput {
  title: string;
  slug?: string;
  category: string;
  content?: unknown;
  excerpt?: string;
  coverMediaPublicId?: string;
  sortOrder?: number;
  versionNote?: string;
}

interface UpdateGuideInput {
  title?: string;
  slug?: string;
  category?: string;
  content?: unknown;
  excerpt?: string;
  coverMediaPublicId?: string | null;
  sortOrder?: number;
  versionNote?: string;
  status?: string;
}

// ── Mutations ───────────────────────────────────────────────────────

export function useCreateGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGuideInput) => adminClient.post("/admin/content/guides", input),
    onSuccess: () => {
      toast.success("Đã tạo hướng dẫn.");
      void qc.invalidateQueries({ queryKey: guideKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateGuideInput & { publicId: string }) =>
      adminClient.patch(`/admin/content/guides/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("Đã cập nhật hướng dẫn.");
      void qc.invalidateQueries({ queryKey: guideKeys.lists() });
      void qc.invalidateQueries({ queryKey: guideKeys.detail(publicId) });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function usePublishGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.post(`/admin/content/guides/${publicId}/publish`),
    onSuccess: () => {
      toast.success("Đã xuất bản hướng dẫn.");
      void qc.invalidateQueries({ queryKey: guideKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/content/guides/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá hướng dẫn.");
      void qc.invalidateQueries({ queryKey: guideKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}
