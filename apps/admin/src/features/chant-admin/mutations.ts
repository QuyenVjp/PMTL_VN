import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client";
import { handleApiError } from "@/lib/handle-api-error";
import { chantAdminKeys } from "@/features/chant-admin/queries";

type UpdateEnvironmentRulePayload = {
  title?: string;
  canonicalWording?: string;
  severity?: string;
  productizationMode?: string;
  referenceOnly?: boolean;
};

export function useUpdateEnvironmentRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleKey,
      payload,
    }: {
      ruleKey: string;
      payload: UpdateEnvironmentRulePayload;
    }) =>
      adminClient.patch(
        `/admin/content/chanting/environment-rules/${ruleKey}`,
        payload,
      ),
    onSuccess: () => {
      toast.success("Đã cập nhật quy tắc môi trường.");
      void queryClient.invalidateQueries({ queryKey: chantAdminKeys.environmentRules() });
    },
    onError: handleApiError,
  });
}
