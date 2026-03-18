import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { WebAuthError } from "../utils/auth-error";

export function toAuthErrorResponse(error: unknown): NextResponse {
  if (error instanceof WebAuthError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      {
        status: error.statusCode,
      },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: "AUTH_UNKNOWN",
          message: "Dữ liệu gửi lên không lệ.",
        },
      },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "AUTH_UNKNOWN",
        message: "Yêu cầu xác thực thất bại.",
      },
    },
    {
      status: 500,
    },
  );
}

