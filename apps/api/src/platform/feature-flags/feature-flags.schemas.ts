import { z } from "zod";

export const featureFlagKeySchema = z.enum([
  "notification.push.enabled",
  "notification.email.enabled",
  "offline.bundle.enabled",
  "search.meilisearch.enabled",
  "community.posting.enabled",
  "community.comments.enabled",
  "engagement.tracking.enabled",
  "maintenance.mode.enabled",
]);

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
