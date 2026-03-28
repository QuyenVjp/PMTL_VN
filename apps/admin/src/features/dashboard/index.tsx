import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivityIcon,
  BookTextIcon,
  RefreshCcwIcon,
  SearchIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react";

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

// ── Main export ───────────────────────────────────────────────────────

export function DashboardOverview() {
  const { setOpen } = useSearch();
  const qc = useQueryClient();

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
    </div>
  );
}
