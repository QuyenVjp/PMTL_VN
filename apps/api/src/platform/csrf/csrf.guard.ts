import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator.js";
import type { RequestWithUser } from "../../common/auth/auth-request.types.js";

export const SKIP_CSRF_KEY = "skipCsrf";

/**
 * CSRF guard — double-submit cookie pattern.
 *
 * - Safe HTTP methods (GET, HEAD, OPTIONS) are always allowed.
 * - Public routes (no session yet) are skipped — AuthGuard will handle them.
 * - Authenticated mutation routes require X-CSRF-Token header === csrf_token cookie.
 *
 * The csrf_token cookie is non-httpOnly so JS can read and forward it.
 * Auth tokens remain httpOnly (browser-only, unreachable by JS).
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser & { cookies: Record<string, string> }>();

    // Safe methods — no CSRF check needed
    const method = request.method?.toUpperCase();
    if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

    // Public routes have no session yet — skip CSRF, let AuthGuard decide
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // @SkipCsrf() opt-out for specific handlers (e.g. internal webhooks)
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipCsrf) return true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookieToken: string | undefined = request.cookies?.["csrf_token"];

    // No cookie → session doesn't exist → AuthGuard will reject anyway
    if (!cookieToken) return true;

    const headerToken = request.headers["x-csrf-token"] as string | undefined;

    if (!headerToken || headerToken !== cookieToken) {
      throw new ForbiddenException({
        code: "security.csrf_failed",
        message: "Yêu cầu không hợp lệ (CSRF token không khớp)",
      });
    }

    return true;
  }
}
