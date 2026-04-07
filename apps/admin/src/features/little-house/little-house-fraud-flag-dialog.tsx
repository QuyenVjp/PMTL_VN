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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFlagLhFraud } from "./mutations.js";
import { type LhListItem } from "./types.js";

export interface FraudFlagDialogProps {
  open: boolean;
  onClose: () => void;
  item: LhListItem | null;
}

export function FraudFlagDialog({ open, onClose, item }: FraudFlagDialogProps) {
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState<string>("");
  const mutation = useFlagLhFraud();

  function handleClose() {
    setReason("");
    setSeverity("");
    onClose();
  }

  function handleConfirm() {
    if (!item || !reason.trim() || !severity) return;
    mutation.mutate(
      { publicId: item.id, reason: reason.trim(), severity },
      { onSuccess: handleClose },
    );
  }

  const isValid = reason.trim().length > 0 && severity.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đánh dấu gian lận</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fraud-reason">
              Lý do <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="fraud-reason"
              placeholder="Mô tả lý do phát hiện gian lận…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fraud-severity">
              Mức độ <span className="text-destructive">*</span>
            </Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="fraud-severity">
                <SelectValue placeholder="Chọn mức độ…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Nhẹ</SelectItem>
                <SelectItem value="MEDIUM">Trung bình</SelectItem>
                <SelectItem value="HIGH">Nghiêm trọng</SelectItem>
                <SelectItem value="CRITICAL">Nghiêm trọng nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || mutation.isPending}
          >
            {mutation.isPending ? "Đang xử lý…" : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
