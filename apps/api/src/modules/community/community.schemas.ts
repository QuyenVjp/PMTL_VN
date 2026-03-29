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
