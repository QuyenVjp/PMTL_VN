import { closeRedisClient } from "@/lib/cache/redis";
import { logger } from "@/lib/logger";
import { isServerSentryEnabled } from "@/lib/observability/sentry";

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
