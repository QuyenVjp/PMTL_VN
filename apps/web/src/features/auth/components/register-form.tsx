"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterSchema } from "@pmtl/shared";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { registerViaWeb } from "../api/browser-auth-client";
import { WebAuthError } from "../utils/auth-error";

type RegisterFormProps = {
  className?: string;
};

export function RegisterForm({ className }: RegisterFormProps) {
  const router = useRouter();
  const { refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      await registerViaWeb(values);
      await refetch();
      router.push("/profile");
      router.refresh();
    } catch (error) {
      if (error instanceof WebAuthError) {
        setError(error.message);
      } else {
        setError("Khong the tao tai khoan luc nay.");
      }
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(event);
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
            Tạo tài khoản để giữ nhịp tu học của bạn
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Hồ sơ sẽ được liên kết với hệ thống thành viên của PMTL để bạn lưu tiến trình và tham gia cộng đồng.
          </p>
        </div>

        <Field data-invalid={form.formState.errors.displayName ? true : undefined}>
          <FieldLabel htmlFor="displayName">Tên hiển thị</FieldLabel>
          <Input
            {...form.register("displayName")}
            id="displayName"
            type="text"
            placeholder="Pháp danh hoặc tên thường dùng..."
            autoComplete="name"
            aria-invalid={form.formState.errors.displayName ? true : undefined}
          />
          {form.formState.errors.displayName ? (
            <FieldDescription data-invalid>{form.formState.errors.displayName.message}</FieldDescription>
          ) : null}
        </Field>

        <Field data-invalid={form.formState.errors.email ? true : undefined}>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <Input
            {...form.register("email")}
            id="register-email"
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
          <FieldLabel htmlFor="register-password">Mật khẩu</FieldLabel>
          <Input
            {...form.register("password")}
            id="register-password"
            type="password"
            placeholder="Tối thiểu 8 ký tự..."
            autoComplete="new-password"
            aria-invalid={form.formState.errors.password ? true : undefined}
          />
          {form.formState.errors.password ? (
            <FieldDescription data-invalid>{form.formState.errors.password.message}</FieldDescription>
          ) : (
            <FieldDescription>Dùng mật khẩu đủ dài để bảo vệ hồ sơ của bạn.</FieldDescription>
          )}
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
            {form.formState.isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
          </Button>
          <FieldDescription className="text-center">
            Đã có tài khoản?{" "}
            <Link href="/auth?mode=login" className="font-medium text-foreground underline underline-offset-4">
              Đăng nhập
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
