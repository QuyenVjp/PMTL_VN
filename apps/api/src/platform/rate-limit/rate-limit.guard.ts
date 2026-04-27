import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RateLimitService } from "./rate-limit.service.js";
import type { RateLimitEndpoint } from "./rate-limit.schemas.js";
import type { RequestWithUser } from "../../common/auth/auth-request.types.js";

export const RATE_LIMIT_KEY = "rateLimit";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rateLimitService: RateLimitService,
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
    const key = this.getKey(request);

    const result = await this.rateLimitService.checkLimit(key, endpoint);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
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

  private getKey(request: RequestWithUser): string {
    // Use user ID if authenticated, otherwise IP
    const userId = request.user?.id;
    if (userId) {
      return `user:${userId}`;
    }

    const ip = request.ip || request.headers["x-forwarded-for"] || "unknown";
    return `ip:${Array.isArray(ip) ? ip[0] : ip}`;
  }
}
