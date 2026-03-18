"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@pmtl/shared";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/contexts/AuthContext";
import { publicEnv } from "@/lib/env/public-env";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { loginViaWeb } from "../api/browser-auth-client";
import { WebAuthError } from "../utils/auth-error";

type LoginFormProps = {
  redirectTo?: string;
  className?: string;
};

const googleIcon = (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path
      d="M12 4.75c1.73 0 3.28.6 4.5 1.77l3.35-3.35C17.81 1.29 15.1.25 12 .25 7.33.25 3.3 2.94 1.32 6.84l3.9 3.03A7.22 7.22 0 0 1 12 4.75Z"
      fill="#EA4335"
    />
    <path
      d="M22.25 12.27c0-.77-.07-1.51-.2-2.22H12v4.2h5.76a4.91 4.91 0 0 1-2.13 3.23l3.46 2.68c2.02-1.86 3.16-4.6 3.16-7.9Z"
      fill="#4285F4"
    />
    <path
      d="M5.22 14.13a7.25 7.25 0 0 1 0-4.25l-3.9-3.03a11.78 11.78 0 0 0 0 10.32l3.9-3.04Z"
      fill="#FBBC05"
    />
    <path
      d="M12 23.75c3.1 0 5.7-1.02 7.6-2.76l-3.46-2.68c-.96.65-2.2 1.04-4.14 1.04a7.22 7.22 0 0 1-6.77-4.87l-3.9 3.04A11.75 11.75 0 0 0 12 23.75Z"
      fill="#34A853"
    />
  </svg>
);

export function LoginForm({ redirectTo = "/profile", className }: LoginFormProps) {
  const router = useRouter();
  const { refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      await loginViaWeb(values);
      await refetch();
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      if (error instanceof WebAuthError) {
        setError(error.message);
      } else {
        setError("Khong the dang nhap luc nay.");
      }
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(event);
  };

  const handleGoogleLogin = () => {
    const url = new URL("/api/connect/google", publicEnv.CMS_PUBLIC_URL);
    url.searchParams.set("redirectTo", redirectTo);
    window.location.href = url.toString();
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
            Đăng nhập để tiếp tục hành trình tu học
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Session được đồng bộ qua cookie bảo mật của Payload. Nhập email và mật khẩu để vào hồ sơ của bạn.
          </p>
        </div>

        <Field data-invalid={form.formState.errors.email ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            {...form.register("email")}
            id="email"
            type="email"
            placeholder="ban@vidu.vn..."
            autoComplete="email"
            inputMode="email"
            aria-invalid={form.formState.errors.email ? true : undefined}
          />
          {form.formState.errors.email ? (
            <FieldDescription data-invalid>{form.formState.errors.email.message}</FieldDescription>
          ) : null}
        </Field>

        <Field data-invalid={form.formState.errors.password ? true : undefined}>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <Input
            {...form.register("password")}
            id="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn..."
            autoComplete="current-password"
            aria-invalid={form.formState.errors.password ? true : undefined}
          />
          {form.formState.errors.password ? (
            <FieldDescription data-invalid>{form.formState.errors.password.message}</FieldDescription>
          ) : null}
        </Field>

        {error ? (
          <Field data-invalid>
            <FieldDescription data-invalid>{error}</FieldDescription>
          </Field>
        ) : null}

        <Field>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {form.formState.isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </Field>

        <FieldSeparator>Hoặc tiếp tục với</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            size="lg"
            className="w-full rounded-xl border-border/80 bg-background/80"
            onClick={handleGoogleLogin}
          >
            <span className="size-4 [&_svg]:size-4">{googleIcon}</span>
            Tiếp tục với Google
          </Button>
          <FieldDescription className="text-center">
            Chưa có tài khoản?{" "}
            <Link href="/auth?mode=register" className="font-medium text-foreground underline underline-offset-4">
              Tạo tài khoản
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
