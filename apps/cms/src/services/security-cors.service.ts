import type { NextRequest } from "next/server";

import { isAllowedOrigin } from "@/services/security-origin.service";

const ALLOWED_HEADERS = ["Content-Type", "Authorization", "X-CSRF-Token", "X-Requested-With"];
const ALLOWED_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export function getCorsHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");

  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS.join(", "));
  headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS.join(", "));
  headers.set("Access-Control-Max-Age", "600");
  headers.append("Vary", "Origin");

  if (origin && isAllowedOrigin(request, origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  return headers;
}

export function isCorsOriginAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  return isAllowedOrigin(request, origin);
}
