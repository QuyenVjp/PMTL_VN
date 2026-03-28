import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { mediaKeys } from "./queries.js";
import { dashboardKeys } from "@/features/dashboard/queries.js";

export function useDeleteMediaAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.delete(`/admin/media/${publicId}`),
    onSuccess: () => {
      toast.success("Đã xoá media asset.");
      void qc.invalidateQueries({ queryKey: mediaKeys.lists() });
      void qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: handleApiError,
  });
}
