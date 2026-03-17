import "server-only";

import { headers } from "next/headers";

import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@pmtl/shared";

import { buildCMSUrl } from "@/lib/cms/client";
import { CORRELATION_ID_HEADER } from "@/lib/security/request-context";

import type {
  AuthSessionResponse,
  ForgotPasswordResponse,
  UpdateProfileResponse,
} from "../types";
import { WebAuthError, readAuthError } from "../utils/auth-error";

function buildAuthHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function cmsAuthRequest<T>(
  path: string,
  init?: RequestInit & {
    token?: string;
  },
): Promise<T> {
  const requestHeaders = await headers();
  const correlationId = requestHeaders.get(CORRELATION_ID_HEADER);
  const response = await fetch(buildCMSUrl(path), {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(init?.token),
      ...(correlationId ? { [CORRELATION_ID_HEADER]: correlationId } : {}),
      ...(init?.headers ?? {}),
    },
    ...(init?.body !== undefined ? { body: init.body } : {}),
    cache: "no-store",
  });

  if (!response.ok) {
    throw await readAuthError(response);
  }

  return (await response.json()) as T;
}

export async function registerWithCMS(input: RegisterInput): Promise<AuthSessionResponse> {
  return cmsAuthRequest<AuthSessionResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginWithCMS(input: LoginInput): Promise<AuthSessionResponse> {
  return cmsAuthRequest<AuthSessionResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutWithCMS(token?: string): Promise<{ success: boolean }> {
  return cmsAuthRequest<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
    ...(token ? { token } : {}),
  });
}

export async function forgotPasswordWithCMS(
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResponse> {
  return cmsAuthRequest<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPasswordWithCMS(input: ResetPasswordInput): Promise<AuthSessionResponse> {
  return cmsAuthRequest<AuthSessionResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentSessionFromCMS(token: string): Promise<AuthSessionResponse> {
  if (!token) {
    throw new WebAuthError("AUTH_TOKEN_REQUIRED", "Token session bi thieu.", 401);
  }

  return cmsAuthRequest<AuthSessionResponse>("/api/auth/me", {
    token,
  });
}

export async function updateProfileWithCMS(
  token: string,
  input: UpdateProfileInput,
): Promise<UpdateProfileResponse> {
  return cmsAuthRequest<UpdateProfileResponse>("/api/auth/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(input),
  });
}
