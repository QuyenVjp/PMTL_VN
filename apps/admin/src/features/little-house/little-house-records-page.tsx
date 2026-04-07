import { LhRecordsTable } from "./little-house-records-table.js";

export function LhRecordsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Danh sách sớ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý hồ sơ Ngôi Nhà Nhỏ (sớ)</p>
      </div>
      <LhRecordsTable />
    </div>
  );
}
