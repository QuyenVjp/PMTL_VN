import { z } from "zod";

export const commentCreateSchema = z.object({
  postId: z.string().min(1),
  authorName: z.string().min(2).max(120),
  authorEmail: z.email(),
  content: z.string().min(5).max(2000),
});

export const commentThreadQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const commentReportSchema = z.object({
  reason: z.enum(["spam", "abuse", "off-topic", "unsafe"]).default("spam"),
  notes: z.string().trim().max(500).optional(),
});

export const legacyCommentSubmitSchema = z.object({
  postSlug: z.string().trim().min(1).max(160).optional(),
  content: z.string().trim().min(5).max(2000),
  authorName: z.string().trim().min(2).max(120),
  authorAvatar: z.string().trim().max(2048).optional(),
  parentDocumentId: z.string().trim().min(1).max(160).optional(),
});

export type CommentCreateSchema = z.infer<typeof commentCreateSchema>;
export type CommentThreadQueryInput = z.infer<typeof commentThreadQuerySchema>;
export type CommentReportInput = z.infer<typeof commentReportSchema>;
export type LegacyCommentSubmitInput = z.infer<typeof legacyCommentSubmitSchema>;

