import { LhFraudQueueTable } from "./little-house-fraud-queue-table.js";

export function LhFraudQueuePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hàng đợi gian lận sớ</h1>
        <p className="mt-2 text-sm text-muted-foreground">Các hồ sơ sớ bị gắn cờ gian lận cần xử lý</p>
      </div>
      <LhFraudQueueTable />
    </div>
  );
}
