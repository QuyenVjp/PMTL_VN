import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

/**
 * Dashboard aggregate query keys per ADMIN_PAGE_API_MAPPING.
 * Covers: systemSummary, pendingModeration, contentOpsSummary,
 *         searchOpsSummary, recentAuditEvents
 */

export interface DashboardWidget {
  type: string;
  title: string;
  data: unknown;
}

export interface DashboardAggregate {
  systemSummary?: {
    activeFeatureFlags: number;
    lastUpdated: string;
  };
  pendingModeration?: {
    reportCount: number;
    commentCount: number;
  };
  contentOpsSummary?: {
    draftCount: number;
    publishedCount: number;
    lastPublished: string;
  };
  searchOpsSummary?: {
    status: string;
    lastIndexed: string;
    indexCount: number;
  };
  recentAuditEvents?: Array<{
    id: string;
    action: string;
    actor: string;
    timestamp: string;
  }>;
}

export const dashboardKeys = {
  all: ["admin-dashboard"] as const,
  aggregate: () => [...dashboardKeys.all, "aggregate"] as const,
  systemSummary: () => [...dashboardKeys.all, "system-summary"] as const,
  pendingModeration: () => [...dashboardKeys.all, "pending-moderation"] as const,
  contentOpsSummary: () => [...dashboardKeys.all, "content-ops"] as const,
  searchOpsSummary: () => [...dashboardKeys.all, "search-ops"] as const,
  recentAuditEvents: () => [...dashboardKeys.all, "audit-events"] as const,
};

/**
 * Main dashboard aggregate — fetches all 5 widget families
 * Invalidation rules per ADMIN_PAGE_API_MAPPING line 98:
 * - systemSummary: feature-flag toggle
 * - pendingModeration: moderation decision
 * - contentOpsSummary: post publish/unpublish
 * - searchOpsSummary: search reindex complete
 * - recentAuditEvents: any mutable action with audit log
 */
export function dashboardAggregateOptions() {
  return queryOptions({
    queryKey: dashboardKeys.aggregate(),
    queryFn: () =>
      adminClient.get<DashboardAggregate>("/admin/system/dashboard-stats"),
    refetchInterval: 30_000, // Poll every 30s to stay fresh on moderation count
  });
}

/**
 * Individual widget queries — for fine-grained invalidation
 */
export function systemSummaryOptions() {
  return queryOptions({
    queryKey: dashboardKeys.systemSummary(),
    queryFn: () =>
      adminClient.get<{ activeFeatureFlags: number; lastUpdated: string }>(
        "/admin/system/dashboard-stats?widget=systemSummary"
      ),
  });
}

export function pendingModerationOptions() {
  return queryOptions({
    queryKey: dashboardKeys.pendingModeration(),
    queryFn: () =>
      adminClient.get<{ reportCount: number; commentCount: number }>(
        "/admin/system/dashboard-stats?widget=pendingModeration"
      ),
    refetchInterval: 15_000, // Poll more frequently — moderation is time-sensitive
  });
}

export function contentOpsSummaryOptions() {
  return queryOptions({
    queryKey: dashboardKeys.contentOpsSummary(),
    queryFn: () =>
      adminClient.get<{
        draftCount: number;
        publishedCount: number;
        lastPublished: string;
      }>("/admin/system/dashboard-stats?widget=contentOpsSummary"),
  });
}

export function searchOpsSummaryOptions() {
  return queryOptions({
    queryKey: dashboardKeys.searchOpsSummary(),
    queryFn: () =>
      adminClient.get<{
        status: string;
        lastIndexed: string;
        indexCount: number;
      }>("/admin/system/dashboard-stats?widget=searchOpsSummary"),
  });
}

export function recentAuditEventsOptions() {
  return queryOptions({
    queryKey: dashboardKeys.recentAuditEvents(),
    queryFn: () =>
      adminClient.get<Array<{ id: string; action: string; actor: string; timestamp: string }>>(
        "/admin/system/dashboard-stats?widget=recentAuditEvents&limit=10"
      ),
  });
}
