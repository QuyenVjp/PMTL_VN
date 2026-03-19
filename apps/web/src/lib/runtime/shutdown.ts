import { closeRedisClient } from "@/lib/cache/redis";
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
  console.warn("[pmtl-web] Web graceful shutdown initiated", { signal });

  const sentryClose = isServerSentryEnabled()
    ? import("@/lib/observability/server-sentry")
        .then(({ closeWebServerSentry }) => closeWebServerSentry(2000))
        .catch(() => false)
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
