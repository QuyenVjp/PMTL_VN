import { Worker } from "bullmq";
import { QUEUE_NAMES } from "@pmtl/shared";
import pino from "pino";

import { cleanupExpiredGuards } from "@/services/request-guard.service";
import { closeRedisClient, getBullMqConnection } from "@/services/redis.service";
import { processEmailNotificationJob } from "@/workers/processors/email-notification";
import { processPushDispatchJob } from "@/workers/processors/push-dispatch";
import { processSearchSyncJob } from "@/workers/processors/search-sync";
import { getWorkerPayload } from "@/workers/payload";

const logger = pino({
  name: "pmtl-worker",
  level: process.env.LOG_LEVEL ?? "info",
});

const maintenanceIntervalMs = Number(process.env.WORKER_MAINTENANCE_INTERVAL_MS ?? "600000");

async function startWorker() {
  const connection = getBullMqConnection();

  if (!connection) {
    throw new Error("REDIS_URL chưa được cấu hình cho worker.");
  }

  const payload = await getWorkerPayload();
  const workers = [
    new Worker(QUEUE_NAMES.searchSync, processSearchSyncJob, {
      connection,
      concurrency: Number(process.env.WORKER_SEARCH_CONCURRENCY ?? "4"),
    }),
    new Worker(QUEUE_NAMES.pushDispatch, processPushDispatchJob, {
      connection,
      concurrency: Number(process.env.WORKER_PUSH_CONCURRENCY ?? "2"),
    }),
    new Worker(QUEUE_NAMES.emailNotification, processEmailNotificationJob, {
      connection,
      concurrency: Number(process.env.WORKER_EMAIL_CONCURRENCY ?? "2"),
    }),
  ];

  for (const worker of workers) {
    worker.on("completed", (job, result) => {
      logger.info({ queue: worker.name, jobId: job.id, result }, "Worker job completed");
    });

    worker.on("failed", (job, error) => {
      logger.error({ queue: worker.name, jobId: job?.id, error }, "Worker job failed");
    });
  }

  const maintenanceTimer = setInterval(() => {
    void cleanupExpiredGuards(payload)
      .then((removed) => {
        if (removed > 0) {
          logger.info({ removed }, "Expired request guards cleaned");
        }
      })
      .catch((error) => {
        logger.error({ error }, "Failed to cleanup expired request guards");
      });
  }, maintenanceIntervalMs);

  maintenanceTimer.unref();

  const shutdown = async () => {
    clearInterval(maintenanceTimer);
    logger.info("Stopping worker...");
    await Promise.all(workers.map((worker) => worker.close()));
    await closeRedisClient();
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
      queues: Object.values(QUEUE_NAMES),
    },
    "PMTL worker is running",
  );
}

void startWorker().catch((error) => {
  logger.error({ error }, "PMTL worker failed to start");
  process.exit(1);
});
