import { withSentryConfig } from "@sentry/nextjs";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig = {
  typedRoutes: true,
};

const payloadConfig = withPayload(nextConfig);
const sentryConfig = {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  tunnelRoute: "/monitoring",
};

export default withSentryConfig(payloadConfig, sentryConfig);

