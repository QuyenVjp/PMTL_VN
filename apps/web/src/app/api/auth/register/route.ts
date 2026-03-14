import { NextResponse } from "next/server";
import { registerSchema } from "@pmtl/shared";

import { registerWithCMS } from "@/features/auth/api/cms-auth-client";
import { toAuthErrorResponse } from "@/features/auth/api/route-error-response";
import { setAuthCookie } from "@/features/auth/utils/auth-cookie";

export async function POST(request: Request) {
  try {
    const body = registerSchema.parse(await request.json());
    const result = await registerWithCMS(body);
    const response = NextResponse.json(result, {
      status: 201,
    });

    setAuthCookie(response, result.session.token);

    return response;
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
