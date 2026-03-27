import type { Request } from "express";
import type { UserRole, UserStatus } from "../../generated/prisma/client.js";

export interface AuthenticatedUser {
  id: string;
  publicId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  sessionId: string;
}

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface JwtRefreshPayload {
  sub: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};
