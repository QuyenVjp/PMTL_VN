import { QUEUE_NAMES } from "@pmtl/shared";
import { mkdir, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";

import { runPendingCmsJobs } from "@/jobs";
import { cleanupExpiredGuards } from "@/services/request-guard.service";
import { getWorkerHeartbeatPath } from "@/services/worker-heartbeat-path.service";
import { workerLogger as logger, initWorkerSentry } from "@/workers/logger";
import { getWorkerPayload } from "@/workers/payload";

const jobsIntervalMs = Number(process.env.WORKER_JOBS_INTERVAL_MS ?? "15000");
const maintenanceIntervalMs = Number(process.env.WORKER_MAINTENANCE_INTERVAL_MS ?? "600000");
const heartbeatPath = getWorkerHeartbeatPath();
const startupRetryCount = Number(process.env.WORKER_STARTUP_RETRY_COUNT ?? "0");
const startupRetryDelayMs = Number(process.env.WORKER_STARTUP_RETRY_DELAY_MS ?? "3000");

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableStartupError(error: unknown) {
  if (!(error instanceof Error)) {
    // Payload/db adapter can surface non-Error rejections in transient startup states.
    return true;
  }

  const message = error.message.toLowerCase();
  return message.includes("cannot connect to postgres") || message.includes("econnrefused") || message.includes("fetch failed");
}

function resolvePostgresEndpoint() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return {
      host: "127.0.0.1",
      port: 5432,
    };
  }

  try {
    const parsed = new URL(databaseUrl);
    const host = parsed.hostname || "127.0.0.1";
    const port = Number(parsed.port || "5432");
    return {
      host,
      port: Number.isFinite(port) ? port : 5432,
    };
  } catch {
    return {
      host: "127.0.0.1",
      port: 5432,
    };
  }
}

function checkTcpReachable(host: string, port: number, timeoutMs = 1200): Promise<boolean> {
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

async function getWorkerPayloadWithRetry() {
  let lastError: unknown;
  let attempt = 1;
  const shouldRetryForever = !Number.isFinite(startupRetryCount) || startupRetryCount <= 0;
  const postgresEndpoint = resolvePostgresEndpoint();

  while (shouldRetryForever || attempt <= startupRetryCount) {
    try {
      const canReachPostgres = await checkTcpReachable(postgresEndpoint.host, postgresEndpoint.port);
      if (!canReachPostgres) {
        throw new Error(`Postgres TCP not reachable at ${postgresEndpoint.host}:${postgresEndpoint.port}`);
      }

      return await getWorkerPayload();
    } catch (error) {
      lastError = error;
      const shouldStop = !isRetryableStartupError(error) || (!shouldRetryForever && attempt >= startupRetryCount);

      if (shouldStop) {
        break;
      }

      logger.warn(
        {
          attempt,
          startupRetryCount: shouldRetryForever ? "infinite" : startupRetryCount,
          startupRetryDelayMs,
          postgresHost: postgresEndpoint.host,
          postgresPort: postgresEndpoint.port,
          error,
        },
        "Worker startup dependency not ready, retrying",
      );
      await sleep(startupRetryDelayMs);
      attempt += 1;
    }
  }

  throw lastError;
}
async function touchHeartbeat(reason: string, queueNames: string[]) {
  try {
    await mkdir(path.dirname(heartbeatPath), { recursive: true });
    await writeFile(
      heartbeatPath,
      JSON.stringify({
        service: "worker",
        hostname: os.hostname(),
        pid: process.pid,
        reason,
        queueNames,
        timestamp: new Date().toISOString(),
      }),
      "utf8",
    );
  } catch (error) {
    logger.warn({ error, heartbeatPath }, "Failed to update worker heartbeat");
  }
}

async function startWorker() {
  initWorkerSentry();
  const payload = await getWorkerPayloadWithRetry();
  let isRunningJobs = false;
  const queueNames = Object.values(QUEUE_NAMES);

  const runJobsCycle = async () => {
    if (isRunningJobs) {
      return;
    }

    isRunningJobs = true;

    try {
      await payload.jobs.handleSchedules({
        allQueues: true,
      });
      await runPendingCmsJobs({
        payload,
        silent: true,
      });
      await touchHeartbeat("jobs-cycle", queueNames);
    } catch (error) {
      logger.error({ error }, "Failed to run pending CMS jobs");
    } finally {
      isRunningJobs = false;
    }
  };

  await runJobsCycle();

  const jobsTimer = setInterval(() => {
    void runJobsCycle();
  }, jobsIntervalMs);

  const maintenanceTimer = setInterval(() => {
    void cleanupExpiredGuards(payload)
      .then((removed) => {
        void touchHeartbeat("maintenance-cycle", queueNames);
        if (removed > 0) {
          logger.info({ removed }, "Expired request guards cleaned");
        }
      })
      .catch((error) => {
        logger.error({ error }, "Failed to cleanup expired request guards");
      });
  }, maintenanceIntervalMs);

  maintenanceTimer.unref();
  jobsTimer.unref();

  const shutdown = async () => {
    clearInterval(jobsTimer);
    clearInterval(maintenanceTimer);
    logger.info("Stopping worker...");
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });

  logger.info(
    {
      heartbeatPath,
      intervalMs: jobsIntervalMs,
      queues: queueNames,
    },
    "PMTL worker is running",
  );
}

process.on("uncaughtException", (error) => {
  logger.error({ error }, "Unhandled worker exception");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ error: reason }, "Unhandled worker rejection");
});

void startWorker().catch((error) => {
  logger.error({ error }, "PMTL worker failed to start");
  process.exit(1);
});
