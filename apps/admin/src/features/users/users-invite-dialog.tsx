import { useState } from "react";
import { ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { roleLabel, roleOptions, type AdminUserListItem, type ApiUserRole } from "@/features/users/types";
import { useChangeRole } from "@/features/users/mutations";

/** Change-role dialog — replaces old invite dialog */
export function UsersRoleDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow: AdminUserListItem;
}) {
  const changeRole = useChangeRole();
  const [role, setRole] = useState<ApiUserRole>(currentRow.role);

  const handleSubmit = () => {
    if (role === currentRow.role) {
      onOpenChange(false);
      return;
    }

    changeRole.mutate(
      { publicId: currentRow.publicId, input: { role } },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="size-5" />
            Đổi vai trò
          </DialogTitle>
          <DialogDescription>
            Thay đổi vai trò của <span className="font-semibold text-foreground">{currentRow.displayName}</span>. Vai
            trò hiện tại: <span className="font-medium">{roleLabel(currentRow.role)}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Vai trò mới</span>
            <Select value={role} onValueChange={(v) => setRole(v as ApiUserRole)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={changeRole.isPending}>
            {changeRole.isPending ? "Đang lưu..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
