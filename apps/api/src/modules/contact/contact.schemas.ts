import { z } from "zod";

export const submitContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.enum(["general", "feedback", "support", "partnership", "report"]),
  message: z.string().min(10).max(5000),
});

export type SubmitContactInput = z.infer<typeof submitContactSchema>;

export const contactQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  subject: z.enum(["general", "feedback", "support", "partnership", "report"]).optional(),
  status: z.enum(["new", "in_progress", "resolved", "closed"]).optional(),
});

export type ContactQuery = z.infer<typeof contactQuerySchema>;
