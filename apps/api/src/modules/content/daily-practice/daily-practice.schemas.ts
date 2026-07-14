import { z } from "zod";

// ── Guide schemas ─────────────────────────────────────────────────────────────

export const listGuidesSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListGuidesQuery = z.infer<typeof listGuidesSchema>;

export const createGuideSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  body: z.string().min(1),
  scriptureImageMediaPublicId: z.string().nullable().optional(),
  duration: z.number().int().min(0).default(0),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  sortOrder: z.number().int().min(0).default(0),
});
export type CreateGuideInput = z.infer<typeof createGuideSchema>;

export const updateGuideSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  scriptureImageMediaPublicId: z.string().nullable().optional(),
  duration: z.number().int().min(0).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdateGuideInput = z.infer<typeof updateGuideSchema>;

// ── Preset schemas ────────────────────────────────────────────────────────────

export const createPresetSchema = z.object({
  name: z.string().min(1).max(255),
  scenarioType: z.string().min(1).max(100),
  practiceCount: z.number().int().min(0).default(0),
  guideIds: z.array(z.string()).default([]),
});
export type CreatePresetInput = z.infer<typeof createPresetSchema>;

export const updatePresetSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  scenarioType: z.string().min(1).max(100).optional(),
  practiceCount: z.number().int().min(0).optional(),
  guideIds: z.array(z.string()).optional(),
});
export type UpdatePresetInput = z.infer<typeof updatePresetSchema>;

// ── FAQ schemas ───────────────────────────────────────────────────────────────

export const createFaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().min(1).max(100).default("general"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});
export type CreateFaqInput = z.infer<typeof createFaqSchema>;

export const updateFaqSchema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;

// ── Response types ────────────────────────────────────────────────────────────

export interface GuideResponse {
  id: string;
  publicId: string;
  title: string;
  slug: string;
  body: string;
  scriptureImageMediaPublicId: string | null;
  scriptureImageUrl: string | null;
  duration: number;
  difficulty: string;
  status: string;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PresetResponse {
  id: string;
  publicId: string;
  name: string;
  scenarioType: string;
  practiceCount: number;
  guideIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FaqResponse {
  id: string;
  publicId: string;
  question: string;
  answer: string;
  category: string;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OverviewResponse {
  guides: { total: number; published: number };
  presets: { total: number };
  faqs: { total: number };
}
