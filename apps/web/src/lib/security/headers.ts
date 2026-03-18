import type { NextResponse } from "next/server";

const LOCAL_CMS_ORIGINS = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

const REMOTE_IMAGE_ORIGINS = [
  "https://img.youtube.com",
  "https://i.ytimg.com",
  "https://picsum.photos",
];

function readConfiguredOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function buildCsp() {
  const siteOrigin = readConfiguredOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const cmsOrigin = readConfiguredOrigin(process.env.CMS_PUBLIC_URL) ?? readConfiguredOrigin(process.env.PAYLOAD_PUBLIC_SERVER_URL);
  const connectSrc = ["'self'", ...LOCAL_CMS_ORIGINS, ...REMOTE_IMAGE_ORIGINS];
  const imgSrc = ["'self'", "data:", "blob:", ...LOCAL_CMS_ORIGINS, ...REMOTE_IMAGE_ORIGINS];

  if (siteOrigin) {
    connectSrc.push(siteOrigin);
  }

  if (cmsOrigin) {
    connectSrc.push(cmsOrigin);
    imgSrc.push(cmsOrigin);
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "font-src 'self' data:",
    "img-src " + imgSrc.join(" "),
    "media-src 'self' blob: https:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src " + [...new Set(connectSrc)].join(" "),
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  ].join("; ");
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("content-security-policy", buildCsp());
  response.headers.set("cross-origin-opener-policy", "same-origin");
  response.headers.set("cross-origin-resource-policy", "same-site");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");

  return response;
}
