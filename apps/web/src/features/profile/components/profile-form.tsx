"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type AuthUser, type UpdateProfileInput } from "@pmtl/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { updateProfileViaWeb } from "@/features/auth/api/browser-auth-client";
import { WebAuthError } from "@/features/auth/utils/auth-error";

type ProfileFormProps = {
  user: AuthUser;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setSuccess(null);

    try {
      await updateProfileViaWeb(values);
      setSuccess("Đã cập nhật hồ sơ.");
      router.refresh();
    } catch (error) {
      if (error instanceof WebAuthError) {
        setError(error.message);
      } else {
        setError("Không thể cập nhật hồ sơ.");
      }
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void onSubmit(event);
  };

  return (
    <form className="panel section-stack" onSubmit={handleSubmit} style={{ padding: 24 }}>
      <h3 style={{ margin: 0 }}>Profile settings</h3>
      <input {...form.register("displayName")} className="field" placeholder="Tên hiển thị" />
      <textarea {...form.register("bio")} className="textarea" placeholder="Mô tả ngắn" />
      {error ? <p style={{ color: "#a33", margin: 0 }}>{error}</p> : null}
      {success ? <p style={{ color: "#15543d", margin: 0 }}>{success}</p> : null}
      <button className="button button-primary" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
