import * as Sentry from "@sentry/react";

let sentryReady = false;

export function initAdminSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    sentryReady = false;
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? "development",
    release: import.meta.env.VITE_SENTRY_RELEASE,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? "0"),
  });

  sentryReady = true;
}

export function captureAdminException(
  error: unknown,
  context?: { componentStack?: string | null },
): void {
  if (!sentryReady) {
    return;
  }
  Sentry.captureException(error, {
    extra: {
      componentStack: context?.componentStack,
    },
  });
}
