import { z } from "zod";

// Login
export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

// Register
export const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  displayName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(50),
});

// First-admin bootstrap (when database has no users yet)
export const bootstrapAdminSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  displayName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(50),
});

// Forgot password
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

// Reset password
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

// Update profile
const avatarUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/[^\s]+$/, "Đường dẫn avatar không hợp lệ"),
]);

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: avatarUrlSchema.optional().nullable(),
});

// Change password
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
});

// Auth response
export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    displayName: z.string(),
    role: z.string(),
    avatarUrl: z.string().nullable(),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BootstrapAdminInput = z.infer<typeof bootstrapAdminSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
