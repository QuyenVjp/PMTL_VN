import pg from "pg";
import { spawnSync } from "node:child_process";
import path from "node:path";

const { Client } = pg;

const defaultDatabaseUrl = "postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl_test";
const databaseUrl = process.env.DATABASE_URL ?? defaultDatabaseUrl;
const url = new URL(databaseUrl);
const databaseName = url.pathname.replace(/^\//, "");

if (!databaseName) {
  throw new Error("DATABASE_URL must include a database name for tests.");
}

const adminUrl = new URL(databaseUrl);
adminUrl.pathname = "/postgres";

const client = new Client({
  connectionString: adminUrl.toString(),
});

async function ensureDatabase() {
  await client.connect();

  const result = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);

  if (result.rowCount === 0) {
    await client.query(`CREATE DATABASE "${databaseName}"`);
  }
}

async function main() {
  try {
    await ensureDatabase();
  } finally {
    await client.end();
  }

  const prismaCommand = path.join(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prisma.cmd" : "prisma",
  );

  const prismaArgs = [
    "db",
    "push",
    "--schema=./prisma/schema.prisma",
    `--url=${databaseUrl}`,
  ];

  const pushResult = process.platform === "win32"
    ? spawnSync("cmd.exe", ["/c", prismaCommand, ...prismaArgs], {
        cwd: process.cwd(),
        stdio: "inherit",
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          DATABASE_DIRECT_URL: databaseUrl,
        },
      })
    : spawnSync(prismaCommand, prismaArgs, {
        cwd: process.cwd(),
        stdio: "inherit",
        env: {
          ...process.env,
          DATABASE_URL: databaseUrl,
          DATABASE_DIRECT_URL: databaseUrl,
        },
      });

  if (pushResult.error) {
    console.error(pushResult.error);
    process.exit(1);
  }

  if (pushResult.status !== 0) {
    process.exit(pushResult.status ?? 1);
  }
}

await main();
