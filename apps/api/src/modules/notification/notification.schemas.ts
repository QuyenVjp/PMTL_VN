import { z } from "zod";

// ─── Admin Schemas ──────────────────────────────────────────────────────────

export const adminPushJobQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
});
export type AdminPushJobQuery = z.infer<typeof adminPushJobQuerySchema>;

export const adminCreatePushJobSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(5).max(2000),
  targetAudience: z.string().default("all_members"),
});
export type AdminCreatePushJobInput = z.infer<typeof adminCreatePushJobSchema>;

export const adminRedrivePushJobSchema = z.object({
  publicId: z.string().min(1),
});
export type AdminRedrivePushJobInput = z.infer<typeof adminRedrivePushJobSchema>;

// ─── Member Schemas ─────────────────────────────────────────────────────────

export const updatePreferencesSchema = z.object({
  practiceReminders: z.boolean().optional(),
  eventReminders: z.boolean().optional(),
  communityUpdates: z.boolean().optional(),
  quietHoursStart: z.string().max(5).optional(),
  quietHoursEnd: z.string().max(5).optional(),
});
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>;

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url(),
});
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>;
