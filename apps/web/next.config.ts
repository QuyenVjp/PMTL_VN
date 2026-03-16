import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@pmtl/shared", "@pmtl/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/api/media/file/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001", pathname: "/api/media/file/**" },
      { protocol: "http", hostname: "localhost", port: "3001", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001", pathname: "/media/**" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
});

