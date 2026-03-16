type SentryRuntime = "web";

function getNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBooleanEnv(name: string, fallback = false) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  return raw === "1" || raw.toLowerCase() === "true";
}

export function getSentryEnvironment() {
  return process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

export function getServerDsn() {
  return process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";
}

export function getClientDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN ?? "";
}

export function isServerSentryEnabled() {
  return getBooleanEnv("SENTRY_ENABLED", process.env.NODE_ENV === "production") && getServerDsn().length > 0;
}

export function isClientSentryEnabled() {
  return getBooleanEnv("NEXT_PUBLIC_SENTRY_ENABLED", process.env.NODE_ENV === "production") && getClientDsn().length > 0;
}

function getCommonOptions(runtime: SentryRuntime) {
  return {
    environment: getSentryEnvironment(),
    release: process.env.SENTRY_RELEASE,
    enabled: runtime === "web" ? isServerSentryEnabled() : false,
    sendDefaultPii: false,
    tracesSampleRate: getNumberEnv("SENTRY_TRACES_SAMPLE_RATE", process.env.NODE_ENV === "production" ? 0.1 : 1),
    normalizeDepth: 6,
  };
}

export function getWebServerSentryOptions() {
  return {
    ...getCommonOptions("web"),
    dsn: getServerDsn(),
  };
}

export function getWebEdgeSentryOptions() {
  return {
    environment: getSentryEnvironment(),
    release: process.env.SENTRY_RELEASE,
    enabled: isServerSentryEnabled(),
    dsn: getServerDsn(),
    tracesSampleRate: getNumberEnv("SENTRY_TRACES_SAMPLE_RATE", process.env.NODE_ENV === "production" ? 0.1 : 1),
    sendDefaultPii: false,
  };
}

export function getWebClientSentryOptions() {
  return {
    environment: getSentryEnvironment(),
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE ?? process.env.SENTRY_RELEASE,
    enabled: isClientSentryEnabled(),
    dsn: getClientDsn(),
    tracesSampleRate: getNumberEnv(
      "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
      getNumberEnv("SENTRY_TRACES_SAMPLE_RATE", process.env.NODE_ENV === "production" ? 0.1 : 1),
    ),
    replaysSessionSampleRate: getNumberEnv("NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE", 0),
    replaysOnErrorSampleRate: getNumberEnv("NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE", 0),
    sendDefaultPii: false,
  };
}
