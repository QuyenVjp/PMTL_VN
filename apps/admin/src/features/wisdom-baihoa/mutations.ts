import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client";
import { handleApiError } from "@/lib/handle-api-error";
import { wisdomKeys } from "./queries";
import { dashboardKeys } from "@/features/dashboard/queries";

// ── Inputs ───────────────────────────────────────────────────────────

interface CreateWisdomEntryInput {
  title: string;
  slug?: string;
  entryType?: "BACH_THOAI" | "KHAI_THI" | "PHAT_NGON" | "PHAP_HOI";
  sourceFamily?: string;
  sourceUrl?: string;
  sourceCode?: string;
  originalText?: string;
  translatedText?: string;
  excerpt?: string;
  tags?: string[];
}

interface UpdateWisdomEntryInput {
  publicId: string;
  title?: string;
  slug?: string;
  entryType?: "BACH_THOAI" | "KHAI_THI" | "PHAT_NGON" | "PHAP_HOI";
  sourceFamily?: string;
  sourceUrl?: string;
  sourceCode?: string;
  originalText?: string;
  translatedText?: string;
  excerpt?: string;
  tags?: string[];
}

// ── Mutations ────────────────────────────────────────────────────────

export function useCreateWisdomEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWisdomEntryInput) =>
      adminClient.post("/admin/wisdom/entries", input),
    onSuccess: () => {
      toast.success("Đã tạo bài tri tuệ.");
      void qc.invalidateQueries({ queryKey: wisdomKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateWisdomEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateWisdomEntryInput) =>
      adminClient.patch(`/admin/wisdom/entries/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("Đã cập nhật bài tri tuệ.");
      void qc.invalidateQueries({ queryKey: wisdomKeys.lists() });
      void qc.invalidateQueries({ queryKey: wisdomKeys.detail(publicId) });
    },
    onError: handleApiError,
  });
}

export function usePublishWisdomEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/wisdom/entries/${publicId}/publish`),
    onSuccess: () => {
      toast.success("Đã xuất bản bài tri tuệ.");
      void qc.invalidateQueries({ queryKey: wisdomKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteWisdomEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/wisdom/entries/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá bài tri tuệ.");
      void qc.invalidateQueries({ queryKey: wisdomKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}
