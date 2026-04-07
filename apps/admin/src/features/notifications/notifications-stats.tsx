import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { pushStatusOptions, subscriptionStatsOptions } from "./queries.js";

export function StatsCards() {
  const { data: pushStatus, isLoading: statusLoading } = useQuery(pushStatusOptions());
  const { data: subStats, isLoading: subLoading } = useQuery(subscriptionStatsOptions());

  const cards = [
    { label: "Tổng đợt gửi", value: pushStatus?.total, loading: statusLoading },
    { label: "Chờ xử lý", value: pushStatus?.pending, loading: statusLoading },
    { label: "Hoàn thành", value: pushStatus?.completed, loading: statusLoading },
    { label: "Thất bại", value: pushStatus?.failed, loading: statusLoading },
    { label: "Thiết bị đang nhận", value: subStats?.active, loading: subLoading },
    { label: "Thiết bị đã tắt", value: subStats?.inactive, loading: subLoading },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
            {card.loading ? (
              <Skeleton className="mt-1 h-7 w-16" />
            ) : (
              <p className="mt-1 text-2xl font-bold tabular-nums">{card.value ?? 0}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
