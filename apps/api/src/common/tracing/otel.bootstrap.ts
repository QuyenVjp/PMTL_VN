/**
 * OpenTelemetry SDK bootstrap — must be imported FIRST in main.ts (before NestFactory).
 *
 * Opt-in: only activates when OTEL_EXPORTER_OTLP_ENDPOINT is set.
 * No-op in local dev unless the env var is configured.
 *
 * Instruments:
 *  - HTTP in/out (via @opentelemetry/instrumentation-http)
 *  - Prisma queries (via @prisma/instrumentation)
 *
 * Wire format: OTLP/HTTP → Grafana Tempo or any OTLP-compatible backend.
 * Env vars:
 *   OTEL_EXPORTER_OTLP_ENDPOINT — e.g. http://tempo:4318  (required to activate)
 *   OTEL_SERVICE_NAME            — defaults to "pmtl-api"
 */
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PrismaInstrumentation } from "@prisma/instrumentation";

const endpoint = process.env["OTEL_EXPORTER_OTLP_ENDPOINT"];

if (endpoint) {
  const sdk = new NodeSDK({
    serviceName: process.env["OTEL_SERVICE_NAME"] ?? "pmtl-api",
    traceExporter: new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }),
    instrumentations: [
      new HttpInstrumentation({
        // Don't trace internal healthcheck/metrics scrape traffic
        ignoreIncomingRequestHook: (req) =>
          req.url?.startsWith("/health") === true ||
          req.url?.startsWith("/metrics") === true,
      }),
      new PrismaInstrumentation(),
    ],
  });

  sdk.start();

  // Flush remaining spans on graceful shutdown
  process.once("SIGTERM", () => {
    sdk.shutdown().catch((err: unknown) => {
      console.error("[otel] shutdown error", err);
    });
  });
}
