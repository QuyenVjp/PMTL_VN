import * as Sentry from "@sentry/nextjs";

type LogLevel = "info" | "warn" | "error";

const isServer = typeof window === "undefined";
const pinoLogger = (() => {
  if (isServer) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pino = require("pino") as typeof import("pino");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createSentryLogStream } = require("./sentry-stream") as typeof import("./sentry-stream");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isServerSentryEnabled } = require("../observability/sentry") as typeof import("../observability/sentry");

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

    return pino(
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
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pinoBrowser = require("pino/browser") as typeof import("pino");
  return pinoBrowser({
    name: "pmtl-web",
    level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
    base: undefined,
    browser: {
      asObject: true,
    },
  });
})();

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

