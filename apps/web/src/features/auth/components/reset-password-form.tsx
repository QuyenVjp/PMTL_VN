"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordSchema } from "@pmtl/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { resetPasswordViaWeb } from "../api/browser-auth-client";
import { WebAuthError } from "../utils/auth-error";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);

    try {
      await resetPasswordViaWeb(values);
      router.push("/profile");
      router.refresh();
    } catch (error) {
      if (error instanceof WebAuthError) {
        setError(error.message);
      } else {
        setError("Không thể đặt lại mật khẩu.");
      }
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(event);
  };

  return (
    <form className="panel section-stack" onSubmit={handleSubmit} style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Đặt lại mật khẩu</h1>
      <input
        {...form.register("password")}
        className="field"
        placeholder="Mật khẩu mới"
        type="password"
      />
      {error ? <p style={{ color: "#a33", margin: 0 }}>{error}</p> : null}
      <button className="button button-primary" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );
}
