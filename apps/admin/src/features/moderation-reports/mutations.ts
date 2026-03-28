import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { reportKeys } from "./queries.js";
import type { DecisionType } from "./types.js";

/** Resolve a moderation report with a decision */
export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      decision,
      note,
    }: {
      publicId: string;
      decision: DecisionType;
      note?: string;
    }) => adminClient.post(`/moderation/reports/${publicId}/decision`, { decision, note }),
    onSuccess: () => {
      toast.success("Đã xử lý báo cáo.");
      void qc.invalidateQueries({ queryKey: reportKeys.lists() });
    },
    onError: handleApiError,
  });
}
