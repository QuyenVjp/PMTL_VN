import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PowerIcon, RefreshCwIcon } from "lucide-react";

import { WorkspaceConfirmDialog } from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { flagListOptions, flagKeys, type FeatureFlag } from "./queries.js";
import { useUpdateFeatureFlag } from "./mutations.js";

type StatusFilter = "all" | "enabled" | "disabled";

function statusBadge(flag: FeatureFlag) {
  return flag.enabled
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
    : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400";
}

export function FeatureFlagsPage() {
  const queryClient = useQueryClient();
  const { data: envelope, isLoading } = useQuery(flagListOptions());
  const updateFlag = useUpdateFeatureFlag();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pendingFlag, setPendingFlag] = useState<FeatureFlag | null>(null);
  const [pendingEnabled, setPendingEnabled] = useState<boolean | null>(null);

  const flags = envelope?.data ?? [];

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const normalizedQuery = query.trim().toLowerCase();
      const haystack = `${flag.key} ${flag.description ?? ""}`.toLowerCase();
      const matchesQuery = normalizedQuery ? haystack.includes(normalizedQuery) : true;
      const matchesStatus =
        status === "all"
          ? true
          : status === "enabled"
            ? flag.enabled
            : !flag.enabled;

      return matchesQuery && matchesStatus;
    });
  }, [flags, query, status]);

  const openToggleConfirm = (flag: FeatureFlag, enabled: boolean) => {
    if (enabled === flag.enabled) {
      return;
    }

    setPendingFlag(flag);
    setPendingEnabled(enabled);
  };

  const closeConfirm = () => {
    setPendingFlag(null);
    setPendingEnabled(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Cờ tính năng</h1>
          <p className="text-sm text-muted-foreground">
            Danh sách cờ hệ thống theo lane vận hành nhanh. Mỗi thao tác bật hoặc tắt đều phải xác nhận trước khi ghi.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void queryClient.invalidateQueries({ queryKey: flagKeys.list() })}
        >
          <RefreshCwIcon className="mr-2 size-4" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Bộ lọc</CardTitle>
          <CardDescription>
            Tìm theo key hoặc mô tả, rồi bật hoặc tắt từng cờ bằng nút nguồn có xác nhận.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo key hoặc mô tả..."
            aria-label="Tìm feature flag"
          />
          <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger aria-label="Lọc trạng thái">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="enabled">Đang bật</SelectItem>
              <SelectItem value="disabled">Đang tắt</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Danh sách cờ</CardTitle>
              <CardDescription>
                {isLoading ? <Skeleton className="h-4 w-48" /> : `${filteredFlags.length} cờ hiển thị / ${flags.length} cờ tổng cộng`}
              </CardDescription>
            </div>
            <Badge variant="outline">{updateFlag.isPending ? "Đang cập nhật" : "Sẵn sàng"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-xl border px-4 py-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="mt-3 h-3 w-80" />
              </div>
            ))
          ) : filteredFlags.length ? (
            filteredFlags.map((flag) => (
              <div
                key={flag.key}
                className="flex flex-col gap-3 rounded-xl border px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded-md bg-muted px-2 py-1 text-sm font-medium">{flag.key}</code>
                    <Badge variant="outline" className={statusBadge(flag)}>
                      {flag.enabled ? "Đang bật" : "Đang tắt"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {flag.description ?? "Chưa có mô tả cho cờ này."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cập nhật: {new Date(flag.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={updateFlag.isPending}
                    onClick={() => openToggleConfirm(flag, !flag.enabled)}
                    aria-label={flag.enabled ? `Tắt cờ ${flag.key}` : `Bật cờ ${flag.key}`}
                  >
                    <PowerIcon className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed px-4 py-8 text-sm text-muted-foreground">
              Không tìm thấy feature flag nào theo bộ lọc hiện tại.
            </div>
          )}
        </CardContent>
      </Card>

      {pendingFlag && pendingEnabled !== null ? (
        <WorkspaceConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              closeConfirm();
            }
          }}
          title={pendingEnabled ? "Bật feature flag" : "Tắt feature flag"}
          description={
            <>
              Bạn có chắc muốn {pendingEnabled ? "bật" : "tắt"} cờ{" "}
              <span className="font-semibold text-foreground">{pendingFlag.key}</span> không?
            </>
          }
          confirmLabel={pendingEnabled ? "Bật cờ" : "Tắt cờ"}
          isPending={updateFlag.isPending}
          onConfirm={() => {
            updateFlag.mutate(
              { key: pendingFlag.key, enabled: pendingEnabled },
              {
                onSuccess: () => {
                  closeConfirm();
                },
              },
            );
          }}
        />
      ) : null}
    </div>
  );
}
