import helmet from "helmet";
import type { NextRequest, NextResponse } from "next/server";

type HelmetDirectiveMap = Record<string, Iterable<string>>;

function serializeDirectives(directives: HelmetDirectiveMap): string {
  return Object.entries(directives)
    .map(([directive, values]) => {
      const normalizedValues = Array.from(values).filter(Boolean);
      return normalizedValues.length > 0 ? `${directive} ${normalizedValues.join(" ")}` : directive;
    })
    .join("; ");
}

function buildPageDirectives(request: NextRequest): HelmetDirectiveMap {
  const defaults = helmet.contentSecurityPolicy.getDefaultDirectives();

  return {
    ...defaults,
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(process.env.NODE_ENV !== "production" ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'", "https:"],
    "img-src": ["'self'", "data:", "https:", "blob:"],
    "font-src": ["'self'", "data:", "https:"],
    "connect-src": ["'self'", "https:", "wss:", "ws:", request.nextUrl.origin],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "script-src-attr": ["'none'"],
    ...(process.env.NODE_ENV === "production" ? { "upgrade-insecure-requests": [] } : {}),
  };
}

function buildApiDirectives(): HelmetDirectiveMap {
  return {
    "default-src": ["'none'"],
    "base-uri": ["'none'"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'none'"],
  };
}

export function applyHelmetHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const isApiRequest = request.nextUrl.pathname.startsWith("/api/");
  const directives = isApiRequest ? buildApiDirectives() : buildPageDirectives(request);

  response.headers.set("content-security-policy", serializeDirectives(directives));
  response.headers.set("cross-origin-opener-policy", isApiRequest ? "same-origin" : "same-origin-allow-popups");
  response.headers.set("cross-origin-resource-policy", isApiRequest ? "same-origin" : "same-site");
  response.headers.set("origin-agent-cluster", "?1");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-dns-prefetch-control", "off");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("x-frame-options", "SAMEORIGIN");

  if (process.env.NODE_ENV === "production") {
    response.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
  }

  return response;
}
