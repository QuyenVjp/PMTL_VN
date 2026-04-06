import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { canonAdminKeys } from "./queries.js";

/**
 * Canon (Kinh văn) mutations
 * Manages scripture catalog and practice guidelines
 */

export interface CreateScriptureInput {
  name: string;
  chineseName: string;
  abbreviation: string;
  category: "CORE" | "SUPPLEMENTARY" | "REFERENCE";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  minRecitations?: number;
  maxRecitations?: number;
  status: "PUBLISHED" | "DRAFT";
}

export interface CreateGuidelineInput {
  scriptureId: string;
  guidance: string;
  purpose: string;
  targetAudience: string;
}

/**
 * Create scripture
 */
export function useCreateScriptureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScriptureInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/canon/scriptures", input),
    onSuccess: () => {
      toast.success("✅ Kinh văn đã được thêm");
      void qc.invalidateQueries({ queryKey: canonAdminKeys.scriptures.lists() });
      void qc.invalidateQueries({ queryKey: canonAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update scripture
 */
export function useUpdateScriptureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateScriptureInput> & { publicId: string }) =>
      adminClient.patch(`/admin/canon/scriptures/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Kinh văn đã được cập nhật");
      void qc.invalidateQueries({ queryKey: canonAdminKeys.scriptures.detail(publicId) });
      void qc.invalidateQueries({ queryKey: canonAdminKeys.scriptures.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish scripture
 */
export function usePublishScriptureMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/canon/scriptures/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Kinh văn đã được xuất bản");
      void qc.invalidateQueries({ queryKey: canonAdminKeys.scriptures.detail(publicId) });
      void qc.invalidateQueries({ queryKey: canonAdminKeys.scriptures.lists() });
      void qc.invalidateQueries({ queryKey: canonAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Create practice guideline
 */
export function useCreateGuidelineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGuidelineInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/canon/guidelines", input),
    onSuccess: () => {
      toast.success("✅ Hướng dẫn tu hành đã được tạo");
      void qc.invalidateQueries({ queryKey: canonAdminKeys.guidelines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update practice guideline
 */
export function useUpdateGuidelineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateGuidelineInput> & { publicId: string }) =>
      adminClient.patch(`/admin/canon/guidelines/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Hướng dẫn tu hành đã được cập nhật");
      void qc.invalidateQueries({ queryKey: canonAdminKeys.guidelines.detail(publicId) });
      void qc.invalidateQueries({ queryKey: canonAdminKeys.guidelines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete guideline
 */
export function useDeleteGuidelineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/canon/guidelines/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Hướng dẫn tu hành đã được xóa");
      void qc.invalidateQueries({ queryKey: canonAdminKeys.guidelines.lists() });
    },
    onError: handleApiError,
  });
}
