import { z } from "zod";

import { userRoleValues } from "../enums/user-role";
import { userStatusValues } from "../enums/user-status";

export const userRoleSchema = z.enum(userRoleValues);
export const userStatusSchema = z.enum(userStatusValues);

export const authPasswordSchema = z
  .string()
  .min(8, "Password phai co it nhat 8 ky tu.")
  .max(128, "Password qua dai.");

export const registerSchema = z.object({
  email: z.email(),
  password: authPasswordSchema,
  displayName: z.string().trim().min(2).max(120),
});

export const loginSchema = z.object({
  email: z.email(),
  password: authPasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: authPasswordSchema,
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(280),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
