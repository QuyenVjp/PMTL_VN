import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { altarMgmtKeys } from "./queries.js";

export function useUpdateAltarCondition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      condition,
      notes,
    }: {
      publicId: string;
      condition: string;
      notes?: string;
    }) => adminClient.patch(`/altar-management/items/${publicId}/condition`, { condition, notes }),
    onSuccess: () => {
      toast.success("Đã cập nhật tình trạng vật phẩm.");
      void qc.invalidateQueries({ queryKey: altarMgmtKeys.all });
    },
    onError: handleApiError,
  });
}
