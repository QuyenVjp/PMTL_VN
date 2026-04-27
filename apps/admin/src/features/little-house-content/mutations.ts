import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { littleHouseContentKeys, type LittleHouseStatus } from "./queries.js";

export interface PublishLittleHouseInput {
  status: LittleHouseStatus;
  changeSummary: string;
}

export function usePublishLittleHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishLittleHouseInput) => adminClient.post("/admin/content/little-house/publish", input),
    onSuccess: (_data, variables) => {
      toast.success(variables.status === "PUBLISHED" ? "Đã xuất bản Ngôi Nhà Nhỏ." : "Đã đưa Ngôi Nhà Nhỏ về nháp.");
      void queryClient.invalidateQueries({ queryKey: littleHouseContentKeys.all });
    },
    onError: handleApiError,
  });
}
