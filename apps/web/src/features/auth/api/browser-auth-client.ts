"use client";

import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "@pmtl/shared";

import type {
  AuthSessionResponse,
  ForgotPasswordResponse,
  UpdateProfileResponse,
} from "../types";
import { readAuthError } from "../utils/auth-error";

async function requestWebAuth<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw await readAuthError(response);
  }

  return (await response.json()) as T;
}

export function registerViaWeb(input: RegisterInput): Promise<AuthSessionResponse> {
  return requestWebAuth<AuthSessionResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginViaWeb(input: LoginInput): Promise<AuthSessionResponse> {
  return requestWebAuth<AuthSessionResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutViaWeb(): Promise<{ success: boolean }> {
  return requestWebAuth<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export function forgotPasswordViaWeb(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
  return requestWebAuth<ForgotPasswordResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resetPasswordViaWeb(input: ResetPasswordInput): Promise<AuthSessionResponse> {
  return requestWebAuth<AuthSessionResponse>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchCurrentSessionViaWeb(): Promise<AuthSessionResponse> {
  return requestWebAuth<AuthSessionResponse>("/api/auth/me");
}

export function updateProfileViaWeb(
  input: UpdateProfileInput,
): Promise<UpdateProfileResponse> {
  return requestWebAuth<UpdateProfileResponse>("/api/auth/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

