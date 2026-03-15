import pino from "pino";

type LogLevel = "info" | "warn" | "error";

const pinoLogger = pino({
  name: "pmtl-web",
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

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

