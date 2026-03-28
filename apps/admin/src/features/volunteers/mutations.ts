import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { volunteerKeys } from "./queries.js";

export interface CreateVolunteerInput {
  displayName: string;
  role: string;
  phone?: string;
  zaloLink?: string;
  bio?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateVolunteerInput {
  displayName?: string;
  role?: string;
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
      toast.success("Đã thêm phụng sự viên mới.");
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
      toast.success("Đã cập nhật phụng sự viên.");
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
      toast.success("Đã xoá phụng sự viên.");
      void qc.invalidateQueries({ queryKey: volunteerKeys.lists() });
    },
    onError: handleApiError,
  });
}
