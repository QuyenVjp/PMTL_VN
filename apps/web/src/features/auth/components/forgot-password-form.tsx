"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@pmtl/shared";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { forgotPasswordViaWeb } from "../api/browser-auth-client";
import { WebAuthError } from "../utils/auth-error";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    message: string;
    resetUrl?: string;
  } | null>(null);
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    try {
      const result = await forgotPasswordViaWeb(values);
      setSuccess({
        message: result.message,
        ...(result.resetUrl ? { resetUrl: result.resetUrl } : {}),
      });
    } catch (error) {
      if (error instanceof WebAuthError) {
        setError(error.message);
      } else {
        setError("Không thể gửi yêu cầu đặt lại mật khẩu.");
      }
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(event);
  };

  return (
    <form className="panel section-stack" onSubmit={handleSubmit} style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Quên mật khẩu</h1>
      <input
        {...form.register("email")}
        className="field"
        placeholder="Email"
        type="email"
      />
      {error ? <p style={{ color: "#a33", margin: 0 }}>{error}</p> : null}
      {success ? (
        <div className="panel" style={{ padding: 16 }}>
          <p style={{ marginTop: 0 }}>{success.message}</p>
          {success.resetUrl ? (
            <p style={{ marginBottom: 0 }}>
              Dev reset URL: <a href={success.resetUrl}>{success.resetUrl}</a>
            </p>
          ) : null}
        </div>
      ) : null}
      <button className="button button-primary" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn"}
      </button>
    </form>
  );
}
