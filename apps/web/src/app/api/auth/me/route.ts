import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCurrentSessionFromCMS } from "@/features/auth/api/cms-auth-client";
import { clearAuthCookie, AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/features/auth/utils/auth-cookie";

export async function GET() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_UNAUTHENTICATED",
          message: "Ban chua dang nhap.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const session = await getCurrentSessionFromCMS(token);
    return NextResponse.json(session);
  } catch {
    const response = NextResponse.json(
      {
        error: {
          code: "AUTH_UNAUTHENTICATED",
          message: "Session khong con hop le.",
        },
      },
      { status: 401 },
    );

    clearAuthCookie(response);
    return response;
  }
}
