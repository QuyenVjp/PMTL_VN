"use client";

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/security/csrf";

export function getCsrfToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const csrfCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

  return csrfCookie ? decodeURIComponent(csrfCookie.split("=").slice(1).join("=")) : null;
}

export function withCsrfHeaders(headers?: HeadersInit): HeadersInit {
  const nextHeaders = new Headers(headers ?? {});
  const token = getCsrfToken();

  if (token) {
    nextHeaders.set(CSRF_HEADER_NAME, token);
  }

  return nextHeaders;
}
