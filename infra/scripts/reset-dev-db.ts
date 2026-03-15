import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

type EnvMap = Record<string, string>;

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const repoRoot = path.resolve(dirname, "..", "..");
const composeFilePath = path.join(repoRoot, "infra", "docker", "compose.dev.yml");
const dockerEnvPath = path.join(repoRoot, "infra", "docker", ".env.dev");

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

function runDockerCompose(commandArgs: string[]) {
  return spawnSync("docker", ["compose", "--env-file", dockerEnvPath, "-f", composeFilePath, ...commandArgs], {
    cwd: repoRoot,
    stdio: "inherit",
  });
}

function main() {
  const env = parseEnvFile(dockerEnvPath);
  const database = env.POSTGRES_DB ?? "pmtl";
  const user = env.POSTGRES_USER ?? "pmtl";

  const upResult = runDockerCompose(["up", "-d", "postgres"]);

  if (upResult.status !== 0) {
    process.exit(upResult.status ?? 1);
  }

  const resetSql = "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;";
  const execResult = runDockerCompose([
    "exec",
    "-T",
    "postgres",
    "psql",
    "-U",
    user,
    "-d",
    database,
    "-c",
    resetSql,
  ]);

  if (execResult.status !== 0) {
    process.exit(execResult.status ?? 1);
  }

  console.info("[db:reset:dev] Local development schema has been reset.");
}

main();
