import { SacredFormApplicantsTable } from "./sacred-forms-applicants-table.js";

export function SacredFormApplicantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Đơn đăng ký Pháp Bảo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Theo dõi luồng tiếp nhận hồ sơ, trạng thái xét duyệt và lịch sử lưu vết của đơn Pháp Bảo.
        </p>
      </div>

      <SacredFormApplicantsTable />
    </div>
  );
}
