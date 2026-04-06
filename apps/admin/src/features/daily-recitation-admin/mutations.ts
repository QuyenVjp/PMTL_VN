import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { recitationAdminKeys } from "./queries.js";

/**
 * Daily Recitation (Công Khóa) mutations
 * Manages practice schedules, guidelines, and daily routines
 */

export interface CreatePracticeScheduleInput {
  name: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  dailyMinutes: number;
  scriptureList: Array<{ scriptureId: string; recitations: number }>;
  minRecitations: number;
  maxRecitations?: number;
  status: "PUBLISHED" | "DRAFT";
}

export interface CreateGuidelineInput {
  scheduleId: string;
  topic: string;
  guidance: string;
  importance: "CRITICAL" | "IMPORTANT" | "REFERENCE";
}

export interface CreateDailyRoutineInput {
  scheduleId: string;
  dayNumber: number;
  scriptureSequence: string[];
  timing: string;
  notes: string;
}

/**
 * Create practice schedule
 */
export function useCreatePracticeScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePracticeScheduleInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/daily-recitation/schedules", input),
    onSuccess: () => {
      toast.success("✅ Lịch tu hành đã được tạo");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.schedules.lists() });
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update practice schedule
 */
export function useUpdatePracticeScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreatePracticeScheduleInput> & { publicId: string }) =>
      adminClient.patch(`/admin/daily-recitation/schedules/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Lịch tu hành đã được cập nhật");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.schedules.detail(publicId) });
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.schedules.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish practice schedule
 */
export function usePublishPracticeScheduleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/daily-recitation/schedules/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Lịch tu hành đã được xuất bản");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.schedules.detail(publicId) });
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.schedules.lists() });
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Create recitation guideline
 */
export function useCreateRecitationGuidelineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGuidelineInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/daily-recitation/guidelines", input),
    onSuccess: () => {
      toast.success("✅ Hướng dẫn tụng kinh đã được tạo");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.guidelines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update recitation guideline
 */
export function useUpdateRecitationGuidelineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateGuidelineInput> & { publicId: string }) =>
      adminClient.patch(`/admin/daily-recitation/guidelines/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Hướng dẫn tụng kinh đã được cập nhật");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.guidelines.detail(publicId) });
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.guidelines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete recitation guideline
 */
export function useDeleteRecitationGuidelineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/daily-recitation/guidelines/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Hướng dẫn tụng kinh đã được xóa");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.guidelines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create daily routine
 */
export function useCreateDailyRoutineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDailyRoutineInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/daily-recitation/routines", input),
    onSuccess: () => {
      toast.success("✅ Lịch trình hàng ngày đã được tạo");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.routines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update daily routine
 */
export function useUpdateDailyRoutineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateDailyRoutineInput> & { publicId: string }) =>
      adminClient.patch(`/admin/daily-recitation/routines/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Lịch trình hàng ngày đã được cập nhật");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.routines.detail(publicId) });
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.routines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Delete daily routine
 */
export function useDeleteDailyRoutineMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/daily-recitation/routines/${publicId}`),
    onSuccess: () => {
      toast.success("✅ Lịch trình hàng ngày đã được xóa");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.routines.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish all schedules and routines
 */
export function usePublishRecitationMaterialsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      adminClient.post("/admin/daily-recitation/publish-all"),
    onSuccess: () => {
      toast.success("✅ Tất cả tài liệu tụng kinh đã được xuất bản");
      void qc.invalidateQueries({ queryKey: recitationAdminKeys.all });
    },
    onError: handleApiError,
  });
}
