export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function logJsonFetchFailure(input: RequestInfo | URL, status: number, error: { message: string; details?: unknown }) {
  if (typeof window === "undefined") {
    const { logger } = await import("@/lib/logger");
    logger.warn("JSON fetch failed", { error, status, url: String(input) });
    return;
  }

  console.warn("JSON fetch failed", {
    error,
    status,
    url: String(input),
  });
}

async function parseErrorResponse(response: Response): Promise<{ message: string; details?: unknown }> {
  try {
    const data = (await response.json()) as Record<string, unknown>;
    return {
      message:
        typeof data.message === "string"
          ? data.message
          : typeof data.error === "string"
            ? data.error
            : response.statusText || `HTTP ${response.status}`,
      details: data.details ?? data.error ?? data,
    };
  } catch {
    return {
      message: response.statusText || `HTTP ${response.status}`,
    };
  }
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      next: init?.next,
      signal: init?.signal ?? controller.signal,
    });

    if (!response.ok) {
      const error = await parseErrorResponse(response);
      await logJsonFetchFailure(input, response.status, error);
      throw new ApiError(error.message, response.status, error.details);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timeout", 408);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

