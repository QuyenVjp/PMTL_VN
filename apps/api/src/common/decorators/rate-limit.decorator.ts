import { SetMetadata } from "@nestjs/common";
import { RATE_LIMIT_KEY } from "../../platform/rate-limit/rate-limit.guard.js";
import type { RateLimitEndpoint } from "../../platform/rate-limit/rate-limit.schemas.js";

/**
 * RateLimit decorator - applies rate limiting to a route
 *
 * Usage:
 * @RateLimit("auth.login")
 * @Post("login")
 * async login(...) { ... }
 *
 * Constitution: design/02-platform-baseline/security-runtime/SECURITY_POLICY.md
 * - Rate limiting MANDATORY for auth endpoints (especially /auth/refresh)
 * - Per SECURITY_POLICY.md line 106: refresh endpoint is critical attack vector
 */
export const RateLimit = (endpoint: RateLimitEndpoint) => SetMetadata(RATE_LIMIT_KEY, endpoint);
