import { EyeIcon, HistoryIcon, LockIcon } from "lucide-react";

import { WorkspaceScopeCards } from "@/components/workspace";
import { AltarManagementLogsTable } from "./altar-management-logs-table.js";

export function ValidationLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhật ký kiểm tra thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Lịch sử kiểm tra vật phẩm và quy trình thờ cúng (chỉ đọc)</p>
      </div>
      <WorkspaceScopeCards
        items={[
          {
            title: "Audit projection",
            description: "Trang này chỉ xem lại log xác nhận/quy trình, không tự tạo log hoặc sửa dữ liệu quá khứ.",
            badge: "Read-only",
            icon: HistoryIcon,
          },
          {
            title: "Không có admin contract",
            description: "Design chưa mở route admin cho altar-management; không thêm query/mutation mới.",
            badge: "Blocked / stop",
            icon: LockIcon,
          },
          {
            title: "Operator review",
            description: "Dùng để quan sát trạng thái runtime hiện có, không thay thế member-facing altar workflow.",
            badge: "Engagement boundary",
            icon: EyeIcon,
          },
        ]}
      />
      <AltarManagementLogsTable />
    </div>
  );
}
