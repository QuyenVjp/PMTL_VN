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
const windowsPowerShellPath = `${process.env.SystemRoot ?? "C:\\Windows"}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`;
const pwshPath = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
const dockerDesktopCandidates =
  process.platform === "win32"
    ? [
        "C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe",
        path.join(process.env.LOCALAPPDATA ?? "", "Docker", "Docker Desktop.exe"),
      ]
    : [];

function log(message: string): void {
  console.info(`[dev] ${message}`);
}

function fail(message: string): never {
  console.error(`[dev] ${message}`);
  process.exit(1);
}

function ensureSupportedNodeVersion(): void {
  const [major, minor] = process.versions.node.split(".").map((value) => Number.parseInt(value, 10));

  if (Number.isNaN(major) || Number.isNaN(minor)) {
    fail(`Khong doc duoc phien ban Node hien tai: ${process.versions.node}.`);
  }

  if (major < 20 || (major === 20 && minor < 18)) {
    fail(
      `Node ${process.versions.node} khong duoc ho tro. Repo nay can Node >=20.18.0. Hay chuyen sang Node 20 roi chay lai run-dev.bat.`,
    );
  }
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

function getPowerShellExecutable(): string | null {
  if (process.platform !== "win32") {
    return null;
  }

  if (existsSync(windowsPowerShellPath)) {
    return windowsPowerShellPath;
  }

  if (existsSync(pwshPath)) {
    return pwshPath;
  }

  return null;
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
  const databaseUrlWithLocalHost = mapUrlHost(baseEnv.DATABASE_URL, "postgres", "127.0.0.1") ?? baseEnv.DATABASE_URL;
  localEnv.DATABASE_URL = mapUrlPort(databaseUrlWithLocalHost, "5432", postgresHostPort) ?? databaseUrlWithLocalHost;
  localEnv.MEILI_HOST = mapUrlHost(baseEnv.MEILI_HOST, "meilisearch", "127.0.0.1") ?? baseEnv.MEILI_HOST;
  localEnv.REDIS_URL =
    mapUrlHost(baseEnv.REDIS_URL ?? "redis://redis:6379", "127.0.0.1", "127.0.0.1") ??
    mapUrlHost(baseEnv.REDIS_URL ?? "redis://redis:6379", "redis", "127.0.0.1") ??
    "redis://127.0.0.1:6379";
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
    ["compose", "--env-file", dockerEnvPath, "-f", composeFilePath, "up", "-d", "--wait", "postgres", "meilisearch", "redis"],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    fail("Khong the khoi dong postgres, meilisearch va redis bang Docker Compose.");
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

  const databaseUrl = localEnv.DATABASE_URL ?? "postgresql://pmtl:pmtl@127.0.0.1:55432/pmtl";
  let postgresPort = 55432;
  try {
    const parsed = new URL(databaseUrl);
    postgresPort = Number.parseInt(parsed.port || "55432", 10);
  } catch {
    postgresPort = 55432;
  }

  let infraFailStreak = 0;
  let monitorInFlight = false;
  const infraMonitor = setInterval(() => {
    if (monitorInFlight) {
      return;
    }

    monitorInFlight = true;
    void isTcpPortReachable(postgresPort, "127.0.0.1")
      .then((ok) => {
        if (ok) {
          infraFailStreak = 0;
          return;
        }

        infraFailStreak += 1;
        if (infraFailStreak >= 3) {
          log(
            `Postgres localhost:${postgresPort} khong con reachable. Dung web/cms/worker de tranh spam loi. Chay lai run-dev.bat sau khi Docker on dinh.`,
          );
          stopChild();
          process.exit(1);
        }
      })
      .finally(() => {
        monitorInFlight = false;
      });
  }, 5000);
  infraMonitor.unref();

  appChild.on("exit", (code) => {
    clearInterval(infraMonitor);
    if (!workerChild.killed) {
      workerChild.kill("SIGINT");
    }

    process.exit(code ?? 0);
  });

  workerChild.on("exit", (code) => {
    const exitCode = code ?? 0;
    if (exitCode !== 0) {
      log(
        `Worker da dung voi ma ${exitCode}. Web/CMS tiep tuc chay. Kiem tra log worker va chay lai \`pnpm dev:worker\` khi can.`,
      );
    }
  });
}

function isTcpPortReachable(port: number, host: string, timeoutMs = 1200): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (ok: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
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

function isDockerDaemonReady(): boolean {
  const result = spawnSync("docker", ["info"], {
    cwd: repoRoot,
    stdio: "ignore",
  });

  return result.status === 0;
}

function getDockerDesktopServiceState(): "running" | "stopped" | "missing" | "unknown" {
  if (process.platform !== "win32") {
    return "unknown";
  }

  const powershellExecutable = getPowerShellExecutable();
  if (!powershellExecutable) {
    return "unknown";
  }

  const result = spawnSync(
    powershellExecutable,
    [
      "-NoLogo",
      "-NoProfile",
      "-Command",
      "(Get-Service com.docker.service -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Status)",
    ],
    {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    },
  );

  const output = result.stdout?.trim().toLowerCase();

  if (!output) {
    return "missing";
  }

  if (output === "running") {
    return "running";
  }

  if (output === "stopped") {
    return "stopped";
  }

  return "unknown";
}

function findDockerDesktopExecutable(): string | null {
  for (const candidate of dockerDesktopCandidates) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function tryLaunchDockerDesktop(): boolean {
  if (process.platform !== "win32") {
    return false;
  }

  const executable = findDockerDesktopExecutable();

  if (!executable) {
    return false;
  }

  const result = spawnSync(executable, [], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });

  return result.status === 0;
}

async function ensureDockerDaemonReady(): Promise<void> {
  if (isDockerDaemonReady()) {
    return;
  }

  const serviceState = getDockerDesktopServiceState();

  if (serviceState === "stopped") {
    fail(
      "Docker Desktop Service dang bi tat. Hay mo Docker Desktop bang quyen Administrator hoac bat lai service `com.docker.service`, sau do chay lai `docker info` va `run-dev.bat`.",
    );
  }

  const launched = tryLaunchDockerDesktop();

  if (launched) {
    log("Docker daemon chua san sang. Dang mo Docker Desktop va cho engine khoi dong...");
  } else {
    log("Docker daemon chua san sang. Dang cho Docker Desktop/daemon khoi dong...");
  }

  const timeoutMs = 180_000;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (isDockerDaemonReady()) {
      log("Docker daemon da san sang.");
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  }

  fail(
    "Docker daemon chua san sang. Hay mo Docker Desktop, chuyen sang Linux containers, dam bao `com.docker.service` dang chay, va kiem tra `docker info` chay duoc.",
  );
}

async function main(): Promise<void> {
  ensureSupportedNodeVersion();
  ensureDockerInstalled();
  await ensureDockerDaemonReady();
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
