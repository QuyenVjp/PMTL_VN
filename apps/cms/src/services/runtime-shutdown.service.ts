import { closeRedisClient } from "@/services/redis.service";
import { logger } from "@/services/logger.service";
import { isServerSentryEnabled } from "@/services/observability/sentry.service";

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

  const sentryClose = isServerSentryEnabled()
    ? import("@sentry/nextjs").then((Sentry) => Sentry.close(2000))
    : Promise.resolve(false);

  await Promise.allSettled([closeRedisClient(), sentryClose]);
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
