import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  detail: string;
}

export interface HealthExtended {
  overall: HealthStatus;
  components: ComponentHealth[];
  systemStats: {
    errorRate24h: number;
    activeAdmins: number;
    totalAdmins: number;
  };
  timestamp: string;
}

export const healthKeys = {
  all: ["admin-health"] as const,
  lists: () => [...healthKeys.all, "list"] as const,
  list: () => [...healthKeys.lists(), "summary"] as const,
  details: () => [...healthKeys.all, "detail"] as const,
  detail: (component: string) => [...healthKeys.details(), component] as const,
  summary: () => healthKeys.list(),
};

export function healthExtendedOptions() {
  return queryOptions({
    queryKey: healthKeys.summary(),
    queryFn: () => adminClient.get<HealthExtended>("/admin/system/health-extended"),
    refetchInterval: 30_000,
  });
}
