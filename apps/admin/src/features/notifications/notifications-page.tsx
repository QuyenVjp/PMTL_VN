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
        <NotificationsTable />
      </div>

      <NotifDialogs />
    </NotifProvider>
  );
}
