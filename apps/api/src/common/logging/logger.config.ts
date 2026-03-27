import type { Params } from "nestjs-pino";
import type { Options } from "pino-http";
import { nanoid } from "nanoid";
import { REDACT_PATHS, REQUEST_ID_HEADER } from "./logger.constants.js";

export function createLoggerConfig(isDevelopment: boolean): Params {
  const pinoHttpOptions: Options = {
    level: isDevelopment ? "debug" : "info",
    transport: isDevelopment
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
    redact: {
      paths: REDACT_PATHS,
      censor: "[REDACTED]",
    },
    genReqId: (req) => {
      const existingId = req.headers[REQUEST_ID_HEADER];
      if (typeof existingId === "string" && existingId.length > 0) {
        return existingId;
      }
      return nanoid();
    },
    customProps: () => ({
      context: "HTTP",
    }),
    autoLogging: {
      ignore: (req) => {
        const url = req.url ?? "";
        return url.startsWith("/api/health") || url.startsWith("/api/metrics");
      },
    },
  };

  return {
    pinoHttp: pinoHttpOptions,
  };
}
