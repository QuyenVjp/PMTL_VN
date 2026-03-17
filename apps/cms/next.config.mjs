import { withSentryConfig } from "@sentry/nextjs";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig = {
  typedRoutes: true,
};

const payloadConfig = withPayload(nextConfig);

export default withSentryConfig(payloadConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  tunnelRoute: "/monitoring",
});

