/**
 * Admin Sign-In Page — wired to backend auth/login API
 *
 * Constitution: Cookie-first auth, session authority at apps/api.
 * On success: sets httpOnly cookies (pmtl_access + pmtl_refresh) via API,
 * then redirects to dashboard.
 */
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { AuthShell } from "@/features/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminClient } from "@/lib/api/admin-client";
import { HttpError } from "@/lib/api/http-error";
import { primeAuthCacheFromLogin } from "@/lib/auth";
import type { UserRole } from "@/lib/roles";

interface LoginResponse {
  user: {
    id?: string;
    publicId?: string;
    email: string;
    displayName: string;
    role: UserRole;
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
  const [showPassword, setShowPassword] = useState(false);
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

      // Cookie httpOnly đã được set bởi API; snapshot này chỉ giúp route guard
      // không đá về login nếu Vite/API đang reload ngay sau thao tác đăng nhập.
      primeAuthCacheFromLogin(result.user);

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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="min-h-[44px] pr-11"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
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
