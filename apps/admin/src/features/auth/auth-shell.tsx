import type { PropsWithChildren } from "react";
import { Link } from "@tanstack/react-router";
import { CommandIcon, ShieldCheckIcon } from "lucide-react";

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <div className="grid min-h-svh place-items-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CommandIcon className="size-5" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold tracking-tight">PMTL Admin</p>
            <p className="text-sm text-muted-foreground">Cổng đăng nhập vận hành nội dung và hệ thống</p>
          </div>
        </div>

        {children}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheckIcon className="size-3.5" />
          <span>Chỉ dành cho tài khoản quản trị đã được cấp quyền.</span>
          <Link to="/dashboard" className="underline underline-offset-4 hover:text-foreground">
            Về dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
