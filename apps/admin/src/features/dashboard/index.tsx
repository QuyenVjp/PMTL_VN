import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIcon,
  BookTextIcon,
  RefreshCcwIcon,
  SearchIcon,
  ShieldAlertIcon,
  UsersIcon,
  PlusIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useSearch } from "@/stores/search";
import { dashboardStatsOptions, dashboardKeys } from "./queries.js";
import { healthExtendedOptions } from "@/features/system/health-queries.js";
import { PracticeStatsOverview } from "@/features/practice";
import { toast } from "sonner";

// ── Badge helpers ─────────────────────────────────────────────────────

function contentStatusClass(status: string): string {
  if (status === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (status === "ARCHIVED")
    return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400";
  return "";
}

function statusLabel(status: string): string {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "ARCHIVED") return "Đã ẩn";
  return status;
}

function reasonLabel(code: string): string {
  const map: Record<string, string> = {
    spam: "Spam",
    inappropriate: "Không phù hợp",
    misinformation: "Sai thông tin",
    harassment: "Quấy rối",
    other: "Khác",
  };
  return map[code] ?? code;
}

function targetTypeLabel(type: string): string {
  const map: Record<string, string> = {
    post: "Bài viết",
    comment: "Bình luận",
    community_post: "Bài đăng CĐ",
    guestbook: "Sổ lưu niệm",
  };
  return map[type] ?? type;
}

function statusShortLabel(status: string): string {
  if (status === "PUBLISHED") return "Xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "ARCHIVED") return "Ẩn";
  return status;
}

function targetTypeShortLabel(type: string): string {
  if (type === "post") return "Bài viết";
  if (type === "comment") return "Bình luận";
  if (type === "community_post") return "CĐ";
  if (type === "guestbook") return "Sổ lưu niệm";
  return type;
}

function userInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("vi-VN");
}

// ── Skeleton cards ───────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="mt-2 h-4 w-32" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// ── System Status Cards Component ─────────────────────────────────────

type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface ComponentHealth {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  detail: string;
}

const STATUS_CONFIG: Record<HealthStatus, { dot: string; badge: string; label: string }> = {
  healthy: {
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
    label: "Hoạt động tốt",
  },
  degraded: {
    dot: "bg-amber-500 animate-pulse",
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
    label: "Giảm hiệu suất",
  },
  unhealthy: {
    dot: "bg-red-500 animate-pulse",
    badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
    label: "Gặp sự cố",
  },
};

function SystemStatusRow({ component }: { component: ComponentHealth }) {
  const cfg = STATUS_CONFIG[component.status];
  return (
    <div className="flex items-center justify-between py-3 [&:not(:last-child)]:border-b">
      <div className="flex items-center gap-3">
        <div className={cn("size-2 shrink-0 rounded-full", cfg.dot)} />
        <div>
          <p className="text-sm font-medium leading-none">{component.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{component.detail}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums text-muted-foreground">{component.latencyMs}ms</span>
        <Badge variant="outline" className={cfg.badge}>{cfg.label}</Badge>
      </div>
    </div>
  );
}

function SystemStatusCards() {
  const { data: health, isLoading } = useQuery(healthExtendedOptions());
  const components = health?.components ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-2 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (components.length === 0) return null;

  return (
    <div>
      {components.map((component) => (
        <SystemStatusRow key={component.name} component={component} />
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────

export function DashboardOverview() {
  const { setOpen } = useSearch();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    setChartReady(true);
  }, []);

  const { data: adminUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });
  const isSuperAdmin = adminUser?.role === "SUPER_ADMIN";

  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery(dashboardStatsOptions());

  const handleRefresh = () => {
    void qc.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  const summaryCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        title: "Thành viên",
        value: formatNumber(stats.totalUsers),
        detail: "Tổng tài khoản không bị xóa",
        icon: UsersIcon,
        urgent: false,
      },
      {
        title: "Bài viết đã xuất bản",
        value: formatNumber(stats.publishedPosts),
        detail: "Nội dung đang hiển thị public",
        icon: BookTextIcon,
        urgent: false,
      },
      {
        title: "Báo cáo chờ xử lý",
        value: formatNumber(stats.pendingReports),
        detail: stats.pendingReports > 0
          ? "Cần quyết định kiểm duyệt"
          : "Không có case mở",
        icon: ShieldAlertIcon,
        urgent: stats.pendingReports > 0,
      },
      {
        title: "Phiên đang mở",
        value: formatNumber(stats.activeSessions),
        detail: "Session chưa hết hạn, chưa thu hồi",
        icon: ActivityIcon,
        urgent: false,
      },
    ];
  }, [stats]);

  const postStatusChartData = useMemo(() => {
    if (!stats) return [];
    return stats.postStatusStats.map((item) => ({
      name: statusShortLabel(item.status),
      value: item.count,
    }));
  }, [stats]);

  const pendingTargetChartData = useMemo(() => {
    if (!stats) return [];
    return stats.pendingReportTargetStats.map((item) => ({
      name: targetTypeShortLabel(item.targetType),
      value: item.count,
    }));
  }, [stats]);

  const auditActionChartData = useMemo(() => {
    if (!stats) return [];
    return stats.auditActionStats.map((item) => ({
      name: item.action,
      value: item.count,
    }));
  }, [stats]);

  const activitySeriesChartData = useMemo(() => {
    if (!stats) return [];
    return stats.activitySeries7d.map((item) => ({
      ...item,
      label: new Date(item.date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }),
    }));
  }, [stats]);

  const pieColors = ["#16a34a", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ef4444", "#06b6d4"];

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Admin PMTL</Badge>
              {isSuperAdmin && (
                <Badge
                  variant="outline"
                  className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400"
                >
                  Super Admin
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Tổng quan vận hành PMTL
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Dữ liệu thực từ hệ thống. Nhấn "Làm mới" để cập nhật.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setOpen(true)}>
                <SearchIcon className="size-4" />
                Tìm nhanh
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCcwIcon className="size-4" />
                Làm mới
              </Button>
            </div>
          </div>

          {adminUser && (
            <div className="grid min-w-[280px] gap-3 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  {adminUser.displayName
                    ? userInitials(adminUser.displayName)
                    : "AD"}
                </div>
                <div>
                  <p className="font-semibold">
                    {adminUser.displayName ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {adminUser.email ?? "—"}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Vai trò</span>
                  <Badge
                    variant="outline"
                    className={
                      isSuperAdmin
                        ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400"
                        : ""
                    }
                  >
                    {isSuperAdmin ? "Super Admin" : "Admin"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Error state ──────────────────────────────────────────────── */}
      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Không tải được dữ liệu dashboard.{" "}
              {error instanceof Error ? error.message : ""}
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card
          className="group cursor-pointer border-dashed transition-all hover:border-solid hover:shadow-md"
          onClick={() => void navigate({ to: "/noi-dung/bai-viet" })}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 dark:bg-blue-950/50">
              <PlusIcon className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium">Tạo bài viết</p>
              <p className="text-xs text-muted-foreground">Nội dung mới</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-dashed transition-all hover:border-solid hover:shadow-md"
          onClick={() => void navigate({ to: "/kiem-duyet/bao-cao" })}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 group-hover:bg-green-100 dark:bg-green-950/50">
              <CheckCircleIcon className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium">Duyệt báo cáo</p>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingReports ?? 0} chờ xử lý
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-dashed transition-all hover:border-solid hover:shadow-md"
          onClick={() => {
            toast.success("Đang chuyển đến trang tìm kiếm...");
            void navigate({ to: "/he-thong/tim-kiem" });
          }}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 group-hover:bg-purple-100 dark:bg-purple-950/50">
              <RefreshCcwIcon className="size-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-medium">Reindex All</p>
              <p className="text-xs text-muted-foreground">Làm mới tìm kiếm</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-dashed transition-all hover:border-solid hover:shadow-md"
          onClick={() => void navigate({ to: "/he-thong/audit-logs" })}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-50 group-hover:bg-orange-100 dark:bg-orange-950/50">
              <TrendingUpIcon className="size-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-medium">Báo cáo</p>
              <p className="text-xs text-muted-foreground">Thống kê chi tiết</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="group cursor-pointer border-dashed transition-all hover:border-solid hover:shadow-md"
          onClick={() => void navigate({ to: "/he-thong/health" })}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 dark:bg-red-950/50">
              <AlertTriangleIcon className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium">Cảnh báo</p>
              <p className="text-xs text-muted-foreground">Hệ thống</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Summary KPIs ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : summaryCards.map(({ title, value, detail, icon: Icon, urgent }) => (
              <Card key={title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{title}</CardDescription>
                  <Icon
                    className={cn(
                      "size-4",
                      urgent ? "text-red-500" : "text-muted-foreground",
                    )}
                  />
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      urgent && "text-red-600 dark:text-red-400",
                    )}
                  >
                    {value}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ── Practical reporting section ───────────────────────────────── */ }
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Nhịp vận hành 7 ngày</CardTitle>
            <CardDescription>
              Theo dõi song song nội dung, kiểm duyệt và audit event để phát hiện lệch tải.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading || !chartReady ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activitySeriesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="posts" name="Bài viết" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="reports" name="Báo cáo" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="audits" name="Audit" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {stats && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border px-3 py-2">
                  <p className="text-xs text-muted-foreground">User mới 7 ngày</p>
                  <p className="text-lg font-semibold">{formatNumber(stats.periodSummary.newUsers7d)}</p>
                </div>
                <div className="rounded-lg border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Bài đã xuất bản 7 ngày</p>
                  <p className="text-lg font-semibold">{formatNumber(stats.periodSummary.newPublishedPosts7d)}</p>
                </div>
                <div className="rounded-lg border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Báo cáo pending mới 7 ngày</p>
                  <p className="text-lg font-semibold">{formatNumber(stats.periodSummary.newPendingReports7d)}</p>
                </div>
                <div className="rounded-lg border px-3 py-2">
                  <p className="text-xs text-muted-foreground">Phiên active mới 24h</p>
                  <p className="text-lg font-semibold">{formatNumber(stats.periodSummary.activeSessions24h)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỷ trọng trạng thái nội dung</CardTitle>
            <CardDescription>Phân bố bài viết theo trạng thái hiện tại.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !chartReady ? (
              <Skeleton className="h-64 w-full" />
            ) : postStatusChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={postStatusChartData} dataKey="value" nameKey="name" outerRadius={84}>
                      {postStatusChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Chưa đủ dữ liệu để hiển thị biểu đồ.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top hành động audit (7 ngày)</CardTitle>
            <CardDescription>
              Nhìn nhanh hành vi vận hành nào đang chiếm tải cao nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !chartReady ? (
              <Skeleton className="h-64 w-full" />
            ) : auditActionChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={auditActionChartData} layout="vertical" margin={{ left: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Chưa có event audit trong 7 ngày.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cơ cấu báo cáo pending</CardTitle>
            <CardDescription>
              Cho biết lane kiểm duyệt nào đang dồn case chờ quyết định.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !chartReady ? (
              <Skeleton className="h-64 w-full" />
            ) : pendingTargetChartData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pendingTargetChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Không có báo cáo pending.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Content table + Pending reports ───────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        {/* Recent posts */}
        <Card>
          <CardHeader>
            <CardTitle>Nội dung cập nhật gần đây</CardTitle>
            <CardDescription>
              5 bài viết mới nhất theo thời gian chỉnh sửa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : stats && stats.recentPosts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Cập nhật</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPosts.map((post) => (
                    <TableRow key={post.publicId}>
                      <TableCell className="max-w-[200px] truncate">
                        {post.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={contentStatusClass(post.status)}
                        >
                          {statusLabel(post.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.authorName}</TableCell>
                      <TableCell className="text-nowrap text-muted-foreground">
                        {timeAgo(post.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Chưa có bài viết nào.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending reports */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo chờ quyết định</CardTitle>
            <CardDescription>
              Ưu tiên lane kiểm duyệt theo mức độ ảnh hưởng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : stats && stats.pendingReportsList.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.pendingReportsList.map((report) => (
                    <TableRow key={report.publicId}>
                      <TableCell>
                        {targetTypeLabel(report.targetType)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reasonLabel(report.reasonCode)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-nowrap text-muted-foreground">
                        {timeAgo(report.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Không có báo cáo chờ xử lý.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── System Health Dashboard ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái hệ thống</CardTitle>
          <CardDescription>
            Theo dõi sức khoẻ các dịch vụ nền tảng theo thời gian thực.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemStatusCards />
        </CardContent>
      </Card>

      {/* ── Audit log stream ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>
            10 event audit mới nhất trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : stats && stats.recentAuditLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Resource</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentAuditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-nowrap">
                      {timeAgo(log.createdAt)}
                    </TableCell>
                    <TableCell>{log.actorId ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.resource
                        ? `${log.resource}${log.resourceId ? ` / ${log.resourceId}` : ""}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Chưa có hoạt động nào được ghi nhận.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Practice Core modules stats — private aggregate, no member-level data */}
      <PracticeStatsOverview />
    </div>
  );
}
