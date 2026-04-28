import { AltarManagementLogsTable } from "./altar-management-logs-table.js";

export function ValidationLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nhật ký kiểm tra thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Lịch sử kiểm tra vật phẩm và quy trình thờ cúng (chỉ đọc)</p>
      </div>
      <AltarManagementLogsTable />
    </div>
  );
}
