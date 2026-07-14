/**
 * Admin forgot-password page — real submit to POST /auth/forgot-password.
 *
 * Anti-enumeration: success copy is identical whether or not the email exists.
 * Field validation via Zod; loading/success/error states are explicit.
 */
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { AuthShell } from "@/features/auth/auth-shell";
import { useRequestPasswordReset } from "@/features/auth/mutations";
import { forgotPasswordFormSchema } from "@/features/auth/schemas";
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

/** Canonical success copy — never reveals whether the account exists. */
export const FORGOT_PASSWORD_SUCCESS_COPY =
  "Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (và thư rác).";

export function ForgotPasswordPage() {
  const mutation = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setFormError(null);

    const parsed = forgotPasswordFormSchema.safeParse({ email });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setFieldError(issue?.message ?? "Email không hợp lệ");
      return;
    }

    mutation.mutate(parsed.data, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err) => {
        // Network / 5xx only — API never reveals account existence.
        if (err instanceof HttpError) {
          setFormError(err.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
          return;
        }
        setFormError("Không thể kết nối máy chủ. Vui lòng kiểm tra lại hoặc thử sau.");
      },
    });
  }

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
          {submitted ? (
            <div
              className="rounded-md bg-muted/50 px-3 py-3 text-sm text-foreground"
              role="status"
              data-testid="forgot-password-success"
            >
              {FORGOT_PASSWORD_SUCCESS_COPY}
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
              {formError && (
                <div
                  className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                  data-testid="forgot-password-error"
                >
                  {formError}
                </div>
              )}
              <div className="grid gap-2">
                <label htmlFor="forgot-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="admin@pmtl.local"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  autoComplete="email"
                  className="min-h-[44px]"
                  aria-invalid={Boolean(fieldError)}
                  aria-describedby={fieldError ? "forgot-email-error" : undefined}
                  disabled={mutation.isPending}
                />
                {fieldError && (
                  <p
                    id="forgot-email-error"
                    className="text-sm text-destructive"
                    role="alert"
                    data-testid="forgot-email-field-error"
                  >
                    {fieldError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="mt-2 min-h-[44px]"
                disabled={mutation.isPending}
                data-testid="forgot-password-submit"
              >
                {mutation.isPending ? "Đang gửi..." : "Gửi liên kết khôi phục"}
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
