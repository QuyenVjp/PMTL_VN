import { z } from "zod";

export const healthStatusSchema = z.enum(["healthy", "degraded", "unhealthy"]);

export const healthCheckResultSchema = z.object({
  status: healthStatusSchema,
  checks: z.record(
    z.string(),
    z.object({
      status: healthStatusSchema,
      latencyMs: z.number().optional(),
      message: z.string().optional(),
    }),
  ),
  timestamp: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
export type HealthCheckResult = z.infer<typeof healthCheckResultSchema>;
