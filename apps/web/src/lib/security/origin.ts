const DEFAULT_ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.CMS_PUBLIC_URL,
  process.env.PAYLOAD_PUBLIC_SERVER_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

export function getAllowedOrigins(): string[] {
  const configured = process.env.SECURITY_ALLOWED_ORIGINS
    ?.split(",")
    .map((value) => normalizeOrigin(value.trim()))
    .filter((value): value is string => Boolean(value));

  return [
    ...new Set(
      [...(configured ?? []), ...DEFAULT_ALLOWED_ORIGINS.map((value) => normalizeOrigin(value)).filter((value): value is string => Boolean(value))],
    ),
  ];
}

export function isAllowedOrigin(origin: string | null): boolean {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  return getAllowedOrigins().includes(normalizedOrigin);
}
