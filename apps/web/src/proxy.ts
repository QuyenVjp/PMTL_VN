import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { isShuttingDown } from "@/lib/runtime/shutdown";
import { CSRF_HEADER_NAME } from "@/lib/security/csrf-constants";
import { ensureCsrfCookie, isCsrfProtectedMethod, isCsrfRequestValid, readCsrfTokenFromRequest } from "@/lib/security/csrf";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { cloneHeadersWithCorrelationId, CORRELATION_ID_HEADER } from "@/lib/security/request-context";

function getAuthCookie(req: NextRequest) {
  return req.cookies.get("pmtl-session")?.value ?? req.cookies.get("auth_token")?.value;
}

function finalizeResponse(req: NextRequest, response: NextResponse): NextResponse {
  response.headers.set(CORRELATION_ID_HEADER, response.headers.get(CORRELATION_ID_HEADER) ?? req.headers.get(CORRELATION_ID_HEADER) ?? randomUUID());
  ensureCsrfCookie(response, readCsrfTokenFromRequest(req));
  return applySecurityHeaders(response);
}

function isApiRequest(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

function isExemptMutationPath(pathname: string): boolean {
  return pathname.startsWith("/api/health")
    || pathname.startsWith("/api/revalidate")
    || pathname.startsWith("/api/push/send")
    || pathname.startsWith("/api/internal/monitoring");
}

function requiresCsrf(pathname: string): boolean {
  return pathname.startsWith("/api/auth/")
    || pathname.startsWith("/api/guestbook/submit")
    || pathname.startsWith("/api/community-")
    || pathname.startsWith("/api/upload");
}

function getMaxBodySize(pathname: string): number | null {
  if (pathname.startsWith("/api/upload")) {
    return 10 * 1024 * 1024;
  }

  if (pathname.startsWith("/api/auth/")) {
    return 32 * 1024;
  }

  if (pathname.startsWith("/api/guestbook/submit") || pathname.startsWith("/api/community-")) {
    return 64 * 1024;
  }

  return null;
}

export async function proxy(req: NextRequest) {
  const correlationId = req.headers.get(CORRELATION_ID_HEADER) ?? randomUUID();
  const requestHeaders = cloneHeadersWithCorrelationId(req, correlationId);

  if (isShuttingDown()) {
    const response = NextResponse.json(
      {
        error: "Service is shutting down. Please retry shortly.",
      },
      { status: 503 },
    );
    response.headers.set(CORRELATION_ID_HEADER, correlationId);
    return finalizeResponse(req, response);
  }

  const idToken = req.nextUrl.searchParams.get("id_token");

  // OAuth callback fallback: if a reverse proxy strips the callback path, preserve the token hand-off.
  if (idToken && req.nextUrl.pathname !== "/auth/google/callback") {
    const callbackUrl = req.nextUrl.clone();
    callbackUrl.pathname = "/auth/google/callback";
    const response = NextResponse.redirect(callbackUrl);
    response.headers.set(CORRELATION_ID_HEADER, correlationId);
    return finalizeResponse(req, response);
  }

  const token = getAuthCookie(req);

  if (req.nextUrl.pathname.startsWith("/profile") && !token) {
    const redirectUrl = req.nextUrl.clone();
    const originalPath = req.nextUrl.pathname;
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("redirect", originalPath);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set(CORRELATION_ID_HEADER, correlationId);
    return finalizeResponse(req, response);
  }

  if (isApiRequest(req.nextUrl.pathname)) {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    const maxBodySize = getMaxBodySize(req.nextUrl.pathname);

    if (maxBodySize && Number.isFinite(contentLength) && contentLength > maxBodySize) {
      const response = NextResponse.json(
        {
          error: "Request body too large.",
        },
        { status: 413 },
      );
      response.headers.set(CORRELATION_ID_HEADER, correlationId);
      return finalizeResponse(req, response);
    }

    const rateLimitResult = await checkRateLimit(req);
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        {
          error: rateLimitResult.reason === "service-unavailable" ? "Rate limit service unavailable." : "Too many requests.",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: rateLimitResult.reason === "service-unavailable" ? 503 : 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(Math.ceil(rateLimitResult.resetAt / 1000)),
            "X-RateLimit-Store": rateLimitResult.store,
          },
        },
      );
      response.headers.set(CORRELATION_ID_HEADER, correlationId);
      return finalizeResponse(req, response);
    }

    if (
      requiresCsrf(req.nextUrl.pathname)
      && isCsrfProtectedMethod(req.method)
      && !isExemptMutationPath(req.nextUrl.pathname)
      && !isCsrfRequestValid(req)
    ) {
      const response = NextResponse.json(
        {
          error: "Invalid CSRF token.",
          header: CSRF_HEADER_NAME,
        },
        { status: 403 },
      );
      response.headers.set(CORRELATION_ID_HEADER, correlationId);
      return finalizeResponse(req, response);
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(CORRELATION_ID_HEADER, correlationId);
  return finalizeResponse(req, response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2)$).*)",
  ],
};
