import { BellRingIcon, FlagIcon, ListChecksIcon } from "lucide-react";

import { WorkspaceScopeCards } from "@/components/workspace";
import { NotifProvider } from "./notifications-provider.js";
import { StatsCards } from "./notifications-stats.js";
import { NotificationsTable } from "./notifications-table.js";
import { NotifDialogs, NotifPrimaryButtons } from "./notifications-dialogs.js";

export function NotificationsPage() {
  return (
    <NotifProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thông báo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi các đợt gửi, số thiết bị đang nhận và tạo thông báo với nhóm người nhận rõ ràng.
            </p>
          </div>
          <NotifPrimaryButtons />
        </div>

        <StatsCards />
        <WorkspaceScopeCards
          items={[
            {
              title: "Feature flag guarded",
              description: "Push notification phải phản ánh trạng thái `notification.push.enabled`, không giả định runtime luôn bật.",
              badge: "notification.push.enabled",
              icon: FlagIcon,
            },
            {
              title: "Job-first workflow",
              description: "Tạo thông báo sinh push job; xử lý/redrive đi theo job queue thay vì gửi ẩn trong component.",
              badge: "Push jobs",
              icon: ListChecksIcon,
            },
            {
              title: "Không gây sợ hãi",
              description: "Copy thông báo phải rõ ràng, có nhóm người nhận và tránh câu thúc ép người dùng.",
              badge: "Operator safety",
              icon: BellRingIcon,
            },
          ]}
        />
        <NotificationsTable />
      </div>

      <NotifDialogs />
    </NotifProvider>
  );
}
