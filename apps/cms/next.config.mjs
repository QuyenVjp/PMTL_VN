import { withSentryConfig } from "@sentry/nextjs";
import { withPayload } from "@payloadcms/next/withPayload";
import path from "node:path";

const nextConfig = {
  typedRoutes: true,
  webpack: (config) => {
    if (!sentryEnabled) {
      config.resolve ??= {};
      config.resolve.alias ??= {};
      config.resolve.alias["@sentry/nextjs"] = path.resolve(import.meta.dirname, "src/services/observability/sentry-stub.ts");
    }

    return config;
  },
};

const payloadConfig = withPayload(nextConfig);
const sentryConfig = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  tunnelRoute: "/monitoring",
};

const sentryEnabled =
  process.env.SENTRY_ENABLED === "true" || process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true";

export default sentryEnabled ? withSentryConfig(payloadConfig, sentryConfig) : payloadConfig;

