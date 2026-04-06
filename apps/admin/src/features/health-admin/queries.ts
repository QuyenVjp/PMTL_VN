import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

/**
 * Health check queries for admin monitoring
 * Per ADMIN_FEATURE_QUERY_PLAN line 32: status only, polling only (no mutations)
 */

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  requestId?: string;
}

export interface HealthCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  duration?: number;
  message?: string;
}

export interface HealthExtended {
  overall: HealthStatus;
  checks: HealthCheck[];
  services: Record<string, {
    status: string;
    latency?: number;
    lastChecked?: string;
  }>;
}

export const healthAdminKeys = {
  all: ["admin-health"] as const,
  summary: () => [...healthAdminKeys.all, "summary"] as const,
  checks: () => [...healthAdminKeys.all, "checks"] as const,
};

/**
 * Health summary for dashboard widget
 * Light polling to detect issues without overwhelming the API
 */
export function getHealthExtendedQuery() {
  return queryOptions({
    queryKey: healthAdminKeys.summary(),
    queryFn: () =>
      adminClient.get<HealthExtended>("/admin/health"),
    refetchInterval: 30_000, // Poll every 30 seconds
    staleTime: 10_000, // Consider data stale after 10s
  });
}

/**
 * Detailed health checks for ops diagnostics
 * Used in a dedicated health monitoring page
 */
export function getHealthChecksQuery() {
  return queryOptions({
    queryKey: healthAdminKeys.checks(),
    queryFn: () =>
      adminClient.get<{
        timestamp: string;
        checks: HealthCheck[];
      }>("/admin/health/checks"),
    refetchInterval: 60_000, // Poll every minute for detailed checks
  });
}
