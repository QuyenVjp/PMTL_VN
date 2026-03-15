import { stat } from "node:fs/promises";

import { QUEUE_NAMES } from "@pmtl/shared";
import type { Payload } from "payload";

import { getQueueJobCounts } from "@/services/queue.service";

const workerHeartbeatPath = process.env.WORKER_HEARTBEAT_PATH ?? "/tmp/pmtl-worker-heartbeat";
const workerHeartbeatStaleSeconds = Number(process.env.WORKER_HEARTBEAT_STALE_SECONDS ?? "120");

type QueueHealth = Awaited<ReturnType<typeof getQueueJobCounts>>;

export type WorkerHealthStatus = {
  status: "ok" | "stale";
  service: "worker";
  heartbeatPath: string;
  heartbeatAt: string | null;
  heartbeatAgeSeconds: number | null;
  staleAfterSeconds: number;
  queues: Record<string, QueueHealth["counts"]>;
};

async function getHeartbeatState() {
  try {
    const heartbeatStat = await stat(workerHeartbeatPath);
    const heartbeatAgeSeconds = Math.max(0, (Date.now() - heartbeatStat.mtimeMs) / 1000);

    return {
      heartbeatAt: new Date(heartbeatStat.mtimeMs).toISOString(),
      heartbeatAgeSeconds,
      isStale: heartbeatAgeSeconds > workerHeartbeatStaleSeconds,
    };
  } catch {
    return {
      heartbeatAt: null,
      heartbeatAgeSeconds: null,
      isStale: true,
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
