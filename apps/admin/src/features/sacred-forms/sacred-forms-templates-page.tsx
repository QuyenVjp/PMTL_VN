import { SacredFormTemplatesTable } from "./sacred-forms-templates-table.js";

export function SacredFormTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mẫu đơn Pháp Bảo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý mẫu đơn, điều kiện tiên quyết và nguồn quy tắc cho từng loại đơn Pháp Bảo.
        </p>
      </div>

      <SacredFormTemplatesTable />
    </div>
  );
}
