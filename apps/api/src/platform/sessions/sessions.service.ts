import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { SessionsRepository } from "./sessions.repository.js";
import type { CreateSessionInput } from "./sessions.schemas.js";

@Injectable()
export class SessionsService {
  constructor(private readonly repository: SessionsRepository) {}

  async createSession(
    userId: string,
    expiresInDays: number,
    metadata?: { userAgent?: string; ipAddress?: string },
  ) {
    const refreshToken = nanoid(64);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const input: CreateSessionInput = {
      userId,
      refreshToken,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      expiresAt,
    };

    const session = await this.repository.create(input);
    return { session, refreshToken };
  }

  async validateRefreshToken(refreshToken: string) {
    const session = await this.repository.findByRefreshToken(refreshToken);
    
    if (!session) {
      return null;
    }

    if (session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    return session;
  }

  async rotateSession(
    oldSessionId: string,
    userId: string,
    expiresInDays: number,
    metadata?: { userAgent?: string; ipAddress?: string },
  ) {
    // Revoke old session
    await this.repository.revoke(oldSessionId);
    
    // Create new session
    return this.createSession(userId, expiresInDays, metadata);
  }

  async revokeSession(sessionId: string) {
    return this.repository.revoke(sessionId);
  }

  async revokeAllUserSessions(userId: string, exceptSessionId?: string) {
    return this.repository.revokeAllForUser(userId, exceptSessionId);
  }

  async getActiveSessions(userId: string) {
    return this.repository.findActiveByUserId(userId);
  }

  async cleanupExpiredSessions() {
    return this.repository.deleteExpired();
  }
}
