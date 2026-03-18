import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { updateProfileSchema } from "@pmtl/shared";

import { updateProfileWithCMS } from "@/features/auth/api/cms-auth-client";
import { invalidateAuthSessionCache } from "@/features/auth/api/session";
import { toAuthErrorResponse } from "@/features/auth/api/route-error-response";
import { AUTH_COOKIE_NAME } from "@/features/auth/utils/auth-cookie";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: "AUTH_UNAUTHENTICATED",
            message: "Bạn chưa đăng nhập.",
          },
        },
        {
          status: 401,
        },
      );
    }

    const body = updateProfileSchema.parse(await request.json());
    const result = await updateProfileWithCMS(token, body);
    await invalidateAuthSessionCache(token);

    return NextResponse.json(result);
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
