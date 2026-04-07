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
import { useUpdateAltarCondition } from "./mutations.js";
import { type AltarItemListItem } from "./types.js";

export interface ConditionUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  item: AltarItemListItem | null;
}

export function ConditionUpdateDialog({ open, onClose, item }: ConditionUpdateDialogProps) {
  const [condition, setCondition] = useState<string>("");
  const [notes, setNotes] = useState("");
  const mutation = useUpdateAltarCondition();

  function handleClose() {
    setCondition("");
    setNotes("");
    onClose();
  }

  function handleConfirm() {
    if (!item || !condition) return;
    mutation.mutate(
      { publicId: item.id, condition, notes: notes.trim() || undefined },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật tình trạng vật phẩm</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="condition-select">
              Tình trạng mới <span className="text-destructive">*</span>
            </Label>
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger id="condition-select">
                <SelectValue placeholder="Chọn tình trạng…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">Tốt</SelectItem>
                <SelectItem value="NEEDS_ATTENTION">Cần chú ý</SelectItem>
                <SelectItem value="REQUIRES_REPLACEMENT">Cần thay thế</SelectItem>
                <SelectItem value="RETIRED">Đã ngưng dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition-notes">Ghi chú</Label>
            <Textarea
              id="condition-notes"
              placeholder="Ghi chú thêm về tình trạng vật phẩm (không bắt buộc)…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!condition || mutation.isPending}
          >
            {mutation.isPending ? "Đang lưu…" : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
