import { queryOptions } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client";

export interface PracticeStats {
  totalMembers: number;
  activeVows: number;
  gongkeLogsLast30Days: number;
  littleHousesActive: number;
  littleHousesBurnedTotal: number;
  repentanceLogsLast30Days: number;
  activationLogsLast30Days: number;
}

export const practiceKeys = {
  all: ["admin-practice"] as const,
  lists: () => [...practiceKeys.all, "list"] as const,
  list: () => [...practiceKeys.lists(), "stats"] as const,
  details: () => [...practiceKeys.all, "detail"] as const,
  detail: (owner: string) => [...practiceKeys.details(), owner] as const,
  stats: () => practiceKeys.list(),
};

export function practiceStatsOptions() {
  return queryOptions({
    queryKey: practiceKeys.stats(),
    queryFn: () => adminClient.get<PracticeStats>("/admin/practice/stats"),
    staleTime: 5 * 60_000,
  });
}
