// Core HTTP primitives — usable by any app
export { createAdminClient } from "./core/client.js";
export type { ApiClient, QueryParams } from "./core/client.js";
export { HttpError } from "./core/http-error.js";
export type { ApiErrorPayload } from "./core/http-error.js";
export type {
  ApiSuccessEnvelope,
  ApiErrorEnvelope,
  ListEnvelope,
  SingleEnvelope,
  PaginatedList,
  PaginationMeta,
  ListResponse,
  PaginationParams,
} from "./core/envelopes.js";

// Admin-scoped client + query factories
export * from "./admin/index.js";
