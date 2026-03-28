import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { communityPostKeys } from "./queries.js";
import { toast } from "sonner";

export function useUpdateCommunityPostStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: string }) =>
      adminClient.patch(`/admin/community/posts/${publicId}`, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
      toast.success("Đã cập nhật trạng thái bài đăng");
    },
    onError: () => toast.error("Không thể cập nhật trạng thái"),
  });
}
