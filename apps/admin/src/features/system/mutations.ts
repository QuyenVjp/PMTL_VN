import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { flagKeys } from "./queries.js";
import { dashboardKeys } from "./dashboard-queries.js";
import { searchKeys } from "./search-queries.js";

interface UpdateFeatureFlagInput {
  enabled?: boolean;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Toggle or update a feature flag (SUPER_ADMIN only)
 * Per ADMIN_PAGE_API_MAPPING line 118: "toggle/update: invalidate feature-flag list + detail + dashboard systemSummary"
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
      // Invalidate feature-flags workspace
      void queryClient.invalidateQueries({ queryKey: flagKeys.list() });
      void queryClient.invalidateQueries({ queryKey: flagKeys.detail(key) });

      // Invalidate dashboard systemSummary widget (affected by flag changes)
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.systemSummary(),
      });
    },
    onError: handleApiError,
  });
}

/**
 * Trigger search reindex for a specific index
 * Per ADMIN_PAGE_API_MAPPING line 122: "reindex trigger: invalidate status + operational-status + indexing-jobs"
 */
export function useReindexMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName: string) =>
      adminClient.post<{ status: string; indexName: string; message: string }>(
        `/admin/search/reindex/${indexName}`
      ),
    onSuccess: (data, indexName) => {
      toast.success(`✅ Reindex thành công cho ${indexName}`, {
        description: data.message || "Index đã được cập nhật",
      });
      // Invalidate search workspace
      void queryClient.invalidateQueries({ queryKey: searchKeys.all });

      // Invalidate dashboard searchOpsSummary widget
      void queryClient.invalidateQueries({
        queryKey: dashboardKeys.searchOpsSummary(),
      });
    },
    onError: (error, indexName) => {
      // Handle authentication errors specifically
      if (error instanceof Error && error.message.includes("401")) {
        toast.error("🔒 Cần đăng nhập", {
          description: "Bạn cần đăng nhập với quyền Admin để thực hiện reindex",
        });
        return;
      }

      // Handle other errors
      toast.error(`❌ Reindex thất bại cho ${indexName}`, {
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại",
      });
    },
    onMutate: (indexName) => {
      toast.loading(`🔄 Đang reindex ${indexName}...`, {
        description: "Quá trình này có thể mất vài giây",
      });
    },
  });
}
