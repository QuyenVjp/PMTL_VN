export interface AppErrorOptions {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  cause?: Error;
}

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.details = options.details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

// Common errors
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super({
      code: "NOT_FOUND",
      message: id ? `${resource} với ID '${id}' không tồn tại` : `${resource} không tồn tại`,
      statusCode: 404,
      details: { resource, id },
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Chưa xác thực") {
    super({
      code: "UNAUTHORIZED",
      message,
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Không có quyền truy cập") {
    super({
      code: "FORBIDDEN",
      message,
      statusCode: 403,
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: "VALIDATION_ERROR",
      message,
      statusCode: 400,
      details,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({
      code: "CONFLICT",
      message,
      statusCode: 409,
      details,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSeconds?: number) {
    super({
      code: "RATE_LIMIT_EXCEEDED",
      message: "Quá nhiều yêu cầu, vui lòng thử lại sau",
      statusCode: 429,
      details: retryAfterSeconds ? { retryAfter: retryAfterSeconds } : undefined,
    });
  }
}

export class InternalError extends AppError {
  constructor(message = "Lỗi hệ thống", cause?: Error) {
    super({
      code: "INTERNAL_ERROR",
      message,
      statusCode: 500,
      cause,
    });
  }
}
