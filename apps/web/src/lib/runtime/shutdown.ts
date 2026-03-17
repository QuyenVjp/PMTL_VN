import * as Sentry from "@sentry/nextjs";

import { closeRedisClient } from "@/lib/cache/redis";
import { logger } from "@/lib/logger";

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
  logger.warn("Web graceful shutdown initiated", { signal });

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
