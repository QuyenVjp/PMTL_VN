import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { logoutWithCMS } from "@/features/auth/api/cms-auth-client";
import { clearAuthCookie, AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/features/auth/utils/auth-cookie";

export async function POST() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;

  if (token) {
    await logoutWithCMS(token).catch(() => null);
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);

  return response;
}
