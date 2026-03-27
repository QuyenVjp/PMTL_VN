import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import { sessionAdminKeys } from "./queries.js";

/** Revoke a single session */
export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) =>
      adminClient.delete(`/admin/sessions/${sessionId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionAdminKeys.lists() });
    },
  });
}

/** Revoke multiple sessions at once */
export function useRevokeBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionIds }: { sessionIds: string[] }) =>
      adminClient.post("/admin/sessions/revoke-bulk", { sessionIds }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: sessionAdminKeys.lists() });
    },
  });
}
