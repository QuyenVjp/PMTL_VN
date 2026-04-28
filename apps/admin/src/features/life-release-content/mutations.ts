import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { lifeReleaseContentKeys, type LifeReleaseGuideGroup, type LifeReleaseStatus } from "./queries.js";

export interface CreateLifeReleaseGuideInput {
  title: string;
  slug?: string;
  summary: string;
  groupKey: LifeReleaseGuideGroup;
  sourceReference: string;
  reviewNote: string;
  warningNotes?: string[];
  displayOrder?: number;
}

export interface UpdateLifeReleaseGuideInput extends Partial<CreateLifeReleaseGuideInput> {
  publicId: string;
}

export interface CreateLifeReleaseVariantInput {
  name: string;
  summary: string;
  routeSlug: string;
  sourceReference: string;
  reviewNote: string;
  warningNotes?: string[];
  displayOrder?: number;
}

export interface UpdateLifeReleaseVariantInput extends Partial<CreateLifeReleaseVariantInput> {
  publicId: string;
}

export interface CreateLifeReleaseFaqInput {
  question: string;
  answer: string;
  sourceReference: string;
  displayOrder?: number;
}

export interface UpdateLifeReleaseFaqInput extends Partial<CreateLifeReleaseFaqInput> {
  publicId: string;
}

export interface PublishLifeReleaseInput {
  status: LifeReleaseStatus;
  changeSummary: string;
}

export function usePublishLifeRelease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishLifeReleaseInput) => adminClient.post("/admin/content/life-release/publish", input),
    onSuccess: (_data, variables) => {
      toast.success(variables.status === "PUBLISHED" ? "Đã xuất bản Phóng sanh." : "Đã đưa Phóng sanh về nháp.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateLifeReleaseGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLifeReleaseGuideInput) => adminClient.post("/admin/content/life-release/guides", input),
    onSuccess: () => {
      toast.success("Đã thêm bài hướng dẫn Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateLifeReleaseGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateLifeReleaseGuideInput) => adminClient.patch(`/admin/content/life-release/guides/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật bài hướng dẫn Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteLifeReleaseGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/content/life-release/guides/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá bài hướng dẫn Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateLifeReleaseVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLifeReleaseVariantInput) => adminClient.post("/admin/content/life-release/ritual-variants", input),
    onSuccess: () => {
      toast.success("Đã thêm biến thể nghi thức Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateLifeReleaseVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateLifeReleaseVariantInput) => adminClient.patch(`/admin/content/life-release/ritual-variants/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật biến thể nghi thức Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteLifeReleaseVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/content/life-release/ritual-variants/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá biến thể nghi thức Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateLifeReleaseFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLifeReleaseFaqInput) => adminClient.post("/admin/content/life-release/faq", input),
    onSuccess: () => {
      toast.success("Đã thêm mục hỏi đáp Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateLifeReleaseFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateLifeReleaseFaqInput) => adminClient.patch(`/admin/content/life-release/faq/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật mục hỏi đáp Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteLifeReleaseFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/content/life-release/faq/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá mục hỏi đáp Phóng sanh.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}
