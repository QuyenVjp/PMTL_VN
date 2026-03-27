import { Injectable } from "@nestjs/common";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

@Injectable()
export class LoggerService {
  constructor(
    @InjectPinoLogger(LoggerService.name)
    private readonly logger: PinoLogger,
  ) {}

  log(message: string, context?: Record<string, unknown>) {
    this.logger.info(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.logger.error(
      {
        ...context,
        err: error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : undefined,
      },
      message,
    );
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.logger.warn(context ?? {}, message);
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.logger.debug(context ?? {}, message);
  }

  trace(message: string, context?: Record<string, unknown>) {
    this.logger.trace(context ?? {}, message);
  }

  child(): PinoLogger {
    return this.logger;
  }
}
