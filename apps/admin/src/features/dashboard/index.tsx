import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIcon,
  BellRingIcon,
  BookTextIcon,
  DatabaseIcon,
  RefreshCcwIcon,
  SearchIcon,
  ServerIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { adminOperators } from "@/components/layout/admin-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useSearch } from "@/stores/search";

// ── Static mock data ──────────────────────────────────────────────────

const summaryCards = [
  {
    title: "Thành viên hoạt động",
    value: "12.480",
    detail: "+8,2% so với tháng trước",
    icon: UsersIcon,
    urgent: false,
  },
  {
    title: "Nội dung đã xuất bản",
    value: "1.284",
    detail: "34 mục lên public trong tuần này",
    icon: BookTextIcon,
    urgent: false,
  },
  {
    title: "Báo cáo chờ xử lý",
    value: "24",
    detail: "4 case khẩn cần quyết định hôm nay",
    icon: ShieldAlertIcon,
    urgent: true,
  },
  {
    title: "Phiên đang mở",
    value: "573",
    detail: "201 phiên phát sinh trong 1 giờ gần nhất",
    icon: ActivityIcon,
    urgent: false,
  },
];

const publishTrend = [
  { label: "T2", published: 38, reviewed: 21 },
  { label: "T3", published: 42, reviewed: 26 },
  { label: "T4", published: 35, reviewed: 19 },
  { label: "T5", published: 48, reviewed: 28 },
  { label: "T6", published: 44, reviewed: 24 },
  { label: "T7", published: 31, reviewed: 17 },
  { label: "CN", published: 27, reviewed: 12 },
];

const runtimePulse = [
  { label: "08h", sessions: 320 },
  { label: "10h", sessions: 410 },
  { label: "12h", sessions: 456 },
  { label: "14h", sessions: 573 },
  { label: "16h", sessions: 498 },
  { label: "18h", sessions: 382 },
];

const pendingReports = [
  { id: "RPT-24031", target: "Bài đăng cộng đồng #CP-991", priority: "Khẩn", reporter: "Minh Quang" },
  { id: "RPT-24018", target: "Bình luận #CM-1182", priority: "Cao", reporter: "Diệu Tâm" },
  { id: "RPT-23994", target: "Bài viết hướng dẫn", priority: "Trung bình", reporter: "Hồng Liên" },
];

const operatorNotes = [
  {
    name: "Ngọc Minh",
    note: "Đã chốt 6 bài viết và 2 guide onboarding trong ca sáng.",
    avatar: "/avatars/ngoc-minh.png",
    ago: "14 phút trước",
  },
  {
    name: "Diệu An",
    note: "Ưu tiên lane moderation, còn 3 case cần quyết định.",
    avatar: "/avatars/dieu-an.png",
    ago: "31 phút trước",
  },
  {
    name: "Pháp Bảo",
    note: "Đang theo dõi media index và fallback trong search.",
    avatar: "/avatars/phap-bao.png",
    ago: "52 phút trước",
  },
];

// Super admin — system health
type HealthStatus = "healthy" | "warning" | "error";

const systemComponents: {
  name: string;
  latency: string;
  status: HealthStatus;
  detail: string;
  icon: typeof ServerIcon;
}[] = [
  { name: "API Gateway", latency: "42 ms", status: "healthy", detail: "live + ready · 2,1k req/min", icon: ServerIcon },
  { name: "PostgreSQL", latency: "15 ms", status: "healthy", detail: "migration + seed ổn định", icon: DatabaseIcon },
  { name: "Redis Cache", latency: "6 ms", status: "healthy", detail: "hit rate 94% · cache nóng", icon: ZapIcon },
  {
    name: "Search Index",
    latency: "168 ms",
    status: "warning",
    detail: "14 fallback events · 9/10 index khỏe",
    icon: SearchIcon,
  },
];

const superAdminStats = [
  {
    title: "Tỷ lệ lỗi (24h)",
    value: "0,02%",
    detail: "Dưới ngưỡng cảnh báo 0,1%",
    icon: TrendingUpIcon,
  },
  {
    title: "Operator đang trực",
    value: "4 / 6",
    detail: "2 operator nghỉ — đủ phủ lane",
    icon: UsersIcon,
  },
];

// ── Badge helpers ─────────────────────────────────────────────────────

function priorityBadgeClass(priority: string): string {
  if (priority === "Khẩn")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  if (priority === "Cao")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400";
}

function contentStatusClass(status: string): string {
  if (status === "Đang xuất bản")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "Chờ duyệt")
    return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400";
  if (status === "Đang chỉnh sửa")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

function healthBadgeClass(status: HealthStatus): string {
  if (status === "healthy")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "warning")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
}

function healthIconClass(status: HealthStatus): string {
  if (status === "healthy")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "warning")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
}

function healthStatusLabel(status: HealthStatus): string {
  if (status === "healthy") return "Khỏe";
  if (status === "warning") return "Cảnh báo";
  return "Lỗi";
}

function utilizationBarClass(pct: number): string {
  if (pct > 80) return "bg-red-500";
  if (pct > 60) return "bg-amber-500";
  return "bg-emerald-500";
}

function utilizationTextClass(pct: number): string {
  if (pct > 80) return "text-red-500 dark:text-red-400";
  if (pct > 60) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function userInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Charts ────────────────────────────────────────────────────────────

function PublishChart() {
  return (
    <ResponsiveContainer width="100%" height={290}>
      <BarChart data={publishTrend}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.18 }}
          contentStyle={{
            borderRadius: 14,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
          }}
        />
        <Bar dataKey="published" name="Xuất bản" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
        <Bar dataKey="reviewed" name="Duyệt" radius={[6, 6, 0, 0]} fill="var(--color-muted-foreground)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RuntimeChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={runtimePulse}>
        <defs>
          <linearGradient id="runtimePulse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          cursor={{ stroke: "var(--color-border)" }}
          contentStyle={{
            borderRadius: 14,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
          }}
        />
        <Area
          type="monotone"
          dataKey="sessions"
          name="Phiên mở"
          stroke="var(--color-primary)"
          fill="url(#runtimePulse)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Main export ───────────────────────────────────────────────────────

export function DashboardOverview() {
  const { setOpen } = useSearch();
  const [lastRefresh, setLastRefresh] = useState("vừa xong");

  const { data: adminUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    staleTime: Infinity,
  });
  const isSuperAdmin = adminUser?.role === "SUPER_ADMIN";

  const operatorLoad = useMemo(
    () =>
      adminOperators.map((operator) => ({
        ...operator,
        utilization: Math.min(96, operator.tasksClosed * 4 + operator.queue * 6),
      })),
    [],
  );

  const handleRefresh = () => {
    setLastRefresh(
      new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Wave 0 · Admin doanh nghiệp</Badge>
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
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan vận hành PMTL</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Dashboard gom đúng lane nội dung, kiểm duyệt, người dùng, tìm kiếm và hỗ trợ. Không còn tab demo
                  hoặc chỉ số vô nghĩa.
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

            <div className="grid min-w-[280px] gap-3 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-xl">
                  <AvatarFallback className="rounded-xl text-sm font-semibold">
                    {adminUser?.displayName ? userInitials(adminUser.displayName) : "AD"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{adminUser?.displayName ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{adminUser?.email ?? "—"}</p>
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
                <div className="flex items-center justify-between">
                  <span>Hệ thống</span>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                  >
                    9/10 chỉ mục khỏe
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lần làm mới</span>
                  <span>{lastRefresh}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nhịp hệ thống trong ngày</CardTitle>
            <CardDescription>Biến thiên số phiên mở và tải vận hành trong 10 giờ gần nhất.</CardDescription>
          </CardHeader>
          <CardContent className="ps-2">
            <RuntimeChart />
          </CardContent>
        </Card>
      </div>

      {/* ── Super Admin: System Health ────────────────────────────────── */}
      {isSuperAdmin && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sức khỏe hệ thống
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {systemComponents.map(({ name, latency, status, detail, icon: Icon }) => (
              <Card
                key={name}
                className={cn(
                  status === "warning" && "border-amber-200 dark:border-amber-800",
                  status === "error" && "border-red-200 dark:border-red-800",
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-8 items-center justify-center rounded-lg border",
                          healthIconClass(status),
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <CardDescription className="font-medium">{name}</CardDescription>
                    </div>
                    <Badge variant="outline" className={healthBadgeClass(status)}>
                      {healthStatusLabel(status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">{latency}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {superAdminStats.map(({ title, value, detail, icon: Icon }) => (
              <Card key={title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{title}</CardDescription>
                  <Icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{value}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Summary KPIs ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ title, value, detail, icon: Icon, urgent }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{title}</CardDescription>
              <Icon className={cn("size-4", urgent ? "text-red-500" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", urgent && "text-red-600 dark:text-red-400")}>{value}</div>
              <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts + Priority Queue ───────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nhịp xuất bản và duyệt 7 ngày</CardTitle>
            <CardDescription>Số lượng mục nội dung được publish và số mục đã chốt duyệt theo ngày.</CardDescription>
          </CardHeader>
          <CardContent className="ps-2">
            <PublishChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hàng chờ ưu tiên</CardTitle>
            <CardDescription>Những lane đang tiêu tốn attention vận hành nhiều nhất.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Kiểm duyệt báo cáo", value: "24 case mở mới", note: "Cần owner trực ca", urgent: true },
              { title: "Tìm kiếm", value: "14 fallback events", note: "Ưu tiên media-library", urgent: false },
              { title: "Hỗ trợ nhập hộ", value: "3 phiếu mới", note: "Cần xác nhận lại thành viên", urgent: false },
              { title: "Niệm kinh", value: "2 bản nghi thức", note: "Chờ owner nội dung chốt duyệt", urgent: false },
            ].map(({ title, value, note, urgent }) => (
              <div
                key={title}
                className={cn(
                  "rounded-xl border p-4",
                  urgent && "border-red-200 bg-red-50/40 dark:border-red-800 dark:bg-red-950/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{title}</p>
                  <Badge variant="outline" className={urgent ? priorityBadgeClass("Khẩn") : ""}>
                    {value}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Operators ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Operator trong ca</CardTitle>
            <CardDescription>Nhìn nhanh tải xử lý từng owner mà không phải mở từng workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {operatorLoad.map((operator) => (
              <div key={operator.name} className="space-y-2 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 rounded-xl">
                      <AvatarImage src={operator.avatar} alt={operator.name} />
                      <AvatarFallback className="rounded-xl">{operator.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{operator.name}</p>
                      <p className="text-sm text-muted-foreground">{operator.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{operator.tasksClosed} mục đã xử lý</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tải ca trực</span>
                    <span className={utilizationTextClass(operator.utilization)}>{operator.utilization}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn("h-2 rounded-full transition-all", utilizationBarClass(operator.utilization))}
                      style={{ width: `${operator.utilization}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Còn {operator.queue} mục trong hàng chờ owner.</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nhật ký vận hành gần đây</CardTitle>
            <CardDescription>Luồng hành động vừa xảy ra trong ca trực hiện tại.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {operatorNotes.map(({ name, note, avatar, ago }) => (
              <div key={name} className="flex items-start gap-3 rounded-xl border p-4">
                <Avatar className="mt-0.5 size-10 rounded-xl">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-xl">{name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">{name}</p>
                    <span className="text-xs text-muted-foreground">{ago}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{note}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Content table + Signals ───────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nội dung cập nhật gần đây</CardTitle>
            <CardDescription>Giữ đúng owner của module nội dung, không dùng task dev nội bộ.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  {
                    module: "Bài viết",
                    title: "Tổng hợp pháp thoại tháng ba",
                    status: "Đang xuất bản",
                    updatedAt: "27/03 14:20",
                  },
                  {
                    module: "Hướng dẫn",
                    title: "Bắt đầu niệm Phật tại nhà",
                    status: "Chờ duyệt",
                    updatedAt: "27/03 11:45",
                  },
                  {
                    module: "Niệm kinh",
                    title: "Nghi thức lễ tối",
                    status: "Đang chỉnh sửa",
                    updatedAt: "27/03 10:18",
                  },
                  {
                    module: "Tài liệu",
                    title: "Slide nhập môn",
                    status: "Đang xuất bản",
                    updatedAt: "26/03 18:05",
                  },
                ].map(({ module, title, status, updatedAt }) => (
                  <TableRow key={`${module}-${title}`}>
                    <TableCell>{module}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={contentStatusClass(status)}>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-nowrap text-muted-foreground">{updatedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tín hiệu cần chú ý</CardTitle>
            <CardDescription>Những việc có khả năng trượt SLA nếu không đụng vào trong ca này.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(
              [
                {
                  title: "Thông báo",
                  note: "Đợt gửi PUSH-2741 sẽ chạy lúc 18:00",
                  detail: "Cần rà lại subscriber segment",
                  Icon: BellRingIcon,
                  severity: "info" as const,
                  badge: "Lịch trình",
                },
                {
                  title: "Kiểm duyệt",
                  note: "4 báo cáo khẩn chưa ra quyết định",
                  detail: "Ưu tiên target bài public trước",
                  Icon: ShieldAlertIcon,
                  severity: "urgent" as const,
                  badge: "Khẩn",
                },
                {
                  title: "Nội dung",
                  note: "2 guide onboarding còn treo duyệt",
                  detail: "Đã ping owner nhưng chưa chốt",
                  Icon: BookTextIcon,
                  severity: "warning" as const,
                  badge: "Theo dõi",
                },
              ] as const
            ).map(({ title, note, detail, Icon, severity, badge }) => (
              <div
                key={title}
                className={cn(
                  "rounded-xl border p-4",
                  severity === "urgent" && "border-red-200 bg-red-50/30 dark:border-red-800 dark:bg-red-950/10",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border",
                      severity === "urgent" &&
                        "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400",
                      severity === "warning" &&
                        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
                      severity === "info" &&
                        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400",
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{title}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          severity === "urgent" && priorityBadgeClass("Khẩn"),
                          severity === "warning" && priorityBadgeClass("Cao"),
                          severity === "info" &&
                            "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400",
                        )}
                      >
                        {badge}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{note}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Pending Reports ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo chờ quyết định</CardTitle>
          <CardDescription>Ưu tiên lane kiểm duyệt theo mức độ ảnh hưởng và target thực tế.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Đối tượng</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Người gửi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingReports.map(({ id, target, priority, reporter }) => (
                <TableRow key={id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{id}</TableCell>
                  <TableCell>{target}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityBadgeClass(priority)}>
                      {priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{reporter}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
