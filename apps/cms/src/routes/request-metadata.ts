import { buildReporterIpHash } from "@/services/moderation.service";

export function getRequestIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }

  return headers.get("x-real-ip");
}

export function getRequestIpHash(headers: Headers): string {
  return buildReporterIpHash(getRequestIp(headers));
}
