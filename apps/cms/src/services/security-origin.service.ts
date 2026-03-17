import type { NextRequest } from "next/server";
import { getLogger, withError } from "@/services/logger.service";

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"];
const logger = getLogger("security:origin");

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch (error) {
    logger.debug(
      withError(
        {
          originCandidate: value,
        },
        error,
      ),
      "Ignored invalid origin value",
    );
    return null;
  }
}

function splitOrigins(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => normalizeOrigin(item.trim()))
    .filter((item): item is string => Boolean(item));
}

export function getAllowedOrigins(request: NextRequest): string[] {
  const origins = new Set<string>(DEFAULT_ALLOWED_ORIGINS);
  const requestOrigin = normalizeOrigin(request.nextUrl.origin);
  const siteOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const cmsOrigin = normalizeOrigin(process.env.CMS_PUBLIC_URL ?? process.env.PAYLOAD_PUBLIC_SERVER_URL);
  const securityOrigins = splitOrigins(process.env.SECURITY_ALLOWED_ORIGINS);
  const extraOrigins = splitOrigins(process.env.CORS_ALLOWED_ORIGINS);

  for (const origin of [requestOrigin, siteOrigin, cmsOrigin, ...securityOrigins, ...extraOrigins]) {
    if (origin) {
      origins.add(origin);
    }
  }

  return Array.from(origins);
}

export function isAllowedOrigin(request: NextRequest, candidate: string | null | undefined): boolean {
  const normalizedCandidate = normalizeOrigin(candidate);
  if (!normalizedCandidate) {
    return false;
  }

  return getAllowedOrigins(request).includes(normalizedCandidate);
}

export function getOriginFromReferer(referer: string | null): string | null {
  if (!referer) {
    return null;
  }

  return normalizeOrigin(referer);
}
