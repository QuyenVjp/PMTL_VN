import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIcon,
  ArchiveIcon,
  BookOpenIcon,
  BookTextIcon,
  CalendarIcon,
  CheckIcon,
  ImageIcon,
  MessageSquareIcon,
  RefreshCcwIcon,
  ScrollTextIcon,
  SearchIcon,
  ServerIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";

import type { LucideIcon } from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardCard,
  DashboardCardActionsDropdown,
  DashboardOverviewCardV2,
  DashboardOverviewCardV3,
  SparklineAreaChart,
} from "@/components/dashboard";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useSearch } from "@/stores/search";
import { dashboardStatsOptions, dashboardKeys } from "./queries.js";
import { healthExtendedOptions } from "@/features/system/health-queries.js";

// ── Helpers ───────────────────────────────────────────────────────────

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

function statusShortLabel(status: string): string {
  if (status === "PUBLISHED") return "Xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "ARCHIVED") return "Ẩn";
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

// ── Chart configs ─────────────────────────────────────────────────────

const activityChartConfig: ChartConfig = {
  posts: { label: "Bài viết", color: "var(--chart-1)" },
  reports: { label: "Báo cáo", color: "var(--destructive)" },
  audits: { label: "Audit", color: "var(--chart-3)" },
};

// Ordered: inner → outer (recharts radial renders first-item innermost)
const RADIAL_COLORS = [
  "var(--chart-5)",
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
];

// ── Period selector ───────────────────────────────────────────────────

type StatPeriod = "7d" | "total";

const PERIOD_LABEL: Record<StatPeriod, string> = {
  "7d": "7 ngày gần đây",
  "total": "Tổng cộng",
};

// ── System health ─────────────────────────────────────────────────────

type HealthStatus = "healthy" | "degraded" | "unhealthy";

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

  if (components.length === 0)
    return <p className="py-4 text-sm text-muted-foreground">Không có dữ liệu.</p>;

  return (
    <div>
      {components.map((c: { name: string; status: string; latencyMs: number; detail: string }) => {
        const cfg = STATUS_CONFIG[c.status as HealthStatus] ?? STATUS_CONFIG.unhealthy;
        return (
          <div key={c.name} className="flex items-center justify-between py-3 [&:not(:last-child)]:border-b">
            <div className="flex items-center gap-3">
              <div className={cn("size-2 shrink-0 rounded-full", cfg.dot)} />
              <div>
                <p className="text-sm font-medium leading-none">{c.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-muted-foreground">{c.latencyMs}ms</span>
              <Badge variant="outline" className={cfg.badge}>{cfg.label}</Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card>
      <div className="flex justify-between p-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="size-4" />
      </div>
      <CardContent className="space-y-1">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24" />
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

// ── Module card ───────────────────────────────────────────────────────

interface ContentModule {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  colorClass: string;
  urgentCount?: number;
}

function ModuleCard({ module: mod }: { module: ContentModule }) {
  const navigate = useNavigate();
  const hasUrgent = (mod.urgentCount ?? 0) > 0;
  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        hasUrgent ? "border-destructive/40 ring-1 ring-destructive/20" : "hover:border-border/80",
      )}
      onClick={() => void navigate({ to: mod.href })}
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110", mod.colorClass)}>
          <mod.icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-snug">{mod.label}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {hasUrgent ? (
              <span className="font-semibold text-destructive">{mod.urgentCount} chờ xử lý</span>
            ) : (
              mod.description
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Progress bar row (Traffic Sources pattern) ────────────────────────

function ProgressRow({
  color,
  label,
  count,
  total,
  note,
}: {
  color: string;
  label: string;
  count: number;
  total: number;
  note?: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          {note && <span className="text-xs text-muted-foreground">{note}</span>}
          <span className="w-10 text-right tabular-nums text-xs font-medium">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────

export function DashboardOverview() {
  const { setOpen } = useSearch();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [chartReady, setChartReady] = useState(false);
  const [statPeriod, setStatPeriod] = useState<StatPeriod>("total");

  useEffect(() => {
    setChartReady(true);
  }, []);

  const { data: adminUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });
  const isSuperAdmin = adminUser?.role === "SUPER_ADMIN";

  const { data: stats, isLoading, isError, error } = useQuery(dashboardStatsOptions());

  const handleRefresh = () => {
    void qc.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  // ── Period-sensitive KPI values ───────────────────────────────────
  const kpi = useMemo(() => {
    if (!stats) return null;
    if (statPeriod === "7d") {
      return {
        users: { value: stats.periodSummary.newUsers7d, period: "Người dùng mới" },
        posts: { value: stats.periodSummary.newPublishedPosts7d, period: "Bài xuất bản mới" },
        reports: { value: stats.periodSummary.newPendingReports7d, period: "Báo cáo mới" },
        sessions: { value: stats.periodSummary.activeSessions24h, period: "Phiên active 24h" },
      };
    }
    return {
      users: { value: stats.totalUsers, period: "Tổng tài khoản" },
      posts: { value: stats.publishedPosts, period: "Nội dung public" },
      reports: { value: stats.pendingReports, period: "Đang chờ xử lý" },
      sessions: { value: stats.activeSessions, period: "Session active" },
    };
  }, [stats, statPeriod]);

  // ── Radial chart data for content status ──────────────────────────
  const statusRadialData = useMemo(() => {
    if (!stats) return [];
    // Reversed so innermost ring = smallest value visually
    return [...stats.postStatusStats]
      .sort((a, b) => a.count - b.count)
      .map((item, i) => ({
        name: statusShortLabel(item.status),
        value: item.count,
        fill: RADIAL_COLORS[i % RADIAL_COLORS.length],
      }));
  }, [stats]);

  const statusTotal = useMemo(
    () => statusRadialData.reduce((s, d) => s + d.value, 0),
    [statusRadialData],
  );

  // ── Audit action breakdown (Traffic Sources style) ────────────────
  const auditTotal = useMemo(
    () => (stats?.auditActionStats ?? []).reduce((s, d) => s + d.count, 0),
    [stats],
  );

  // ── Activity series ───────────────────────────────────────────────
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

  // ── Period dropdown action ────────────────────────────────────────
  const periodAction = (
    <DashboardCardActionsDropdown>
      {(["7d", "total"] as StatPeriod[]).map((p) => (
        <DropdownMenuItem key={p} onClick={() => setStatPeriod(p)}>
          {statPeriod === p && <CheckIcon className="mr-2 size-4" />}
          {statPeriod !== p && <span className="mr-2 size-4" />}
          {PERIOD_LABEL[p]}
        </DropdownMenuItem>
      ))}
    </DashboardCardActionsDropdown>
  );

  // ── Content modules ───────────────────────────────────────────────
  const contentModules: ContentModule[] = [
    {
      icon: BookTextIcon,
      label: "Bài viết",
      description: `${stats?.publishedPosts ?? "—"} đã xuất bản`,
      href: "/noi-dung/bai-viet",
      colorClass: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
    },
    {
      icon: ScrollTextIcon,
      label: "Bạch thoại",
      description: "Phật pháp bạch thoại",
      href: "/noi-dung/bach-thoai",
      colorClass: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
    },
    {
      icon: BookOpenIcon,
      label: "Hướng dẫn",
      description: "Tài liệu nhập môn",
      href: "/noi-dung/huong-dan",
      colorClass: "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400",
    },
    {
      icon: ArchiveIcon,
      label: "Tài liệu",
      description: "File tải xuống",
      href: "/noi-dung/tai-lieu",
      colorClass: "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
    },
    {
      icon: BookOpenIcon,
      label: "Kinh sách",
      description: "Kinh văn số hoá",
      href: "/noi-dung/kinh-sach",
      colorClass: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: ActivityIcon,
      label: "Niệm kinh",
      description: "Audio hành trì",
      href: "/noi-dung/niem-kinh",
      colorClass: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
    },
    {
      icon: ImageIcon,
      label: "Ảnh assets",
      description: "Kho ảnh vận hành",
      href: "/noi-dung/anh",
      colorClass: "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400",
    },
    {
      icon: ImageIcon,
      label: "Video assets",
      description: "Kho video vận hành",
      href: "/noi-dung/video",
      colorClass: "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400",
    },
    {
      icon: ArchiveIcon,
      label: "Tệp tài liệu assets",
      description: "Kho file kỹ thuật",
      href: "/noi-dung/tep-tai-lieu",
      colorClass: "bg-zinc-50 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400",
    },
    {
      icon: MessageSquareIcon,
      label: "Cộng đồng",
      description: "Bài đăng & sổ lưu niệm",
      href: "/cong-dong/bai-dang",
      colorClass: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: ShieldAlertIcon,
      label: "Kiểm duyệt",
      description: "Báo cáo & bình luận",
      href: "/kiem-duyet/bao-cao",
      colorClass: "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400",
      urgentCount: stats?.pendingReports,
    },
    {
      icon: UsersIcon,
      label: "Người dùng",
      description: `${stats?.totalUsers ?? "—"} tài khoản`,
      href: "/nguoi-dung",
      colorClass: "bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400",
    },
    {
      icon: CalendarIcon,
      label: "Lịch sự kiện",
      description: "Quản lý sự kiện",
      href: "/he-thong/lich",
      colorClass: "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400",
    },
    {
      icon: ServerIcon,
      label: "Hệ thống",
      description: "Health & cài đặt",
      href: "/he-thong/health",
      colorClass: "bg-gray-50 dark:bg-gray-950/50 text-gray-600 dark:text-gray-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-sm ring-1 ring-border/60">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            {adminUser && (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md">
                {adminUser.displayName ? userInitials(adminUser.displayName) : "AD"}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Tổng quan vận hành PMTL</h1>
                {isSuperAdmin && (
                  <Badge className="border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-900/50 dark:text-violet-300" variant="outline">
                    Super Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{adminUser?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              <SearchIcon className="size-4" />
              Tìm nhanh
            </Button>
            <Button size="sm" variant="outline" onClick={handleRefresh}>
              <RefreshCcwIcon className="size-4" />
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {isError && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-red-600 dark:text-red-400">
              Không tải được dữ liệu dashboard.{" "}
              {error instanceof Error ? error.message : ""}
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>Thử lại</Button>
          </CardContent>
        </Card>
      )}

      {/* ── KPI Cards — with period selector ─────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : kpi ? (
          <>
            {/* Users — V2: colored icon badge */}
            <DashboardOverviewCardV2
              title="Thành viên"
              period={kpi.users.period}
              icon={UsersIcon}
              iconColor="#3B82F6"
              data={{ value: kpi.users.value, percentageChange: 0 }}
              action={periodAction}
            />
            {/* Posts — V3: stat + sparkline (posts series) */}
            <DashboardOverviewCardV3
              title="Bài viết xuất bản"
              data={{ value: kpi.posts.value, percentageChange: 0 }}
              action={periodAction}
              chart={
                chartReady && activitySeriesChartData.length > 0 ? (
                  <SparklineAreaChart
                    data={activitySeriesChartData}
                    dataKey="posts"
                    color="#10B981"
                    className="h-24 w-full"
                  />
                ) : (
                  <Skeleton className="h-24 w-full" />
                )
              }
            />
            {/* Reports — V2: amber/red icon based on urgency */}
            <DashboardOverviewCardV2
              title="Báo cáo chờ duyệt"
              period={kpi.reports.period}
              icon={ShieldAlertIcon}
              iconColor={statPeriod === "total" && (stats?.pendingReports ?? 0) > 0 ? "#EF4444" : "#F59E0B"}
              data={{ value: kpi.reports.value, percentageChange: 0 }}
              action={periodAction}
            />
            {/* Sessions — V3: stat + sparkline (audits as proxy) */}
            <DashboardOverviewCardV3
              title="Phiên đang mở"
              data={{ value: kpi.sessions.value, percentageChange: 0 }}
              action={periodAction}
              chart={
                chartReady && activitySeriesChartData.length > 0 ? (
                  <SparklineAreaChart
                    data={activitySeriesChartData}
                    dataKey="audits"
                    color="#8B5CF6"
                    className="h-24 w-full"
                  />
                ) : (
                  <Skeleton className="h-24 w-full" />
                )
              }
            />
          </>
        ) : null}
      </div>

      {/* ── Content Modules Grid ──────────────────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Truy cập nhanh
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
          {contentModules.map((mod) => (
            <ModuleCard key={mod.href} module={mod} />
          ))}
        </div>
      </div>

      {/* ── Charts: Activity line + Status breakdown ─────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Hoạt động & Nội dung
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {/* 7-day activity line chart */}
        <DashboardCard
          title="Nhịp vận hành 7 ngày"
          period="Nội dung, kiểm duyệt và audit event"
          className="xl:col-span-2"
          size="sm"
        >
          {isLoading || !chartReady ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ChartContainer config={activityChartConfig} className="h-full w-full">
              <LineChart accessibilityLayer data={activitySeriesChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="posts" stroke="var(--color-posts)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="reports" stroke="var(--color-reports)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="audits" stroke="var(--color-audits)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          )}
        </DashboardCard>

        {/* Post status — Radial chart + progress list (Traffic Sources pattern) */}
        <Card>
          <div className="flex justify-between p-6 pb-0">
            <div>
              <CardTitle>Trạng thái nội dung</CardTitle>
              <CardDescription>Phân bố bài viết theo trạng thái</CardDescription>
            </div>
          </div>
          <CardContent className="pt-0">
            {isLoading || !chartReady ? (
              <Skeleton className="h-48 w-full" />
            ) : statusRadialData.length > 0 ? (
              <>
                {/* Radial rings — Shadboard concentric pattern */}
                <div className="flex justify-center">
                  <RadialBarChart
                    width={200}
                    height={180}
                    cx="50%"
                    cy="50%"
                    innerRadius="25%"
                    outerRadius="90%"
                    barSize={14}
                    data={statusRadialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      background={{ fill: "hsl(var(--muted))" }}
                      cornerRadius={6}
                    >
                      {statusRadialData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </RadialBar>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const d = payload[0].payload as { name: string; value: number; fill: string };
                        return (
                          <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-md">
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
                              <span className="font-medium">{d.name}</span>
                              <span className="text-muted-foreground">{d.value}</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </RadialBarChart>
                </div>
                {/* Progress list below chart */}
                <div className="space-y-3">
                  {[...statusRadialData].reverse().map((item) => (
                    <ProgressRow
                      key={item.name}
                      color={item.fill}
                      label={item.name}
                      count={item.value}
                      total={statusTotal}
                      note={`${item.value} bài`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Chưa đủ dữ liệu.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Audit actions breakdown — Traffic Sources style ───────────── */}
      {stats && stats.auditActionStats.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Audit & Hoạt động
          </p>
        </div>
      )}
      {stats && stats.auditActionStats.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <div className="flex justify-between p-6 pb-2">
              <div>
                <CardTitle>Top hành động audit</CardTitle>
                <CardDescription>Phân bố event vận hành 7 ngày gần đây</CardDescription>
              </div>
            </div>
            <CardContent className="space-y-4">
              {stats.auditActionStats.slice(0, 6).map((item, i) => (
                <ProgressRow
                  key={item.action}
                  color={RADIAL_COLORS[RADIAL_COLORS.length - 1 - (i % RADIAL_COLORS.length)]}
                  label={item.action}
                  count={item.count}
                  total={auditTotal}
                  note={`${item.count} lần`}
                />
              ))}
            </CardContent>
          </Card>

          {/* Recent audit log on the right */}
          <Card>
            <div className="flex justify-between p-6 pb-4">
              <div>
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>Event audit mới nhất trong hệ thống.</CardDescription>
              </div>
            </div>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={4} />
              ) : stats.recentAuditLogs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Hành động</TableHead>
                      <TableHead>Resource</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentAuditLogs.slice(0, 6).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-nowrap text-muted-foreground">{timeAgo(log.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-muted-foreground">
                          {log.resource
                            ? `${log.resource}${log.resourceId ? `/${log.resourceId.slice(0, 8)}` : ""}`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Recent content + Pending reports ─────────────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Nội dung & Kiểm duyệt
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="flex justify-between p-6 pb-4">
            <div>
              <CardTitle>Nội dung cập nhật gần đây</CardTitle>
              <CardDescription>5 bài viết mới nhất theo thời gian chỉnh sửa.</CardDescription>
            </div>
          </div>
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
                    <TableRow
                      key={post.publicId}
                      className="cursor-pointer"
                      onClick={() => void navigate({ to: `/noi-dung/bai-viet/${post.publicId}` })}
                    >
                      <TableCell className="max-w-[180px] truncate">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={contentStatusClass(post.status)}>
                          {statusLabel(post.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{post.authorName}</TableCell>
                      <TableCell className="text-nowrap text-muted-foreground">{timeAgo(post.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Chưa có bài viết nào.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="flex justify-between p-6 pb-4">
            <div>
              <CardTitle>Báo cáo chờ quyết định</CardTitle>
              <CardDescription>Ưu tiên lane kiểm duyệt theo mức độ ảnh hưởng.</CardDescription>
            </div>
          </div>
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
                    <TableRow
                      key={report.publicId}
                      className="cursor-pointer"
                      onClick={() => void navigate({ to: `/kiem-duyet/bao-cao/${report.publicId}` })}
                    >
                      <TableCell>{targetTypeLabel(report.targetType)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{reasonLabel(report.reasonCode)}</Badge>
                      </TableCell>
                      <TableCell className="text-nowrap text-muted-foreground">{timeAgo(report.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Không có báo cáo chờ xử lý.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── System Health ─────────────────────────────────────────────── */}
      <DashboardCard title="Trạng thái hệ thống" period="Sức khoẻ dịch vụ nền tảng">
        <SystemStatusCards />
      </DashboardCard>
    </div>
  );
}
