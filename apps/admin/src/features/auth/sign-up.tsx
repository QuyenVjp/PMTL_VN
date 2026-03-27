import { Link } from "@tanstack/react-router";

import { AuthShell } from "@/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SignUpPage() {
  return (
    <AuthShell>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Tạo tài khoản quản trị</CardTitle>
          <CardDescription>
            Bản này giữ bố cục auth page của starter để shell admin đầy đủ route, không còn thiếu
            trang nền.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Họ tên
              </label>
              <Input id="name" placeholder="Quản trị viên PMTL" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="signup-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="signup-email" type="email" placeholder="admin@pmtl.local" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="signup-password" className="text-sm font-medium">
                Mật khẩu
              </label>
              <Input id="signup-password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="mt-2">
              Tạo tài khoản
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link to="/auth/dang-nhap" className="underline underline-offset-4 hover:text-foreground">
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
