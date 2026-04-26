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
  postStatusStats: Array<{
    status: string;
    count: number;
  }>;
  pendingReportTargetStats: Array<{
    targetType: string;
    count: number;
  }>;
  auditActionStats: Array<{
    action: string;
    count: number;
  }>;
  activitySeries7d: Array<{
    date: string;
    posts: number;
    reports: number;
    audits: number;
  }>;
  periodSummary: {
    newUsers7d: number;
    newPublishedPosts7d: number;
    newPendingReports7d: number;
    activeSessions24h: number;
  };
}

export const dashboardKeys = {
  all: ["admin-dashboard"] as const,
  lists: () => [...dashboardKeys.all, "list"] as const,
  list: () => [...dashboardKeys.lists(), "stats"] as const,
  details: () => [...dashboardKeys.all, "detail"] as const,
  detail: (widget: string) => [...dashboardKeys.details(), widget] as const,
  stats: () => dashboardKeys.list(),
};

export function dashboardStatsOptions() {
  return queryOptions({
    queryKey: dashboardKeys.stats(),
    queryFn: () => adminClient.get<DashboardStats>("/admin/system/dashboard-stats"),
    staleTime: 30_000,
  });
}
