/**
 * Global Exception Filter — HTTP error envelope authority
 *
 * Constitution: design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
 * "global exception filter standardizes error envelope" — pipeline position #10
 *
 * Error envelope canon format:
 * { error: { code, message, status, requestId, traceId, details? } }
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
import { captureApiException } from "../monitoring/sentry.js";

interface CanonErrorEnvelope {
  error: {
    code: string;
    message: string;
    status: number;
    requestId?: string;
    traceId?: string;
    details?: Record<string, unknown>;
  };
}

function fieldDetails(fields: string[], message: string): Record<string, unknown> | undefined {
  const uniqueFields = [...new Set(fields.filter((field) => field.length > 0))];
  if (uniqueFields.length === 0) return undefined;

  return {
    properties: Object.fromEntries(
      uniqueFields.map((field) => [field, { errors: [message] }]),
    ),
    fieldErrors: Object.fromEntries(uniqueFields.map((field) => [field, message])),
    fields: uniqueFields,
  };
}

function extractPrismaValidationFields(message: string): string[] {
  const fields = new Set<string>();
  const patterns = [
    /Argument `([^`]+)` is missing/g,
    /Argument `([^`]+)`:/g,
    /Invalid value for argument `([^`]+)`/g,
    /Unknown argument `([^`]+)`/g,
  ];

  for (const pattern of patterns) {
    for (const match of message.matchAll(pattern)) {
      const field = match[1]?.trim();
      if (field) fields.add(field);
    }
  }

  return [...fields];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(Logger) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.headers["x-request-id"] as string | undefined;
    const traceId = (request.headers["x-trace-id"] as string | undefined) ?? requestId;

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
        const rawDetails = resp.detail ?? resp.details;
        if (rawDetails && typeof rawDetails === "object") {
          details = rawDetails as Record<string, unknown>;
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
        fields: [...new Set(exception.issues.map((issue) => issue.path.join(".")).filter(Boolean))],
        fieldErrors: exception.issues.reduce<Record<string, string>>((acc, issue) => {
          const path = issue.path.join(".");
          if (path && !acc[path]) {
            acc[path] = issue.message;
          }
          return acc;
        }, {}),
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
        const target = exception.meta?.target;
        details = fieldDetails(
          Array.isArray(target) ? target.filter((field): field is string => typeof field === "string") : [],
          "Giá trị này đã được dùng.",
        );
      } else if (exception.code === "P2003") {
        statusCode = HttpStatus.BAD_REQUEST;
        code = "INVALID_REFERENCE";
        message = "Dữ liệu tham chiếu không hợp lệ (khóa ngoại).";
        const fieldName = exception.meta?.field_name;
        details = fieldDetails(typeof fieldName === "string" ? [fieldName] : [], "Dữ liệu tham chiếu không hợp lệ.");
      } else if (exception.code === "P2025") {
        statusCode = HttpStatus.NOT_FOUND;
        code = "NOT_FOUND";
        message = "Không tìm thấy bản ghi liên quan.";
      } else if (exception.code === "P2021" || exception.code === "P2022") {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        code = "DB_SCHEMA_MISMATCH";
        message = "Schema cơ sở dữ liệu chưa đồng bộ với API.";
        details = {
          prismaCode: exception.code,
          hint: "Chạy migration mới nhất: pnpm --filter @pmtl/api prisma:migrate:deploy",
        };
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
      message = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường trong form.";
      details = fieldDetails(
        extractPrismaValidationFields(exception.message),
        "Dữ liệu của trường này không hợp lệ.",
      );
      this.logger.error(
        { err: { message: exception.message }, path: request.url, requestId },
        `Prisma validation error`,
      );
    } else if (exception instanceof Error) {
      // No stack trace leak to production client
      captureApiException(exception);
      this.logger.error(
        {
          err: { message: exception.message, stack: exception.stack, name: exception.name },
          path: request.url,
          requestId,
        },
        `Unhandled error: ${exception.message}`,
      );
    } else {
      captureApiException(exception);
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
        traceId,
        ...(details && { details }),
      },
    };

    response.status(statusCode).json(envelope);
  }
}
