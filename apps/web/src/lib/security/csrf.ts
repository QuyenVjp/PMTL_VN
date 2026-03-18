import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { NextRequest, NextResponse } from "next/server";

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/security/csrf-constants";
import { isAllowedOrigin } from "@/lib/security/origin";
const CSRF_MAX_AGE_SECONDS = 60 * 60 * 8;

function getCsrfSecret(): string {
  return process.env.CSRF_SECRET ?? process.env.PAYLOAD_SECRET ?? "replace-me";
}

function sign(payload: string): string {
  return createHmac("sha256", getCsrfSecret()).update(payload).digest("base64url");
}

function buildToken(timestampMs = Date.now()): string {
  const nonce = randomBytes(24).toString("base64url");
  const payload = `${timestampMs}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function isCsrfProtectedMethod(method: string): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
}

export function createCsrfToken(): string {
  return buildToken();
}

export function verifyCsrfToken(token: string | null | undefined): boolean {
  if (!token) {
    return false;
  }

  const [timestamp, nonce, signature] = token.split(".");
  if (!timestamp || !nonce || !signature) {
    return false;
  }

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > CSRF_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expectedSignature = sign(`${timestamp}.${nonce}`);

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export function readCsrfTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(CSRF_COOKIE_NAME)?.value ?? null;
}

export function ensureCsrfCookie(response: NextResponse, currentToken?: string | null): string {
  const token = currentToken && verifyCsrfToken(currentToken) ? currentToken : createCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    maxAge: CSRF_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return token;
}

function getOriginFromReferer(referer: string | null): string | null {
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function isCsrfRequestValid(request: NextRequest): boolean {
  const cookieToken = readCsrfTokenFromRequest(request);
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!verifyCsrfToken(cookieToken) || !verifyCsrfToken(headerToken)) {
    return false;
  }

  if (cookieToken !== headerToken) {
    return false;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  if (origin) {
    return isAllowedOrigin(origin);
  }

  const refererOrigin = getOriginFromReferer(referer);
  if (refererOrigin) {
    return isAllowedOrigin(refererOrigin);
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) {
    return ["same-origin", "same-site", "none"].includes(fetchSite);
  }

  return false;
}
