import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUserListItem } from "@/features/users/types";
import { useBlockUser, useUnblockUser } from "@/features/users/mutations";

/** Block confirmation dialog — requires typing the user's email to confirm */
export function UsersBlockDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow: AdminUserListItem;
}) {
  const blockUser = useBlockUser();
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");

  const canBlock = confirm.trim() === currentRow.email;

  const handleSubmit = () => {
    blockUser.mutate(
      { publicId: currentRow.publicId, input: reason ? { reason } : undefined },
      {
        onSuccess: () => {
          setConfirm("");
          setReason("");
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle className="text-destructive">Khóa tài khoản</DialogTitle>
          <DialogDescription>
            Khóa <span className="font-semibold text-foreground">{currentRow.displayName}</span>. Tất cả phiên đăng
            nhập sẽ bị thu hồi ngay lập tức.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Lý do khóa (tuỳ chọn)</span>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vi phạm nội quy cộng đồng..."
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Nhập email để xác nhận</span>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={currentRow.email} />
          </label>
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Cẩn thận: Khóa sẽ đăng xuất người dùng khỏi tất cả thiết bị.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="destructive" disabled={!canBlock || blockUser.isPending} onClick={handleSubmit}>
            {blockUser.isPending ? "Đang khóa..." : "Khóa tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Unblock confirmation dialog */
export function UsersUnblockDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow: AdminUserListItem;
}) {
  const unblockUser = useUnblockUser();

  const handleSubmit = () => {
    unblockUser.mutate(
      { publicId: currentRow.publicId },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>Mở khóa tài khoản</DialogTitle>
          <DialogDescription>
            Mở khóa <span className="font-semibold text-foreground">{currentRow.displayName}</span> để họ có thể đăng
            nhập lại.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button disabled={unblockUser.isPending} onClick={handleSubmit}>
            {unblockUser.isPending ? "Đang mở khóa..." : "Xác nhận mở khóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
