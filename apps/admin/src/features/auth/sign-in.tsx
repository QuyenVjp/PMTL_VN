/**
 * Admin Sign-In Page — wired to backend auth/login API
 *
 * Constitution: Cookie-first auth, session authority at apps/api.
 * On success: sets httpOnly cookies (pmtl_access + pmtl_refresh) via API,
 * then redirects to dashboard.
 */
import { useEffect, useState, type FormEvent } from "react";
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

interface BootstrapStatusResponse {
  needsBootstrap: boolean;
  userCount: number;
  adminCount: number;
}

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingBootstrap, setCheckingBootstrap] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkBootstrap = async () => {
      try {
        const status = await adminClient.get<BootstrapStatusResponse>("/auth/bootstrap-status");
        if (!mounted) return;
        setNeedsBootstrap(status.needsBootstrap);
      } catch {
        if (!mounted) return;
        setNeedsBootstrap(false);
      } finally {
        if (mounted) setCheckingBootstrap(false);
      }
    };

    void checkBootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = needsBootstrap
        ? await adminClient.post<LoginResponse>("/auth/bootstrap-admin", {
            email,
            password,
            displayName,
          })
        : await adminClient.post<LoginResponse>("/auth/login", {
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
        if (err.status === 409 && needsBootstrap) {
          setNeedsBootstrap(false);
        }
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
          <CardTitle className="text-lg tracking-tight">
            {needsBootstrap ? "Khởi tạo tài khoản quản trị" : "Đăng nhập quản trị"}
          </CardTitle>
          <CardDescription>
            {needsBootstrap
              ? "Hệ thống chưa có dữ liệu quản trị. Tạo tài khoản đầu tiên để bắt đầu."
              : "Chỉ tài khoản quản trị được phép vào admin."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={(e) => void handleSubmit(e)}>
            {checkingBootstrap && (
              <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                Đang kiểm tra trạng thái hệ thống...
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}
            {needsBootstrap && (
              <div className="grid gap-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Tên hiển thị quản trị viên
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Quản trị viên"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  autoComplete="name"
                  className="min-h-[44px]"
                />
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
                {!needsBootstrap && (
                  <Link
                    to="/auth/quen-mat-khau"
                    className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Quên mật khẩu?
                  </Link>
                )}
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
              {loading ? "Đang xác thực..." : needsBootstrap ? "Tạo tài khoản quản trị đầu tiên" : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
