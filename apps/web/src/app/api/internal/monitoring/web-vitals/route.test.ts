import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loggerInfo = vi.fn();
const loggerWarn = vi.fn();

vi.mock("@/lib/logger", () => ({
  logger: {
    info: loggerInfo,
    warn: loggerWarn,
  },
}));

describe("web vitals monitoring route", () => {
  beforeEach(() => {
    loggerInfo.mockClear();
    loggerWarn.mockClear();
  });

  it("accepts valid web vital payloads", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/monitoring/web-vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "metric-1",
          name: "LCP",
          value: 1234,
          delta: 1234,
          rating: "good",
          navigationType: "navigate",
          pathname: "/",
          href: "http://localhost:3000/",
          userAgent: "vitest",
          timestamp: Date.now(),
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(loggerInfo).toHaveBeenCalledTimes(1);
    expect(loggerWarn).not.toHaveBeenCalled();
  });

  it("rejects malformed web vital payloads", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new NextRequest("http://localhost:3000/api/internal/monitoring/web-vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "",
          name: "LCP",
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false });
    expect(loggerWarn).toHaveBeenCalledTimes(1);
  });
});
