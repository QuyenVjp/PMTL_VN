import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from "@nestjs/common";
import { randomBytes, createHash } from "node:crypto";
import { nanoid } from "nanoid";
import * as argon2 from "argon2";
import * as jose from "jose";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { ConfigService } from "../../common/config/config.service.js";
import { SessionsService } from "../../platform/sessions/sessions.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { TraceService } from "../../common/tracing/trace.service.js";
import { EmailService } from "../../platform/email/email.service.js";
import { canUserLogin } from "./identity.policy.js";
import { mapUserToAuthResponse } from "./identity.mapper.js";
import type { LoginInput, RegisterInput, UpdateProfileInput, ChangePasswordInput, ForgotPasswordInput, ResetPasswordInput } from "./identity.schemas.js";
import type { JwtAccessPayload } from "../../common/auth/auth-request.types.js";
import type { UserRole } from "../../generated/prisma/client.js";

/** Number of bytes for password-reset token (48 bytes = 96 hex chars). */
const RESET_TOKEN_BYTES = 48;
/** Password-reset token validity window. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class IdentityService {
  private readonly logger = new Logger(IdentityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly sessions: SessionsService,
    private readonly audit: AuditService,
    private readonly tracing: TraceService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Login — write-path with mandatory audit in same transaction.
   * Constitution Bug 2 fix: audit MUST be same DB transaction as canonical write.
   */
  async login(input: LoginInput, metadata: { userAgent?: string; ipAddress?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    // Anti-enumeration: same response for invalid email and password
    if (!user) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    const passwordValid = await argon2.verify(user.passwordHash, input.password);
    if (!passwordValid) {
      throw new UnauthorizedException("Email hoặc mật khẩu không đúng");
    }

    if (!canUserLogin(user.status)) {
      throw new UnauthorizedException("Tài khoản đã bị khóa");
    }

    // Create session
    const { session, refreshToken } = await this.sessions.createSession(
      user.id,
      this.config.refreshTokenTtlDays,
      metadata,
    );

    // Generate tokens
    const accessToken = await this.generateAccessToken(user, session.id);

    // Transaction: lastLogin update + audit append — Bug 2 fix
    const auditContext: AuditContext = { actorId: user.id, actorType: "user", ...metadata };
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      await this.audit.appendInTransaction(
        tx, auditContext, "auth.login", "session", session.id,
      );
    });

    this.logger.log({
      msg: "auth.login.success",
      userId: user.id,
      sessionId: session.id,
      ...this.tracing.getCurrentTraceContext(),
    });

    return {
      ...mapUserToAuthResponse(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register — write-path with mandatory audit in same transaction.
   * Constitution Bug 2 fix: user.create + audit MUST be atomic.
   */
  async register(input: RegisterInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException("Email đã được sử dụng");
    }

    const passwordHash = await argon2.hash(input.password);
    const publicId = nanoid(21);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          publicId,
          email: input.email.toLowerCase(),
          passwordHash,
          displayName: input.displayName,
          role: "MEMBER",
          status: "ACTIVE",
        },
      });
      await this.audit.appendInTransaction(
        tx,
        { actorId: created.id, actorType: "user" },
        "user.create",
        "user",
        created.publicId,
      );
      return created;
    });

    return mapUserToAuthResponse(user);
  }

  async refresh(refreshToken: string, metadata: { userAgent?: string; ipAddress?: string }) {
    const session = await this.sessions.validateRefreshToken(refreshToken);
    
    if (!session) {
      throw new UnauthorizedException("Phiên đăng nhập không hợp lệ");
    }

    const user = session.user;
    if (!canUserLogin(user.status)) {
      throw new UnauthorizedException("Tài khoản đã bị khóa");
    }

    // Rotate session
    const { session: newSession, refreshToken: newRefreshToken } = await this.sessions.rotateSession(
      session.id,
      user.id,
      this.config.refreshTokenTtlDays,
      metadata,
    );

    const accessToken = await this.generateAccessToken(user, newSession.id);

    await this.audit.append(
      { actorId: user.id, actorType: "user", ...metadata },
      "auth.refresh",
      "session",
      newSession.id,
    );

    return {
      ...mapUserToAuthResponse(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(sessionId: string, auditContext: AuditContext) {
    await this.sessions.revokeSession(sessionId);
    await this.audit.append(auditContext, "auth.logout", "session", sessionId);
    return { success: true };
  }

  async logoutAll(userId: string, currentSessionId: string, auditContext: AuditContext) {
    await this.sessions.revokeAllUserSessions(userId, currentSessionId);
    await this.audit.append(auditContext, "auth.logout_all", "user", userId);
    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("Người dùng không tồn tại");
    }

    return mapUserToAuthResponse(user);
  }

  /** Bug 2 fix: profile update + audit in same transaction */
  async updateProfile(userId: string, input: UpdateProfileInput, auditContext: AuditContext) {
    const user = await this.prisma.$transaction(async (tx) => {
      const profileData: Record<string, unknown> = {};
      if (input.displayName !== undefined) profileData.displayName = input.displayName;
      if (input.avatarUrl !== undefined) profileData.avatarUrl = input.avatarUrl;

      const updated = await tx.user.update({
        where: { id: userId },
        data: profileData,
      });
      await this.audit.appendInTransaction(
        tx, auditContext, "user.update", "user", updated.publicId, input as Record<string, unknown>,
      );
      return updated;
    });

    return mapUserToAuthResponse(user);
  }

  /** Bug 2 fix: password change + audit in same transaction */
  async changePassword(userId: string, input: ChangePasswordInput, auditContext: AuditContext) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("Người dùng không tồn tại");
    }

    const passwordValid = await argon2.verify(user.passwordHash, input.currentPassword);
    if (!passwordValid) {
      throw new BadRequestException("Mật khẩu hiện tại không đúng");
    }

    const newPasswordHash = await argon2.hash(input.newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
      await this.audit.appendInTransaction(
        tx, auditContext, "user.update", "user", user.publicId, { field: "password" },
      );
    });

    return { success: true };
  }

  // ─── Password Reset (public, anti-enumeration) ───────────────────────

  /**
   * Request password reset — always returns success regardless of whether
   * the email exists (anti-enumeration). Generates a random token, stores
   * its SHA-256 hash, and logs the plaintext token for dev use.
   */
  async requestPasswordReset(input: ForgotPasswordInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    // Anti-enumeration: return silently if user not found
    if (!user) {
      return { success: true };
    }

    const plainToken = randomBytes(RESET_TOKEN_BYTES).toString("hex");
    const tokenHash = createHash("sha256").update(plainToken).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.$transaction(async (tx) => {
      // Invalidate any previous unused tokens for this user
      await tx.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await this.audit.appendInTransaction(
        tx,
        { actorId: user.id, actorType: "user" },
        "auth.password_reset_request",
        "user",
        user.publicId,
      );
    });

    this.emailService.dispatchPasswordReset({
      email: user.email,
      token: plainToken,
    });

    if (this.config.emailProvider === "log") {
      this.logger.log({
        msg: "Password reset token generated (log provider)",
        userId: user.id,
        token: plainToken,
      });
    }

    return { success: true };
  }

  /**
   * Reset password using a valid token. SHA-256 hashes the incoming token
   * and looks up by exact match. Updates password, marks token used,
   * invalidates all sessions, and audit-logs the action.
   */
  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = createHash("sha256").update(input.token).digest("hex");

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException("Token không hợp lệ hoặc đã hết hạn");
    }

    const newPasswordHash = await argon2.hash(input.password);

    await this.prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      });

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      // Invalidate all user sessions (security: password was compromised)
      await tx.session.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await this.audit.appendInTransaction(
        tx,
        { actorId: resetToken.userId, actorType: "user" },
        "auth.password_reset_complete",
        "user",
        resetToken.userId,
        { field: "password" },
      );
    });

    return { success: true };
  }

  /**
   * PDPA right to erasure — Nghị định 13/2023/NĐ-CP Điều 16.
   * Soft-deletes the account: status → DELETED, email anonymised.
   * Hard delete is deferred 30 days to allow audit/dispute resolution.
   * All active sessions are revoked immediately.
   */
  async requestAccountDeletion(
    userId: string,
    metadata: { actorId: string; actorType: "user"; ipAddress?: string; userAgent?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Tài khoản không tồn tại");
    }

    const anonymisedEmail = `deleted_${user.publicId}@pmtl.deleted`;

    await this.prisma.$transaction(async (tx) => {
      // Soft-delete: anonymise PII and mark DELETED
      await tx.user.update({
        where: { id: userId },
        data: {
          status: "DELETED" as const,
          email: anonymisedEmail,
          displayName: "Tài khoản đã xóa",
          avatarUrl: null,
        },
      });

      // Revoke all active sessions immediately
      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await this.audit.appendInTransaction(tx, metadata, "user.delete", "user", userId);
    });

    return {
      success: true,
      message: "Yêu cầu xóa tài khoản đã được ghi nhận. Dữ liệu sẽ bị xóa vĩnh viễn sau 30 ngày.",
      scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * PDPA personal data export — Nghị định 13/2023/NĐ-CP.
   * Returns all personal data held for the authenticated user.
   * Excludes: passwordHash, internal audit logs, system fields.
   */
  async exportPersonalData(userId: string) {
    const [user, sessions, communityPosts, communityComments, vows, gongkeLogs, repentanceLogs, lifeReleaseJournals, notificationPrefs] =
      await Promise.all([
        this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            publicId: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            role: true,
            status: true,
            emailVerifiedAt: true,
            lastLoginAt: true,
            createdAt: true,
          },
        }),
        this.prisma.session.findMany({
          where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
          select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        this.prisma.communityPost.findMany({
          where: { authorId: userId },
          select: { publicId: true, content: true, isPinned: true, isHidden: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 200,
        }),
        this.prisma.communityComment.findMany({
          where: { authorId: userId },
          select: { content: true, isHidden: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 500,
        }),
        this.prisma.vow.findMany({
          where: { userId },
          select: { publicId: true, description: true, vowType: true, status: true, startDate: true, endDate: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 200,
        }),
        this.prisma.dailyGongkeLog.findMany({
          where: { userId },
          select: { date: true, coreCountsJson: true, note: true, createdAt: true },
          orderBy: { date: "desc" },
          take: 365,
        }),
        this.prisma.repentanceLog.findMany({
          where: { userId },
          select: { date: true, count: true, privateNote: true, createdAt: true },
          orderBy: { date: "desc" },
          take: 200,
        }),
        this.prisma.lifeReleaseJournal.findMany({
          where: { userId },
          select: { publicId: true, journalDate: true, animalType: true, quantity: true, location: true, note: true, createdAt: true },
          orderBy: { journalDate: "desc" },
          take: 200,
        }),
        this.prisma.notificationPreference.findUnique({
          where: { userId },
          select: { practiceReminders: true, eventReminders: true, communityUpdates: true, quietHoursStart: true, quietHoursEnd: true },
        }),
      ]);

    return {
      exportedAt: new Date().toISOString(),
      legalBasis: "Nghị định 13/2023/NĐ-CP — quyền truy cập và di chuyển dữ liệu cá nhân",
      profile: user,
      activeSessions: sessions,
      communityActivity: {
        posts: communityPosts,
        comments: communityComments,
      },
      practiceData: {
        vows,
        dailyGongke: gongkeLogs,
        repentanceLogs,
        lifeReleaseJournals,
      },
      notificationPreferences: notificationPrefs,
    };
  }

  private async generateAccessToken(user: { id: string; email: string; role: UserRole }, sessionId: string): Promise<string> {
    const secret = new TextEncoder().encode(this.config.jwtAccessSecret);
    const payload: Omit<JwtAccessPayload, "iat" | "exp"> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId,
    };

    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${this.config.accessTokenTtlMinutes}m`)
      .setIssuer("pmtl-api")
      .setAudience("pmtl-web")
      .sign(secret);
  }
}
