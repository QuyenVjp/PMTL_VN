import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { beginnerGuideAdminKeys } from "./queries.js";

/**
 * Beginner guide mutations per ADMIN_FEATURE_QUERY_PLAN line 34:
 * "guide list/detail + related public guide loaders"
 */

export interface CreateBeginnerGuideInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  videoUrl?: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes: number;
  tags?: string[];
  status: "DRAFT" | "PUBLISHED";
}

export interface UpdateBeginnerGuideInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  videoUrl?: string;
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  estimatedMinutes?: number;
  tags?: string[];
}

/**
 * Create a new beginner guide
 */
export function useCreateBeginnerGuideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBeginnerGuideInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/beginner-guides", input),
    onSuccess: () => {
      toast.success("✅ Hướng dẫn đã được tạo");
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update beginner guide details
 */
export function useUpdateBeginnerGuideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateBeginnerGuideInput & { publicId: string }) =>
      adminClient.patch(`/admin/beginner-guides/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Hướng dẫn đã được cập nhật");
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish a beginner guide
 */
export function usePublishBeginnerGuideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/beginner-guides/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Hướng dẫn đã được xuất bản");
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.lists() });
      // Public guide loaders invalidation would be handled by public cache owner
    },
    onError: handleApiError,
  });
}

/**
 * Unpublish a beginner guide
 */
export function useUnpublishBeginnerGuideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/beginner-guides/${publicId}/unpublish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Hướng dẫn đã được đưa về nháp");
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Archive a beginner guide
 */
export function useArchiveBeginnerGuideMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/beginner-guides/${publicId}/archive`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Hướng dẫn đã được ẩn");
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.detail(publicId) });
      void queryClient.invalidateQueries({ queryKey: beginnerGuideAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}
