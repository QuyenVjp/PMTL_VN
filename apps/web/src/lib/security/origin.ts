const DEFAULT_ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.CMS_PUBLIC_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

export function getAllowedOrigins(): string[] {
  const configured = process.env.SECURITY_ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return [...new Set([...(configured ?? []), ...DEFAULT_ALLOWED_ORIGINS.filter(Boolean) as string[]])];
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) {
    return false;
  }

  return getAllowedOrigins().includes(origin);
}
