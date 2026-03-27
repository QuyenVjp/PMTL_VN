import { Link } from "@tanstack/react-router";

import { AuthShell } from "@/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Khôi phục mật khẩu</CardTitle>
          <CardDescription>
            Nhập email quản trị để nhận hướng dẫn đặt lại mật khẩu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="forgot-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="forgot-email" type="email" placeholder="admin@pmtl.local" />
            </div>
            <Button type="submit" className="mt-2">
              Gửi liên kết khôi phục
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Quay lại{" "}
            <Link to="/auth/dang-nhap" className="underline underline-offset-4 hover:text-foreground">
              đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
