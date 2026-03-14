import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@pmtl/shared";

import { resetPasswordWithCMS } from "@/features/auth/api/cms-auth-client";
import { toAuthErrorResponse } from "@/features/auth/api/route-error-response";
import { setAuthCookie } from "@/features/auth/utils/auth-cookie";

export async function POST(request: Request) {
  try {
    const body = resetPasswordSchema.parse(await request.json());
    const result = await resetPasswordWithCMS(body);
    const response = NextResponse.json(result);

    setAuthCookie(response, result.session.token);

    return response;
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
