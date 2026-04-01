function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

/**
 * Resolve media source URL for admin rendering.
 *
 * - Keep full URL by default (preserve signed query params).
 * - In local dev (loopback -> loopback), route via current origin proxy by
 *   returning pathname + search to avoid direct cross-port coupling.
 */
export function resolveMediaSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/")) return url;

  try {
    const parsed = new URL(url);
    if (typeof window !== "undefined" && isLoopbackHost(window.location.hostname) && isLoopbackHost(parsed.hostname)) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

