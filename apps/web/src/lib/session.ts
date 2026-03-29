/**
 * Server-side session utilities for Next.js 16 App Router.
 * Used in Server Components / layouts to check member auth.
 * Forwards cookies from the incoming request to the API.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerApiBaseUrl } from "./api-base";

export interface SessionUser {
  id: string;
  publicId: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string | null;
}

interface MeResponse {
  user: SessionUser;
}

/**
 * Fetch the current session from the API using the request cookies.
 * Returns null if not authenticated (401/403).
 */
export async function getSession(): Promise<SessionUser | null> {
  const apiBase = getServerApiBaseUrl();
  if (!apiBase) return null;

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as MeResponse;
    return json.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Guard helper: redirects to /dang-nhap if not authenticated.
 * Use at the top of member layouts/pages.
 */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect("/dang-nhap");
  }
  return user;
}
