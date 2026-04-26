/**
 * API Envelope Types — matches backend ResponseInterceptor + GlobalExceptionFilter
 *
 * Backend success: { data: T, meta: { timestamp, requestId, path } }
 * Backend error:   { error: { code, message, status, requestId, traceId, details? } }
 *
 * The client auto-unwraps the success envelope, so callers receive T directly.
 */

export interface ApiSuccessEnvelope<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId?: string;
    path: string;
  };
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    status: number;
    requestId?: string;
    traceId?: string;
    details?: Record<string, unknown>;
  };
}

/** Standard list response — inside the data envelope (after auto-unwrap) */
export interface ListEnvelope<T> {
  data: T[];
  meta: {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
}

/** Single-item response — inside the data envelope (after auto-unwrap) */
export interface SingleEnvelope<T> {
  data: T;
}

/** Legacy paginated list shape used by some content routes */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Legacy list response shape (inside data envelope) */
export interface ListResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Pagination query params */
export interface PaginationParams {
  page?: number;
  limit?: number;
}
