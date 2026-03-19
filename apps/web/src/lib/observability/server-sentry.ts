import { getWebServerSentryOptions, isServerSentryEnabled } from "@/lib/observability/sentry";

type SentryScope = {
  setTag(key: string, value: string): void;
  setExtra(key: string, value: unknown): void;
};

type SentryModule = {
  init(options: Record<string, unknown>): void;
  withScope<T>(callback: (scope: SentryScope) => T): T;
  captureException(error: unknown): string;
  captureMessage(message: string, level?: string): string;
  flush(timeoutMs?: number): Promise<boolean>;
  close(timeoutMs?: number): Promise<boolean>;
};

let initialized = false;
let sentryModule: SentryModule | null = null;

function isEdgeRuntime() {
  return "EdgeRuntime" in globalThis || process.env.NEXT_RUNTIME === "edge";
}

function getSentryModule() {
  if (sentryModule || isEdgeRuntime()) {
    return sentryModule;
  }

  try {
    const localRequire = Function("return require")() as NodeRequire;
    sentryModule = localRequire("@sentry/node") as SentryModule;
  } catch {
    sentryModule = null;
  }

  return sentryModule;
}

function ensureInitialized() {
  if (initialized || !isServerSentryEnabled()) {
    return isServerSentryEnabled();
  }

  const sentry = getSentryModule();
  if (!sentry) {
    return false;
  }

  sentry.init({
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

  const sentry = getSentryModule();
  if (!sentry) {
    return "sentry-disabled";
  }

  return sentry.withScope((scope) => {
    scope.setTag("app", "web");

    if (context) {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
    }

    return sentry.captureException(error);
  });
}

export function captureWebServerMessage(message: string, context?: Record<string, unknown>) {
  if (!ensureInitialized()) {
    return "sentry-disabled";
  }

  const sentry = getSentryModule();
  if (!sentry) {
    return "sentry-disabled";
  }

  return sentry.withScope((scope) => {
    scope.setTag("app", "web");

    if (context) {
      for (const [key, value] of Object.entries(context)) {
        scope.setExtra(key, value);
      }
    }

    return sentry.captureMessage(message, "warning");
  });
}

export async function flushWebServerSentry(timeoutMs = 2000) {
  if (!ensureInitialized()) {
    return false;
  }

  const sentry = getSentryModule();
  return sentry ? sentry.flush(timeoutMs) : false;
}

export async function closeWebServerSentry(timeoutMs = 2000) {
  if (!ensureInitialized()) {
    return false;
  }

  const sentry = getSentryModule();
  return sentry ? sentry.close(timeoutMs) : false;
}
