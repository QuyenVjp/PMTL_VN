import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { initials, type AdminUserListItem } from "@/features/users/types";
import { useUpdateProfile } from "@/features/users/mutations";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function UsersActionDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow: AdminUserListItem;
}) {
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState(currentRow.displayName);
  const [email, setEmail] = useState(currentRow.email);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(currentRow.displayName);
    setEmail(currentRow.email);
    setError(null);
  }, [currentRow, open]);

  const handleSubmit = () => {
    if (!displayName.trim() || !email.trim()) {
      setError("Tên hiển thị và email không được để trống.");
      return;
    }

    updateProfile.mutate(
      {
        publicId: currentRow.publicId,
        input: {
          ...(displayName !== currentRow.displayName && { displayName: displayName.trim() }),
          ...(email !== currentRow.email && { email: email.trim() }),
        },
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) => setError(err.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>Cập nhật hồ sơ người dùng.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={currentRow.avatarUrl ?? undefined} alt={currentRow.displayName} />
              <AvatarFallback className="rounded-2xl text-lg">
                {initials(currentRow.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium">{currentRow.displayName}</div>
              <div className="text-sm text-muted-foreground">{currentRow.email}</div>
            </div>
          </div>

          <Field label="Tên hiển thị">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
