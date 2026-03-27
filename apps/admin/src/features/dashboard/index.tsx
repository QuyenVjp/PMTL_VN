import { useMemo, useState } from "react";
import { ActivityIcon, BellRingIcon, BookTextIcon, RefreshCcwIcon, SearchIcon, ShieldAlertIcon, UsersIcon } from "lucide-react";
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

import { adminOperators, currentAdminUser } from "@/components/layout/admin-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSearch } from "@/context/search-provider";

const summaryCards = [
  { title: "Thành viên hoạt động", value: "12.480", detail: "+8,2% so với tháng trước", icon: UsersIcon },
  { title: "Nội dung đã xuất bản", value: "1.284", detail: "34 mục lên public trong tuần này", icon: BookTextIcon },
  { title: "Báo cáo chờ xử lý", value: "24", detail: "4 case khẩn cần quyết định trong hôm nay", icon: ShieldAlertIcon },
  { title: "Phiên đang mở", value: "573", detail: "201 phiên phát sinh trong 1 giờ gần nhất", icon: ActivityIcon },
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
  ["RPT-24031", "Bài đăng cộng đồng #CP-991", "Khẩn", "Minh Quang"],
  ["RPT-24018", "Bình luận #CM-1182", "Cao", "Diệu Tâm"],
  ["RPT-23994", "Bài viết hướng dẫn", "Trung bình", "Hồng Liên"],
];

const operatorNotes = [
  ["Ngọc Minh", "Đã chốt 6 bài viết và 2 guide onboarding trong ca sáng.", "/avatars/ngoc-minh.png"],
  ["Diệu An", "Ưu tiên lane moderation, còn 3 case cần quyết định.", "/avatars/dieu-an.png"],
  ["Pháp Bảo", "Đang theo dõi media index và fallback trong search.", "/avatars/phap-bao.png"],
];

function statusBadge(value: string) {
  if (value === "Đang xuất bản") {
    return <Badge variant="secondary">{value}</Badge>;
  }

  if (value === "Chờ duyệt" || value === "Đang chỉnh sửa" || value === "Cao" || value === "Khẩn") {
    return <Badge variant="outline">{value}</Badge>;
  }

  return <Badge variant="outline">{value}</Badge>;
}

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

export function DashboardOverview() {
  const { setOpen } = useSearch();
  const [lastRefresh, setLastRefresh] = useState("vừa xong");

  const operatorLoad = useMemo(
    () =>
      adminOperators.map((operator) => ({
        ...operator,
        utilization: Math.min(96, operator.tasksClosed * 4 + operator.queue * 6),
      })),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Badge variant="outline">Wave 0 · Admin doanh nghiệp</Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan vận hành PMTL</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Dashboard gom đúng lane nội dung, kiểm duyệt, người dùng, tìm kiếm và hỗ trợ. Không còn tab demo hoặc
                  chỉ số vô nghĩa.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setOpen(true)}>
                  <SearchIcon className="size-4" />
                  Tìm nhanh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLastRefresh(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }))}
                >
                  <RefreshCcwIcon className="size-4" />
                  Làm mới
                </Button>
              </div>
            </div>

            <div className="grid min-w-[280px] gap-3 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-xl">
                  <AvatarImage src={currentAdminUser.avatar} alt={currentAdminUser.name} />
                  <AvatarFallback className="rounded-xl">{currentAdminUser.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{currentAdminUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentAdminUser.role}</p>
                </div>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Ca trực hiện tại</span>
                  <Badge variant="secondary">Ổn định</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hệ thống đồng bộ</span>
                  <span>9/10 chỉ mục khỏe</span>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{card.title}</CardDescription>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
              ["Kiểm duyệt báo cáo", "24 case mở mới", "Cần owner trực ca"],
              ["Tìm kiếm", "14 fallback events", "Ưu tiên media-library"],
              ["Hỗ trợ nhập hộ", "3 phiếu mới", "Cần xác nhận lại thành viên"],
              ["Niệm kinh", "2 bản nghi thức chờ duyệt", "Chờ owner nội dung"],
            ].map(([title, value, note]) => (
              <div key={title} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{title}</p>
                  <Badge variant="outline">{value}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
                    <span>{operator.utilization}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${operator.utilization}%` }} />
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
            {operatorNotes.map(([name, note, avatar]) => (
              <div key={name} className="flex items-start gap-3 rounded-xl border p-4">
                <Avatar className="mt-0.5 size-10 rounded-xl">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback className="rounded-xl">{name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium">{name}</p>
                    <span className="text-sm text-muted-foreground">Vừa xong</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{note}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
                  ["Bài viết", "Tổng hợp pháp thoại tháng ba", "Đang xuất bản", "27/03 14:20"],
                  ["Hướng dẫn", "Bắt đầu niệm Phật tại nhà", "Chờ duyệt", "27/03 11:45"],
                  ["Niệm kinh", "Nghi thức lễ tối", "Đang chỉnh sửa", "27/03 10:18"],
                  ["Tài liệu", "Slide nhập môn", "Đang xuất bản", "26/03 18:05"],
                ].map(([module, title, status, updatedAt]) => (
                  <TableRow key={`${module}-${title}`}>
                    <TableCell>{module}</TableCell>
                    <TableCell>{title}</TableCell>
                    <TableCell>{statusBadge(status)}</TableCell>
                    <TableCell>{updatedAt}</TableCell>
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
            {[
              {
                title: "Thông báo",
                note: "Đợt gửi PUSH-2741 sẽ chạy lúc 18:00",
                detail: "Cần rà lại subscriber segment",
                Icon: BellRingIcon,
              },
              {
                title: "Kiểm duyệt",
                note: "4 báo cáo khẩn chưa ra quyết định",
                detail: "Ưu tiên target bài public trước",
                Icon: ShieldAlertIcon,
              },
              {
                title: "Nội dung",
                note: "2 guide onboarding còn treo duyệt",
                detail: "Đã ping owner nhưng chưa chốt",
                Icon: BookTextIcon,
              },
            ].map(({ title, note, detail, Icon }) => (
              <div key={title} className="rounded-xl border p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg border bg-muted/40">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{title}</p>
                      <Badge variant="outline">Theo dõi</Badge>
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
              {pendingReports.map(([id, target, priority, reporter]) => (
                <TableRow key={id}>
                  <TableCell>{id}</TableCell>
                  <TableCell>{target}</TableCell>
                  <TableCell>{statusBadge(priority)}</TableCell>
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
