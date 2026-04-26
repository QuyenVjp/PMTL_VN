import { z } from "zod";

// All document types per design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md
export const SEARCH_INDEX_VALUES = [
  "posts",
  "events",
  "guides",
  "downloads",
  "community",
  "sutras",
  "wisdom",
  "qa",
] as const;

export type SearchIndexValue = (typeof SEARCH_INDEX_VALUES)[number];

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Từ khóa tìm kiếm không được để trống").max(120, "Từ khóa tìm kiếm quá dài"),
  index: z.enum(SEARCH_INDEX_VALUES).optional(),
  // Wisdom-QA specific filters per CONTRACTS.md
  type: z.string().optional(),
  entryType: z.string().optional(),
  sourceFamily: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Admin reindex schema per design CONTRACTS.md
export const adminReindexSchema = z.object({
  scope: z.enum(["full", "source", "ids"]),
  source: z.enum(["posts", "guides", "wisdom", "little_house_guides", "sutras", "qa"]).optional(),
  ids: z.array(z.string()).optional(),
  reason: z.string().max(500).optional(),
});

export const adminReindexSourceSchema = z.enum(["posts", "guides", "wisdom", "little_house_guides", "sutras", "qa"]);

export type AdminReindexInput = z.infer<typeof adminReindexSchema>;
export type AdminReindexSourceInput = z.infer<typeof adminReindexSourceSchema>;
