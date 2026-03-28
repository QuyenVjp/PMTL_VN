/**
 * Admin API Client — typed, envelope-aware, cookie-first auth
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
import type { ApiSuccessEnvelope, ApiErrorEnvelope } from "./envelopes.js";

const BASE_URL = "/api";
const REQUEST_TIMEOUT_MS = 15_000;

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);

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

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // 204 No Content
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
    // Extract from canon error envelope: { error: { code, message, status, requestId, details? } }
    const envelope = json as ApiErrorEnvelope;
    const err = envelope.error;
    if (err) {
      throw new HttpError(response.status, {
        code: err.code ?? "UNKNOWN_ERROR",
        message: err.message ?? "Lỗi không xác định",
        details: err.details,
      });
    }
    // Fallback for non-canon error responses
    throw new HttpError(response.status, {
      code: "UNKNOWN_ERROR",
      message: "Lỗi không xác định",
    });
  }

  // Auto-unwrap success envelope from ResponseInterceptor: { data: T, meta }
  const envelope = json as ApiSuccessEnvelope<T>;
  if (envelope.data !== undefined) {
    return envelope.data;
  }

  // Fallback for responses not wrapped by interceptor
  return json as T;
}

export const adminClient = {
  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    return request<T>(path, { params });
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
