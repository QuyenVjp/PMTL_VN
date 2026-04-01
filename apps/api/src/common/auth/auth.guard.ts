/**
 * AuthGuard — global authentication guard (APP_GUARD #1).
 *
 * Extends @nestjs/passport AuthGuard('jwt') which delegates JWT verification
 * and session validation to JwtStrategy.validate().
 * Preserves @Public() decorator bypass for public endpoints.
 */
import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard as PassportAuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import type { Observable } from "rxjs";

@Injectable()
export class AuthGuard extends PassportAuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<T>(err: Error | null, user: T | false): T {
    if (err || !user) {
      throw err instanceof UnauthorizedException
        ? err
        : new UnauthorizedException(err?.message ?? "Chưa xác thực");
    }
    return user;
  }
}
