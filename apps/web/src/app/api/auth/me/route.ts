import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getOptionalAuthSession, invalidateAuthSessionCache } from "@/features/auth/api/session";
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
          message: "Bạn chưa đăng nhập.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const session = await getOptionalAuthSession();
    if (!session) {
      throw new Error("Session not found");
    }

    return NextResponse.json({ session });
  } catch {
    await invalidateAuthSessionCache(token);
    const response = NextResponse.json(
      {
        error: {
          code: "AUTH_UNAUTHENTICATED",
          message: "Session không còn hợp lệ.",
        },
      },
      { status: 401 },
    );

    clearAuthCookie(response);
    return response;
  }
}
