import { z } from "zod";

export const rateLimitEndpointSchema = z.enum([
  "auth.login",
  "auth.refresh",
  "auth.forgot_password",
  "auth.reset_password",
  "auth.verify_email",
  "search.query",
  "upload.media",
  "content.create",
  "content.update",
  "community.post",
  "community.comment",
  "moderation.report",
  "guestbook.entry",
  "global.api",
]);

export const rateLimitConfigSchema = z.object({
  endpoint: rateLimitEndpointSchema,
  windowSeconds: z.number().int().positive(),
  maxRequests: z.number().int().positive(),
});

export type RateLimitEndpoint = z.infer<typeof rateLimitEndpointSchema>;
export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;

// Phase 1 rate limit values from CODING_READINESS.md
export const RATE_LIMIT_CONFIGS: Record<RateLimitEndpoint, RateLimitConfig> = {
  "auth.login": { endpoint: "auth.login", windowSeconds: 900, maxRequests: 5 },
  "auth.refresh": { endpoint: "auth.refresh", windowSeconds: 60, maxRequests: 10 },
  "auth.forgot_password": { endpoint: "auth.forgot_password", windowSeconds: 3600, maxRequests: 3 },
  "auth.reset_password": { endpoint: "auth.reset_password", windowSeconds: 3600, maxRequests: 5 },
  "auth.verify_email": { endpoint: "auth.verify_email", windowSeconds: 3600, maxRequests: 5 },
  "search.query": { endpoint: "search.query", windowSeconds: 60, maxRequests: 30 },
  "upload.media": { endpoint: "upload.media", windowSeconds: 3600, maxRequests: 50 },
  "content.create": { endpoint: "content.create", windowSeconds: 3600, maxRequests: 20 },
  "content.update": { endpoint: "content.update", windowSeconds: 60, maxRequests: 30 },
  "community.post": { endpoint: "community.post", windowSeconds: 3600, maxRequests: 10 },
  "community.comment": { endpoint: "community.comment", windowSeconds: 300, maxRequests: 20 },
  "moderation.report": { endpoint: "moderation.report", windowSeconds: 3600, maxRequests: 10 },
  "guestbook.entry": { endpoint: "guestbook.entry", windowSeconds: 86400, maxRequests: 3 },
  "global.api": { endpoint: "global.api", windowSeconds: 60, maxRequests: 100 },
};
