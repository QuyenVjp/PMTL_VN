"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@pmtl/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { loginViaWeb } from "../api/browser-auth-client";
import { WebAuthError } from "../utils/auth-error";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/profile" }: LoginFormProps) {
  const router = useRouter();
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

  return (
    <form className="panel section-stack" onSubmit={handleSubmit} style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Dang nhap</h1>
      <p className="muted" style={{ margin: 0 }}>
        Session cua web se luu Payload JWT trong cookie httpOnly.
      </p>
      <input
        {...form.register("email")}
        className="field"
        placeholder="Email"
        type="email"
      />
      <input
        {...form.register("password")}
        className="field"
        placeholder="Mat khau"
        type="password"
      />
      {error ? <p style={{ color: "#a33", margin: 0 }}>{error}</p> : null}
      <button className="button button-primary" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Dang dang nhap..." : "Dang nhap"}
      </button>
      <div className="inline-list">
        <Link href="/register">Tao tai khoan</Link>
        <Link href="/forgot-password">Quen mat khau</Link>
      </div>
    </form>
  );
}
