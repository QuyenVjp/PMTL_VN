import { QUEUE_NAMES } from "@pmtl/shared";
import { writeFile } from "node:fs/promises";
import os from "node:os";

import { runPendingCmsJobs } from "@/jobs";
import { cleanupExpiredGuards } from "@/services/request-guard.service";
import { workerLogger as logger, initWorkerSentry } from "@/workers/logger";
import { getWorkerPayload } from "@/workers/payload";

const jobsIntervalMs = Number(process.env.WORKER_JOBS_INTERVAL_MS ?? "15000");
const maintenanceIntervalMs = Number(process.env.WORKER_MAINTENANCE_INTERVAL_MS ?? "600000");
const heartbeatPath = process.env.WORKER_HEARTBEAT_PATH ?? "/tmp/pmtl-worker-heartbeat.json";

async function touchHeartbeat(reason: string, queueNames: string[]) {
  try {
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
  const payload = await getWorkerPayload();
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
