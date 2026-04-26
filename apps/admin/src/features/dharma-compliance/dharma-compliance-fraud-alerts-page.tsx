import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon, ClipboardCheckIcon, ShieldAlertIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceScopeCards } from "@/components/workspace";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fraudAlertListOptions } from "./queries.js";
import { useResolveFraudAlert } from "./mutations.js";
import {
  FRAUD_SEVERITY_LABELS,
  FRAUD_SEVERITY_VARIANT,
  type FraudAlertItem,
} from "./types.js";
import { DharmaComplianceFraudAlertsTable } from "./dharma-compliance-fraud-alerts-table";

type ResolveDialogState = {
  item: FraudAlertItem;
  resolution: string;
} | null;

export function DharmaComplianceFraudAlertsPage() {
  const { isLoading } = useQuery(fraudAlertListOptions());
  const resolveAlert = useResolveFraudAlert();
  const [resolveDialog, setResolveDialog] = useState<ResolveDialogState>(null);

  function handleConfirmResolve() {
    if (!resolveDialog) return;
    resolveAlert.mutate(
      { publicId: resolveDialog.item.id, resolution: resolveDialog.resolution },
      { onSuccess: () => setResolveDialog(null) },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cảnh báo gian lận</h1>
        <p className="mt-2 text-sm text-muted-foreground">Hàng đợi cảnh báo gian lận cần xem xét và xử lý</p>
      </div>

      <WorkspaceScopeCards
        items={[
          {
            title: "Resolve có ghi chú",
            description: "Operator phải để lại ghi chú xử lý; không có hành động ẩn một chạm trên cảnh báo rủi ro.",
            badge: "Fraud alert",
            icon: ClipboardCheckIcon,
          },
          {
            title: "Không mở rộng queue",
            description: "Design hiện chỉ backing list và resolve; chưa mở workflow điều tra, phong tỏa hay notify tự động.",
            badge: "Hygiene tier",
            icon: AlertTriangleIcon,
          },
          {
            title: "Bảo vệ pháp lý",
            description: "Surface này dùng để giảm rủi ro lừa đảo tài khoản/quyên góp, không phải CRM từ thiện.",
            badge: "Dharma compliance",
            icon: ShieldAlertIcon,
          },
        ]}
      />

      <DharmaComplianceFraudAlertsTable
        isLoading={isLoading}
        onResolve={(item) => setResolveDialog({ item, resolution: "" })}
      />

      {resolveDialog && (
        <Dialog open onOpenChange={() => setResolveDialog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Giải quyết cảnh báo gian lận</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={FRAUD_SEVERITY_VARIANT[resolveDialog.item.severity]}>
                  {FRAUD_SEVERITY_LABELS[resolveDialog.item.severity]}
                </Badge>
                <span className="text-sm font-medium">{resolveDialog.item.alertType}</span>
              </div>
              <p className="text-sm text-muted-foreground">{resolveDialog.item.description}</p>
              <div className="space-y-1.5">
                <Label htmlFor="resolve-notes">Ghi chú xử lý</Label>
                <Textarea
                  id="resolve-notes"
                  value={resolveDialog.resolution}
                  onChange={(e) => setResolveDialog((d) => d ? { ...d, resolution: e.target.value } : d)}
                  placeholder="Mô tả cách giải quyết cảnh báo này..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResolveDialog(null)}>Huỷ</Button>
              <Button
                onClick={handleConfirmResolve}
                disabled={resolveAlert.isPending}
              >
                {resolveAlert.isPending ? "Đang lưu..." : "Xác nhận giải quyết"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
