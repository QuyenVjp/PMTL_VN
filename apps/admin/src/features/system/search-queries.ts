import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

/**
 * Search operations query keys per design.
 * Per ADMIN_PAGE_API_MAPPING line 122: queries are read-mostly
 * Mutations (reindex) moved to mutations.ts per file organization convention
 */

export interface SearchIndexInfo {
  name: string;
  status: string;
}

export interface SearchAdminStatus {
  engine: string;
  fallback: string;
  status: "operational" | "degraded" | "unavailable";
  indexes: SearchIndexInfo[];
  checkedAt: string;
}

export const searchKeys = {
  all: ["admin-search"] as const,
  lists: () => [...searchKeys.all, "list"] as const,
  list: (owner: string) => [...searchKeys.lists(), owner] as const,
  details: () => [...searchKeys.all, "detail"] as const,
  detail: (owner: string) => [...searchKeys.details(), owner] as const,
  status: () => searchKeys.list("status"),
  operationalStatus: () => searchKeys.detail("operational-status"),
  performance: () => searchKeys.detail("performance"),
  indexingJobs: () => searchKeys.list("indexing-jobs"),
  fallbackEvents: () => searchKeys.list("fallback-events"),
  indexSettings: () => searchKeys.detail("index-settings"),
};

/**
 * Fetch overall search engine status
 */
export function searchStatusOptions() {
  return queryOptions({
    queryKey: searchKeys.status(),
    queryFn: () =>
      adminClient.get<SearchAdminStatus>("/admin/search/status"),
    refetchInterval: 60_000,
  });
}

/**
 * Fetch operational status (reachability, connection info)
 */
export function searchOperationalStatusOptions() {
  return queryOptions({
    queryKey: searchKeys.operationalStatus(),
    queryFn: () =>
      adminClient.get<{ status: string; lastChecked: string }>(
        "/admin/search/operational-status"
      ),
    refetchInterval: 30_000,
  });
}

/**
 * Fetch search performance metrics
 */
export function searchPerformanceOptions() {
  return queryOptions({
    queryKey: searchKeys.performance(),
    queryFn: () =>
      adminClient.get<{
        avgQueryTime: number;
        queryCount: number;
        failureRate: number;
      }>("/admin/search/performance"),
    refetchInterval: 120_000,
  });
}

/**
 * Fetch indexing jobs history
 */
export function searchIndexingJobsOptions() {
  return queryOptions({
    queryKey: searchKeys.indexingJobs(),
    queryFn: () =>
      adminClient.get<Array<{ id: string; status: string; indexName: string; createdAt: string }>>(
        "/admin/search/indexing-jobs"
      ),
    refetchInterval: 30_000,
  });
}

/**
 * Fetch fallback query events (when search engine is unavailable)
 */
export function searchFallbackEventsOptions() {
  return queryOptions({
    queryKey: searchKeys.fallbackEvents(),
    queryFn: () =>
      adminClient.get<Array<{ id: string; timestamp: string; query: string }>>(
        "/admin/search/fallback-events"
      ),
    refetchInterval: 60_000,
  });
}

/**
 * Fetch search index settings and configuration
 */
export function searchIndexSettingsOptions() {
  return queryOptions({
    queryKey: searchKeys.indexSettings(),
    queryFn: () =>
      adminClient.get<{
        indexes: Array<{
          name: string;
          settings: Record<string, unknown>;
        }>;
      }>("/admin/search/index-settings"),
  });
}
