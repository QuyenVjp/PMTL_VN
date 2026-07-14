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
    /** @deprecated use generatedAt — kept during envelope migration. */
    timestamp: string;
    /** Canonical generation timestamp (API_DTO_SHAPE_PLAN). */
    generatedAt: string;
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

/**
 * Canonical paginated list payload (Phase 4.1 canary shape).
 *
 * Rides INSIDE the transport `data` envelope, so after the client auto-unwraps
 * one layer callers receive this object directly:
 *   wire:   { data: { items, pagination }, meta: { requestId, generatedAt } }
 *   client: { items, pagination }
 *
 * Pagination lives inside the payload (design: API_DTO_SHAPE_PLAN.md "pagination
 * phải nằm trong data"), unlike the legacy ListEnvelope where it was a sibling of data.
 */
export interface PaginatedList<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
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
