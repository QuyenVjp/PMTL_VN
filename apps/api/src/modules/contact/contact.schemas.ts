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

// Volunteer schemas
export const volunteerQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().optional(),
});
export type VolunteerQuery = z.infer<typeof volunteerQuerySchema>;

export const createVolunteerSchema = z.object({
  displayName: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  zaloLink: z.string().max(500).optional(),
  bio: z.string().max(2000).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type CreateVolunteerInput = z.infer<typeof createVolunteerSchema>;

export const updateVolunteerSchema = createVolunteerSchema.partial();
export type UpdateVolunteerInput = z.infer<typeof updateVolunteerSchema>;

// Contact info schema
export const updateContactInfoSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
});
export type UpdateContactInfoInput = z.infer<typeof updateContactInfoSchema>;
