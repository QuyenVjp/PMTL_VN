import path from "node:path";
import { defineConfig } from "prisma/config";

const fallbackDatasourceUrl = "postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(import.meta.dirname, "prisma", "schema.prisma"),
  datasource: {
    url:
      process.env.DATABASE_DIRECT_URL ??
      process.env.DATABASE_URL ??
      fallbackDatasourceUrl,
  },
  migrations: {
    path: path.join(import.meta.dirname, "prisma", "migrations"),
    seed: "npx tsx prisma/seed.ts",
  },
});
