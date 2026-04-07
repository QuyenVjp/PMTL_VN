import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdvanceLhStatus } from "./mutations.js";
import { LH_STATUS_LABELS, type LhListItem, type LhStatus } from "./types.js";

const ADVANCE_ACTION_LABELS: Partial<Record<LhStatus, string>> = {
  SIGNED: "Ký nhận",
  CHANTED: "Hoàn thành tụng",
  BURNED: "Ghi nhận đốt",
  CANCELLED: "Huỷ",
};

export interface AdvanceDialogProps {
  open: boolean;
  onClose: () => void;
  item: LhListItem | null;
  targetStatus: LhStatus | null;
}

export function AdvanceDialog({ open, onClose, item, targetStatus }: AdvanceDialogProps) {
  const mutation = useAdvanceLhStatus();

  function handleConfirm() {
    if (!item || !targetStatus) return;
    mutation.mutate(
      { publicId: item.id, status: targetStatus },
      { onSuccess: onClose },
    );
  }

  const actionLabel = targetStatus ? (ADVANCE_ACTION_LABELS[targetStatus] ?? targetStatus) : "";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận {actionLabel.toLowerCase()}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Hồ sơ sớ của <strong>{item?.beneficiaryName}</strong> sẽ được chuyển sang trạng thái{" "}
          <strong>{targetStatus ? LH_STATUS_LABELS[targetStatus] : ""}</strong>.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending}
            variant={targetStatus === "CANCELLED" ? "destructive" : "default"}
          >
            {mutation.isPending ? "Đang xử lý…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
