import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

export interface DashboardStats {
  totalUsers: number;
  publishedPosts: number;
  pendingReports: number;
  activeSessions: number;
  recentPosts: Array<{
    publicId: string;
    title: string;
    status: string;
    authorName: string;
    updatedAt: string;
  }>;
  pendingReportsList: Array<{
    publicId: string;
    targetType: string;
    targetId: string;
    reasonCode: string;
    reporterUserId: string;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    actorId: string | null;
    action: string;
    resource: string | null;
    resourceId: string | null;
    createdAt: string;
  }>;
}

export const dashboardKeys = {
  all: ["admin-dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
};

export function dashboardStatsOptions() {
  return queryOptions({
    queryKey: dashboardKeys.stats(),
    queryFn: () => adminClient.get<DashboardStats>("/admin/system/dashboard-stats"),
    staleTime: 30_000,
  });
}
