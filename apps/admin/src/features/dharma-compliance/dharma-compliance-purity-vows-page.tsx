import { DharmaCompliancePurityVowsTable } from "./dharma-compliance-purity-vows-table";

export function DharmaCompliancePurityVowsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lời nguyện thanh tu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Chỉ xem — lời nguyện do đồng tu tự đăng ký
        </p>
      </div>
      <DharmaCompliancePurityVowsTable />
    </div>
  );
}
