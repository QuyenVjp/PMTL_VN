export function normalizeDockerHostnameUrl(rawUrl: string | undefined, dockerHostname: string, localHostname: string): string | null {
  const value = rawUrl?.trim();

  if (!value) {
    return null;
  }

  if (process.platform !== "win32") {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname === dockerHostname) {
      parsed.hostname = localHostname;
      return parsed.toString();
    }
  } catch {
    return value;
  }

  return value;
}
