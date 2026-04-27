import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { CreateSessionInput } from "./sessions.schemas.js";

/**
 * Fields exposed on session records returned to callers.
 * Deliberately excludes `refreshToken` (sensitive secret).
 */
const SESSION_SELECT = {
  id: true,
  userId: true,
  userAgent: true,
  ipAddress: true,
  createdAt: true,
  expiresAt: true,
  revokedAt: true,
} as const;

/**
 * Mirrors AUTH_USER_SELECT in identity.service.ts.
 * Provides only the fields needed for token generation and auth responses.
 * Deliberately excludes `passwordHash`, `resetToken`, and all other sensitive columns.
 */
const SESSION_USER_SELECT = {
  id: true,
  publicId: true,
  email: true,
  displayName: true,
  role: true,
  avatarUrl: true,
  status: true,
  emailVerifiedAt: true,
} as const;

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSessionInput) {
    return this.prisma.session.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshToken,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    return this.prisma.session.findUnique({
      where: { refreshToken },
      select: {
        ...SESSION_SELECT,
        user: { select: SESSION_USER_SELECT },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.session.findUnique({
      where: { id },
      select: SESSION_SELECT,
    });
  }

  async findActiveByUserId(userId: string) {
    return this.prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: SESSION_SELECT,
    });
  }

  async revoke(id: string) {
    return this.prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string, exceptSessionId?: string) {
    return this.prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId && { id: { not: exceptSessionId } }),
      },
      data: { revokedAt: new Date() },
    });
  }

  async deleteExpired() {
    return this.prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  }
}
