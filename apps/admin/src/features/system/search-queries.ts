import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

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
  status: () => [...searchKeys.all, "status"] as const,
};

export function searchStatusOptions() {
  return queryOptions({
    queryKey: searchKeys.status(),
    queryFn: () => adminClient.get<SearchAdminStatus>("/admin/search/status"),
    refetchInterval: 60_000,
  });
}

export function useReindexMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (indexName: string) =>
      adminClient.post<{ status: string; indexName: string; message: string }>(
        `/admin/search/reindex/${indexName}`,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: searchKeys.all });
    },
  });
}
