/**
 * Admin reset-password page — POST /auth/reset-password with token from query.
 *
 * Token comes from ?token=... (email link). Invalid/expired/used tokens surface
 * a safe error; password policy + confirm mismatch are field-level.
 * On success, sessions are revoked server-side; user is directed to sign-in.
 */
import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { AuthShell } from "@/features/auth/auth-shell";
import { useResetPassword } from "@/features/auth/mutations";
import { resetPasswordFormSchema } from "@/features/auth/schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HttpError } from "@/lib/api/http-error";

export const RESET_PASSWORD_SUCCESS_COPY =
  "Mật khẩu đã được đặt lại. Mọi phiên đăng nhập cũ đã bị thu hồi. Vui lòng đăng nhập bằng mật khẩu mới.";

type FieldErrors = {
  token?: string;
  password?: string;
  confirmPassword?: string;
};

export function ResetPasswordPage() {
  // Token from ?token=... — route validateSearch guarantees string | undefined
  const search = useSearch({ strict: false });
  const tokenFromUrl =
    "token" in search && typeof search.token === "string" ? search.token : "";

  const mutation = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const missingToken = useMemo(() => tokenFromUrl.trim().length === 0, [tokenFromUrl]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const parsed = resetPasswordFormSchema.safeParse({
      token: tokenFromUrl,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "token" || key === "password" || key === "confirmPassword") {
          if (!next[key]) next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }

    mutation.mutate(
      { token: parsed.data.token, password: parsed.data.password },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err) => {
          if (err instanceof HttpError) {
            // 400 from API = invalid/expired/used token
            if (err.status === 400) {
              setFormError(
                err.message || "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.",
              );
              return;
            }
            setFormError(err.message || "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
            return;
          }
          setFormError("Không thể kết nối máy chủ. Vui lòng kiểm tra lại hoặc thử sau.");
        },
      },
    );
  }

  return (
    <AuthShell>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Đặt lại mật khẩu</CardTitle>
          <CardDescription>
            Nhập mật khẩu mới cho tài khoản quản trị. Mật khẩu phải có ít nhất 8 ký tự.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div
              className="grid gap-3"
              role="status"
              data-testid="reset-password-success"
            >
              <div className="rounded-md bg-muted/50 px-3 py-3 text-sm text-foreground">
                {RESET_PASSWORD_SUCCESS_COPY}
              </div>
              <Button asChild className="min-h-[44px]">
                <Link to="/auth/dang-nhap">Đăng nhập ngay</Link>
              </Button>
            </div>
          ) : missingToken ? (
            <div
              className="grid gap-3"
              role="alert"
              data-testid="reset-password-missing-token"
            >
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu mã token. Vui lòng yêu cầu liên kết mới.
              </div>
              <Button asChild variant="outline" className="min-h-[44px]">
                <Link to="/auth/quen-mat-khau">Yêu cầu liên kết mới</Link>
              </Button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
              {formError && (
                <div
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                  data-testid="reset-password-error"
                >
                  {formError}
                </div>
              )}
              {fieldErrors.token && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {fieldErrors.token}
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="reset-password" className="text-sm font-medium">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Input
                    id="reset-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    autoComplete="new-password"
                    className="min-h-[44px] pr-11"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "reset-password-error" : undefined}
                    disabled={mutation.isPending}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((c) => !c)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p
                    id="reset-password-error"
                    className="text-sm text-destructive"
                    role="alert"
                    data-testid="reset-password-field-error"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="reset-confirm" className="text-sm font-medium">
                  Xác nhận mật khẩu
                </label>
                <Input
                  id="reset-confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  autoComplete="new-password"
                  className="min-h-[44px]"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={
                    fieldErrors.confirmPassword ? "reset-confirm-error" : undefined
                  }
                  disabled={mutation.isPending}
                />
                {fieldErrors.confirmPassword && (
                  <p
                    id="reset-confirm-error"
                    className="text-sm text-destructive"
                    role="alert"
                    data-testid="reset-confirm-field-error"
                  >
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-2 min-h-[44px]"
                disabled={mutation.isPending}
                data-testid="reset-password-submit"
              >
                {mutation.isPending ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Quay lại{" "}
            <Link
              to="/auth/dang-nhap"
              className="underline underline-offset-4 hover:text-foreground"
            >
              đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthShell>
  );
}
