/**
 * API Envelope Types — matches backend ResponseInterceptor + GlobalExceptionFilter
 *
 * Backend success: { data: T, meta: { timestamp, requestId, path } }
 * Backend error:   { error: { code, message, status, requestId, details? } }
 *
 * The admin client auto-unwraps the success envelope, so callers
 * receive T directly — these types describe what services return.
 */

/** Backend ResponseInterceptor wraps all success responses in this shape */
export interface ApiSuccessEnvelope<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId?: string;
    path: string;
  };
}

/** Backend GlobalExceptionFilter wraps all errors in this shape */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    status: number;
    requestId?: string;
    details?: Record<string, unknown>;
  };
}

/** Pagination shape returned by list services */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Standard list response shape from services (inside the data envelope) */
export interface ListResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Pagination params sent as query */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Legacy envelope types — backward-compatible with admin service response shapes.
 *
 * Backend admin services return { data: T } and { data: T[], meta: { pagination } }.
 * The admin client auto-unwraps the ResponseInterceptor's outer envelope,
 * so callers receive the service response directly — these types match that.
 */
export interface SingleEnvelope<T> {
  data: T;
}

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
