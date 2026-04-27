/**
 * Core HTTP client factory — typed, envelope-aware, cookie-first auth.
 *
 * Auto-unwraps the backend ResponseInterceptor envelope:
 *   Backend returns: { data: T, meta: { timestamp, requestId, path } }
 *   Client returns:  T (just the data)
 *
 * Error handling matches GlobalExceptionFilter canon envelope:
 *   Backend returns: { error: { code, message, status, requestId, traceId, details? } }
 *   Client throws:   HttpError(status, { code, message, requestId, traceId, details })
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
  // Singleton promise for in-flight token refresh — deduplicates simultaneous 401s.
  // If three requests fail with 401 at the same time, only one /auth/refresh call is made.
  let refreshInFlight: Promise<boolean> | null = null;

  async function tryRefreshTokens(): Promise<boolean> {
    if (!refreshInFlight) {
      refreshInFlight = fetch(new URL(`${baseUrl}/auth/refresh`, window.location.origin).toString(), {
        method: "POST",
        credentials: "include",
        signal: AbortSignal.timeout(10_000),
      })
        .then((r) => r.ok)
        .catch(() => false)
        .finally(() => {
          refreshInFlight = null;
        });
    }
    return refreshInFlight;
  }

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

  function getCsrfToken(): string | undefined {
    try {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="))
        ?.split("=")[1];
    } catch {
      return undefined;
    }
  }

  async function request<T>(path: string, options: RequestOptions = {}, retrying = false): Promise<T> {
    const { method = "GET", body, params } = options;

    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    // Double-submit cookie CSRF: read non-httpOnly csrf_token cookie and forward as header.
    // Server CsrfGuard verifies header === cookie on all mutation routes.
    if (!["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers["X-CSRF-Token"] = csrfToken;
      }
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
      // On first 401, attempt token refresh once and retry the original request.
      const canRefresh =
        response.status === 401 &&
        !retrying &&
        path !== "/auth/refresh" &&
        path !== "/auth/login" &&
        path !== "/auth/bootstrap-admin" &&
        path !== "/auth/logout" &&
        path !== "/auth/logout-all";

      if (canRefresh) {
        const refreshed = await tryRefreshTokens();
        if (refreshed) {
          return request<T>(path, options, true);
        }
      }

      const envelope = json as ApiErrorEnvelope;
      const err = envelope?.error;
      if (err?.code && err?.message) {
        const payload: ApiErrorPayload = {
          code: err.code,
          message: err.message,
        };
        if (err.requestId !== undefined) {
          payload.requestId = err.requestId;
        }
        if (err.traceId !== undefined) {
          payload.traceId = err.traceId;
        }
        if (err.details !== undefined) {
          payload.details = err.details;
        }
        throw new HttpError(response.status, payload);
      }
      // Non-JSON or unparseable response (e.g. proxy ECONNREFUSED, nginx 502)
      // — surface as a network error, not a fake API message
      throw new HttpError(response.status, {
        code: "NETWORK_ERROR",
        message: "Không thể kết nối máy chủ. Vui lòng kiểm tra lại hoặc thử sau.",
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
    put<T>(path: string, body?: unknown) {
      return request<T>(path, { method: "PUT", body });
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
