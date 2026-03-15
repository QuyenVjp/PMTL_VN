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

const displayNameSchema = z.string().trim().min(2).max(120);

export const updateProfileSchema = z
  .object({
    displayName: displayNameSchema.optional(),
    fullName: displayNameSchema.optional(),
    bio: z.string().trim().max(280).optional(),
    phone: z.string().trim().max(32).nullable().optional(),
    dharmaName: z.string().trim().max(120).nullable().optional(),
    avatar: z.union([z.string().min(1), z.number().int().positive()]).nullable().optional(),
  })
  .refine((input) => input.displayName !== undefined || input.fullName !== undefined || input.bio !== undefined || input.phone !== undefined || input.dharmaName !== undefined || input.avatar !== undefined, {
    message: "Phai cung cap it nhat mot truong de cap nhat.",
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
