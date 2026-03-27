import { HttpError } from "./http-error.js";

const BASE_URL = "/api";

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
  });

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  interface ApiErrorShape {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  }
  interface ApiResponseShape {
    error?: ApiErrorShape;
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  }

  const json = (await response.json()) as ApiResponseShape;

  if (!response.ok) {
    const error: ApiErrorShape = json.error ?? json;
    throw new HttpError(response.status, {
      code: error.code ?? "UNKNOWN_ERROR",
      message: error.message ?? "Lỗi không xác định",
      details: error.details,
    });
  }

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
