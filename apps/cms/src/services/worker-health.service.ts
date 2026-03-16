import { readFile, stat } from "node:fs/promises";

import { QUEUE_NAMES } from "@pmtl/shared";
import type { Payload } from "payload";

import { getQueueJobCounts } from "@/services/queue.service";

const workerHeartbeatPath = process.env.WORKER_HEARTBEAT_PATH ?? "/tmp/pmtl-worker-heartbeat.json";
const workerHeartbeatStaleSeconds = Number(process.env.WORKER_HEARTBEAT_STALE_SECONDS ?? "120");

type QueueHealth = Awaited<ReturnType<typeof getQueueJobCounts>>;
type WorkerHeartbeatFile = {
  service?: string;
  hostname?: string;
  pid?: number;
  queueNames?: string[];
  reason?: string;
  timestamp?: string;
};

export type WorkerHealthStatus = {
  status: "ok" | "stale";
  service: "worker";
  heartbeatPath: string;
  heartbeatAt: string | null;
  heartbeatAgeSeconds: number | null;
  staleAfterSeconds: number;
  heartbeatReason: string | null;
  hostname: string | null;
  pid: number | null;
  queueNames: string[];
  queues: Record<string, QueueHealth["counts"]>;
};

async function getHeartbeatState() {
  try {
    const [heartbeatStat, file] = await Promise.all([
      stat(workerHeartbeatPath),
      readFile(workerHeartbeatPath, "utf8"),
    ]);
    const heartbeatAgeSeconds = Math.max(0, (Date.now() - heartbeatStat.mtimeMs) / 1000);
    const parsed = JSON.parse(file) as WorkerHeartbeatFile;

    return {
      heartbeatAt: new Date(heartbeatStat.mtimeMs).toISOString(),
      heartbeatAgeSeconds,
      isStale: heartbeatAgeSeconds > workerHeartbeatStaleSeconds,
      heartbeatReason: parsed.reason ?? null,
      hostname: parsed.hostname ?? null,
      pid: typeof parsed.pid === "number" ? parsed.pid : null,
      queueNames: Array.isArray(parsed.queueNames) ? parsed.queueNames.filter((value): value is string => typeof value === "string") : [],
    };
  } catch {
    return {
      heartbeatAt: null,
      heartbeatAgeSeconds: null,
      isStale: true,
      heartbeatReason: null,
      hostname: null,
      pid: null,
      queueNames: [],
    };
  }
}

export async function getWorkerHealthStatus(payload: Payload): Promise<WorkerHealthStatus> {
  const [heartbeat, searchSync, pushDispatch, emailNotification] = await Promise.all([
    getHeartbeatState(),
    getQueueJobCounts(payload, QUEUE_NAMES.searchSync),
    getQueueJobCounts(payload, QUEUE_NAMES.pushDispatch),
    getQueueJobCounts(payload, QUEUE_NAMES.emailNotification),
  ]);

  return {
    status: heartbeat.isStale ? "stale" : "ok",
    service: "worker",
    heartbeatPath: workerHeartbeatPath,
    heartbeatAt: heartbeat.heartbeatAt,
    heartbeatAgeSeconds: heartbeat.heartbeatAgeSeconds,
    staleAfterSeconds: workerHeartbeatStaleSeconds,
    heartbeatReason: heartbeat.heartbeatReason,
    hostname: heartbeat.hostname,
    pid: heartbeat.pid,
    queueNames: heartbeat.queueNames,
    queues: {
      [QUEUE_NAMES.searchSync]: searchSync.counts,
      [QUEUE_NAMES.pushDispatch]: pushDispatch.counts,
      [QUEUE_NAMES.emailNotification]: emailNotification.counts,
    },
  };
}

export function formatWorkerMetrics(status: WorkerHealthStatus) {
  const lines = [
    "# HELP pmtl_worker_healthy Worker heartbeat health state (1 healthy, 0 stale).",
    "# TYPE pmtl_worker_healthy gauge",
    `pmtl_worker_healthy ${status.status === "ok" ? 1 : 0}`,
    "# HELP pmtl_worker_heartbeat_age_seconds Seconds since the worker heartbeat was updated.",
    "# TYPE pmtl_worker_heartbeat_age_seconds gauge",
    `pmtl_worker_heartbeat_age_seconds ${status.heartbeatAgeSeconds ?? -1}`,
    "# HELP pmtl_worker_heartbeat_stale_after_seconds Worker heartbeat stale threshold in seconds.",
    "# TYPE pmtl_worker_heartbeat_stale_after_seconds gauge",
    `pmtl_worker_heartbeat_stale_after_seconds ${status.staleAfterSeconds}`,
    "# HELP pmtl_worker_process_info Worker process identity labels.",
    "# TYPE pmtl_worker_process_info gauge",
    `pmtl_worker_process_info{hostname="${status.hostname ?? "unknown"}",pid="${status.pid ?? "unknown"}",reason="${status.heartbeatReason ?? "unknown"}"} 1`,
    "# HELP pmtl_worker_queue_jobs Number of jobs by queue and state.",
    "# TYPE pmtl_worker_queue_jobs gauge",
  ];

  for (const [queue, counts] of Object.entries(status.queues)) {
    for (const [state, value] of Object.entries(counts)) {
      lines.push(`pmtl_worker_queue_jobs{queue="${queue}",state="${state}"} ${value}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
