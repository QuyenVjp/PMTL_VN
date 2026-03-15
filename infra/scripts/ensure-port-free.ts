import { execSync, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

function parsePort(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid port: ${value ?? "<empty>"}`);
  }

  return parsed;
}

function getListeningPidsWindows(port: number): number[] {
  const output = execSync(
    `pwsh -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"`,
    {
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    },
  ).toString();

  const pids = new Set<number>();
  for (const line of output.split(/\r?\n/u)) {
    const pid = Number.parseInt(line.trim(), 10);
    if (Number.isInteger(pid)) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function getListeningPidsUnix(port: number): number[] {
  const output = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, {
    stdio: ["ignore", "pipe", "ignore"],
  }).toString();

  const pids = new Set<number>();
  for (const line of output.split(/\r?\n/u)) {
    const pid = Number.parseInt(line.trim(), 10);
    if (Number.isInteger(pid)) {
      pids.add(pid);
    }
  }

  return [...pids];
}

function getListeningPids(port: number): number[] {
  try {
    if (process.platform === "win32") {
      return getListeningPidsWindows(port);
    }

    return getListeningPidsUnix(port);
  } catch {
    return process.platform === "win32" ? [] : [];
  }
}

function killPid(pid: number): void {
  try {
    if (process.platform === "win32") {
      spawnSync(
        "pwsh",
        [
          "-NoProfile",
          "-Command",
          `Stop-Process -Id ${pid} -Force -ErrorAction SilentlyContinue`,
        ],
        {
          stdio: "ignore",
          windowsHide: true,
        },
      );
      return;
    }

    process.kill(pid, "SIGKILL");
  } catch {
    // Ignore. Process may have exited.
  }
}

function sleepMs(durationMs: number): void {
  const startedAt = Date.now();
  while (Date.now() - startedAt < durationMs) {
    // Busy wait is acceptable here because this script is tiny and one-off before dev starts.
  }
}

function ensurePortFreed(port: number): void {
  for (let attempt = 0; attempt < 10; attempt++) {
    const pids = getListeningPids(port).filter((pid) => pid !== process.pid);
    if (pids.length === 0) {
      return;
    }

    for (const pid of pids) {
      killPid(pid);
    }

    sleepMs(250);
  }
}

function main(): void {
  const port = parsePort(process.argv[2]);
  const label = process.argv[3] ?? `port-${port}`;
  const pids = getListeningPids(port).filter((pid) => pid !== process.pid);

  if (pids.length === 0) {
    console.info(`[dev] ${label}: port ${port} is free.`);
    return;
  }

  console.info(`[dev] ${label}: cleaning port ${port}, pids=${pids.join(",")}`);
  ensurePortFreed(port);

  const remaining = getListeningPids(port).filter((pid) => pid !== process.pid);
  if (remaining.length > 0) {
    console.warn(`[dev] ${label}: port ${port} is still busy, pids=${remaining.join(",")}`);
  } else {
    console.info(`[dev] ${label}: port ${port} is now free.`);
  }

  const nextDevLockPath = path.join(process.cwd(), ".next", "dev", "lock");
  if (existsSync(nextDevLockPath)) {
    try {
      rmSync(nextDevLockPath, { force: true });
      console.info(`[dev] ${label}: removed stale Next dev lock.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[dev] ${label}: could not remove stale Next dev lock: ${message}`);
    }
  }
}

main();
