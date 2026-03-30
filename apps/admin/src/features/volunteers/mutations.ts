import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { volunteerKeys } from "./queries.js";

export interface CreateVolunteerInput {
  displayName: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  zaloLink?: string;
  bio?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateVolunteerInput {
  displayName?: string;
  role?: string;
  avatarUrl?: string;
  phone?: string;
  zaloLink?: string;
  bio?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/** Create a new volunteer */
export function useCreateVolunteer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVolunteerInput) =>
      adminClient.post("/admin/volunteers", input),
    onSuccess: () => {
      toast.success("Đã thêm tình nguyện viên mới.");
      void qc.invalidateQueries({ queryKey: volunteerKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Update an existing volunteer */
export function useUpdateVolunteer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, input }: { publicId: string; input: UpdateVolunteerInput }) =>
      adminClient.patch(`/admin/volunteers/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật tình nguyện viên.");
      void qc.invalidateQueries({ queryKey: volunteerKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Delete a volunteer */
export function useDeleteVolunteer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/volunteers/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá tình nguyện viên.");
      void qc.invalidateQueries({ queryKey: volunteerKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Activate a volunteer */
export function useActivateVolunteer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/volunteers/${publicId}/activate`),
    onSuccess: () => {
      toast.success("Đã kích hoạt tình nguyện viên.");
      void qc.invalidateQueries({ queryKey: volunteerKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Deactivate a volunteer */
export function useDeactivateVolunteer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/volunteers/${publicId}/deactivate`),
    onSuccess: () => {
      toast.success("Đã vô hiệu hoá tình nguyện viên.");
      void qc.invalidateQueries({ queryKey: volunteerKeys.lists() });
    },
    onError: handleApiError,
  });
}
