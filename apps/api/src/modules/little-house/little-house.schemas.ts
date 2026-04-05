import { z } from "zod";

export const lhQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
});
export type LhQuery = z.infer<typeof lhQuerySchema>;

export const createLhRecordSchema = z.object({
  beneficiaryName: z.string().min(2).max(200),
  vowText: z.string().max(2000).optional(),
});
export type CreateLhRecordInput = z.infer<typeof createLhRecordSchema>;

export const logRecitationSchema = z.object({
  recitationType: z.enum(["DA_BEI_ZHOU", "HEART_SUTRA", "REPENTANCE", "NAMO_AMITABHA", "CUSTOM"]),
  count: z.number().int().min(1),
  sessionDate: z.string().datetime(),
  chanterName: z.string().max(100).optional(),
});
export type LogRecitationInput = z.infer<typeof logRecitationSchema>;

export const dottingSessionSchema = z.object({
  operatorName: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});
export type DottingSessionInput = z.infer<typeof dottingSessionSchema>;

export const combustionLogSchema = z.object({
  burnedAt: z.string().datetime(),
  altitude: z.string().max(100).optional(),
  containerType: z.string().max(100).optional(),
  operatorName: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});
export type CombustionLogInput = z.infer<typeof combustionLogSchema>;

export const flagFraudSchema = z.object({
  reason: z.string().min(5).max(1000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
});
export type FlagFraudInput = z.infer<typeof flagFraudSchema>;

export const resolveFraudSchema = z.object({
  resolution: z.string().min(5).max(1000),
});
export type ResolveFraudInput = z.infer<typeof resolveFraudSchema>;

export const fraudQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  severity: z.string().optional(),
  resolved: z.coerce.boolean().optional(),
});
export type FraudQuery = z.infer<typeof fraudQuerySchema>;
