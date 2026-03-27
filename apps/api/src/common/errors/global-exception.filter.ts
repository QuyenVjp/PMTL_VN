/**
 * Global Exception Filter — HTTP error envelope authority
 *
 * Constitution: design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
 * "global exception filter standardizes error envelope" — pipeline position #10
 *
 * Error envelope canon format:
 * { error: { code, message, status, requestId, details? } }
 *
 * Registered via APP_FILTER provider (NOT app.useGlobalFilters).
 * No stack trace leak to production client.
 * Validation errors: safe field-level details.
 * Auth errors: avoid enumeration.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import type { Response, Request } from "express";
import { Logger } from "nestjs-pino";
import { AppError } from "./app-error.js";

interface CanonErrorEnvelope {
  error: {
    code: string;
    message: string;
    status: number;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.headers["x-request-id"] as string | undefined;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "Lỗi hệ thống";
    let details: Record<string, unknown> | undefined;

    if (exception instanceof AppError) {
      statusCode = exception.statusCode;
      code = exception.code;
      message = exception.message;
      details = exception.details;

      this.logger.warn(
        { code, statusCode, details, path: request.url, requestId },
        `App error: ${code}`,
      );
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = (resp.code as string) ?? (resp.error as string) ?? "HTTP_ERROR";
        message = (resp.message as string) ?? exception.message;
        if (resp.detail && typeof resp.detail === "object") {
          details = resp.detail as Record<string, unknown>;
        }
      } else {
        message = exception.message;
      }

      this.logger.warn(
        { code, statusCode, path: request.url, requestId },
        `HTTP exception: ${statusCode}`,
      );
    } else if (exception instanceof Error) {
      // No stack trace leak to production client
      this.logger.error(
        {
          err: { message: exception.message, stack: exception.stack, name: exception.name },
          path: request.url,
          requestId,
        },
        `Unhandled error: ${exception.message}`,
      );
    } else {
      this.logger.error(
        { exception, path: request.url, requestId },
        "Unknown exception",
      );
    }

    const envelope: CanonErrorEnvelope = {
      error: {
        code,
        message,
        status: statusCode,
        requestId,
        ...(details && { details }),
      },
    };

    response.status(statusCode).json(envelope);
  }
}
