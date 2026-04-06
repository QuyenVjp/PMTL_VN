import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { chantAdminKeys } from "@/features/chant-admin/queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Chant mutations per ADMIN_FEATURE_QUERY_PLAN line 40:
 * "collection-based structure with recordings and lyrics"
 */

export interface CreateCollectionInput {
  name: string;
  slug: string;
  description: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateChantInput {
  title: string;
  collectionId: string;
  difficulty: string;
  duration: number;
  content: string;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateRecordingInput {
  chantId: string;
  artist: string;
  audioUrl: string;
  duration: number;
}

export interface CreateLyricsInput {
  chantId: string;
  language: string;
  content: string;
  romanization?: string;
}

type UpdateEnvironmentRulePayload = {
  title?: string;
  canonicalWording?: string;
  severity?: string;
  productizationMode?: string;
  referenceOnly?: boolean;
};

/**
 * Create collection
 */
export function useCreateChantCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCollectionInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/chant/collections", input),
    onSuccess: () => {
      toast.success("✅ Bộ sưu tập tụng kinh đã được tạo");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.collections.lists() });
      void qc.invalidateQueries({ queryKey: chantAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update collection
 */
export function useUpdateChantCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateCollectionInput> & { publicId: string }) =>
      adminClient.patch(`/admin/chant/collections/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Bộ sưu tập tụng kinh đã được cập nhật");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.collections.detail(publicId) });
      void qc.invalidateQueries({ queryKey: chantAdminKeys.collections.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish collection
 */
export function usePublishChantCollectionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/chant/collections/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Bộ sưu tập tụng kinh đã được xuất bản");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.collections.detail(publicId) });
      void qc.invalidateQueries({ queryKey: chantAdminKeys.collections.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}

/**
 * Create chant
 */
export function useCreateChantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateChantInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/chant/chants", input),
    onSuccess: () => {
      toast.success("✅ Tụng kinh đã được tạo");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.chants.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Update chant
 */
export function useUpdateChantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateChantInput> & { publicId: string }) =>
      adminClient.patch(`/admin/chant/chants/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Tụng kinh đã được cập nhật");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.chants.detail(publicId) });
      void qc.invalidateQueries({ queryKey: chantAdminKeys.chants.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create recording
 */
export function useCreateChantRecordingMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecordingInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/chant/recordings", input),
    onSuccess: () => {
      toast.success("✅ Bản ghi âm đã được tạo");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.recordings.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create lyrics
 */
export function useCreateChantLyricsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLyricsInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/chant/lyrics", input),
    onSuccess: () => {
      toast.success("✅ Lời tụng đã được tạo");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.lyrics.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish entire chant workspace
 */
export function usePublishChantWorkspaceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post("/admin/chant/publish"),
    onSuccess: () => {
      toast.success("✅ Không gian tụng kinh đã được xuất bản");
      void qc.invalidateQueries({ queryKey: chantAdminKeys.all });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}

/**
 * Update environment rule
 */
export function useUpdateEnvironmentRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleKey,
      payload,
    }: {
      ruleKey: string;
      payload: UpdateEnvironmentRulePayload;
    }) =>
      adminClient.patch(
        `/admin/content/chanting/environment-rules/${ruleKey}`,
        payload,
      ),
    onSuccess: () => {
      toast.success("Đã cập nhật quy tắc môi trường.");
      void queryClient.invalidateQueries({ queryKey: chantAdminKeys.environmentRules() });
    },
    onError: handleApiError,
  });
}
