import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { guestbookKeys } from "./queries.js";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-api-error.js";

export function useUpdateGuestbookStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      status,
    }: {
      publicId: string;
      status: "APPROVED" | "REJECTED";
    }) => adminClient.patch(`/admin/community/guestbook/${publicId}`, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: guestbookKeys.lists() });
      toast.success("Đã cập nhật trạng thái lưu niệm");
    },
    onError: handleApiError,
  });
}

export function useApproveGuestbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.patch(`/admin/community/guestbook/${publicId}`, { status: "APPROVED" }),
    onSuccess: () => {
      toast.success("Đã duyệt lưu niệm.");
      void qc.invalidateQueries({ queryKey: guestbookKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useRejectGuestbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.patch(`/admin/community/guestbook/${publicId}`, { status: "REJECTED" }),
    onSuccess: () => {
      toast.success("Đã từ chối lưu niệm.");
      void qc.invalidateQueries({ queryKey: guestbookKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useDeleteGuestbook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/community/guestbook/${publicId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: guestbookKeys.lists() });
      toast.success("Đã xoá lưu niệm");
    },
    onError: handleApiError,
  });
}
