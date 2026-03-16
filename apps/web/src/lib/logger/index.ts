import pino from "pino";
import * as Sentry from "@sentry/nextjs";

import { createSentryLogStream } from "@/lib/logger/sentry-stream";
import { isServerSentryEnabled } from "@/lib/observability/sentry";

type LogLevel = "info" | "warn" | "error";

const sentryStream = createSentryLogStream({
  app: "web",
  enabled: isServerSentryEnabled(),
  sentry: {
    captureException(error, context) {
      Sentry.withScope((scope) => {
        scope.setTag("app", "web");
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value);
        }
        Sentry.captureException(error);
      });
    },
    captureMessage(message, context) {
      Sentry.withScope((scope) => {
        scope.setTag("app", "web");
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value);
        }
        Sentry.captureMessage(message, "warning");
      });
    },
  },
});

const pinoLogger = pino(
  {
    name: "pmtl-web",
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      error: pino.stdSerializers.err,
      err: pino.stdSerializers.err,
    },
  },
  pino.multistream([
    { stream: process.stdout },
    ...(sentryStream ? [{ level: "warn" as const, stream: sentryStream }] : []),
  ]),
);

function write(level: LogLevel, message: string, context?: unknown): void {
  if (context && typeof context === "object") {
    pinoLogger[level](context, message);
    return;
  }

  if (context !== undefined) {
    pinoLogger[level]({ context }, message);
    return;
  }

  pinoLogger[level](message);
}

export const logger = {
  info: (message: string, context?: unknown) => write("info", message, context),
  warn: (message: string, context?: unknown) => write("warn", message, context),
  error: (message: string, context?: unknown) => write("error", message, context),
};

