import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

/**
 * System feature flags & settings query keys per design.
 * Feature-flags per ADMIN_PAGE_API_MAPPING line 118:
 * "toggle/update: invalidate feature-flag list + detail + any screen directly bound to changed flag"
 */

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export const flagKeys = {
  all: ["admin-feature-flags"] as const,
  lists: () => [...flagKeys.all, "list"] as const,
  list: () => [...flagKeys.lists()] as const,
  details: () => [...flagKeys.all, "detail"] as const,
  detail: (key: string) => [...flagKeys.details(), key] as const,
};

/**
 * Fetch all feature flags for admin panel
 */
export function flagListOptions() {
  return queryOptions({
    queryKey: flagKeys.list(),
    queryFn: () =>
      adminClient.get<{ data: FeatureFlag[] }>("/admin/feature-flags"),
  });
}

/**
 * Fetch single feature flag detail
 */
export function flagDetailOptions(key: string) {
  return queryOptions({
    queryKey: flagKeys.detail(key),
    queryFn: () =>
      adminClient.get<FeatureFlag>(`/admin/feature-flags/${key}`),
    enabled: !!key,
  });
}
