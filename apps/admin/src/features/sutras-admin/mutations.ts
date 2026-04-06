import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { sutrasAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Sutras mutations per ADMIN_FEATURE_QUERY_PLAN line 39:
 * "nested structure: texts + translations + commentaries + interpretations"
 */

export interface CreateSutraTextInput {
  title: string;
  slug: string;
  language: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateSutraTranslationInput {
  sutraId: string;
  language: string;
  translator: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateCommentaryInput {
  sutraId: string;
  title: string;
  author: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateInterpretationInput {
  sutraId: string;
  title: string;
  author: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
}

/**
 * Create sutra text
 */
export function useCreateSutraTextMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSutraTextInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/sutras/texts", input),
    onSuccess: () => {
      toast.success("✅ Kinh văn đã được tạo");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.texts.lists() });
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update sutra text
 */
export function useUpdateSutraTextMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateSutraTextInput> & { publicId: string }) =>
      adminClient.patch(`/admin/sutras/texts/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Kinh văn đã được cập nhật");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.texts.detail(publicId) });
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.texts.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish sutra text
 */
export function usePublishSutraTextMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/sutras/texts/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Kinh văn đã được xuất bản");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.texts.detail(publicId) });
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.texts.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}

/**
 * Create translation
 */
export function useCreateSutraTranslationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSutraTranslationInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/sutras/translations", input),
    onSuccess: () => {
      toast.success("✅ Bản dịch đã được tạo");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.translations.lists() });
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update translation
 */
export function useUpdateSutraTranslationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateSutraTranslationInput> & { publicId: string }) =>
      adminClient.patch(`/admin/sutras/translations/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Bản dịch đã được cập nhật");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.translations.detail(publicId) });
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.translations.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create commentary
 */
export function useCreateSutraCommentaryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentaryInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/sutras/commentaries", input),
    onSuccess: () => {
      toast.success("✅ Chú giải đã được tạo");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.commentaries.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update commentary
 */
export function useUpdateSutraCommentaryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateCommentaryInput> & { publicId: string }) =>
      adminClient.patch(`/admin/sutras/commentaries/${publicId}`, input),
    onSuccess: () => {
      toast.success("✅ Chú giải đã được cập nhật");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.commentaries.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create interpretation
 */
export function useCreateSutraInterpretationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInterpretationInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/sutras/interpretations", input),
    onSuccess: () => {
      toast.success("✅ Giải thích đã được tạo");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.interpretations.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update interpretation
 */
export function useUpdateSutraInterpretationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateInterpretationInput> & { publicId: string }) =>
      adminClient.patch(`/admin/sutras/interpretations/${publicId}`, input),
    onSuccess: () => {
      toast.success("✅ Giải thích đã được cập nhật");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.interpretations.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish entire sutras workspace
 */
export function usePublishSutrasWorkspaceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post("/admin/sutras/publish"),
    onSuccess: () => {
      toast.success("✅ Không gian kinh điển đã được xuất bản");
      void qc.invalidateQueries({ queryKey: sutrasAdminKeys.all });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}
