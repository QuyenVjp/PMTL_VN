import * as Sentry from "@sentry/node";
import type { ConfigService } from "../config/config.service.js";

let sentryEnabled = false;

export function initApiSentry(config: ConfigService): void {
  if (!config.sentryDsn) {
    sentryEnabled = false;
    return;
  }

  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.sentryEnvironment,
    release: config.sentryRelease,
    tracesSampleRate: config.sentryTracesSampleRate,
    profilesSampleRate: config.sentryProfilesSampleRate,
  });

  sentryEnabled = true;
}

export function captureApiException(error: unknown): void {
  if (!sentryEnabled) {
    return;
  }
  Sentry.captureException(error);
}
