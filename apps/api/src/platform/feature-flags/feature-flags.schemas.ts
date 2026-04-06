import { z } from "zod";

export const featureFlagKeys = [
  "notification.push.enabled",
  "notification.email.enabled",
  "offline.bundle.enabled",
  "search.meilisearch.enabled",
  "community.posting.enabled",
  "community.comments.enabled",
  "engagement.tracking.enabled",
  "maintenance.mode.enabled",
  "wisdom.ai.slug_suggest.enabled",
  "wisdom.ai.translation_draft.enabled",
  "wisdom_qa.enabled",
] as const;

export const featureFlagKeySchema = z.enum(featureFlagKeys);

export const createFeatureFlagSchema = z.object({
  key: featureFlagKeySchema,
  enabled: z.boolean().default(false),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateFeatureFlagSchema = z.object({
  enabled: z.boolean().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type FeatureFlagKey = z.infer<typeof featureFlagKeySchema>;
export type CreateFeatureFlagInput = z.infer<typeof createFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof updateFeatureFlagSchema>;
