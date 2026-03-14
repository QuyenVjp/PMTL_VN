type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, message: string, context?: unknown): void {
  console[level](`[web:${level}] ${message}`, context ?? "");
}

export const logger = {
  info: (message: string, context?: unknown) => write("info", message, context),
  warn: (message: string, context?: unknown) => write("warn", message, context),
  error: (message: string, context?: unknown) => write("error", message, context),
};

