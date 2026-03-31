export function getCsrfTokenFromCookie(): string | undefined {
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrf_token="))
      ?.split("=")[1];
    return raw ? decodeURIComponent(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function buildCsrfHeader(method: string): Record<string, string> {
  if (["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase())) {
    return {};
  }
  const csrfToken = getCsrfTokenFromCookie();
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
}

