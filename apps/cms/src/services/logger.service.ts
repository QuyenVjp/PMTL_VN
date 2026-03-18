import pino from "pino";
import pretty from "pino-pretty";

import { createSentryLogStream } from "@/services/pino-sentry-stream.service";
import { isServerSentryEnabled } from "@/services/observability/sentry.service";

type LogContext = Record<string, unknown>;

const rootLoggerOptions: pino.LoggerOptions = {
  name: "pmtl-cms",
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    app: "cms",
    env: process.env.NODE_ENV ?? "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    error: pino.stdSerializers.err,
    err: pino.stdSerializers.err,
  },
};

const prettyStream =
  process.env.NODE_ENV === "production"
    ? null
    : pretty({
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
      });

const sentryEnabled = isServerSentryEnabled();
const sentryStream = createSentryLogStream({
  app: "cms",
  enabled: sentryEnabled,
  sentry: {
    captureException(error, context) {
      if (!sentryEnabled) {
        return;
      }

      void import("@sentry/nextjs").then((Sentry) => {
        const capture = () => {
          Sentry.captureException(error);
        };

        const scopeHandler = (scope: { setTag: (key: string, value: string) => void; setExtra: (key: string, value: unknown) => void }) => {
          scope.setTag("app", "cms");
          for (const [key, value] of Object.entries(context)) {
            scope.setExtra(key, value);
          }
          capture();
        };

        if (typeof Sentry.withScope === "function") {
          Sentry.withScope(scopeHandler);
          return;
        }

        capture();
      });
    },
    captureMessage(message, context) {
      if (!sentryEnabled) {
        return;
      }

      void import("@sentry/nextjs").then((Sentry) => {
        const capture = () => {
          Sentry.captureMessage(message, "warning");
        };

        const scopeHandler = (scope: { setTag: (key: string, value: string) => void; setExtra: (key: string, value: unknown) => void }) => {
          scope.setTag("app", "cms");
          for (const [key, value] of Object.entries(context)) {
            scope.setExtra(key, value);
          }
          capture();
        };

        if (typeof Sentry.withScope === "function") {
          Sentry.withScope(scopeHandler);
          return;
        }

        capture();
      });
    },
  },
});

const rootLogger = pino(
  rootLoggerOptions,
  pino.multistream([
    {
      stream: prettyStream ?? process.stdout,
    },
    ...(sentryStream ? [{ level: "warn" as const, stream: sentryStream }] : []),
  ]),
);

export function normalizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
}

export function withError(context: LogContext | undefined, error: unknown): LogContext {
  return {
    ...(context ?? {}),
    error: normalizeError(error),
  };
}

export function getLogger(scope?: string) {
  return scope ? rootLogger.child({ scope }) : rootLogger;
}

export const logger = getLogger();
