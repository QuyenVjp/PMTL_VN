import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { sessionAdminKeys } from "./queries.js";

/** Revoke a single session */
export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) =>
      adminClient.delete(`/admin/sessions/${sessionId}`),
    onSuccess: () => {
      toast.success("Đã thu hồi phiên đăng nhập.");
      void qc.invalidateQueries({ queryKey: sessionAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}

/** Revoke multiple sessions at once */
export function useRevokeBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionIds }: { sessionIds: string[] }) =>
      adminClient.post("/admin/sessions/revoke-bulk", { sessionIds }),
    onSuccess: (_data, { sessionIds }) => {
      toast.success(`Đã thu hồi ${sessionIds.length} phiên đăng nhập.`);
      void qc.invalidateQueries({ queryKey: sessionAdminKeys.lists() });
    },
    onError: handleApiError,
  });
}
