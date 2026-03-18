import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captureWebServerException = vi.fn(() => "evt_web_test");
const flushWebServerSentry = vi.fn(() => Promise.resolve(true));
const loggerError = vi.fn();

vi.mock("@/lib/observability/server-sentry", () => ({
  captureWebServerException,
  flushWebServerSentry,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerError,
  },
}));

describe("web monitoring sentry test route", () => {
  beforeEach(() => {
    process.env.MONITORING_TEST_SECRET = "monitoring-secret";
    captureWebServerException.mockClear();
    flushWebServerSentry.mockClear();
    loggerError.mockClear();
  });

  it("rejects unauthorized monitoring drills", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/monitoring/sentry-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "PMTL unauthorized drill",
        }),
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized monitoring test request.",
    });
  });

  it("captures a sentry event for authorized monitoring drills", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/monitoring/sentry-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-monitoring-test-secret": "monitoring-secret",
        },
        body: JSON.stringify({
          message: "PMTL web monitoring drill",
        }),
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      eventId: "evt_web_test",
      message: "PMTL web monitoring drill",
    });
    expect(captureWebServerException).toHaveBeenCalledTimes(1);
    expect(flushWebServerSentry).toHaveBeenCalledWith(2000);
    expect(loggerError).toHaveBeenCalledTimes(1);
  });
});
