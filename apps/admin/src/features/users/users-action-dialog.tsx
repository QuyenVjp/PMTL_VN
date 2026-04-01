import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FieldError } from "@/components/ui/field-error";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  initials,
  roleOptions,
  statusBadgeClass,
  statusLabel,
  type AdminUserListItem,
  type ApiUserRole,
} from "@/features/users/types";
import {
  useUpdateProfile,
  useChangeRole,
  useBlockUser,
  useUnblockUser,
} from "@/features/users/mutations";
import { extractValidationFieldErrors, hasFieldErrors, invalidFieldClass, type FieldErrors } from "@/lib/form-validation.js";
import { resolveMediaSrc } from "@/lib/media-src";

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
  const changeRole = useChangeRole();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();

  const [displayName, setDisplayName] = useState(currentRow.displayName);
  const [email, setEmail] = useState(currentRow.email);
  const [role, setRole] = useState<ApiUserRole>(currentRow.role);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setDisplayName(currentRow.displayName);
    setEmail(currentRow.email);
    setRole(currentRow.role);
    setFieldErrors({});
  }, [currentRow, open]);

  const handleSubmit = () => {
    const nextErrors: FieldErrors = {};
    if (!displayName.trim()) nextErrors.displayName = "Tên hiển thị không được để trống.";
    if (!email.trim()) nextErrors.email = "Email không được để trống.";
    if (hasFieldErrors(nextErrors)) { setFieldErrors(nextErrors); toast.error(Object.values(nextErrors)[0]); return; }
    setFieldErrors({});

    const profileChanged =
      displayName !== currentRow.displayName || email !== currentRow.email;
    const roleChanged = role !== currentRow.role;

    const promises: Promise<unknown>[] = [];

    if (profileChanged) {
      promises.push(
        updateProfile.mutateAsync({
          publicId: currentRow.publicId,
          input: {
            ...(displayName !== currentRow.displayName && { displayName: displayName.trim() }),
            ...(email !== currentRow.email && { email: email.trim() }),
          },
        }),
      );
    }

    if (roleChanged) {
      promises.push(
        changeRole.mutateAsync({
          publicId: currentRow.publicId,
          input: { role },
        }),
      );
    }

    if (promises.length === 0) {
      onOpenChange(false);
      return;
    }

    Promise.all(promises)
      .then(() => onOpenChange(false))
      .catch((error) => {
        setFieldErrors(extractValidationFieldErrors(error));
      });
  };

  const isPending =
    updateProfile.isPending || changeRole.isPending ||
    blockUser.isPending || unblockUser.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
          <DialogDescription>Cập nhật hồ sơ, vai trò và trạng thái tài khoản.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-2xl">
              <AvatarImage src={resolveMediaSrc(currentRow.avatarUrl) ?? undefined} alt={currentRow.displayName} />
              <AvatarFallback className="rounded-2xl text-lg">
                {initials(currentRow.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{currentRow.displayName}</div>
              <div className="text-sm text-muted-foreground">{currentRow.email}</div>
              <Badge variant="outline" className={`mt-1 text-xs ${statusBadgeClass(currentRow.status)}`}>
                {statusLabel(currentRow.status)}
              </Badge>
            </div>
          </div>

          <Field label="Tên hiển thị">
            <Input
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (fieldErrors.displayName) setFieldErrors((prev) => ({ ...prev, displayName: "" }));
              }}
              className={invalidFieldClass(Boolean(fieldErrors.displayName))}
            />
            <FieldError message={fieldErrors.displayName} />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={invalidFieldClass(Boolean(fieldErrors.email))}
            />
            <FieldError message={fieldErrors.email} />
          </Field>
          <Field label="Vai trò">
            <Select value={role} onValueChange={(v) => setRole(v as ApiUserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Trạng thái tài khoản</p>
            {currentRow.status === "SUSPENDED" ? (
              <Button
                variant="outline"
                size="sm"
                disabled={unblockUser.isPending}
                onClick={() =>
                  unblockUser.mutate(
                    { publicId: currentRow.publicId },
                    { onSuccess: () => onOpenChange(false) },
                  )
                }
              >
                {unblockUser.isPending ? "Đang mở khóa..." : "Mở khóa tài khoản"}
              </Button>
            ) : currentRow.status === "ACTIVE" ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={blockUser.isPending}
                onClick={() =>
                  blockUser.mutate(
                    { publicId: currentRow.publicId },
                    { onSuccess: () => onOpenChange(false) },
                  )
                }
              >
                {blockUser.isPending ? "Đang khóa..." : "Khóa tài khoản"}
              </Button>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {updateProfile.isPending || changeRole.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
