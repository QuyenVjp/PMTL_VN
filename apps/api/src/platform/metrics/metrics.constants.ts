export const METRICS_CONSTANTS = {
  PREFIX: "pmtl_api_",
  LABELS: {
    METHOD: "method",
    PATH: "path",
    STATUS: "status",
    ENDPOINT: "endpoint",
  },
} as const;

export const METRIC_NAMES = {
  HTTP_REQUESTS_TOTAL: "http_requests_total",
  HTTP_REQUEST_DURATION_SECONDS: "http_request_duration_seconds",
  HTTP_REQUEST_SIZE_BYTES: "http_request_size_bytes",
  HTTP_RESPONSE_SIZE_BYTES: "http_response_size_bytes",
  UPLOAD_TOTAL: "upload_total",
  UPLOAD_SIZE_BYTES: "upload_size_bytes",
  RATE_LIMIT_HITS_TOTAL: "rate_limit_hits_total",
  AUTH_ATTEMPTS_TOTAL: "auth_attempts_total",
  DB_QUERY_DURATION_SECONDS: "db_query_duration_seconds",
} as const;
