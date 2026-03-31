import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as jose from "jose";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { ConfigService } from "../config/config.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AuthenticatedUser, JwtAccessPayload, RequestWithUser } from "./auth-request.types.js";

const ACCESS_TOKEN_COOKIE = "pmtl_access";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Chưa xác thực");
    }

    try {
      const secret = new TextEncoder().encode(this.configService.jwtAccessSecret);
      const { payload } = await jose.jwtVerify<JwtAccessPayload>(token, secret, {
        issuer: "pmtl-api",
        audience: "pmtl-web",
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          publicId: true,
          email: true,
          displayName: true,
          role: true,
          status: true,
        },
      });

      if (!user || user.status !== "ACTIVE") {
        throw new UnauthorizedException("Tài khoản không hợp lệ");
      }

      const session = await this.prisma.session.findFirst({
        where: {
          id: payload.sessionId,
          userId: user.id,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        throw new UnauthorizedException("Phiên đăng nhập không hợp lệ");
      }

      request.user = {
        ...user,
        sessionId: session.id,
      } satisfies AuthenticatedUser;

      return true;
    } catch (error) {
      if (error instanceof jose.errors.JWTExpired) {
        throw new UnauthorizedException("Token đã hết hạn");
      }
      if (error instanceof jose.errors.JWTClaimValidationFailed) {
        throw new UnauthorizedException("Token không hợp lệ");
      }
      if (error instanceof jose.errors.JWTInvalid) {
        throw new UnauthorizedException("Token không hợp lệ");
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Xác thực thất bại");
    }
  }

  private extractToken(request: RequestWithUser): string | undefined {
    // Cookie-first auth
    const cookieToken = this.extractCookieValue(request, ACCESS_TOKEN_COOKIE);
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to Authorization header for internal/API clients
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return undefined;
  }

  private extractCookieValue(request: RequestWithUser, key: string): string | undefined {
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const value = cookies?.[key];
    return typeof value === "string" ? value : undefined;
  }
}
