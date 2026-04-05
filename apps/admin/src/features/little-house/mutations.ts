import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { lhKeys } from "./queries.js";

export function useAdvanceLhStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, status }: { publicId: string; status: string }) =>
      adminClient.patch(`/little-house/${publicId}/advance`, { status }),
    onSuccess: (_, { publicId }) => {
      toast.success("Đã chuyển trạng thái sớ.");
      void qc.invalidateQueries({ queryKey: lhKeys.lists() });
      void qc.invalidateQueries({ queryKey: lhKeys.detail(publicId) });
    },
    onError: handleApiError,
  });
}

export function useFlagLhFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, reason, severity }: { publicId: string; reason: string; severity: string }) =>
      adminClient.post(`/little-house/${publicId}/fraud`, { reason, severity }),
    onSuccess: () => {
      toast.success("Đã gắn cờ gian lận.");
      void qc.invalidateQueries({ queryKey: lhKeys.all });
    },
    onError: handleApiError,
  });
}

export function useResolveLhFraud() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fraudId, resolution }: { fraudId: string; resolution: string }) =>
      adminClient.patch(`/little-house/fraud/${fraudId}/resolve`, { resolution }),
    onSuccess: () => {
      toast.success("Đã xử lý gian lận.");
      void qc.invalidateQueries({ queryKey: lhKeys.all });
    },
    onError: handleApiError,
  });
}
