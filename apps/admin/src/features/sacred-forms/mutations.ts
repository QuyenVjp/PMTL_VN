import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { sacredFormKeys } from "./queries.js";
import type { SacredFormType } from "./types.js";

export interface CreateTemplateInput {
  formType: SacredFormType;
  titleVi: string;
  titleZh?: string;
  description?: string;
  isActive?: boolean;
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateInput) =>
      adminClient.post("/admin/sacred-forms/templates", data),
    onSuccess: () => {
      toast.success("Đã tạo mẫu đơn.");
      void qc.invalidateQueries({ queryKey: sacredFormKeys.templates() });
    },
    onError: handleApiError,
  });
}

export function useReviewApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      decision,
      reviewNotes,
      probationDays,
    }: {
      publicId: string;
      decision: "APPROVE" | "REJECT" | "PROBATION";
      reviewNotes?: string;
      probationDays?: number;
    }) =>
      adminClient.patch(`/admin/sacred-forms/applicants/${publicId}/review`, {
        decision,
        reviewNotes,
        probationDays,
      }),
    onSuccess: (_, { publicId }) => {
      toast.success("Đã xét duyệt đơn đăng ký.");
      void qc.invalidateQueries({ queryKey: sacredFormKeys.applicants() });
      void qc.invalidateQueries({ queryKey: sacredFormKeys.applicantDetail(publicId) });
    },
    onError: handleApiError,
  });
}

export function useToggleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, isActive }: { publicId: string; isActive: boolean }) =>
      adminClient.patch(`/admin/sacred-forms/templates/${publicId}/toggle`, { isActive }),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái mẫu đơn.");
      void qc.invalidateQueries({ queryKey: sacredFormKeys.templates() });
    },
    onError: handleApiError,
  });
}

export function useUpdatePrerequisite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      applicantPublicId,
      name,
      status,
      evidence,
    }: {
      applicantPublicId: string;
      name: string;
      status: string;
      evidence?: string;
    }) =>
      adminClient.patch(`/admin/sacred-forms/applicants/${applicantPublicId}/prerequisites`, {
        name,
        status,
        evidence,
      }),
    onSuccess: (_, { applicantPublicId }) => {
      toast.success("Đã cập nhật điều kiện tiên quyết.");
      void qc.invalidateQueries({ queryKey: sacredFormKeys.applicantDetail(applicantPublicId) });
    },
    onError: handleApiError,
  });
}
