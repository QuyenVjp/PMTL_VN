import { z } from "zod";

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
