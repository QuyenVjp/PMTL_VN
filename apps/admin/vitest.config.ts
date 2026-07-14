import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Unit/component test config for apps/admin.
 * Separate from Storybook browser tests in root vitest.workspace.ts.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    name: "admin-unit",
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    // Per-file env overrides (// @vitest-environment jsdom) still work.
    testTimeout: 15_000,
    hookTimeout: 15_000,
    // Avoid storybook browser project picking these up.
    exclude: ["**/node_modules/**", "**/dist/**", "**/*.stories.*"],
  },
});
