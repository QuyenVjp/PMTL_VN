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

interface AuthResponseUser {
  id?: string;
  publicId?: string;
  email?: string;
  emailMasked?: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
}

interface MeResponse {
  user: AuthResponseUser;
}

let cachedUser: AdminUser | null = null;
let authProbeInFlight: Promise<AdminUser | null> | null = null;

const AUTH_PROBE_RETRY_DELAYS_MS = [300, 700, 1_200, 2_000, 3_000, 4_000] as const;
const AUTH_STALE_USER_KEY = "pmtl.admin.staleUser";
const AUTH_STALE_GRACE_MS = import.meta.env.DEV ? 5 * 60 * 1000 : 0;

interface StoredUserEnvelope {
  user: AdminUser;
  storedAt: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isTransientAuthProbeError(err: unknown): boolean {
  if (!(err instanceof HttpError)) {
    return true;
  }

  return (
    err.code === "NETWORK_ERROR" ||
    err.status === 408 ||
    err.status === 502 ||
    err.status === 503 ||
    err.status === 504
  );
}

function mapAuthResponseUser(user: AuthResponseUser): AdminUser | null {
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    clearStoredUser();
    return null;
  }

  const publicId = user.publicId ?? user.id;
  if (!publicId) {
    clearStoredUser();
    return null;
  }

  return {
    publicId,
    email: user.email ?? user.emailMasked ?? "",
    displayName: user.displayName,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

function mapMeResponse(response: MeResponse): AdminUser | null {
  return mapAuthResponseUser(response.user);
}

function isStoredEnvelope(value: unknown): value is StoredUserEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredUserEnvelope>;
  return Boolean(candidate.user) && typeof candidate.storedAt === "number";
}

function parseStoredUser(raw: string | null, maxAgeMs?: number): AdminUser | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AdminUser | StoredUserEnvelope;
    const envelope = isStoredEnvelope(parsed)
      ? parsed
      : { user: parsed, storedAt: 0 };
    if (!isAdminRole(envelope.user.role)) return null;
    if (maxAgeMs !== undefined) {
      if (!envelope.storedAt) return null;
      if (Date.now() - envelope.storedAt > maxAgeMs) return null;
    }
    return envelope.user;
  } catch {
    return null;
  }
}

function readStoredUser(maxAgeMs?: number): AdminUser | null {
  try {
    return (
      parseStoredUser(window.sessionStorage.getItem(AUTH_STALE_USER_KEY), maxAgeMs) ??
      parseStoredUser(window.localStorage.getItem(AUTH_STALE_USER_KEY), maxAgeMs)
    );
  } catch {
    return null;
  }
}

function storeUser(user: AdminUser | null) {
  try {
    if (user) {
      const envelope: StoredUserEnvelope = { user, storedAt: Date.now() };
      const serialized = JSON.stringify(envelope);
      window.sessionStorage.setItem(AUTH_STALE_USER_KEY, serialized);
      if (AUTH_STALE_GRACE_MS > 0) {
        window.localStorage.setItem(AUTH_STALE_USER_KEY, serialized);
      }
    } else {
      window.sessionStorage.removeItem(AUTH_STALE_USER_KEY);
      window.localStorage.removeItem(AUTH_STALE_USER_KEY);
    }
  } catch {
    // sessionStorage is best-effort only.
  }
}

function clearStoredUser() {
  storeUser(null);
}

/** Attempt silent token refresh using the refresh cookie. Returns true if successful. */
async function trySilentRefresh(): Promise<boolean> {
  try {
    await adminClient.post<MeResponse>("/auth/refresh");
    return true;
  } catch (err) {
    if (isTransientAuthProbeError(err)) {
      throw err;
    }
    return false;
  }
}

/** Check current session by calling /auth/me. Returns user or null. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  if (cachedUser) return cachedUser;

  authProbeInFlight ??= getCurrentUserWithRetry().finally(() => {
    authProbeInFlight = null;
  });

  return authProbeInFlight;
}

export async function validateCurrentUser(): Promise<AdminUser | null> {
  const previous = cachedUser;
  cachedUser = null;

  try {
    const user = await getCurrentUserWithRetry();
    if (user) return user;
  } finally {
    if (!cachedUser && previous) {
      cachedUser = previous;
    }
  }

  return null;
}

async function getCurrentUserWithRetry(): Promise<AdminUser | null> {
  for (let attempt = 0; attempt <= AUTH_PROBE_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await getCurrentUserLegacyFlow();
    } catch (err) {
      if (!isTransientAuthProbeError(err) || attempt === AUTH_PROBE_RETRY_DELAYS_MS.length) {
        if (isTransientAuthProbeError(err)) {
          const storedUser = cachedUser ?? readStoredUser(AUTH_STALE_GRACE_MS || undefined);
          if (storedUser) {
            cachedUser = storedUser;
            return storedUser;
          }
        }
        return null;
      }

      await sleep(AUTH_PROBE_RETRY_DELAYS_MS[attempt] ?? 0);
    }
  }

  return null;
}

async function getCurrentUserOnce(): Promise<AdminUser | null> {
  const response = await adminClient.get<MeResponse>("/auth/me");
  const user = mapMeResponse(response);
  cachedUser = user;
  storeUser(user);
  return user;
}

async function getCurrentUserAfterRefresh(): Promise<AdminUser | null> {
  const response = await adminClient.get<MeResponse>("/auth/me");
  const user = mapMeResponse(response);
  cachedUser = user;
  storeUser(user);
  return user;
}

/** Check current session once and use refresh only for true 401 responses. */
async function getCurrentUserLegacyFlow(): Promise<AdminUser | null> {
  if (cachedUser) return cachedUser;

  try {
    // API response sau envelope unwrap: { user: { id, email, role, ... } }
    return await getCurrentUserOnce();
  } catch (err) {
    if (err instanceof HttpError && err.isUnauthorized) {
      // Access token expired — attempt silent refresh before giving up
      const refreshed = await trySilentRefresh();
      if (!refreshed) {
        clearStoredUser();
        return null;
      }

      // Retry /auth/me with the new token
      try {
        return await getCurrentUserAfterRefresh();
      } catch (refreshErr) {
        if (isTransientAuthProbeError(refreshErr)) {
          throw refreshErr;
        }
        clearStoredUser();
        return null;
      }
    }

    throw err;
  }
}

/** Get cached user synchronously (populated by beforeLoad in route guard). */
export function getCachedUser(): AdminUser | null {
  return cachedUser;
}

/** Clear cached user (on logout) */
export function clearAuthCache() {
  cachedUser = null;
  clearStoredUser();
}

/** Prime auth cache after login/bootstrap before the protected route reloads. */
export function primeAuthCacheFromLogin(user: AuthResponseUser) {
  const mapped = mapAuthResponseUser(user);
  cachedUser = mapped;
  storeUser(mapped);
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
