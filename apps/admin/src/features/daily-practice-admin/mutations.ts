import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { dailyPracticeAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Daily practice mutations per ADMIN_FEATURE_QUERY_PLAN line 35:
 * "whole workspace + public grouped loaders"
 */

export interface CreatePracticeGuideInput {
  title: string;
  slug: string;
  content: string;
  duration: number;
  difficulty: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateScenarioPresetInput {
  name: string;
  scenarioType: string;
  configuration: Record<string, unknown>;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreatePracticeFaqInput {
  question: string;
  answer: string;
  category: string;
  featured: boolean;
}

/**
 * Create practice guide
 */
export function useCreateDailyPracticeGuideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePracticeGuideInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/daily-practice/guides", input),
    onSuccess: () => {
      toast.success("✅ Hướng dẫn thực hành đã được tạo");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.guides.lists() });
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update practice guide
 */
export function useUpdateDailyPracticeGuideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreatePracticeGuideInput> & { publicId: string }) =>
      adminClient.patch(`/admin/daily-practice/guides/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Hướng dẫn thực hành đã được cập nhật");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.guides.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.guides.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create scenario preset
 */
export function useCreateScenarioPresetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScenarioPresetInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/daily-practice/presets", input),
    onSuccess: () => {
      toast.success("✅ Mẫu kịch bản đã được tạo");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.presets.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update scenario preset
 */
export function useUpdateScenarioPresetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateScenarioPresetInput> & { publicId: string }) =>
      adminClient.patch(`/admin/daily-practice/presets/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Mẫu kịch bản đã được cập nhật");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.presets.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.presets.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create FAQ entry
 */
export function useCreateDailyPracticeFaqMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePracticeFaqInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/daily-practice/faq", input),
    onSuccess: () => {
      toast.success("✅ Câu hỏi thường gặp đã được tạo");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.faq.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update FAQ entry
 */
export function useUpdateDailyPracticeFaqMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreatePracticeFaqInput> & { publicId: string }) =>
      adminClient.patch(`/admin/daily-practice/faq/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Câu hỏi thường gặp đã được cập nhật");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.faq.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.faq.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish daily practice workspace (all guides + presets + faq)
 */
export function usePublishDailyPracticeWorkspaceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post("/admin/daily-practice/publish"),
    onSuccess: () => {
      toast.success("✅ Không gian thực hành hàng ngày đã được xuất bản");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeAdminKeys.all });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}
