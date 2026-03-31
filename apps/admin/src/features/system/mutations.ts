import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";

export const flagKeys = {
  all: ["admin-feature-flags"] as const,
  list: () => [...flagKeys.all, "list"] as const,
};

interface UpdateFeatureFlagInput {
  enabled?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Toggle or update a feature flag (SUPER_ADMIN only)
 */
export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, ...input }: UpdateFeatureFlagInput & { key: string }) =>
      adminClient.patch(`/admin/feature-flags/${key}`, input),
    onSuccess: (_data, { key, enabled }) => {
      if (enabled !== undefined) {
        toast.success(enabled ? `Đã bật cờ "${key}".` : `Đã tắt cờ "${key}".`);
      } else {
        toast.success(`Đã cập nhật cờ "${key}".`);
      }
      void queryClient.invalidateQueries({ queryKey: flagKeys.list() });
    },
    onError: handleApiError,
  });
}
