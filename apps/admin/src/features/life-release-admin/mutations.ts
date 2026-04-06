import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { lifeReleaseAdminKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";

/**
 * Life release mutations per ADMIN_FEATURE_QUERY_PLAN line 37:
 * "whole workspace + public guide surfaces"
 */

export interface CreateRitualInput {
  name: string;
  description: string;
  duration: number;
  capacity: number;
  status: "DRAFT" | "PUBLISHED";
}

export interface CreateDedicantInput {
  name: string;
  intention: string;
  ritualId: string;
}

export interface CreateLocationInput {
  name: string;
  address: string;
  capacity: number;
}

/**
 * Create ritual
 */
export function useCreateLifeReleaseRitualMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRitualInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/life-release/rituals", input),
    onSuccess: () => {
      toast.success("✅ Nghi thức giải thoát đã được tạo");
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.rituals.lists() });
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.overview() });
    },
    onError: handleApiError,
  });
}

/**
 * Update ritual
 */
export function useUpdateLifeReleaseRitualMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: Partial<CreateRitualInput> & { publicId: string }) =>
      adminClient.patch(`/admin/life-release/rituals/${publicId}`, input),
    onSuccess: (_data, { publicId }) => {
      toast.success("✅ Nghi thức giải thoát đã được cập nhật");
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.rituals.detail(publicId) });
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.rituals.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish ritual
 */
export function usePublishLifeReleaseRitualMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/life-release/rituals/${publicId}/publish`),
    onSuccess: (_data, publicId) => {
      toast.success("✅ Nghi thức giải thoát đã được xuất bản");
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.rituals.detail(publicId) });
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.rituals.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}

/**
 * Create dedicant
 */
export function useCreateLifeReleaseDedicantMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDedicantInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/life-release/dedicants", input),
    onSuccess: () => {
      toast.success("✅ Người cầu nguyện đã được thêm");
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.dedicants.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Create location
 */
export function useCreateLifeReleaseLocationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLocationInput) =>
      adminClient.post<{ data: { publicId: string } }>("/admin/life-release/locations", input),
    onSuccess: () => {
      toast.success("✅ Địa điểm đã được tạo");
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.locations.lists() });
    },
    onError: handleApiError,
  });
}

/**
 * Publish entire life release workspace
 */
export function usePublishLifeReleaseWorkspaceMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminClient.post("/admin/life-release/publish"),
    onSuccess: () => {
      toast.success("✅ Không gian giải thoát đã được xuất bản");
      void qc.invalidateQueries({ queryKey: lifeReleaseAdminKeys.all });
      void qc.invalidateQueries({ queryKey: dashboardKeys.contentOpsSummary() });
    },
    onError: handleApiError,
  });
}
