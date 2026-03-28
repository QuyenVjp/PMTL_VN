/**
 * Core HTTP client factory — typed, envelope-aware, cookie-first auth.
 *
 * Auto-unwraps the backend ResponseInterceptor envelope:
 *   Backend returns: { data: T, meta: { timestamp, requestId, path } }
 *   Client returns:  T (just the data)
 *
 * Error handling matches GlobalExceptionFilter canon envelope:
 *   Backend returns: { error: { code, message, status, requestId, details? } }
 *   Client throws:   HttpError(status, { code, message, details })
 */
import { HttpError } from "./http-error.js";
import type { ApiErrorPayload } from "./http-error.js";
import type { ApiSuccessEnvelope, ApiErrorEnvelope } from "./envelopes.js";

export type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: QueryParams;
}

const REQUEST_TIMEOUT_MS = 15_000;

export function createAdminClient(baseUrl: string) {
  function buildUrl(path: string, params?: QueryParams): string {
    const url = new URL(`${baseUrl}${path}`, window.location.origin);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, params } = options;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(buildUrl(path, params), {
      method,
      headers,
      credentials: "include",
      // exactOptionalPropertyTypes: body must be null (not undefined) when absent
      body: body !== undefined ? JSON.stringify(body) : null,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 204) {
      return undefined as T;
    }

    let json: unknown = null;
    try {
      json = await response.json();
    } catch {
      json = null;
    }

    if (!response.ok) {
      const envelope = json as ApiErrorEnvelope;
      const err = envelope?.error;
      if (err) {
        const payload: ApiErrorPayload = {
          code: err.code ?? "UNKNOWN_ERROR",
          message: err.message ?? "Lỗi không xác định",
        };
        if (err.details !== undefined) {
          payload.details = err.details;
        }
        throw new HttpError(response.status, payload);
      }
      throw new HttpError(response.status, {
        code: "UNKNOWN_ERROR",
        message: "Lỗi không xác định",
      });
    }

    // Auto-unwrap ResponseInterceptor envelope: { data: T, meta }
    const envelope = json as ApiSuccessEnvelope<T>;
    if (envelope.data !== undefined) {
      return envelope.data;
    }

    return json as T;
  }

  return {
    get<T>(path: string, params?: QueryParams) {
      return request<T>(path, params !== undefined ? { params } : {});
    },
    post<T>(path: string, body?: unknown) {
      return request<T>(path, { method: "POST", body });
    },
    patch<T>(path: string, body?: unknown) {
      return request<T>(path, { method: "PATCH", body });
    },
    delete<T>(path: string) {
      return request<T>(path, { method: "DELETE" });
    },
  };
}

export type ApiClient = ReturnType<typeof createAdminClient>;
