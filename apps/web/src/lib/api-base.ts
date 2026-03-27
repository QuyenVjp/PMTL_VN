export function resolveApiBaseUrl(rawBaseUrl: string): string {
  const trimmed = rawBaseUrl.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export function getServerApiBaseUrl(): string | null {
  const value = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  return value ? resolveApiBaseUrl(value) : null;
}
