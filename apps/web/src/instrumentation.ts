import { isServerSentryEnabled } from "@/lib/observability/sentry";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerGracefulShutdown } = await import("@/lib/runtime/shutdown");
    registerGracefulShutdown();
  }
}

export async function onRequestError(...args: unknown[]) {
  if (!isServerSentryEnabled()) {
    return;
  }

  const error = args[0] instanceof Error ? args[0] : new Error("Next request error");
  const { captureWebServerException } = await import("@/lib/observability/server-sentry");
  captureWebServerException(error, {
    request_error_args: args.map((value) =>
      value instanceof Error
        ? value.message
        : typeof value === "string"
          ? value
          : typeof value,
    ),
  });
}
