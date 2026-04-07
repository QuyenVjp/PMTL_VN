import { LifeReleaseTable } from "./life-liberation-table";

export function LifeReleaseListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ phóng sinh</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quản lý các hồ sơ phóng sinh của đồng tu</p>
      </div>
      <LifeReleaseTable />
    </div>
  );
}
