import { z } from "zod";

export const adminSessionListQuerySchema = z.object({
  userId: z.string().optional(),
  status: z.enum(["active", "revoked", "expired"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const adminRevokeBulkSchema = z.object({
  sessionIds: z.array(z.string()).min(1).max(100),
});

export type AdminSessionListQuery = z.infer<typeof adminSessionListQuerySchema>;
export type AdminRevokeBulkInput = z.infer<typeof adminRevokeBulkSchema>;
