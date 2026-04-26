import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminDetailField, AdminDetailPage, AdminDetailSection, WorkspaceDetailSkeleton } from "@/components/workspace";
import { useUpdateCharityStatus } from "@/features/dharma-compliance/mutations";
import { charityDetailOptions } from "@/features/dharma-compliance/queries";
import { CHARITY_STATUS_LABELS, type CharityStatus } from "@/features/dharma-compliance/types";

type StatusDialogState = {
  targetStatus: CharityStatus;
  reason: string;
} | null;

function statusBadgeClass(s: string): string {
  if (s === "ACTIVE") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (s === "PENDING_REVIEW") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  if (s === "SUSPENDED") return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-400";
  if (s === "FLAGGED") return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  return "";
}

export function DharmaComplianceCharityDetailPage() {
  const navigate = useNavigate();
  const rawParams: unknown = useParams({ strict: false });
  const charityId =
    typeof rawParams === "object" &&
    rawParams !== null &&
    typeof (rawParams as Record<string, unknown>).charityId === "string"
      ? (rawParams as Record<string, string>).charityId
      : "";
  const { data: charity, isLoading } = useQuery(charityDetailOptions(charityId));
  const updateStatus = useUpdateCharityStatus();

  const [statusDialog, setStatusDialog] = useState<StatusDialogState>(null);

  if (isLoading) {
    return <WorkspaceDetailSkeleton />;
  }

  if (!charity) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Tổ chức không tìm thấy</h1>
        <Button onClick={() => void navigate({ to: "/phap-luat/to-chuc-tu-thien" })}>
          Quay lại
        </Button>
      </div>
    );
  }

  function handleStatusChange(targetStatus: CharityStatus) {
    setStatusDialog({ targetStatus, reason: "" });
  }

  function handleConfirmStatus() {
    if (!statusDialog || !charity) return;
    updateStatus.mutate(
      { publicId: charity.id, status: statusDialog.targetStatus, reason: statusDialog.reason },
      {
        onSuccess: () => {
          setStatusDialog(null);
          toast.success("Đã cập nhật trạng thái tổ chức.");
        },
      },
    );
  }

  const actions = [
    ...(charity.status === "PENDING_REVIEW"
      ? [{ label: "Xác minh & kích hoạt", onClick: () => handleStatusChange("ACTIVE") }]
      : []),
    ...(charity.status === "ACTIVE"
      ? [{ label: "Tạm dừng", onClick: () => handleStatusChange("SUSPENDED"), variant: "outline" as const }]
      : []),
    ...(charity.status === "SUSPENDED"
      ? [{ label: "Kích hoạt lại", onClick: () => handleStatusChange("ACTIVE") }]
      : []),
    ...(charity.status !== "FLAGGED"
      ? [{ label: "Thu hồi", onClick: () => handleStatusChange("FLAGGED"), variant: "destructive" as const, separator: true }]
      : []),
  ];

  return (
    <>
      <AdminDetailPage
        backHref="/phap-luat/to-chuc-tu-thien"
        backLabel="Tổ chức từ thiện"
        title={charity.name}
        status={<Badge className={statusBadgeClass(charity.status)} variant="outline">{CHARITY_STATUS_LABELS[charity.status]}</Badge>}
        actions={actions}
        sidebar={
          <AdminDetailSection title="Trạng thái">
            <AdminDetailField
              label="Hiện tại"
              value={<Badge className={statusBadgeClass(charity.status)} variant="outline">{CHARITY_STATUS_LABELS[charity.status]}</Badge>}
            />
            <AdminDetailField label="Mã bản ghi" value={charity.id} />
          </AdminDetailSection>
        }
      >
        <AdminDetailSection title="Thông tin tổ chức">
          <AdminDetailField label="Loại tổ chức" value={charity.charityType} />
          <AdminDetailField label="Mã đăng ký" value={charity.registrationNumber} />
          <AdminDetailField label="Email liên hệ" value={charity.contactEmail} />
          <AdminDetailField
            label="Website"
            value={
              charity.websiteUrl ? (
                <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
                  {charity.websiteUrl}
                </a>
              ) : null
            }
            stacked
          />
        </AdminDetailSection>
      </AdminDetailPage>

      <Dialog open={statusDialog !== null} onOpenChange={(open) => !open && setStatusDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusDialog?.targetStatus === "ACTIVE" && "Xác minh & kích hoạt"}
              {statusDialog?.targetStatus === "SUSPENDED" && "Tạm dừng"}
              {statusDialog?.targetStatus === "FLAGGED" && "Thu hồi"}
            </DialogTitle>
            <DialogDescription>
              Tổ chức: <span className="font-semibold text-foreground">{charity.name}</span>
            </DialogDescription>
          </DialogHeader>
          {statusDialog && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status-reason">Lý do</Label>
                <Textarea
                  id="status-reason"
                  value={statusDialog.reason}
                  onChange={(e) => setStatusDialog((d) => d ? { ...d, reason: e.target.value } : d)}
                  placeholder="Ghi chú lý do thay đổi trạng thái..."
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStatusDialog(null)} disabled={updateStatus.isPending}>
                  Huỷ
                </Button>
                <Button
                  variant={statusDialog.targetStatus === "FLAGGED" ? "destructive" : "default"}
                  onClick={handleConfirmStatus}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? "Đang lưu..." : "Xác nhận"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
