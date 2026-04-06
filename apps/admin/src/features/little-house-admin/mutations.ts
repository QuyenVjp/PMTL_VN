import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { littleHouseAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Little house mutations per ADMIN_FEATURE_QUERY_PLAN line 36:
 * "whole workspace + public guide surfaces"
 */

export interface CreateGuideInput {
  title: string;
  slug: string;
  content: string;
  difficulty: string;
  estimatedMinutes: number;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateCaseVariantInput {
  name: string;
  scenario: string;
  guidelines: Record<string, unknown>;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateFaqInput {
  question: string;
  answer: string;
  category: string;
  featured: boolean;
}

/**
 * Create guide
 */
export function useCreateLittleHouseGuideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGuideInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/little-house/guides", input),
    onSuccess: () => {
      toast.success("✅ Hướng dẫn nhà nhỏ đã được tạo");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.guides.lists() });
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update guide
 */
export function useUpdateLittleHouseGuideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateGuideInput> & { publicId: string }) =>
      adminClient.patch(`/admin/little-house/guides/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Hướng dẫn nhà nhỏ đã được cập nhật");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.guides.detail(publicId) });
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.guides.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish guide
 */
export function usePublishLittleHouseGuideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/little-house/guides/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Hướng dẫn nhà nhỏ đã được xuất bản");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.guides.detail(publicId) });
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.guides.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}

/**
 * Create case variant
 */
export function useCreateLittleHouseCaseVariantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCaseVariantInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/little-house/case-variants", input),
    onSuccess: () => {
      toast.success("✅ Biến thể tình huống đã được tạo");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.caseVariants.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update case variant
 */
export function useUpdateLittleHouseCaseVariantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateCaseVariantInput> & { publicId: string }) =>
      adminClient.patch(`/admin/little-house/case-variants/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Biến thể tình huống đã được cập nhật");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.caseVariants.detail(publicId) });
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.caseVariants.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create FAQ
 */
export function useCreateLittleHouseFaqMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFaqInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/little-house/faq", input),
    onSuccess: () => {
      toast.success("✅ Câu hỏi thường gặp đã được tạo");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.faq.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update FAQ
 */
export function useUpdateLittleHouseFaqMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateFaqInput> & { publicId: string }) =>
      adminClient.patch(`/admin/little-house/faq/${publicId}`, input),
    onSuccess: () => {
      toast.success("✅ Câu hỏi thường gặp đã được cập nhật");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.faq.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish entire little house workspace
 */
export function usePublishLittleHouseWorkspaceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post("/admin/little-house/publish"),
    onSuccess: () => {
      toast.success("✅ Không gian nhà nhỏ đã được xuất bản");
      void qc.invalidateQueries({ queryKey: littleHouseAdminKeys.all });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}
