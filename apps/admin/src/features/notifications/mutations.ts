import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { pushKeys } from "./queries.js";

export interface CreatePushJobInput {
  title: string;
  body: string;
  targetAudience?: string;
}

/** Create a new push notification job */
export function useCreatePushJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePushJobInput) =>
      adminClient.post("/admin/notifications/push/jobs", input),
    onSuccess: () => {
      toast.success("Đã tạo đợt gửi thông báo mới.");
      void qc.invalidateQueries({ queryKey: pushKeys.lists() });
      void qc.invalidateQueries({ queryKey: pushKeys.status() });
    },
    onError: handleApiError,
  });
}

/** Redrive a failed push job */
export function useRedrivePushJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/notifications/push/jobs/${publicId}/redrive`),
    onSuccess: () => {
      toast.success("Đã gửi lại đợt thông báo thất bại.");
      void qc.invalidateQueries({ queryKey: pushKeys.lists() });
      void qc.invalidateQueries({ queryKey: pushKeys.status() });
    },
    onError: handleApiError,
  });
}

/** Delete a push job */
export function useDeletePushJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/notifications/push/jobs/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá đợt thông báo.");
      void qc.invalidateQueries({ queryKey: pushKeys.lists() });
      void qc.invalidateQueries({ queryKey: pushKeys.status() });
    },
    onError: handleApiError,
  });
}
