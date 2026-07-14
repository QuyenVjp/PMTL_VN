import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import * as argon2 from "argon2";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { SessionsService } from "../../platform/sessions/sessions.service.js";
import { NotFoundError, ForbiddenError, ConflictError } from "../../common/errors/app-error.js";
import type { UserRole, UserStatus } from "../../generated/prisma/client.js";
import type {
  AdminUserListQuery,
  AdminUserAuditQuery,
  AdminCreateUserInput,
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

    // Canary list shape (Phase 4.1): { items, pagination } rides inside transport `data`.
    // ResponseInterceptor is the sole transport envelope owner — do NOT wrap with { data, meta }.
    return {
      items: users.map((u) => this.mapUserToListItem(u)),
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < total,
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

    // Legacy SingleEnvelope shape until detail batch migrates service + Admin query + page together.
    // List canary is { items, pagination }; detail stays { data: item } so Admin
    // `envelope?.data` (user-detail-page) keeps working after one-layer client unwrap.
    // Do NOT return a raw item here — that is a hybrid-shape regression.
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

  async createUser(
    input: AdminCreateUserInput,
    actorRole: UserRole,
    auditCtx: AuditContext,
  ) {
    if (actorRole !== "SUPER_ADMIN") {
      throw new ForbiddenError("Chỉ Super Admin mới có thể tạo tài khoản phụng sự viên");
    }

    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictError("Email đã được sử dụng");
    }

    const passwordHash = await argon2.hash(input.password);
    const publicId = nanoid(21);

    const created = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          publicId,
          email,
          passwordHash,
          displayName: input.displayName,
          role: input.role,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        },
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
      });
      await this.audit.appendInTransaction(tx, auditCtx, "admin.user.create", "user", publicId, {
        role: input.role,
        email,
      });
      return user;
    });

    return { data: this.mapUserToListItem(created) };
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
      user.publicId,
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
      user.publicId,
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
      user.publicId,
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
      user.publicId,
      { action: "unblock", previousStatus: "SUSPENDED" },
    );

    return { data: updated };
  }

  async getAuditHistory(publicId: string, query: AdminUserAuditQuery) {
    const user = await this.findUserOrThrow(publicId);

    // New writes store actorId = user.publicId (decorator owner).
    // Legacy rows may still hold internal cuid — include both for continuity.
    const actorWhere = {
      OR: [{ actorId: user.publicId }, { actorId: user.id }],
    };

    const logs = await this.prisma.auditLog.findMany({
      where: actorWhere,
      orderBy: { createdAt: "desc" },
      skip: query.offset,
      take: query.limit,
      select: {
        publicId: true,
        action: true,
        resource: true,
        resourceId: true,
        correlationId: true,
        sequenceNumber: true,
        createdAt: true,
        metadata: true,
      },
    });

    const total = await this.prisma.auditLog.count({
      where: actorWhere,
    });

    return {
      data: logs.map((log) => ({
        publicId: log.publicId,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        correlationId: log.correlationId,
        sequenceNumber: log.sequenceNumber.toString(),
        createdAt: log.createdAt,
        metadata: log.metadata,
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

  async revokeAllUserSessions(publicId: string, auditCtx: AuditContext) {
    const user = await this.findUserOrThrow(publicId);

    await this.sessions.revokeAllUserSessions(user.id);

    await this.audit.append(
      auditCtx,
      "admin.user.status_change",
      "user",
      user.publicId,
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
