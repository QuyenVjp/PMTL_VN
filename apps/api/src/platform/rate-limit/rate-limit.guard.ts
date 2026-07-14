import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { createHash } from "node:crypto";
import { RateLimitService } from "./rate-limit.service.js";
import type { RateLimitEndpoint } from "./rate-limit.schemas.js";
import type { RequestWithUser } from "../../common/auth/auth-request.types.js";
import { ConfigService } from "../../common/config/config.service.js";

export const RATE_LIMIT_KEY = "rateLimit";

/**
 * Endpoints that must check BOTH per-IP and per-normalized-email buckets.
 * Email key is HMAC/sha256 of the salt + normalized email — never the raw email.
 */
const DUAL_BUCKET_ENDPOINTS = new Set<RateLimitEndpoint>([
  "auth.forgot_password",
]);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const endpoint = this.reflector.getAllAndOverride<RateLimitEndpoint>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!endpoint) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const keys = this.getKeys(request, endpoint);

    // One denied bucket blocks the request. Check all keys so both counters tick.
    let denied: { resetAt: Date } | null = null;
    for (const key of keys) {
      const result = await this.rateLimitService.checkLimit(key, endpoint);
      if (!result.allowed && !denied) {
        denied = { resetAt: result.resetAt };
      }
    }

    if (denied) {
      const retryAfter = Math.ceil((denied.resetAt.getTime() - Date.now()) / 1000);
      throw new HttpException(
        {
          code: "rate_limit.exceeded",
          message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Build rate-limit keys for this request.
   * - Authenticated → user:{id}
   * - Otherwise → ip:{ip}
   * - Dual-bucket endpoints also add email:{sha256(salt:normalizedEmail)}
   *
   * Keys never contain raw email / password / token.
   */
  getKeys(request: RequestWithUser, endpoint: RateLimitEndpoint): string[] {
    const keys: string[] = [];

    const userId = request.user?.id;
    if (userId) {
      keys.push(`user:${userId}`);
    } else {
      keys.push(`ip:${this.resolveIp(request)}`);
    }

    if (DUAL_BUCKET_ENDPOINTS.has(endpoint)) {
      const emailKey = this.emailBucketKey(request);
      if (emailKey) {
        keys.push(emailKey);
      }
    }

    return keys;
  }

  /** Exposed for tests — normalize + hash email without storing raw value. */
  hashEmailKey(email: string): string {
    const normalized = email.trim().toLowerCase();
    const digest = createHash("sha256")
      .update(`${this.config.auditIpSalt}:rate-limit-email:${normalized}`, "utf8")
      .digest("hex");
    return `email:${digest}`;
  }

  private emailBucketKey(request: RequestWithUser): string | null {
    const body = request.body as { email?: unknown } | undefined;
    const raw = body?.email;
    if (typeof raw !== "string" || raw.trim().length === 0) {
      return null;
    }
    return this.hashEmailKey(raw);
  }

  private resolveIp(request: RequestWithUser): string {
    const ip =
      this.getHeaderIp(request.headers["x-forwarded-for"]) ??
      this.getHeaderIp(request.headers["x-real-ip"]) ??
      request.ip ??
      request.socket.remoteAddress ??
      "unknown";
    return ip;
  }

  private getHeaderIp(value: string | string[] | undefined): string | undefined {
    const raw = Array.isArray(value) ? value[0] : value;
    const ip = raw?.split(",")[0]?.trim();
    return ip || undefined;
  }
}
