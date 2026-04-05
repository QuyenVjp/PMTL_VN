import { z } from "zod";

export const lifeReleaseQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  recordType: z.string().optional(),
  userId: z.string().optional(),
});
export type LifeReleaseQuery = z.infer<typeof lifeReleaseQuerySchema>;

const animalEntrySchema = z.object({
  species: z.enum(["TURTLE", "FISH", "BIRD", "INSECT", "FROG", "CRAB", "OTHER"]),
  quantity: z.number().int().min(1),
  sourceLocation: z.string().max(300).optional(),
  isPredatory: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export const createLifeReleaseSchema = z.object({
  recordType: z.enum(["INDIVIDUAL", "GROUP", "PROXY"]),
  releaseDate: z.string().datetime(),
  locationName: z.string().max(200).optional(),
  locationCoords: z.string().max(100).optional(),
  merit: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  animals: z.array(animalEntrySchema).min(1),
});
export type CreateLifeReleaseInput = z.infer<typeof createLifeReleaseSchema>;

export const updateLifeReleaseStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  notes: z.string().max(500).optional(),
});
export type UpdateLifeReleaseStatusInput = z.infer<typeof updateLifeReleaseStatusSchema>;

export const proxyReleaseSchema = z.object({
  beneficiary: z.string().min(2).max(200),
  merit: z.string().max(500).optional(),
});
export type ProxyReleaseInput = z.infer<typeof proxyReleaseSchema>;
