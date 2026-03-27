import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../audit/audit.service.js";
import { NotFoundError } from "../../common/errors/app-error.js";
import type { AdminSessionListQuery } from "./admin-sessions.schemas.js";

@Injectable()
export class AdminSessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: AdminSessionListQuery) {
    const now = new Date();
    const where: Record<string, unknown> = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status === "active") {
      where.revokedAt = null;
      where.expiresAt = { gt: now };
    } else if (query.status === "revoked") {
      where.revokedAt = { not: null };
    } else if (query.status === "expired") {
      where.revokedAt = null;
      where.expiresAt = { lte: now };
    }

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        select: {
          id: true,
          userId: true,
          userAgent: true,
          ipAddress: true,
          expiresAt: true,
          revokedAt: true,
          createdAt: true,
          user: {
            select: {
              publicId: true,
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.session.count({ where }),
    ]);

    return {
      data: sessions.map((s) => ({
        sessionId: s.id,
        userPublicId: s.user.publicId,
        userDisplayName: s.user.displayName,
        userEmail: s.user.email,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        expiresAt: s.expiresAt,
        revokedAt: s.revokedAt,
        createdAt: s.createdAt,
        status: s.revokedAt
          ? "revoked"
          : s.expiresAt < now
            ? "expired"
            : "active",
      })),
      meta: {
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    };
  }

  async getDetail(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        userAgent: true,
        ipAddress: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
        user: {
          select: {
            publicId: true,
            displayName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError("Phiên đăng nhập", sessionId);
    }

    const now = new Date();

    return {
      data: {
        sessionId: session.id,
        userPublicId: session.user.publicId,
        userDisplayName: session.user.displayName,
        userEmail: session.user.email,
        userRole: session.user.role,
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
        createdAt: session.createdAt,
        status: session.revokedAt
          ? "revoked"
          : session.expiresAt < now
            ? "expired"
            : "active",
      },
    };
  }

  async revokeSession(sessionId: string, auditCtx: AuditContext) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundError("Phiên đăng nhập", sessionId);
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    await this.audit.append(
      auditCtx,
      "auth.logout",
      "session",
      sessionId,
      { adminAction: "revoke_session" },
    );

    return { data: { success: true } };
  }

  async revokeBulk(sessionIds: string[], auditCtx: AuditContext) {
    await this.prisma.session.updateMany({
      where: {
        id: { in: sessionIds },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    await this.audit.append(
      auditCtx,
      "auth.logout",
      "session",
      undefined,
      { adminAction: "revoke_bulk", count: sessionIds.length },
    );

    return { data: { success: true, revokedCount: sessionIds.length } };
  }
}
