/**
 * Member HTTP client — browser-side, cookie-first.
 * Self-contained to avoid Turbopack ESM resolution issues with @pmtl/api-client.
 * Mirrors the same envelope-unwrap contract as the shared api-client core.
 */

export type QueryParams = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: QueryParams;
}

const REQUEST_TIMEOUT_MS = 15_000;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`/api${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : null,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (response.status === 204) return undefined as T;

  let json: unknown = null;
  try { json = await response.json(); } catch { json = null; }

  if (!response.ok) {
    const err = (json as { error?: { code?: string; message?: string } })?.error;
    throw new HttpError(
      response.status,
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? "Lỗi không xác định",
    );
  }

  // Auto-unwrap ResponseInterceptor envelope: { data: T, meta }
  const envelope = json as { data?: T };
  if (envelope?.data !== undefined) return envelope.data;
  return json as T;
}

export const memberClient = {
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
