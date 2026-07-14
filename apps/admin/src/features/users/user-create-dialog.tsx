import { useState } from "react";
import { UserPlusIcon } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUser } from "@/features/users/mutations";
import { roleOptions, type ApiUserRole } from "@/features/users/types";

export function UserCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createUser = useCreateUser();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ApiUserRole>("ADMIN");

  const submit = () => {
    createUser.mutate(
      {
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        role,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <UserPlusIcon className="size-5" />
            Thêm phụng sự viên
          </DialogTitle>
          <DialogDescription>
            Super Admin tạo tài khoản để phụng sự viên đăng nhập và quản trị nội dung.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tên hiển thị *</span>
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Email *</span>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Mật khẩu tạm *</span>
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Vai trò</span>
            <Select value={role} onValueChange={(value) => setRole(value as ApiUserRole)}>
              <SelectTrigger>
                <SelectValue />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createUser.isPending}>
            Hủy
          </Button>
          <Button
            onClick={submit}
            disabled={createUser.isPending || !displayName.trim() || !email.trim() || password.length < 8}
          >
            {createUser.isPending ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
