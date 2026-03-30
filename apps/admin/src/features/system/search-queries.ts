import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onSuccess: (data, indexName) => {
      toast.success(`✅ Reindex thành công cho ${indexName}`, {
        description: data.message || "Index đã được cập nhật",
      });
      void queryClient.invalidateQueries({ queryKey: searchKeys.all });
    },
    onError: (error, indexName) => {
      console.error("Reindex failed:", error);
      
      // Handle authentication errors specifically
      if (error instanceof Error && error.message.includes('401')) {
        toast.error("🔒 Cần đăng nhập", {
          description: "Bạn cần đăng nhập với quyền Admin để thực hiện reindex",
        });
        return;
      }
      
      // Handle other errors  
      toast.error(`❌ Reindex thất bại cho ${indexName}`, {
        description: error instanceof Error ? error.message : "Vui lòng thử lại",
      });
    },
    onMutate: (indexName) => {
      toast.loading(`🔄 Đang reindex ${indexName}...`, {
        description: "Quá trình này có thể mất vài giây",
      });
    },
  });
}
