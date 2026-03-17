import * as Sentry from "@sentry/nextjs";

import { registerGracefulShutdown } from "@/services/runtime-shutdown.service";

export async function register() {
  registerGracefulShutdown();

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
