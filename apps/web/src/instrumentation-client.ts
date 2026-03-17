import { getWebClientSentryOptions } from "@/lib/observability/sentry";

const sentryEnabled =
  process.env.NODE_ENV !== "development" &&
  process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true";

if (sentryEnabled) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init(getWebClientSentryOptions());
  });
}

export const onRouterTransitionStart = (...args: unknown[]) => {
  if (!sentryEnabled) {
    return;
  }

  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureRouterTransitionStart(...(args as [string]));
  });
};
