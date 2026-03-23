import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

import { getEnvValue, parseSimpleEnvFile } from "./env-utils";

type JsonRecord = Record<string, unknown>;

const rootDir = process.cwd();
const composeFile = process.env.MONITORING_DOCKER_COMPOSE_FILE ?? path.join(rootDir, "infra/docker/compose.prod.yml");
const envFile = process.env.MONITORING_ENV_FILE ?? path.join(rootDir, "infra/docker/.env.prod");
const envFileValues = parseSimpleEnvFile(envFile);
const webBaseUrl =
  process.env.MONITORING_WEB_BASE_URL
  ?? `http://127.0.0.1:${getEnvValue("MONITORING_WEB_PORT", envFileValues, "3000")}`;
const prometheusBaseUrl =
  process.env.MONITORING_PROMETHEUS_URL ??
  `http://127.0.0.1:${getEnvValue("PROMETHEUS_PORT", envFileValues, "9090")}`;
const alertmanagerBaseUrl =
  process.env.MONITORING_ALERTMANAGER_URL ??
  `http://127.0.0.1:${getEnvValue("ALERTMANAGER_PORT", envFileValues, "9093")}`;
const alertSinkBaseUrl = process.env.MONITORING_ALERT_SINK_URL
  ?? (getEnvValue("ALERT_SINK_PORT", envFileValues) ? `http://127.0.0.1:${getEnvValue("ALERT_SINK_PORT", envFileValues)}` : "");
const monitoringSecret = getEnvValue("MONITORING_TEST_SECRET", envFileValues, "");
const pollIntervalMs = Number(process.env.MONITORING_POLL_INTERVAL_MS ?? "5000");
const requestTimeoutMs = Number(process.env.MONITORING_REQUEST_TIMEOUT_MS ?? "15000");

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fileExists(targetPath: string) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(requestTimeoutMs),
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as unknown;

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(requestTimeoutMs),
  });
  const body = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    body,
  };
}

async function resetAlertSink() {
  if (!alertSinkBaseUrl) {
    return;
  }

  await fetch(`${alertSinkBaseUrl}/alerts`, {
    method: "DELETE",
    signal: AbortSignal.timeout(requestTimeoutMs),
  }).catch(() => undefined);
}

function runCompose(args: string[]) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const processArgs = ["compose", "--env-file", envFile, "-f", composeFile, ...args];
    const child = spawn("docker", processArgs, {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function requireOk(label: string, result: { ok: boolean; status: number; body: unknown }) {
  if (!result.ok) {
    throw new Error(`${label} failed (${result.status}): ${JSON.stringify(result.body)}`);
  }
}

async function checkPrometheusTargets() {
  const targets = await fetchJson(`${prometheusBaseUrl}/api/v1/targets`);
  await requireOk("prometheus targets", targets);

  const activeTargets =
    typeof targets.body === "object" &&
    targets.body &&
    "data" in targets.body &&
    typeof (targets.body as JsonRecord).data === "object" &&
    (targets.body as JsonRecord).data &&
    Array.isArray(((targets.body as JsonRecord).data as JsonRecord).activeTargets)
      ? ((((targets.body as JsonRecord).data as JsonRecord).activeTargets as unknown[]) as JsonRecord[])
      : [];

  const jobs = new Set(
    activeTargets
      .map((target) => (typeof target.labels === "object" && target.labels ? (target.labels as JsonRecord).job : null))
      .filter((value): value is string => typeof value === "string"),
  );

  const expectedJobs = ["prometheus", "caddy", "blackbox-http", "postgres-exporter", "redis-exporter", "node-exporter"];
  const missingJobs = expectedJobs.filter((job) => !jobs.has(job));

  if (missingJobs.length > 0) {
    throw new Error(`Prometheus missing expected jobs: ${missingJobs.join(", ")}`);
  }

  return {
    totalTargets: activeTargets.length,
    jobs: Array.from(jobs).sort(),
  };
}

async function triggerSentryTest(baseUrl: string) {
  if (!monitoringSecret) {
    throw new Error("MONITORING_TEST_SECRET is required to trigger Sentry test routes.");
  }

  const result = await fetchJson(`${baseUrl}/api/internal/monitoring/sentry-test`, {
    method: "POST",
    headers: {
      "x-monitoring-test-secret": monitoringSecret,
    },
    body: JSON.stringify({
      message: "PMTL web monitoring test",
    }),
  });

  if (result.status !== 500) {
    throw new Error(`web sentry test returned ${result.status}: ${JSON.stringify(result.body)}`);
  }

  const eventId =
    typeof result.body === "object" && result.body && typeof (result.body as JsonRecord).eventId === "string"
      ? ((result.body as JsonRecord).eventId as string)
      : null;
  if (!eventId) {
    throw new Error("web sentry test did not return an eventId.");
  }

  return {
    app: "web",
    eventId,
  };
}

async function checkAlertSinkDelivery() {
  if (!alertSinkBaseUrl) {
    return {
      enabled: false,
    };
  }

  const result = await fetchJson(`${alertSinkBaseUrl}/last`);
  await requireOk("alert sink", result);

  const alerts =
    typeof result.body === "object"
    && result.body
    && Array.isArray((result.body as JsonRecord).alerts)
      ? ((result.body as JsonRecord).alerts as unknown[])
      : [];

  if (alerts.length === 0) {
    throw new Error("Alert sink did not record any delivered alerts.");
  }

  return {
    enabled: true,
    deliveredAlerts: alerts.length,
  };
}

async function main() {
  const results: Array<{ step: string; details: unknown }> = [];

  results.push({
    step: "prometheus-targets",
    details: await checkPrometheusTargets(),
  });

  results.push({
    step: "web-sentry",
    details: await triggerSentryTest(webBaseUrl),
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        checkedAt: new Date().toISOString(),
        results,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
