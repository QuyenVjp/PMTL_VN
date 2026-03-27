import { z } from "zod";

export const createCommunityPostSchema = z.object({
  title: z.string().min(5).max(160),
  content: z.string().min(20).max(10000),
  type: z.enum(["story", "question", "reflection", "feedback", "video"]),
  categoryId: z.string().optional(),
  tags: z.array(z.string().max(50)).max(5).optional(),
});

export type CreateCommunityPostInput = z.infer<typeof createCommunityPostSchema>;

export const communityPostQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  type: z.enum(["story", "question", "reflection", "feedback", "video"]).optional(),
});

export type CommunityPostQuery = z.infer<typeof communityPostQuerySchema>;
