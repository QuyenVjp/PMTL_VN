import { Writable } from "node:stream";

type SentryCapture = {
  captureException: (error: Error, context: Record<string, unknown>) => void;
  captureMessage: (message: string, context: Record<string, unknown>) => void;
};

type SentryStreamOptions = {
  app: string;
  enabled: boolean;
  sentry: SentryCapture;
};

type PinoLogRecord = {
  level?: number;
  msg?: string;
  err?: Record<string, unknown>;
  error?: Record<string, unknown>;
  [key: string]: unknown;
};

function buildError(candidate: unknown) {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const source = candidate as Record<string, unknown>;
  const message = typeof source.message === "string" ? source.message : "Structured log error";
  const error = new Error(message);

  if (typeof source.name === "string") {
    error.name = source.name;
  }

  if (typeof source.stack === "string") {
    error.stack = source.stack;
  }

  return error;
}

function extractContext(record: PinoLogRecord, app: string) {
  const { level, msg, err, error, time, ...rest } = record;

  return {
    app,
    time,
    ...(msg ? { logMessage: msg } : {}),
    ...rest,
  };
}

export function createSentryLogStream(options: SentryStreamOptions) {
  if (!options.enabled) {
    return null;
  }

  return new Writable({
    write(chunk, _encoding, callback) {
      try {
        const text = chunk.toString().trim();
        if (!text) {
          callback();
          return;
        }

        const record = JSON.parse(text) as PinoLogRecord;
        const level = record.level ?? 30;
        const context = extractContext(record, options.app);
        const error = buildError(record.error ?? record.err);

        if (error || level >= 50) {
          options.sentry.captureException(error ?? new Error(record.msg ?? "Unknown logger error"), context);
        } else if (level >= 40) {
          options.sentry.captureMessage(record.msg ?? "Warning log", context);
        }

        callback();
      } catch (error) {
        callback(error as Error);
      }
    },
  });
}
