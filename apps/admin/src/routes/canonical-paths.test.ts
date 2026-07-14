/**
 * Plans 0.4 — canonical route parity snapshot.
 *
 * Extracts every `path: "..."` from routes/__root.tsx so accidental path
 * renames / drops surface as a snapshot failure before browser smoke (7.3).
 *
 * Does NOT import the route tree (avoids pulling every page module into unit tests).
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const rootSource = readFileSync(resolve(here, "__root.tsx"), "utf8");

function extractPaths(source: string): string[] {
  const paths = [...source.matchAll(/\bpath:\s*"([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p): p is string => typeof p === "string");
  // Stable order for snapshot diffs
  return [...new Set(paths)].sort((a, b) => a.localeCompare(b, "vi"));
}

describe("Admin canonical route parity", () => {
  const paths = extractPaths(rootSource);

  it("exports a non-empty path set from __root.tsx", () => {
    expect(paths.length).toBeGreaterThan(20);
  });

  it("includes core auth + workspace owners", () => {
    // Auth recovery + login
    expect(paths).toEqual(expect.arrayContaining([
      "/auth/dang-nhap",
      "/auth/quen-mat-khau",
      "/auth/dat-lai-mat-khau",
    ]));
    // Content / users / system owners that must not drift
    expect(paths).toEqual(expect.arrayContaining([
      "/dashboard",
      "/noi-dung/bai-viet",
      "/noi-dung/kinh-sach",
      "/noi-dung/tai-lieu",
      "/noi-dung/kinh-van-tu-tu",
      "/noi-dung/bach-thoai",
      "/nguoi-dung",
      "/he-thong/audit-logs",
    ]));
  });

  it("matches the frozen path snapshot", () => {
    // Full snapshot — update intentionally when routes are added/removed.
    expect(paths).toMatchSnapshot();
  });
});
