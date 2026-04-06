import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { reportKeys } from "./queries.js";
import { dashboardKeys } from "@/features/system/dashboard-queries.js";
import { postKeys } from "@/features/content/queries.js";
import { communityPostKeys } from "@/features/community-posts/queries.js";
import { guestbookKeys } from "@/features/guestbook/queries.js";
import type { DecisionType } from "./types.js";

/**
 * Resolve moderation report with proper cross-module invalidation.
 *
 * Per ADMIN_PAGE_API_MAPPING line 113:
 * "decision: invalidate report list + detail + affected target workspace list/detail + dashboard pendingModeration widget"
 *
 * targetType can be: post, communityPost, guestbookEntry, comment
 */
export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      publicId,
      decision,
      note,
    }: {
      publicId: string;
      decision: DecisionType;
      note?: string;
    }) =>
      adminClient.post(`/admin/moderation/reports/${publicId}/decision`, {
        decision,
        note,
      }),
    onSuccess: (_data, { publicId }) => {
      toast.success("Đã xử lý báo cáo.");
      // Invalidate report workspace
      void qc.invalidateQueries({ queryKey: reportKeys.lists() });
      void qc.invalidateQueries({ queryKey: reportKeys.detail(publicId) });

      // Invalidate dashboard pendingModeration widget
      void qc.invalidateQueries({
        queryKey: dashboardKeys.pendingModeration(),
      });

      // Invalidate potentially affected target workspaces
      // Note: ideally the API response would include targetType + targetPublicId
      // to avoid broad invalidation. For now, invalidate related workspaces.
      void qc.invalidateQueries({ queryKey: postKeys.lists() });
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
      void qc.invalidateQueries({ queryKey: guestbookKeys.lists() });
    },
    onError: handleApiError,
  });
}
