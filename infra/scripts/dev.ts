import { copyFileSync, existsSync, readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

type EnvMap = Record<string, string>;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const repoRoot = path.resolve(dirname, "..", "..");
const dockerEnvPath = path.join(repoRoot, "infra", "docker", ".env.dev");
const dockerEnvExamplePath = path.join(repoRoot, "infra", "docker", ".env.dev.example");
const composeFilePath = path.join(repoRoot, "infra", "docker", "compose.dev.yml");
const isInfraOnly = process.argv.includes("--infra-only");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function log(message: string): void {
  console.info(`[dev] ${message}`);
}

function fail(message: string): never {
  console.error(`[dev] ${message}`);
  process.exit(1);
}

function ensureDockerInstalled(): void {
  const result = spawnSync("docker", ["--version"], {
    cwd: repoRoot,
    stdio: "ignore",
  });

  if (result.status !== 0) {
    fail("Khong tim thay Docker CLI. Hay mo Docker Desktop va dam bao lenh `docker` chay duoc.");
  }
}

function ensureDockerEnvFile(): void {
  if (existsSync(dockerEnvPath)) {
    return;
  }

  copyFileSync(dockerEnvExamplePath, dockerEnvPath);
  log("Da tao infra/docker/.env.dev tu file example.");
}

function parseEnvFile(filePath: string): EnvMap {
  const content = readFileSync(filePath, "utf8");
  const env: EnvMap = {};

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value.replace(/^"(.*)"$/u, "$1").replace(/^'(.*)'$/u, "$1");
  }

  return env;
}

function mapUrlHost(rawValue: string | undefined, fromHost: string, toHost: string): string | undefined {
  if (!rawValue) {
    return rawValue;
  }

  try {
    const value = new URL(rawValue);

    if (value.hostname === fromHost) {
      value.hostname = toHost;
      return value.toString();
    }
  } catch {
    return rawValue;
  }

  return rawValue;
}

function mapUrlPort(rawValue: string | undefined, fromPort: string, toPort: string): string | undefined {
  if (!rawValue) {
    return rawValue;
  }

  try {
    const value = new URL(rawValue);

    if (value.port === fromPort) {
      value.port = toPort;
      return value.toString();
    }
  } catch {
    return rawValue;
  }

  return rawValue;
}

function normalizeLocalAppEnv(baseEnv: EnvMap): EnvMap {
  const localEnv: EnvMap = {
    ...process.env,
    ...baseEnv,
  } as EnvMap;

  const postgresHostPort = baseEnv.POSTGRES_HOST_PORT ?? "55432";
  const databaseUrlWithLocalHost = mapUrlHost(baseEnv.DATABASE_URL, "postgres", "localhost") ?? baseEnv.DATABASE_URL;
  localEnv.DATABASE_URL = mapUrlPort(databaseUrlWithLocalHost, "5432", postgresHostPort) ?? databaseUrlWithLocalHost;
  localEnv.MEILI_HOST = mapUrlHost(baseEnv.MEILI_HOST, "meilisearch", "localhost") ?? baseEnv.MEILI_HOST;
  localEnv.REDIS_URL =
    mapUrlHost(baseEnv.REDIS_URL ?? "redis://redis:6379", "redis", "localhost") ?? "redis://localhost:6379";
  localEnv.PAYLOAD_DB_PUSH = baseEnv.PAYLOAD_DB_PUSH ?? "false";
  localEnv.PAYLOAD_PUBLIC_SERVER_URL =
    mapUrlHost(baseEnv.PAYLOAD_PUBLIC_SERVER_URL, "cms", "localhost") ?? "http://localhost:3001";
  localEnv.CMS_PUBLIC_URL = mapUrlHost(baseEnv.CMS_PUBLIC_URL, "cms", "localhost") ?? "http://localhost:3001";
  localEnv.NEXT_PUBLIC_SITE_URL =
    mapUrlHost(baseEnv.NEXT_PUBLIC_SITE_URL, "web", "localhost") ?? baseEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  localEnv.PORT = baseEnv.PORT ?? "3001";

  return localEnv;
}

function runDockerComposeInfra(): void {
  const result = spawnSync(
    "docker",
    ["compose", "-f", composeFilePath, "up", "-d", "postgres", "meilisearch", "redis"],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    fail("Khong the khoi dong postgres va meilisearch bang Docker Compose.");
  }
}

function waitForTcpPort(port: number, host: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.createConnection({
        host,
        port,
      });

      socket.once("connect", () => {
        socket.end();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();

        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`TCP ${host}:${port} khong san sang trong ${timeoutMs}ms.`));
          return;
        }

        setTimeout(tryConnect, 1500);
      });
    };

    tryConnect();
  });
}

async function waitForHttp(url: string, timeoutMs: number): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        method: "GET",
      });

      if (response.ok) {
        return;
      }
    } catch {
      // retry
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
  }

  throw new Error(`${url} khong san sang trong ${timeoutMs}ms.`);
}

function runLocalApps(localEnv: EnvMap): void {
  log("Khoi dong web va cms local voi hot reload...");
  log("Khoi dong worker Payload Jobs local...");
  log("Web: http://localhost:3000");
  log("CMS API: http://localhost:3001/api/health");
  log("Meilisearch: http://localhost:7700/health");
  log("Redis: redis://localhost:6379");
  log("Dung Ctrl+C de dung web/cms/worker. Postgres, Meilisearch va Redis se tiep tuc chay nen.");

  const appChild = spawn(pnpmCommand, ["dev:apps"], {
    cwd: repoRoot,
    env: localEnv,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  const workerChild = spawn(pnpmCommand, ["dev:worker"], {
    cwd: repoRoot,
    env: localEnv,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  const stopChild = () => {
    if (!appChild.killed) {
      appChild.kill("SIGINT");
    }

    if (!workerChild.killed) {
      workerChild.kill("SIGINT");
    }
  };

  process.on("SIGINT", stopChild);
  process.on("SIGTERM", stopChild);

  appChild.on("exit", (code) => {
    if (!workerChild.killed) {
      workerChild.kill("SIGINT");
    }

    process.exit(code ?? 0);
  });

  workerChild.on("exit", (code) => {
    if (!appChild.killed) {
      appChild.kill("SIGINT");
    }

    process.exit(code ?? 0);
  });
}

function syncCmsSchema(localEnv: EnvMap): void {
  log("Dong bo schema CMS voi Postgres local...");

  const result = spawnSync(pnpmCommand, ["--filter", "@pmtl/cms", "db:sync"], {
    cwd: repoRoot,
    env: localEnv,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    fail("Khong the dong bo schema CMS truoc khi khoi dong dev runtime.");
  }
}

async function main(): Promise<void> {
  ensureDockerInstalled();
  ensureDockerEnvFile();
  runDockerComposeInfra();

  const dockerEnv = parseEnvFile(dockerEnvPath);
  const postgresHostPort = Number.parseInt(dockerEnv.POSTGRES_HOST_PORT ?? "55432", 10);

  log(`Dang cho postgres tren localhost:${postgresHostPort}...`);
  await waitForTcpPort(postgresHostPort, "127.0.0.1", 60_000);
  log("Dang cho meilisearch tren http://localhost:7700/health...");
  await waitForHttp("http://localhost:7700/health", 60_000);
  log("Dang cho redis tren localhost:6379...");
  await waitForTcpPort(6379, "127.0.0.1", 60_000);

  if (isInfraOnly) {
    log("Ha tang dev da san sang.");
    return;
  }

  const localEnv = normalizeLocalAppEnv(dockerEnv);
  syncCmsSchema(localEnv);
  runLocalApps(localEnv);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  fail(message);
});
