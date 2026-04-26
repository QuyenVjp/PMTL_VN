export interface ApiErrorPayload {
  code: string;
  message: string;
  requestId?: string;
  traceId?: string;
  details?: Record<string, unknown>;
}

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly traceId?: string;
  readonly details?: Record<string, unknown>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "HttpError";
    this.status = status;
    this.code = payload.code;
    if (payload.requestId !== undefined) {
      this.requestId = payload.requestId;
    }
    if (payload.traceId !== undefined) {
      this.traceId = payload.traceId;
    }
    if (payload.details !== undefined) {
      this.details = payload.details;
    }
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isConflict() {
    return this.status === 409;
  }
}
