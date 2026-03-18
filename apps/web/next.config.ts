import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";

function readConfiguredHostname(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const cmsHostname = readConfiguredHostname(process.env.CMS_PUBLIC_URL) ?? readConfiguredHostname(process.env.PAYLOAD_PUBLIC_SERVER_URL);

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@pmtl/shared", "@pmtl/ui"],
  webpack: (config) => {
    if (!sentryEnabled) {
      config.resolve ??= {};
      config.resolve.alias ??= {};
      config.resolve.alias["@sentry/nextjs"] = path.resolve(__dirname, "src/lib/observability/sentry-stub.ts");
    }

    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: false,
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/api/media/file/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001", pathname: "/api/media/file/**" },
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001", pathname: "/media/**" },
      ...(cmsHostname
        ? [
            { protocol: "https" as const, hostname: cmsHostname, pathname: "/api/media/file/**" },
            { protocol: "https" as const, hostname: cmsHostname, pathname: "/media/**" },
          ]
        : []),
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

const sentryConfig = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  tunnelRoute: "/monitoring",
};

const sentryEnabled =
  process.env.SENTRY_ENABLED === "true" || process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true";

export default sentryEnabled ? withSentryConfig(nextConfig, sentryConfig) : nextConfig;

