"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterSchema } from "@pmtl/shared";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { registerViaWeb } from "../api/browser-auth-client";
import { WebAuthError } from "../utils/auth-error";

export function RegisterForm() {
  const router = useRouter();
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
    <form className="panel section-stack" onSubmit={handleSubmit} style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Tao tai khoan</h1>
      <input
        {...form.register("displayName")}
        className="field"
        placeholder="Ten hien thi"
        type="text"
      />
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
        {form.formState.isSubmitting ? "Dang tao..." : "Dang ky"}
      </button>
      <Link href="/login">Da co tai khoan? Dang nhap</Link>
    </form>
  );
}
