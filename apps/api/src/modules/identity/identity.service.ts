import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import * as argon2 from "argon2";
import * as jose from "jose";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { ConfigService } from "../../common/config/config.service.js";
import { SessionsService } from "../../platform/sessions/sessions.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { canUserLogin } from "./identity.policy.js";
import { mapUserToAuthResponse } from "./identity.mapper.js";
import type { LoginInput, RegisterInput, UpdateProfileInput, ChangePasswordInput } from "./identity.schemas.js";
import type { JwtAccessPayload } from "../../common/auth/auth-request.types.js";
import type { UserRole } from "../../generated/prisma/client.js";

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly sessions: SessionsService,
    private readonly audit: AuditService,
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
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          displayName: input.displayName,
          avatarUrl: input.avatarUrl,
        },
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
      .sign(secret);
  }
}
