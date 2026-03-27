import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { SessionsService } from "../../platform/sessions/sessions.service.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../../common/errors/app-error.js";
import type { UserRole, UserStatus } from "../../generated/prisma/client.js";
import type {
  AdminUserListQuery,
  AdminUserAuditQuery,
  AdminUpdateProfileInput,
  AdminChangeRoleInput,
} from "./admin-users.schemas.js";

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly sessions: SessionsService,
  ) {}

  async list(query: AdminUserListQuery) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.role) {
      where.role = query.role;
    }
    if (query.search) {
      where.OR = [
        { displayName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          publicId: true,
          email: true,
          displayName: true,
          avatarUrl: true,
          role: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => this.mapUserToListItem(u)),
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

  async getDetail(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
      select: {
        id: true,
        publicId: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { sessions: true, posts: true } },
      },
    });

    if (!user) {
      throw new NotFoundError("Người dùng", publicId);
    }

    return {
      data: {
        publicId: user.publicId,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        sessionCount: user._count.sessions,
        postCount: user._count.posts,
      },
    };
  }

  async updateProfile(
    publicId: string,
    input: AdminUpdateProfileInput,
    auditCtx: AuditContext,
  ) {
    const user = await this.findUserOrThrow(publicId);

    if (input.email && input.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (existing) {
        throw new ConflictError("Email đã được sử dụng");
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...(input.displayName && { displayName: input.displayName }),
        ...(input.email && { email: input.email.toLowerCase() }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
      select: {
        publicId: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await this.audit.append(
      auditCtx,
      "user.update",
      "user",
      user.id,
      { adminAction: "profile_edit", changes: input },
    );

    return { data: updated };
  }

  async changeRole(
    publicId: string,
    input: AdminChangeRoleInput,
    actorRole: UserRole,
    auditCtx: AuditContext,
  ) {
    const user = await this.findUserOrThrow(publicId);

    // Only SUPER_ADMIN can promote/demote to SUPER_ADMIN
    if (
      (input.role === "SUPER_ADMIN" || user.role === "SUPER_ADMIN") &&
      actorRole !== "SUPER_ADMIN"
    ) {
      throw new ForbiddenError("Chỉ Super Admin mới có thể thay đổi quyền Super Admin");
    }

    const previousRole = user.role;

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { role: input.role },
      select: {
        publicId: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await this.audit.append(
      auditCtx,
      "admin.user.role_change",
      "user",
      user.id,
      { previousRole, newRole: input.role },
    );

    return { data: updated };
  }

  async blockUser(
    publicId: string,
    reason: string | undefined,
    auditCtx: AuditContext,
  ) {
    const user = await this.findUserOrThrow(publicId);

    if (user.status === "SUSPENDED") {
      throw new ConflictError("Người dùng đã bị khóa");
    }

    if (user.role === "SUPER_ADMIN") {
      throw new ForbiddenError("Không thể khóa tài khoản Super Admin");
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { status: "SUSPENDED" as UserStatus },
      select: {
        publicId: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Revoke all sessions when blocking
    await this.sessions.revokeAllUserSessions(user.id);

    await this.audit.append(
      auditCtx,
      "admin.user.status_change",
      "user",
      user.id,
      { action: "block", reason, previousStatus: user.status },
    );

    return { data: updated };
  }

  async unblockUser(publicId: string, auditCtx: AuditContext) {
    const user = await this.findUserOrThrow(publicId);

    if (user.status !== "SUSPENDED") {
      throw new ConflictError("Người dùng không ở trạng thái khóa");
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { status: "ACTIVE" as UserStatus },
      select: {
        publicId: true,
        email: true,
        displayName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    await this.audit.append(
      auditCtx,
      "admin.user.status_change",
      "user",
      user.id,
      { action: "unblock", previousStatus: "SUSPENDED" },
    );

    return { data: updated };
  }

  async getAuditHistory(publicId: string, query: AdminUserAuditQuery) {
    const user = await this.findUserOrThrow(publicId);

    const logs = await this.prisma.auditLog.findMany({
      where: { actorId: user.id },
      orderBy: { createdAt: "desc" },
      skip: query.offset,
      take: query.limit,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        createdAt: true,
        metadata: true,
      },
    });

    const total = await this.prisma.auditLog.count({
      where: { actorId: user.id },
    });

    return {
      data: logs,
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

  async revokeAllUserSessions(publicId: string, auditCtx: AuditContext) {
    const user = await this.findUserOrThrow(publicId);

    await this.sessions.revokeAllUserSessions(user.id);

    await this.audit.append(
      auditCtx,
      "admin.user.status_change",
      "user",
      user.id,
      { action: "revoke_all_sessions" },
    );

    return { data: { success: true } };
  }

  async getPracticeStats(publicId: string) {
    // Stub — practice engagement tables not yet in schema
    await this.findUserOrThrow(publicId);

    return {
      data: {
        totalPracticeDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeAt: null,
      },
    };
  }

  // --- Private helpers ---

  private async findUserOrThrow(publicId: string) {
    const user = await this.prisma.user.findUnique({
      where: { publicId },
    });

    if (!user) {
      throw new NotFoundError("Người dùng", publicId);
    }

    return user;
  }

  private mapUserToListItem(user: {
    id: string;
    publicId: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    role: UserRole;
    status: UserStatus;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: user.publicId,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
