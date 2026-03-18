'use client';

import { getCmsClientSentryOptions, isClientSentryEnabled } from "@/services/observability/sentry.service";

const sentryEnabled = isClientSentryEnabled();

if (sentryEnabled) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init(getCmsClientSentryOptions());
  });
}

export const onRouterTransitionStart = (href: string, navigationType: string) => {
  if (!sentryEnabled) {
    return;
  }

  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.captureRouterTransitionStart(href, navigationType);
  });
};
