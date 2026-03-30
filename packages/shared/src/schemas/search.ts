import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  index: z.enum(["posts", "events", "sutras", "community"]).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

