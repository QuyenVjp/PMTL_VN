import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { littleHouseContentKeys, type LittleHouseGuideGroup, type LittleHouseStatus } from "./queries.js";

export interface PublishLittleHouseInput {
  status: LittleHouseStatus;
  changeSummary: string;
}

export interface CreateLittleHouseGuideInput {
  title: string;
  slug?: string;
  summary: string;
  groupKey: LittleHouseGuideGroup;
  sourceReference: string;
  versionNote: string;
  warningNotes?: string[];
  displayOrder?: number;
}

export interface UpdateLittleHouseGuideInput extends Partial<CreateLittleHouseGuideInput> {
  publicId: string;
}

export interface CreateLittleHouseCaseVariantInput {
  name: string;
  summary: string;
  relatedGroup: LittleHouseGuideGroup;
  sourceReference: string;
  reviewNote: string;
  warningNotes?: string[];
  displayOrder?: number;
}

export interface UpdateLittleHouseCaseVariantInput extends Partial<CreateLittleHouseCaseVariantInput> {
  publicId: string;
}

export interface CreateLittleHouseFaqInput {
  question: string;
  answer: string;
  sourceReference: string;
  displayOrder?: number;
}

export interface UpdateLittleHouseFaqInput extends Partial<CreateLittleHouseFaqInput> {
  publicId: string;
}

export function usePublishLittleHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishLittleHouseInput) => adminClient.post("/admin/content/little-house/publish", input),
    onSuccess: (_data, variables) => {
      toast.success(variables.status === "PUBLISHED" ? "Đã xuất bản Ngôi Nhà Nhỏ." : "Đã đưa Ngôi Nhà Nhỏ về nháp.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateLittleHouseGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLittleHouseGuideInput) => adminClient.post("/admin/content/little-house/guides", input),
    onSuccess: () => {
      toast.success("Đã thêm bài hướng dẫn Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateLittleHouseGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateLittleHouseGuideInput) => adminClient.patch(`/admin/content/little-house/guides/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật bài hướng dẫn Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteLittleHouseGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/content/little-house/guides/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá bài hướng dẫn Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateLittleHouseCaseVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLittleHouseCaseVariantInput) => adminClient.post("/admin/content/little-house/case-variants", input),
    onSuccess: () => {
      toast.success("Đã thêm biến thể tình huống Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateLittleHouseCaseVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateLittleHouseCaseVariantInput) => adminClient.patch(`/admin/content/little-house/case-variants/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật biến thể tình huống Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteLittleHouseCaseVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/content/little-house/case-variants/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá biến thể tình huống Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateLittleHouseFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLittleHouseFaqInput) => adminClient.post("/admin/content/little-house/faq", input),
    onSuccess: () => {
      toast.success("Đã thêm mục hỏi đáp Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateLittleHouseFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateLittleHouseFaqInput) => adminClient.patch(`/admin/content/little-house/faq/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật mục hỏi đáp Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}

export function useDeleteLittleHouseFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => adminClient.delete(`/admin/content/little-house/faq/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá mục hỏi đáp Ngôi Nhà Nhỏ.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}
