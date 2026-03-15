import type { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "pmtl-session";
export const LEGACY_AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function buildCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  };
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, buildCookieOptions());
  response.cookies.set(LEGACY_AUTH_COOKIE_NAME, token, buildCookieOptions());
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...buildCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(LEGACY_AUTH_COOKIE_NAME, "", {
    ...buildCookieOptions(),
    maxAge: 0,
  });
}

