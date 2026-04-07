import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResolveLhFraud } from "./mutations.js";
import { type LhFraudItem } from "./types.js";

export interface ResolveDialogProps {
  open: boolean;
  onClose: () => void;
  item: LhFraudItem | null;
}

export function ResolveDialog({ open, onClose, item }: ResolveDialogProps) {
  const [resolution, setResolution] = useState("");
  const mutation = useResolveLhFraud();

  function handleClose() {
    setResolution("");
    onClose();
  }

  function handleConfirm() {
    if (!item || !resolution.trim()) return;
    mutation.mutate(
      { fraudId: item.id, resolution: resolution.trim() },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Giải quyết gian lận</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="resolution-notes">
            Ghi chú xử lý <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="resolution-notes"
            placeholder="Mô tả biện pháp và kết quả xử lý…"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!resolution.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Đang xử lý…" : "Xác nhận giải quyết"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
