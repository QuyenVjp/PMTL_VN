/**
 * Feature-local Zod schemas for admin password recovery.
 * Mirrors apps/api identity.schemas for forgot/reset, with Vietnamese field errors
 * and confirm-password refinement for the reset form.
 */
import { z } from "zod";

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
});

export type ForgotPasswordFormInput = z.infer<typeof forgotPasswordFormSchema>;

/** Align with API: password min 8. Confirm must match. */
export const resetPasswordFormSchema = z
  .object({
    token: z.string().trim().min(1, "Thiếu mã đặt lại mật khẩu"),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(128, "Mật khẩu quá dài"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

/** Payload sent to API (no confirmPassword). */
export type ResetPasswordApiInput = {
  token: string;
  password: string;
};
