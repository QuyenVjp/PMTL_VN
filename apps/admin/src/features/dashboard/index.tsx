import { ActivityIcon, BookTextIcon, ShieldAlertIcon, UsersIcon } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const summaryCards = [
  { title: "Thành viên hoạt động", value: "12.480", detail: "+8,2% so với tháng trước", icon: UsersIcon },
  { title: "Nội dung đã xuất bản", value: "1.284", detail: "34 mục lên public trong tuần này", icon: BookTextIcon },
  { title: "Báo cáo chờ xử lý", value: "24", detail: "4 case khẩn cần quyết định trong hôm nay", icon: ShieldAlertIcon },
  { title: "Phiên đang mở", value: "573", detail: "201 phiên phát sinh trong 1 giờ gần nhất", icon: ActivityIcon },
];

const publishTrend = [
  { label: "T2", published: 38 },
  { label: "T3", published: 42 },
  { label: "T4", published: 35 },
  { label: "T5", published: 48 },
  { label: "T6", published: 44 },
  { label: "T7", published: 31 },
  { label: "CN", published: 27 },
];

const recentContent = [
  ["Bài viết", "Tổng hợp pháp thoại tháng ba", "Đang xuất bản", "27/03 14:20"],
  ["Hướng dẫn", "Bắt đầu niệm Phật tại nhà", "Chờ duyệt", "27/03 11:45"],
  ["Niệm kinh", "Nghi thức lễ tối", "Đang chỉnh sửa", "27/03 10:18"],
  ["Tài liệu", "Slide nhập môn", "Đang xuất bản", "26/03 18:05"],
];

const pendingReports = [
  ["RPT-24031", "Bài đăng cộng đồng #CP-991", "Khẩn", "Minh Quang"],
  ["RPT-24018", "Bình luận #CM-1182", "Cao", "Diệu Tâm"],
  ["RPT-23994", "Bài viết hướng dẫn", "Trung bình", "Hồng Liên"],
];

const auditEvents = [
  ["27/03 14:11", "Ngọc Minh", "Publish lại bài viết", "Bài viết / pháp thoại tháng ba"],
  ["27/03 13:56", "Diệu An", "Ẩn bình luận", "Kiểm duyệt / bình luận"],
  ["27/03 13:21", "Thanh Tịnh", "Tạo phiếu nhập hộ", "Hỗ trợ / phát nguyện"],
  ["27/03 12:48", "Pháp Bảo", "Reindex guides", "Hệ thống / tìm kiếm"],
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
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={publishTrend}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Bar dataKey="published" radius={[6, 6, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan vận hành</h1>
          <p className="text-sm text-muted-foreground">
            Bảng tổng quan gộp đúng lane PMTL: nội dung, kiểm duyệt, người dùng, tìm kiếm và hỗ trợ.
          </p>
        </div>
        <Button variant="outline">Làm mới số liệu</Button>
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
            <CardTitle>Nhịp xuất bản 7 ngày</CardTitle>
            <CardDescription>Số lượng mục nội dung được đẩy public hoặc cập nhật lại theo ngày.</CardDescription>
          </CardHeader>
          <CardContent className="ps-2">
            <PublishChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hàng chờ cần xử lý</CardTitle>
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
                {recentContent.map(([module, title, status, updatedAt]) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Audit stream gần đây</CardTitle>
          <CardDescription>Luồng sự kiện giúp vận hành nhìn nhanh mutation nào vừa chạm admin authority.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {auditEvents.map(([time, actor, action, target]) => (
            <div key={`${time}-${action}`} className="flex flex-col gap-1 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{action}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {actor} · {target}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">{time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
