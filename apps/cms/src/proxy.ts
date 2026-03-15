import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getCorsHeaders, isCorsOriginAllowed } from "@/services/security-cors.service";
import { applyHelmetHeaders } from "@/services/security-headers.service";
import { validateUnsafeRequest } from "@/services/security-request.service";
import { checkRateLimit } from "@/services/rate-limit.service";

function applySecurityHeaders(request: NextRequest, response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  applyHelmetHeaders(request, response);

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const corsHeaders = getCorsHeaders(request);
    corsHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

async function rateLimitedResponse(request: NextRequest, requestId: string) {
  const rateLimit = await checkRateLimit(request);
  if (rateLimit.allowed) {
    return null;
  }

  const response = NextResponse.json(
    {
      error: "Too many requests",
      message: "Bạn đang gửi quá nhiều yêu cầu tới CMS. Vui lòng thử lại sau.",
    },
    { status: 429 },
  );

  response.headers.set("retry-after", String(rateLimit.retryAfter));
  response.headers.set("x-ratelimit-limit", String(rateLimit.limit));
  response.headers.set("x-ratelimit-remaining", String(rateLimit.remaining));
  response.headers.set("x-ratelimit-reset", String(Math.floor(rateLimit.resetAt / 1000)));
  response.headers.set("x-ratelimit-store", rateLimit.store);

  return applySecurityHeaders(request, response, requestId);
}

export async function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const isApiRequest = request.nextUrl.pathname.startsWith("/api/");

  if (isApiRequest && request.method === "OPTIONS") {
    if (!isCorsOriginAllowed(request)) {
      return applySecurityHeaders(
        request,
        NextResponse.json({ error: "CORS origin not allowed" }, { status: 403 }),
        requestId,
      );
    }

    return applySecurityHeaders(request, new NextResponse(null, { status: 204 }), requestId);
  }

  if (isApiRequest && !isCorsOriginAllowed(request)) {
    return applySecurityHeaders(
      request,
      NextResponse.json({ error: "CORS origin not allowed" }, { status: 403 }),
      requestId,
    );
  }

  if (isApiRequest) {
    const limited = await rateLimitedResponse(request, requestId);
    if (limited) {
      return limited;
    }
  }

  const unsafeRequestValidation = validateUnsafeRequest(request);
  if (!unsafeRequestValidation.valid) {
    if (isApiRequest) {
      return applySecurityHeaders(
        request,
        NextResponse.json(
          {
            error: "CSRF validation failed",
            reason: unsafeRequestValidation.reason,
          },
          { status: 403 },
        ),
        requestId,
      );
    }

    return applySecurityHeaders(request, new NextResponse("Forbidden", { status: 403 }), requestId);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  return applySecurityHeaders(
    request,
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    requestId,
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
