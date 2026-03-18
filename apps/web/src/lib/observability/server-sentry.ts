import * as Sentry from "@sentry/node";

import { getWebServerSentryOptions, isServerSentryEnabled } from "@/lib/observability/sentry";

let initialized = false;

function ensureInitialized() {
  if (initialized || !isServerSentryEnabled()) {
    return isServerSentryEnabled();
  }

  Sentry.init({
    ...getWebServerSentryOptions(),
    defaultIntegrations: false,
  });
  initialized = true;
  return true;
}

export function captureWebServerException(error: unknown, context?: Record<string, unknown>) {
  if (!ensureInitialized()) {
    return "sentry-disabled";
  }

  return Sentry.withScope((scope) => {
    scope.setTag("app", "web");

    if (context) {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
    }

    return Sentry.captureException(error);
  });
}

export function captureWebServerMessage(message: string, context?: Record<string, unknown>) {
  if (!ensureInitialized()) {
    return "sentry-disabled";
  }

  return Sentry.withScope((scope) => {
    scope.setTag("app", "web");

    if (context) {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
    }

    return Sentry.captureMessage(message, "warning");
  });
}

export async function flushWebServerSentry(timeoutMs = 2000) {
  if (!ensureInitialized()) {
    return false;
  }

  return Sentry.flush(timeoutMs);
}

export async function closeWebServerSentry(timeoutMs = 2000) {
  if (!ensureInitialized()) {
    return false;
  }

  return Sentry.close(timeoutMs);
}
