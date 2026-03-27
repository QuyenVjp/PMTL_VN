import { Link } from "@tanstack/react-router";

import { AuthShell } from "@/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignInPage() {
  return (
    <AuthShell>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Đăng nhập quản trị</CardTitle>
          <CardDescription>
            Chỉ tài khoản quản trị được phép vào admin. Route này đứng ngoài shell và không nằm trong sidebar nghiệp vụ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="admin@pmtl.local" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-medium">
                  Mật khẩu
                </label>
                <Link
                  to="/auth/quen-mat-khau"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="mt-2">
              Đăng nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
