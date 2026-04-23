import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useCheckIn } from "./mutations.js";

interface EventsCheckInDialogProps {
  eventPublicId: string;
  eventTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventsCheckInDialog({
  eventPublicId,
  eventTitle,
  open,
  onOpenChange,
}: EventsCheckInDialogProps) {
  const [memberId, setMemberId] = useState("");
  const checkIn = useCheckIn();

  function handleClose() {
    setMemberId("");
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = memberId.trim();
    if (!trimmed) {
      toast.error("Vui lòng nhập mã thành viên.");
      return;
    }
    checkIn.mutate(
      { eventPublicId, userId: trimmed },
      { onSuccess: () => handleClose() },
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điểm danh thành viên</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sự kiện: <span className="font-medium text-foreground">{eventTitle}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="memberId">
              Mã thành viên <span className="text-destructive">*</span>
            </Label>
            <Input
              id="memberId"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Nhập mã thành viên cần điểm danh"
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={checkIn.isPending}>
              {checkIn.isPending ? "Đang điểm danh..." : "Điểm danh"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
