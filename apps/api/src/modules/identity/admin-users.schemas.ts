import { z } from "zod";

// --- Query schemas ---

export const adminUserListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]).optional(),
  role: z.enum(["MEMBER", "ADMIN", "SUPER_ADMIN"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminUserAuditQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// --- Mutation schemas ---

const avatarUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/[^\s]+$/, "Đường dẫn avatar không hợp lệ"),
]);

export const adminUpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  avatarUrl: avatarUrlSchema.optional().nullable(),
});

export const adminCreateUserSchema = z.object({
  displayName: z.string().trim().min(2, "Tên hiển thị phải có ít nhất 2 ký tự.").max(50),
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự."),
  role: z.enum(["MEMBER", "ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
});

export const adminChangeRoleSchema = z.object({
  role: z.enum(["MEMBER", "ADMIN", "SUPER_ADMIN"]),
});

export const adminBlockUserSchema = z.object({
  reason: z.string().max(500).optional(),
});

// --- Types ---

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type AdminUserAuditQuery = z.infer<typeof adminUserAuditQuerySchema>;
export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>;
export type AdminUpdateProfileInput = z.infer<typeof adminUpdateProfileSchema>;
export type AdminChangeRoleInput = z.infer<typeof adminChangeRoleSchema>;
export type AdminBlockUserInput = z.infer<typeof adminBlockUserSchema>;
