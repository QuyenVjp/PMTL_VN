import { isServerSentryEnabled } from "@/lib/observability/sentry";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerGracefulShutdown } = await import("@/lib/runtime/shutdown");
    registerGracefulShutdown();

    if (isServerSentryEnabled()) {
      await import("./sentry.server.config");
    }
  }

  if (process.env.NEXT_RUNTIME === "edge" && isServerSentryEnabled()) {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(...args: unknown[]) {
  if (!isServerSentryEnabled()) {
    return;
  }

  const Sentry = await import("@sentry/nextjs");
  await Sentry.captureRequestError(...(args as Parameters<typeof Sentry.captureRequestError>));
}
