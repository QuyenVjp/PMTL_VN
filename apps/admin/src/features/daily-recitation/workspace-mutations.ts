import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import {
  dailyPracticeWorkspaceKeys,
  type DailyPracticeDifficulty,
  type DailyPracticeStatus,
} from "./workspace-queries.js";

export interface CreateDailyPracticeGuideInput {
  title: string;
  slug?: string;
  body: string;
  scriptureImageMediaPublicId?: string | null;
  duration: number;
  difficulty: DailyPracticeDifficulty;
  sortOrder: number;
}

export interface UpdateDailyPracticeGuideInput extends Partial<CreateDailyPracticeGuideInput> {
  publicId: string;
  status?: DailyPracticeStatus;
}

export interface CreateDailyPracticePresetInput {
  name: string;
  scenarioType: string;
  practiceCount: number;
  guideIds: string[];
}

export interface UpdateDailyPracticePresetInput extends Partial<CreateDailyPracticePresetInput> {
  publicId: string;
}

export interface CreateDailyPracticeFaqInput {
  question: string;
  answer: string;
  category: string;
  featured: boolean;
  sortOrder: number;
}

export interface UpdateDailyPracticeFaqInput extends Partial<CreateDailyPracticeFaqInput> {
  publicId: string;
}

export function useCreateDailyPracticeGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDailyPracticeGuideInput) => adminClient.post("/admin/daily-practice/guides", input),
    onSuccess: () => {
      toast.success("Đã thêm bài niệm/bài chú Kinh bài tập.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateDailyPracticeGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateDailyPracticeGuideInput) =>
      adminClient.patch(`/admin/daily-practice/guides/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật bài niệm/bài chú Kinh bài tập.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteDailyPracticeGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/daily-practice/guides/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá bài niệm/bài chú.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateDailyPracticePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDailyPracticePresetInput) => adminClient.post("/admin/daily-practice/presets", input),
    onSuccess: () => {
      toast.success("Đã thêm kịch bản tu học.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateDailyPracticePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateDailyPracticePresetInput) =>
      adminClient.patch(`/admin/daily-practice/presets/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật kịch bản tu học.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteDailyPracticePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/daily-practice/presets/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá kịch bản tu học.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateDailyPracticeFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDailyPracticeFaqInput) => adminClient.post("/admin/daily-practice/faq", input),
    onSuccess: () => {
      toast.success("Đã thêm mục hỏi đáp.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateDailyPracticeFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateDailyPracticeFaqInput) =>
      adminClient.patch(`/admin/daily-practice/faq/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật mục hỏi đáp.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteDailyPracticeFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/daily-practice/faq/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá mục hỏi đáp.");
      void queryClient.invalidateQueries({ queryKey: dailyPracticeWorkspaceKeys.all });
    },
    onError: handleApiError,
  });
}
