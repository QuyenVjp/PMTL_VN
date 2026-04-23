import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { lifeReleaseKeys } from "./queries.js";

export function useUpdateLifeReleaseStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, status, notes }: { publicId: string; status: string; notes?: string }) =>
      adminClient.patch(`/admin/life-liberation/${publicId}/status`, { status, notes }),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái hồ sơ phóng sinh.");
      void qc.invalidateQueries({ queryKey: lifeReleaseKeys.lists() });
    },
    onError: handleApiError,
  });
}
