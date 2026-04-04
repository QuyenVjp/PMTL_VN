/**
 * JwtStrategy — passport-jwt strategy for @nestjs/passport.
 *
 * Extracts JWT from httpOnly cookie `pmtl_access`.
 * Validates signature, checks DB user + session (blacklist-safe).
 * Returns AuthenticatedUser which passport sets as req.user.
 */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import type { Request } from "express";
import { ConfigService } from "../../config/config.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import type { AuthenticatedUser, JwtAccessPayload } from "../auth-request.types.js";

const ACCESS_TOKEN_COOKIE = "pmtl_access";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const accessSecret =
      process.env["JWT_ACCESS_SECRET"] ??
      config?.jwtAccessSecret;

    if (!accessSecret) {
      throw new Error("JWT_ACCESS_SECRET is required for JwtStrategy");
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // Primary: httpOnly cookie
          const cookie = req.cookies as Record<string, string> | undefined;
          if (cookie?.[ACCESS_TOKEN_COOKIE]) return cookie[ACCESS_TOKEN_COOKIE];
          // Fallback: Authorization Bearer header
          const authHeader = req.headers.authorization;
          if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: accessSecret,
      issuer: "pmtl-api",
      audience: "pmtl-web",
    });
  }

  async validate(payload: JwtAccessPayload): Promise<AuthenticatedUser> {
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

    // Session blacklist check — revokedAt means token was revoked
    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sessionId,
        userId: user.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedException("Phiên đã hết hạn hoặc bị thu hồi");
    }

    return {
      id: user.id,
      publicId: user.publicId,
      email: user.email,
      displayName: user.displayName ?? "",
      role: user.role,
      status: user.status,
      sessionId: payload.sessionId,
    };
  }
}
