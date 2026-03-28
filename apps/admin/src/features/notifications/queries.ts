import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";
import type { ListEnvelope } from "@/lib/api/envelopes.js";

// ── Types ───────────────────────────────────────────────────────────

export interface PushJobItem {
  publicId: string;
  title: string;
  body: string;
  status: string;
  targetAudience: string | null;
  sentCount: number;
  failedCount: number;
  createdBy: { publicId: string; displayName: string; email: string };
  processedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface PushStatus {
  total: number;
  pending: number;
  completed: number;
  failed: number;
}

export interface SubscriptionStats {
  active: number;
  inactive: number;
  total: number;
}

export interface PushJobFilters {
  limit?: number;
  offset?: number;
  status?: string;
}

// ── Query key factory ───────────────────────────────────────────────

export const pushKeys = {
  all: ["admin-push-jobs"] as const,
  lists: () => [...pushKeys.all, "list"] as const,
  list: (filters: PushJobFilters) => [...pushKeys.lists(), filters] as const,
  status: () => [...pushKeys.all, "status"] as const,
  subscriptionStats: () => [...pushKeys.all, "subscription-stats"] as const,
};

// ── Query options ───────────────────────────────────────────────────

export function pushJobListOptions(filters: PushJobFilters = {}) {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: filters.limit ?? 20,
    offset: filters.offset ?? 0,
    status: filters.status || undefined,
  };

  return queryOptions({
    queryKey: pushKeys.list(filters),
    queryFn: () =>
      adminClient.get<ListEnvelope<PushJobItem>>("/admin/notifications/push/jobs", params),
  });
}

export function pushStatusOptions() {
  return queryOptions({
    queryKey: pushKeys.status(),
    queryFn: () => adminClient.get<PushStatus>("/admin/notifications/push/status"),
  });
}

export function subscriptionStatsOptions() {
  return queryOptions({
    queryKey: pushKeys.subscriptionStats(),
    queryFn: () =>
      adminClient.get<SubscriptionStats>("/admin/notifications/push/subscription-stats"),
  });
}
