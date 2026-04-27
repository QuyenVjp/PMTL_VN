import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { lifeReleaseContentKeys, type LifeReleaseStatus } from "./queries.js";

export interface PublishLifeReleaseInput {
  status: LifeReleaseStatus;
  changeSummary: string;
}

export function usePublishLifeRelease() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishLifeReleaseInput) => adminClient.post("/admin/content/life-release/publish", input),
    onSuccess: (_data, variables) => {
      toast.success(variables.status === "PUBLISHED" ? "Đã xuất bản Phóng sanh." : "Đã đưa Phóng sanh về nháp.");
      void queryClient.invalidateQueries({ queryKey: lifeReleaseContentKeys.all });
    },
    onError: handleApiError,
  });
}
