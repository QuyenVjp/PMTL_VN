import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { guestbookKeys } from "./queries.js";
import { toast } from "sonner";

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
    onError: () => toast.error("Không thể cập nhật trạng thái"),
  });
}
