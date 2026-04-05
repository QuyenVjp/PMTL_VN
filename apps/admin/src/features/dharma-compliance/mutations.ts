import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { charityKeys, fraudAlertKeys, guidanceKeys } from "./queries.js";

export function useUpdateCharityStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, status, reason }: { publicId: string; status: string; reason: string }) =>
      adminClient.patch(`/dharma-compliance/charities/${publicId}/status`, { status, reason }),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái tổ chức từ thiện.");
      void qc.invalidateQueries({ queryKey: charityKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useResolveFraudAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, resolution }: { publicId: string; resolution: string }) =>
      adminClient.patch(`/dharma-compliance/fraud-alerts/${publicId}/resolve`, { resolution }),
    onSuccess: () => {
      toast.success("Đã xử lý cảnh báo gian lận.");
      void qc.invalidateQueries({ queryKey: fraudAlertKeys.lists() });
    },
    onError: handleApiError,
  });
}

export function useRespondGuidance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: string; response: string }) =>
      adminClient.patch(`/dharma-compliance/vows/guidance/${id}/respond`, { response }),
    onSuccess: () => {
      toast.success("Đã phản hồi yêu cầu hướng dẫn.");
      void qc.invalidateQueries({ queryKey: guidanceKeys.lists() });
    },
    onError: handleApiError,
  });
}
