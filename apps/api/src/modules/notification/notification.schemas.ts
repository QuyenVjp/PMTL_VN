import { z } from "zod";

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().default(false),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

export const markReadSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1).max(100),
});

export type MarkReadInput = z.infer<typeof markReadSchema>;
