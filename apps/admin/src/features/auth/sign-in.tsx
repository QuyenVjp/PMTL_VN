/**
 * Admin Sign-In Page — wired to backend auth/login API
 *
 * Constitution: Cookie-first auth, session authority at apps/api.
 * On success: sets httpOnly cookies (pmtl_access + pmtl_refresh) via API,
 * then redirects to dashboard.
 */
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { AuthShell } from "@/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminClient } from "@/lib/api/admin-client";
import { HttpError } from "@/lib/api/http-error";
import { clearAuthCache } from "@/lib/auth";

interface LoginResponse {
  user: {
    publicId: string;
    email: string;
    displayName: string;
    role: string;
  };
}

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await adminClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      // Verify admin role
      if (result.user.role !== "ADMIN" && result.user.role !== "SUPER_ADMIN") {
        setError("Tài khoản không có quyền quản trị");
        return;
      }

      // Cookie httpOnly đã được set bởi API.
      // Clear module-level cache trước khi navigate để beforeLoad fetch lại user mới.
      clearAuthCache();

      // Dùng window.location để force full navigation — tránh TanStack Router
      // dùng cached beforeLoad result (cachedUser = null) → redirect về login.
      window.location.href = "/dashboard";
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.message);
      } else {
        setError("Không thể kết nối máy chủ. Vui lòng kiểm tra lại hoặc thử sau.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Đăng nhập quản trị</CardTitle>
          <CardDescription>
            Chỉ tài khoản quản trị được phép vào admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => void handleSubmit(e)}>
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pmtl.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="min-h-[44px]"
              />
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
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="min-h-[44px]"
              />
            </div>
            <Button type="submit" className="mt-2 min-h-[44px]" disabled={loading}>
              {loading ? "Đang xác thực..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
