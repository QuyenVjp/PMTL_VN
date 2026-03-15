import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@pmtl/shared";

import { forgotPasswordWithCMS } from "@/features/auth/api/cms-auth-client";
import { toAuthErrorResponse } from "@/features/auth/api/route-error-response";

export async function POST(request: Request) {
  try {
    const body = forgotPasswordSchema.parse(await request.json());
    const result = await forgotPasswordWithCMS(body);

    return NextResponse.json(result);
  } catch (error) {
    return toAuthErrorResponse(error);
  }
}
