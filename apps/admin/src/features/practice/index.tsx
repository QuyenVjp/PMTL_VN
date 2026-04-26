/**
 * Practice Modules Stats — admin overview widget.
 * Read-only stats for the 8 practice core modules.
 * Owner: engagement (read model) + vows-merit.
 * No business authority here — all writes stay at apps/api.
 */
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ActivityIcon,
  BookOpenIcon,
  HomeIcon,
  HeartHandshakeIcon,
  FlameIcon,
} from "lucide-react";
import { practiceStatsOptions, type PracticeStats } from "./queries";

const STAT_CARDS = (stats: PracticeStats) => [
  {
    icon: BookOpenIcon,
    label: "Buổi tu (30 ngày)",
    value: stats.gongkeLogsLast30Days.toLocaleString("vi-VN"),
    desc: "Tổng nhật ký công khóa toàn hệ thống",
    color: "text-amber-600",
  },
  {
    icon: HeartHandshakeIcon,
    label: "Nguyện đang giữ",
    value: stats.activeVows.toLocaleString("vi-VN"),
    desc: "Trên toàn thành viên",
    color: "text-green-600",
  },
  {
    icon: HomeIcon,
    label: "Nhà Nhỏ đang mở",
    value: stats.littleHousesActive.toLocaleString("vi-VN"),
    desc: `Đã đốt: ${stats.littleHousesBurnedTotal.toLocaleString("vi-VN")} tổng cộng`,
    color: "text-purple-600",
  },
  {
    icon: FlameIcon,
    label: "Sám hối (30 ngày)",
    value: stats.repentanceLogsLast30Days.toLocaleString("vi-VN"),
    desc: "Nhật ký sám hối (tổng hợp, không xem nội dung)",
    color: "text-rose-600",
  },
  {
    icon: ActivityIcon,
    label: "Triệu chứng ghi nhận",
    value: stats.activationLogsLast30Days.toLocaleString("vi-VN"),
    desc: "30 ngày qua — advisory lane suggestions",
    color: "text-blue-600",
  },
];

export function PracticeStatsOverview() {
  const { data: stats, isLoading, isError } = useQuery({
    ...practiceStatsOptions(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Thống kê Practice Core</h2>
        <p className="text-xs text-muted-foreground">
          {stats.totalMembers.toLocaleString("vi-VN")} thành viên · dữ liệu riêng tư, chỉ xem tổng hợp
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS(stats).map(({ icon: Icon, label, value, desc, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <CardDescription className="mt-1 text-xs">{desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        ⚠️ Dữ liệu dream/family/health/symptom không hiển thị ở đây — private-first policy.
        Chỉ xem được khi thành viên tự chia sẻ qua kênh hỗ trợ.
      </p>
    </div>
  );
}
