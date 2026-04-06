import { z } from "zod";

export const toggleReactionSchema = z.object({
  targetType: z.enum(["post", "comment", "community_post"]),
  targetId: z.string().min(1),
  reaction: z.enum(["like", "pray", "inspire", "gratitude"]),
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;

export const toggleBookmarkSchema = z.object({
  targetType: z.enum(["post", "event", "sutra", "guide"]),
  targetId: z.string().min(1),
});

export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkSchema>;

export const getBookmarksQuerySchema = z.object({
  targetType: z.enum(["post", "event", "sutra", "guide"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GetBookmarksQuery = z.infer<typeof getBookmarksQuerySchema>;
