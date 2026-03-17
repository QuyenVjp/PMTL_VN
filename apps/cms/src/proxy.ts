import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const TRUSTED_FETCH_SITES = new Set(["same-origin", "same-site", "none"]);
const DEFAULT_ALLOWED_ORIGINS = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
]);

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function appendOrigins(target: Set<string>, rawValue: string | undefined) {
  if (!rawValue) {
    return;
  }

  for (const item of rawValue.split(",")) {
    const normalized = normalizeOrigin(item.trim());
    if (normalized) {
      target.add(normalized);
    }
  }
}

function getAllowedOrigins(request: NextRequest): Set<string> {
  const origins = new Set(DEFAULT_ALLOWED_ORIGINS);

  for (const candidate of [
    request.nextUrl.origin,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.PAYLOAD_PUBLIC_SERVER_URL,
    process.env.CMS_PUBLIC_URL,
  ]) {
    const normalized = normalizeOrigin(candidate);
    if (normalized) {
      origins.add(normalized);
    }
  }

  appendOrigins(origins, process.env.SECURITY_ALLOWED_ORIGINS);
  appendOrigins(origins, process.env.CORS_ALLOWED_ORIGINS);

  return origins;
}

function isAllowedOrigin(request: NextRequest, candidate: string | null | undefined): boolean {
  const normalized = normalizeOrigin(candidate);
  return normalized ? getAllowedOrigins(request).has(normalized) : false;
}

function getOriginFromReferer(referer: string | null): string | null {
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin.toLowerCase();
  } catch {
    return null;
  }
}

function isUnsafeRequestValid(request: NextRequest): { valid: boolean; reason?: string } {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return { valid: true };
  }

  const origin = request.headers.get("origin");
  if (origin) {
    return isAllowedOrigin(request, origin)
      ? { valid: true }
      : { valid: false, reason: "origin_not_allowed" };
  }

  const refererOrigin = getOriginFromReferer(request.headers.get("referer"));
  if (refererOrigin && !isAllowedOrigin(request, refererOrigin)) {
    return { valid: false, reason: "referer_not_allowed" };
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !TRUSTED_FETCH_SITES.has(fetchSite)) {
    return { valid: false, reason: "cross_site_request" };
  }

  return { valid: true };
}

function applyApiHeaders(request: NextRequest, response: NextResponse, requestId: string): NextResponse {
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Headers",
    ["Content-Type", "Authorization", "X-CSRF-Token", "X-Requested-With"].join(", "),
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].join(", "),
  );
  response.headers.set("Access-Control-Max-Age", "600");
  response.headers.append("Vary", "Origin");

  const origin = request.headers.get("origin");
  if (origin && isAllowedOrigin(request, origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  return response;
}

export function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  if (request.method === "OPTIONS") {
    if (!isAllowedOrigin(request, request.headers.get("origin"))) {
      return applyApiHeaders(
        request,
        NextResponse.json({ error: "CORS origin not allowed" }, { status: 403 }),
        requestId,
      );
    }

    return applyApiHeaders(request, new NextResponse(null, { status: 204 }), requestId);
  }

  if (!isUnsafeRequestValid(request).valid) {
    return applyApiHeaders(
      request,
      NextResponse.json({ error: "CSRF validation failed" }, { status: 403 }),
      requestId,
    );
  }

  if (!isAllowedOrigin(request, request.headers.get("origin")) && request.headers.get("origin")) {
    return applyApiHeaders(
      request,
      NextResponse.json({ error: "CORS origin not allowed" }, { status: 403 }),
      requestId,
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  return applyApiHeaders(
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
  matcher: ["/api/:path*"],
};
