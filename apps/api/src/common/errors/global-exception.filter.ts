import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response, Request } from "express";
import type { Logger } from "nestjs-pino";
import { AppError } from "./app-error.js";

interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    timestamp: string;
    requestId?: string;
    path: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

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
        {
          code,
          message,
          details,
          path: request.url,
          requestId,
        },
        `App error: ${code}`,
      );
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        code = (resp.error as string) ?? "HTTP_ERROR";
        message = (resp.message as string) ?? exception.message;
      } else {
        message = exception.message;
      }

      this.logger.warn(
        {
          code,
          message,
          statusCode,
          path: request.url,
          requestId,
        },
        `HTTP exception: ${statusCode}`,
      );
    } else if (exception instanceof Error) {
      this.logger.error(
        {
          err: {
            message: exception.message,
            stack: exception.stack,
            name: exception.name,
          },
          path: request.url,
          requestId,
        },
        `Unhandled error: ${exception.message}`,
      );
    } else {
      this.logger.error(
        {
          exception,
          path: request.url,
          requestId,
        },
        "Unknown exception",
      );
    }

    const envelope: ErrorEnvelope = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        path: request.url,
      },
    };

    response.status(statusCode).json(envelope);
  }
}
