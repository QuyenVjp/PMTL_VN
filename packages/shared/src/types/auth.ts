import type { UserRole } from "../enums/user-role";
import type { UserStatus } from "../enums/user-status";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  role: UserRole;
  status: UserStatus;
  avatarId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  token: string;
  exp: number | null;
  user: AuthUser;
};

export type AuthErrorCode =
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_FORBIDDEN"
  | "AUTH_UNAUTHENTICATED"
  | "AUTH_USER_INACTIVE"
  | "AUTH_TOKEN_REQUIRED"
  | "AUTH_RESET_TOKEN_INVALID"
  | "AUTH_EMAIL_IN_USE"
  | "AUTH_UNKNOWN";

export type AuthError = {
  code: AuthErrorCode;
  message: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ForgotPasswordInput = {
  email: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  fullName?: string;
  bio?: string;
  phone?: string | null;
  dharmaName?: string | null;
  avatar?: string | number | null;
};

