/** Standard success envelope for single-record responses */
export interface SingleEnvelope<T> {
  data: T;
}

/** Standard success envelope for list responses */
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

/** Pagination params sent as query */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}
