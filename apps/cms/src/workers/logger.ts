import * as Sentry from "@sentry/node";
import pino from "pino";
import pretty from "pino-pretty";

import { createSentryLogStream } from "@/services/pino-sentry-stream.service";
import { getWorkerSentryOptions, isServerSentryEnabled } from "@/services/observability/sentry.service";

let sentryInitialized = false;

export function initWorkerSentry() {
  if (sentryInitialized) {
    return;
  }

  const options = getWorkerSentryOptions();
  if (!options.enabled || !options.dsn) {
    return;
  }

  Sentry.init(options);
  sentryInitialized = true;
}

const prettyStream =
  process.env.NODE_ENV === "production"
    ? null
    : pretty({
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      });

const sentryStream = createSentryLogStream({
  app: "worker",
  enabled: isServerSentryEnabled(),
  sentry: {
    captureException(error, context) {
      Sentry.withScope((scope) => {
        scope.setTag("app", "worker");
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value);
        }
        Sentry.captureException(error);
      });
    },
    captureMessage(message, context) {
      Sentry.withScope((scope) => {
        scope.setTag("app", "worker");
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value);
        }
        Sentry.captureMessage(message, "warning");
      });
    },
  },
});

export const workerLogger = pino(
  {
    name: "pmtl-worker",
    level: process.env.LOG_LEVEL ?? "info",
    base: {
      app: "worker",
      env: process.env.NODE_ENV ?? "development",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      error: pino.stdSerializers.err,
      err: pino.stdSerializers.err,
    },
  },
  pino.multistream([
    {
      stream: prettyStream ?? process.stdout,
    },
    ...(sentryStream ? [{ level: "warn" as const, stream: sentryStream }] : []),
  ]),
);
