import { AltarManagementItemsTable } from "./altar-management-items-table.js";

export function AltarItemsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vật phẩm thờ cúng</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý vật phẩm trên bàn thờ</p>
      </div>
      <AltarManagementItemsTable />
    </div>
  );
}
