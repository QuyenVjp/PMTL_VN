import { z } from "zod";

// Public/member schemas
export const createCommunityPostSchema = z.object({
  content: z.string().min(10).max(10000),
});
export type CreateCommunityPostInput = z.infer<typeof createCommunityPostSchema>;

export const communityPostQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  search: z.string().optional(),
});
export type CommunityPostQuery = z.infer<typeof communityPostQuerySchema>;

// Admin schemas
export const adminUpdateCommunityPostSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "HIDDEN"]),
});
export type AdminUpdateCommunityPostInput = z.infer<typeof adminUpdateCommunityPostSchema>;

// Guestbook schemas
export const createGuestbookEntrySchema = z.object({
  content: z.string().min(5).max(5000),
});
export type CreateGuestbookEntryInput = z.infer<typeof createGuestbookEntrySchema>;

export const guestbookQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
});
export type GuestbookQuery = z.infer<typeof guestbookQuerySchema>;

export const adminUpdateGuestbookSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
export type AdminUpdateGuestbookInput = z.infer<typeof adminUpdateGuestbookSchema>;

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Nội dung không được trống").max(2000),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const commentQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type CommentQuery = z.infer<typeof commentQuerySchema>;

// Report schemas
export const createReportSchema = z.object({
  reasonCode: z.string().min(1).max(50),
  description: z.string().max(1000).optional(),
});
export type CreateReportInput = z.infer<typeof createReportSchema>;

// Volunteer schemas
export const createVolunteerSchema = z.object({
  displayName: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  phone: z.string().max(20).optional(),
  zaloLink: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;

export const updateVolunteerSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().max(20).optional(),
  zaloLink: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

export const volunteerQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});
export type VolunteerQuery = z.infer<typeof volunteerQuerySchema>;
