import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthSession, AuthUser } from "@pmtl/shared";

import { AUTH_COOKIE_NAME } from "../utils/auth-cookie";
import { getCurrentSessionFromCMS } from "./cms-auth-client";

export async function getOptionalAuthSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await getCurrentSessionFromCMS(token);

    return response.session;
  } catch {
    return null;
  }
}

export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getOptionalAuthSession();

  if (!session) {
    redirect("/login?redirect=/profile");
  }

  return session;
}

export function hasAnyRole(user: AuthUser, roles: AuthUser["role"][]): boolean {
  return roles.includes(user.role);
}
