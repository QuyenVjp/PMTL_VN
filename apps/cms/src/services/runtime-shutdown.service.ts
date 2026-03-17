import * as Sentry from "@sentry/nextjs";

import { closeRedisClient } from "@/services/redis.service";
import { logger } from "@/services/logger.service";

let shuttingDown = false;
let registered = false;

export function isShuttingDown(): boolean {
  return shuttingDown;
}

async function handleShutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.warn({ signal }, "CMS graceful shutdown initiated");

  await Promise.allSettled([
    closeRedisClient(),
    Sentry.close(2000),
  ]);
}

export function registerGracefulShutdown(): void {
  if (registered || typeof process === "undefined") {
    return;
  }

  registered = true;

  process.on("SIGINT", () => {
    void handleShutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void handleShutdown("SIGTERM");
  });
}
