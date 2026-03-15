import pino from "pino";

type LogContext = Record<string, unknown>;
type TransportTargetOptions = NonNullable<pino.LoggerOptions["transport"]>;

function getTransportOptions(): TransportTargetOptions | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  return {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
      singleLine: false,
    },
  };
}

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

const transportOptions = getTransportOptions();
if (transportOptions) {
  rootLoggerOptions.transport = transportOptions;
}

const rootLogger = pino(rootLoggerOptions);

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
