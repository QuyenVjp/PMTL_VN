/**
 * Auth utilities — admin session management
 *
 * Constitution: Session authority at apps/api.
 * Cookie-first auth — we check session validity by calling /auth/me.
 * If unauthorized, redirect to sign-in page.
 */
import { adminClient } from "@/lib/api/admin-client";
import { HttpError } from "@/lib/api/http-error";

export interface AdminUser {
  publicId: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
}

interface MeResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    role: string;
    avatarUrl?: string | null;
  };
}

let cachedUser: AdminUser | null = null;

/** Check current session by calling /auth/me. Returns user or null. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  if (cachedUser) return cachedUser;

  try {
    // API response sau envelope unwrap: { user: { id, email, role, ... } }
    const response = await adminClient.get<MeResponse>("/auth/me");
    const user = response.user;

    // Only admin roles allowed in admin panel
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return null;
    }

    cachedUser = {
      publicId: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
    return cachedUser;
  } catch (err) {
    if (err instanceof HttpError && err.isUnauthorized) {
      return null;
    }
    // Network error or other — treat as unauthenticated
    return null;
  }
}

/** Clear cached user (on logout) */
export function clearAuthCache() {
  cachedUser = null;
}

/** Logout — call API then clear cache */
export async function logout(): Promise<void> {
  try {
    await adminClient.post("/auth/logout");
  } catch {
    // Even if API call fails, clear local state
  }
  clearAuthCache();
}

/** Check if user has admin role */
export function isAdminRole(role: string): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
