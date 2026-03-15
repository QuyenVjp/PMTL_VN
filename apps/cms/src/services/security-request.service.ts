import type { NextRequest } from "next/server";

import { getOriginFromReferer, isAllowedOrigin } from "@/services/security-origin.service";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const TRUSTED_FETCH_SITES = new Set(["same-origin", "same-site", "none"]);

export function validateUnsafeRequest(request: NextRequest): { valid: boolean; reason?: string } {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return { valid: true };
  }

  const origin = request.headers.get("origin");
  if (origin) {
    if (!isAllowedOrigin(request, origin)) {
      return { valid: false, reason: "origin_not_allowed" };
    }
  } else {
    const refererOrigin = getOriginFromReferer(request.headers.get("referer"));
    if (refererOrigin && !isAllowedOrigin(request, refererOrigin)) {
      return { valid: false, reason: "referer_not_allowed" };
    }

    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && !TRUSTED_FETCH_SITES.has(fetchSite)) {
      return { valid: false, reason: "cross_site_request" };
    }
  }

  return { valid: true };
}
