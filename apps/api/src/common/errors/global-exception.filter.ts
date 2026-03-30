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
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
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
    } else if (exception instanceof ZodError) {
      statusCode = HttpStatus.BAD_REQUEST;
      code = "VALIDATION_ERROR";
      message = "Dữ liệu không hợp lệ";
      details = {
        issues: exception.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      };

      this.logger.warn(
        { code, statusCode, details, path: request.url, requestId },
        "Zod validation error",
      );
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 unique constraint, P2025 not found, etc.
      if (exception.code === "P2002") {
        statusCode = HttpStatus.CONFLICT;
        code = "CONFLICT";
        message = "Dữ liệu đã tồn tại (unique constraint).";
      } else if (exception.code === "P2025") {
        statusCode = HttpStatus.NOT_FOUND;
        code = "NOT_FOUND";
        message = "Không tìm thấy bản ghi liên quan.";
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        code = "DB_ERROR";
        message = "Lỗi truy vấn dữ liệu.";
      }
      this.logger.error(
        { prismaCode: exception.code, meta: exception.meta, path: request.url, requestId },
        `Prisma error ${exception.code}: ${exception.message}`,
      );
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      code = "VALIDATION_ERROR";
      message = "Dữ liệu không hợp lệ (Prisma validation).";
      this.logger.error(
        { err: { message: exception.message }, path: request.url, requestId },
        `Prisma validation error`,
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
