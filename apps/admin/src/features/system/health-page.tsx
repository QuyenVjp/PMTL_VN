import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { healthExtendedOptions, healthKeys, type ComponentHealth } from "./health-queries.js";

type HealthStatus = "healthy" | "degraded" | "unhealthy";

function statusLabel(status: HealthStatus): string {
  if (status === "healthy") return "Khỏe";
  if (status === "degraded") return "Cảnh báo";
  return "Lỗi";
}

function statusBadgeClass(status: HealthStatus): string {
  if (status === "healthy")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "degraded")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
}

function cardBorderClass(status: HealthStatus): string {
  if (status === "degraded") return "border-amber-200 dark:border-amber-800";
  if (status === "unhealthy") return "border-red-200 dark:border-red-800";
  return "";
}

function ComponentCard({ component }: { component: ComponentHealth }) {
  return (
    <Card className={cn(cardBorderClass(component.status))}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="font-medium">{component.name}</CardDescription>
          <Badge variant="outline" className={statusBadgeClass(component.status)}>
            {statusLabel(component.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{component.latencyMs} ms</div>
        <p className="mt-1 text-xs text-muted-foreground">{component.detail}</p>
      </CardContent>
    </Card>
  );
}

export function HealthPage() {
  const qc = useQueryClient();
  const { data: health, isLoading, isError, error, dataUpdatedAt } = useQuery(healthExtendedOptions());

  const lastRefresh = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Health</h1>
            {health && (
              <Badge variant="outline" className={statusBadgeClass(health.overall)}>
                {statusLabel(health.overall)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Kiểm tra runtime cho API, DB, cache và các thành phần hệ thống. Tự làm mới mỗi 30 giây.
          </p>
          <p className="text-xs text-muted-foreground">
            Lần cập nhật: {lastRefresh}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void qc.invalidateQueries({ queryKey: healthKeys.all })}
        >
          <RefreshCwIcon className="size-4" />
          Làm mới
        </Button>
      </div>

      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Không tải được health data.{" "}
              {error instanceof Error ? error.message : ""}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void qc.invalidateQueries({ queryKey: healthKeys.all })}
            >
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Component cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : health?.components.map((component) => (
              <ComponentCard key={component.name} component={component} />
            ))}
      </div>

      {/* System stats */}
      {health && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Operator đang trực</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {health.systemStats.activeAdmins} / {health.systemStats.totalAdmins}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Admin có session đang mở / tổng admin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>Trạng thái tổng thể</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{statusLabel(health.overall)}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Timestamp: {new Date(health.timestamp).toLocaleString("vi-VN")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail table */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết check</CardTitle>
          <CardDescription>
            Snapshot read-mostly để operator nhìn nhanh thành phần nào đang tạo áp lực runtime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : health ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thành phần</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Độ trễ</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {health.components.map((check) => (
                  <TableRow key={check.name}>
                    <TableCell>{check.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(check.status)}>
                        {statusLabel(check.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{check.latencyMs} ms</TableCell>
                    <TableCell>{check.detail}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
