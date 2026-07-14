/**
 * Password recovery mutations — wired to public API auth endpoints.
 *
 * Anti-enumeration: forgot-password always resolves 200 regardless of whether
 * the email exists, so the UI must show the same success copy either way.
 */
import { useMutation } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";
import type { ForgotPasswordFormInput, ResetPasswordApiInput } from "./schemas";

interface OkResponse {
  success: boolean;
}

/** POST /auth/forgot-password — request a reset link. */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (input: ForgotPasswordFormInput) =>
      adminClient.post<OkResponse>("/auth/forgot-password", {
        email: input.email.trim().toLowerCase(),
      }),
  });
}

/** POST /auth/reset-password — set a new password using a token. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordApiInput) =>
      adminClient.post<OkResponse>("/auth/reset-password", input),
  });
}
