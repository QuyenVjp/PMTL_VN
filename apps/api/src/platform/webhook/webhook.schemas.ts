/**
 * Webhook Schemas — Zod validation for webhook payloads
 *
 * Constitution: design/01-repo-constitution/ARCHITECTURE_PRINCIPLES.md
 * - "Boundary runtime must have schema validation for webhook payload"
 *
 * Constitution: design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md
 * - "webhook không được coi là implemented nếu chưa có provider/event-id dedup artifact
 *    + signature verification + neutral error response"
 */
import { z } from "zod";

/** Known webhook providers — extend as integrations are added */
export const webhookProviderSchema = z.enum(["stripe", "payos", "cloudflare", "generic"]);
export type WebhookProvider = z.infer<typeof webhookProviderSchema>;

/** Per-provider configuration */
export const webhookProviderConfigSchema = z.object({
  secret: z.string().min(1),
  signatureHeader: z.string().min(1),
  toleranceSeconds: z.number().int().positive().default(300), // 5-minute replay window
  algorithm: z.enum(["sha256", "sha512"]).default("sha256"),
});
export type WebhookProviderConfig = z.infer<typeof webhookProviderConfigSchema>;

/** Dedup record creation input */
export const webhookDeliveryInputSchema = z.object({
  provider: webhookProviderSchema,
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type WebhookDeliveryInput = z.infer<typeof webhookDeliveryInputSchema>;

/** Replay window policy defaults */
export const REPLAY_WINDOW_SECONDS = 300; // 5 minutes
export const DEDUP_TTL_DAYS = 7; // Keep dedup records for 7 days
