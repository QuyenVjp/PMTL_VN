import type {
  AuthError,
  AuthSession,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@pmtl/shared";

export type {
  AuthError,
  AuthSession,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
};

export type AuthSessionResponse = {
  session: AuthSession;
};

export type ForgotPasswordResponse = {
  message: string;
  resetToken?: string;
  resetUrl?: string;
};

export type UpdateProfileResponse = {
  user: AuthUser;
};

export type AuthApiErrorResponse = {
  error: AuthError;
};

