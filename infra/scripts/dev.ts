import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const dockerEnvPath = path.join(repoRoot, "infra", "docker", ".env.dev");
const dockerEnvExamplePath = path.join(repoRoot, "infra", "docker", ".env.dev.example");
const composeFilePath = path.join(repoRoot, "infra", "docker", "compose.dev.yml");

type CommandName = "up" | "logs" | "down" | "rebuild";
type PresetName = "core" | "full";

const presetServices: Record<PresetName, string[]> = {
  core: ["web", "cms"],
  full: ["web", "cms", "worker", "caddy"],
};

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

function ensureDockerDaemonReady(): void {
  const result = spawnSync("docker", ["info"], {
    cwd: repoRoot,
    stdio: "ignore",
  });

  if (result.status !== 0) {
    fail("Docker daemon chua san sang. Hay mo Docker Desktop, doi engine khoi dong xong roi chay lai.");
  }
}

function ensureDockerEnvFile(): void {
  if (existsSync(dockerEnvPath)) {
    return;
  }

  copyFileSync(dockerEnvExamplePath, dockerEnvPath);
  console.info("[dev] Da tao infra/docker/.env.dev tu file example.");
}

function buildComposeArgs(args: string[]) {
  return ["compose", "--env-file", dockerEnvPath, "-f", composeFilePath, ...args];
}

function resolveServices(rawServices: string[]) {
  if (rawServices.length === 0) {
    return {
      services: [],
      presetLabel: "full stack",
    };
  }

  if (rawServices.length === 1) {
    const preset = rawServices[0] as PresetName;

    if (preset in presetServices) {
      return {
        services: presetServices[preset],
        presetLabel: preset,
      };
    }
  }

  return {
    services: rawServices,
    presetLabel: rawServices.join(", "),
  };
}

function sleep(ms: number) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < ms) {
    // intentional sync wait for small retry windows in wrapper script
  }
}

function runCompose(args: string[], retries = 3) {
  let lastResult:
    | ReturnType<typeof spawnSync>
    | undefined;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const result = spawnSync("docker", buildComposeArgs(args), {
      cwd: repoRoot,
      stdio: "inherit",
    });

    if (result.status === 0) {
      return result;
    }

    lastResult = result;

    if (attempt < retries) {
      console.warn(`[dev] Docker Compose failed (attempt ${attempt}/${retries}). Retrying in 3s...`);
      sleep(3000);
    }
  }

  return lastResult ?? { status: 1 };
}

function parseCommand(argv: string[]): { command: CommandName; foreground: boolean; services: string[] } {
  const [rawCommand = "up", ...rest] = argv;
  const foreground = rest.includes("--foreground");
  const services = rest.filter((value) => value !== "--foreground");

  if (rawCommand === "up" || rawCommand === "logs" || rawCommand === "down" || rawCommand === "rebuild") {
    return {
      command: rawCommand,
      foreground,
      services,
    };
  }

  fail(`Lenh dev khong hop le: ${rawCommand}. Dung mot trong cac lenh: up, logs, down, rebuild.`);
}

function main() {
  const { command, foreground, services } = parseCommand(process.argv.slice(2));
  const resolved = resolveServices(services);

  ensureDockerInstalled();
  ensureDockerDaemonReady();
  ensureDockerEnvFile();

  if (command === "up") {
    console.info(`[dev] Starting ${resolved.presetLabel}.`);
    const result = runCompose(["up", ...(foreground ? [] : ["-d"]), "--remove-orphans", ...resolved.services]);
    process.exit(result.status ?? 1);
  }

  if (command === "logs") {
    const result = runCompose(["logs", "-f", "--tail", "200", ...resolved.services]);
    process.exit(result.status ?? 1);
  }

  if (command === "down") {
    const result = runCompose(["down", "--remove-orphans"]);
    process.exit(result.status ?? 1);
  }

  console.info(`[dev] Rebuilding ${resolved.presetLabel}.`);
  const buildResult = runCompose(["build", "--no-cache", ...resolved.services]);
  if (buildResult.status !== 0) {
    process.exit(buildResult.status ?? 1);
  }

  const upResult = runCompose(["up", "-d", "--force-recreate", "--remove-orphans", ...resolved.services]);
  process.exit(upResult.status ?? 1);
}

main();
