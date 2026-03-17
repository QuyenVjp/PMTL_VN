import type { NextRequest } from "next/server";

export const CORRELATION_ID_HEADER = "x-correlation-id";
export const REQUEST_IP_HEADER = "x-forwarded-for";

export function getCorrelationId(request: Pick<NextRequest, "headers"> | Headers): string | null {
  const headers = request instanceof Headers ? request : request.headers;
  return headers.get(CORRELATION_ID_HEADER) ?? headers.get("x-request-id");
}

export function getClientIp(request: Pick<NextRequest, "headers"> | Headers): string {
  const headers = request instanceof Headers ? request : request.headers;
  const forwardedFor = headers.get(REQUEST_IP_HEADER);

  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    if (firstIp?.trim()) {
      return firstIp.trim();
    }
  }

  return headers.get("x-real-ip") ?? "unknown";
}

export function cloneHeadersWithCorrelationId(
  request: NextRequest,
  correlationId: string,
): Headers {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_ID_HEADER, correlationId);
  return requestHeaders;
}
