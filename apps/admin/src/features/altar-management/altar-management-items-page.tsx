import { EyeIcon, LockIcon, ShieldAlertIcon } from "lucide-react";

import { WorkspaceScopeCards } from "@/components/workspace";
import { AltarManagementItemsTable } from "./altar-management-items-table.js";

export function AltarItemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vật phẩm thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý vật phẩm trên bàn thờ</p>
      </div>
      <WorkspaceScopeCards
        items={[
          {
            title: "Blocked / stop",
            description: "Design hiện chưa có admin contract cho vật phẩm bàn thờ; surface này chỉ giữ read-only hygiene.",
            badge: "No admin route canon",
            icon: LockIcon,
          },
          {
            title: "Member state boundary",
            description: "Bàn thờ Phase 1 thuộc engagement/member flow, admin không sửa trạng thái thay người dùng.",
            badge: "Engagement",
            icon: ShieldAlertIcon,
          },
          {
            title: "Chỉ xem projection",
            description: "Không mở CRUD, không thêm mutation condition cho tới khi đủ 5 artifact unlock trong design.",
            badge: "Read-only",
            icon: EyeIcon,
          },
        ]}
      />
      <AltarManagementItemsTable />
    </div>
  );
}
