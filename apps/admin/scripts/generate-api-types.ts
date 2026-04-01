#!/usr/bin/env tsx
/**
 * Generate TypeScript types from OpenAPI spec
 * Runs against local API server at http://localhost:3001/api/openapi.json
 */

import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OPENAPI_URL = process.env.OPENAPI_URL ?? "http://localhost:3001/api/openapi.json";
const OUTPUT_PATH = join(__dirname, "..", "src", "lib", "api", "generated.d.ts");

function main() {
  console.log("🔄 Generating API types from OpenAPI spec...");
  console.log(`📡 Source: ${OPENAPI_URL}`);
  console.log(`📝 Output: ${OUTPUT_PATH}`);

  // Ensure output directory exists
  const outputDir = dirname(OUTPUT_PATH);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Generate types using openapi-typescript
    execSync(
      `npx openapi-typescript "${OPENAPI_URL}" --output "${OUTPUT_PATH}"`,
      { stdio: "inherit" }
    );

    console.log("✅ API types generated successfully!");
  } catch (error) {
    console.error("❌ Failed to generate API types:");
    console.error(error);
    process.exit(1);
  }
}

main();
