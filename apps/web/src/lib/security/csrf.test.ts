import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/security/csrf-constants";

describe("csrf security", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CSRF_SECRET = "csrf-test-secret";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    delete process.env.SECURITY_ALLOWED_ORIGINS;
  });

  it("accepts matching CSRF tokens from an allowed origin", async () => {
    const { createCsrfToken, isCsrfRequestValid } = await import("./csrf");
    const token = createCsrfToken();

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: new Headers({
        origin: "http://localhost:3000",
        cookie: `${CSRF_COOKIE_NAME}=${token}`,
        [CSRF_HEADER_NAME]: token,
      }),
    });

    expect(isCsrfRequestValid(request)).toBe(true);
  });

  it("rejects state-changing requests that cannot prove request origin", async () => {
    const { createCsrfToken, isCsrfRequestValid } = await import("./csrf");
    const token = createCsrfToken();

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: new Headers({
        cookie: `${CSRF_COOKIE_NAME}=${token}`,
        [CSRF_HEADER_NAME]: token,
      }),
    });

    expect(isCsrfRequestValid(request)).toBe(false);
  });
});
