import { z } from "zod";

export const createSessionSchema = z.object({
  userId: z.string().cuid(),
  refreshToken: z.string().min(32),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  expiresAt: z.date(),
});

export const sessionResponseSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
