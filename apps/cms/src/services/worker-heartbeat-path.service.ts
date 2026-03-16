import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultHeartbeatPath = "/tmp/pmtl-worker-heartbeat.json";
const servicesDir = path.dirname(fileURLToPath(import.meta.url));
const cmsRoot = path.resolve(servicesDir, "..", "..");
const localHeartbeatPath = path.join(cmsRoot, "tmp-runtime-logs", "worker-heartbeat.json");

export function getWorkerHeartbeatPath(): string {
  const configuredPath = process.env.WORKER_HEARTBEAT_PATH ?? defaultHeartbeatPath;

  if (os.platform() === "win32" && configuredPath.startsWith("/")) {
    return localHeartbeatPath;
  }

  return configuredPath;
}
