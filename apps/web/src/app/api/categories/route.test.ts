import { beforeEach, describe, expect, it, vi } from "vitest";

const connection = vi.fn(() => Promise.resolve());
const getCategories = vi.fn();
const loggerError = vi.fn();

vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");

  return {
    ...actual,
    connection,
  };
});

vi.mock("@/lib/api/categories", () => ({
  getCategories,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerError,
  },
}));

describe("categories route", () => {
  beforeEach(() => {
    connection.mockClear();
    getCategories.mockReset();
    loggerError.mockClear();
  });

  it("returns normalized category data", async () => {
    getCategories.mockResolvedValueOnce([{ id: "cat-1", name: "Khai thị" }]);

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [{ id: "cat-1", name: "Khai thị" }],
    });
    expect(connection).toHaveBeenCalledTimes(1);
  });

  it("falls back to an empty list when category fetching fails", async () => {
    getCategories.mockRejectedValueOnce(new Error("cms offline"));

    const { GET } = await import("./route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: [],
      error: "Internal server error",
      message: "cms offline",
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
  });
});
