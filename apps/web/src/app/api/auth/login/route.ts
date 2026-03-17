import { NextResponse } from "next/server";
import { loginSchema } from "@pmtl/shared";

import { loginWithCMS } from "@/features/auth/api/cms-auth-client";
import { invalidateAuthSessionCache } from "@/features/auth/api/session";
import { toAuthErrorResponse } from "@/features/auth/api/route-error-response";
import { setAuthCookie } from "@/features/auth/utils/auth-cookie";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());
    const result = await loginWithCMS(body);
    await invalidateAuthSessionCache(result.session.token);
    const response = NextResponse.json({
      ...result,
      user: result.session.user,
    });

    setAuthCookie(response, result.session.token);

    return response;
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
