import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { logoutWithCMS } from "@/features/auth/api/cms-auth-client";
import { toAuthErrorResponse } from "@/features/auth/api/route-error-response";
import { AUTH_COOKIE_NAME, clearAuthCookie } from "@/features/auth/utils/auth-cookie";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    await logoutWithCMS(token);

    const response = NextResponse.json({
      success: true,
    });

    clearAuthCookie(response);

    return response;
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
