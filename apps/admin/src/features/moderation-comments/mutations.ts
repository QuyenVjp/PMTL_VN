import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { moderationCommentKeys } from "./queries.js";
import { toast } from "sonner";

export type CommentDecision = "hide" | "ignore" | "escalate";

export function useDecideCommentReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      decision,
    }: {
      publicId: string;
      decision: CommentDecision;
    }) => adminClient.patch(`/moderation/reports/${publicId}/decide`, { decision }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: moderationCommentKeys.lists() });
      toast.success("Đã xử lý báo cáo bình luận");
    },
    onError: () => toast.error("Không thể xử lý báo cáo"),
  });
}
