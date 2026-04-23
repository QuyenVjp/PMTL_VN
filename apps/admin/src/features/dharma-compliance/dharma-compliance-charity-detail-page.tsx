import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const params = useParams({ strict: false });
  const charityId = params.charityId ?? "";
  const { data: charity, isLoading } = useQuery(charityDetailOptions(charityId));
  const updateStatus = useUpdateCharityStatus();

  const [statusDialog, setStatusDialog] = useState<StatusDialogState>(null);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Đang tải...</div>;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{charity?.name}</h1>
          {charity && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Trạng thái:</span>
              <Badge className={statusBadgeClass(charity.status)} variant="outline">
                {CHARITY_STATUS_LABELS[charity.status]}
              </Badge>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => { void navigate({ to: "/phap-luat/to-chuc-tu-thien" }); }}>
          Quay lại
        </Button>
      </div>

      {charity && (
        <>
          {/* Thông tin cơ bản */}
          <Card>
        <CardHeader>
          <CardTitle>Thông tin tổ chức</CardTitle>
          <CardDescription>Các chi tiết đăng ký của tổ chức.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Loại tổ chức</p>
            <p className="text-base font-medium">{charity.charityType}</p>
          </div>
          {charity.registrationNumber && (
            <div>
              <p className="text-sm text-muted-foreground">Mã đăng ký</p>
              <p className="text-base font-medium">{charity.registrationNumber}</p>
            </div>
          )}
          {charity.contactEmail && (
            <div>
              <p className="text-sm text-muted-foreground">Email liên hệ</p>
              <p className="text-base font-medium">{charity.contactEmail}</p>
            </div>
          )}
          {charity.websiteUrl && (
            <div>
              <p className="text-sm text-muted-foreground">Website</p>
              <p className="text-base font-medium">
                <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {charity.websiteUrl}
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quản lý trạng thái */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý trạng thái</CardTitle>
          <CardDescription>Thay đổi trạng thái tổ chức từ thiện.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {charity.status === "PENDING_REVIEW" && (
            <Button onClick={() => handleStatusChange("ACTIVE")} className="w-full">
              Xác minh & kích hoạt
            </Button>
          )}
          {charity.status === "ACTIVE" && (
            <Button onClick={() => handleStatusChange("SUSPENDED")} variant="outline" className="w-full">
              Tạm dừng
            </Button>
          )}
          {charity.status === "SUSPENDED" && (
            <Button onClick={() => handleStatusChange("ACTIVE")} className="w-full">
              Kích hoạt lại
            </Button>
          )}
          {charity.status !== "FLAGGED" && (
            <Button onClick={() => handleStatusChange("FLAGGED")} variant="destructive" className="w-full">
              Thu hồi
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Status change dialog */}
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
      )}
    </div>
  );
}
