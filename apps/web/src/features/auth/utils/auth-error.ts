import type { AuthApiErrorResponse } from "../types";

export class WebAuthError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export async function readAuthError(response: Response): Promise<WebAuthError> {
  try {
    const payload = (await response.json()) as AuthApiErrorResponse;

    return new WebAuthError(
      payload.error?.code ?? "AUTH_UNKNOWN",
      payload.error?.message ?? "Auth request failed.",
      response.status,
    );
  } catch {
    return new WebAuthError("AUTH_UNKNOWN", "Auth request failed.", response.status);
  }
}

