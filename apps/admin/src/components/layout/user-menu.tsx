import { Link } from "@tanstack/react-router";
import { BellIcon, LogOutIcon, Settings2Icon, ShieldCheckIcon, UserIcon } from "lucide-react";

import { getAdminUserDisplay } from "@/components/layout/admin-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const user = getAdminUserDisplay();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="size-10 rounded-full border bg-muted/40 p-0"
          aria-label="Mở menu người dùng"
        >
          <Avatar className="size-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-transparent text-sm font-semibold">{user.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-lg">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 px-1 py-1">
            <Avatar className="size-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-sm font-semibold">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="grid text-start">
              <span className="font-semibold">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/nguoi-dung">
              <UserIcon className="size-4" />
              Hồ sơ quản trị
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/he-thong/thong-bao">
              <BellIcon className="size-4" />
              Thông báo hệ thống
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/he-thong/feature-flags">
              <ShieldCheckIcon className="size-4" />
              Quyền và cờ hệ thống
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/he-thong/cai-dat">
              <Settings2Icon className="size-4" />
              Cài đặt admin
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/he-thong/tim-kiem">
              <Settings2Icon className="size-4" />
              Công cụ vận hành
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
          <Link to="/auth/dang-nhap">
            <LogOutIcon className="size-4" />
            Đăng xuất
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
