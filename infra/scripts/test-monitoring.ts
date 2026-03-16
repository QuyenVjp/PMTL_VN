import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";

type JsonRecord = Record<string, unknown>;

const rootDir = process.cwd();
const webBaseUrl = process.env.MONITORING_WEB_BASE_URL ?? "http://localhost:3000";
const cmsBaseUrl = process.env.MONITORING_CMS_BASE_URL ?? "http://localhost:3001";
const prometheusBaseUrl = process.env.MONITORING_PROMETHEUS_URL ?? "http://127.0.0.1:9090";
const alertmanagerBaseUrl = process.env.MONITORING_ALERTMANAGER_URL ?? "http://127.0.0.1:9093";
const monitoringSecret = process.env.MONITORING_TEST_SECRET ?? "";
const composeFile = process.env.MONITORING_DOCKER_COMPOSE_FILE ?? path.join(rootDir, "infra/docker/compose.prod.yml");
const envFile = process.env.MONITORING_ENV_FILE ?? path.join(rootDir, "infra/docker/.env.prod");
const workerAlertWaitMs = Number(process.env.MONITORING_WORKER_ALERT_WAIT_MS ?? "270000");
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

  const expectedJobs = ["prometheus", "caddy", "blackbox-http", "worker-metrics", "postgres-exporter", "redis-exporter", "node-exporter"];
  const missingJobs = expectedJobs.filter((job) => !jobs.has(job));

  if (missingJobs.length > 0) {
    throw new Error(`Prometheus missing expected jobs: ${missingJobs.join(", ")}`);
  }

  return {
    totalTargets: activeTargets.length,
    jobs: Array.from(jobs).sort(),
  };
}

async function triggerSentryTest(baseUrl: string, app: "web" | "cms") {
  if (!monitoringSecret) {
    throw new Error("MONITORING_TEST_SECRET is required to trigger Sentry test routes.");
  }

  const result = await fetchJson(`${baseUrl}/api/internal/monitoring/sentry-test`, {
    method: "POST",
    headers: {
      "x-monitoring-test-secret": monitoringSecret,
    },
    body: JSON.stringify({
      message: `PMTL ${app} monitoring test`,
    }),
  });

  if (result.status !== 500) {
    throw new Error(`${app} sentry test returned ${result.status}: ${JSON.stringify(result.body)}`);
  }

  const eventId =
    typeof result.body === "object" && result.body && typeof (result.body as JsonRecord).eventId === "string"
      ? ((result.body as JsonRecord).eventId as string)
      : null;
  if (!eventId) {
    throw new Error(`${app} sentry test did not return an eventId.`);
  }

  return {
    app,
    eventId,
  };
}

async function waitForWorkerAlert() {
  const deadline = Date.now() + workerAlertWaitMs;

  while (Date.now() < deadline) {
    const alerts = await fetchJson(`${alertmanagerBaseUrl}/api/v2/alerts`);
    await requireOk("alertmanager alerts", alerts);

    const alertList = Array.isArray(alerts.body) ? (alerts.body as JsonRecord[]) : [];
    const workerAlert = alertList.find((alert) => {
      const labels = typeof alert.labels === "object" && alert.labels ? (alert.labels as JsonRecord) : null;
      return labels?.alertname === "PMTLWorkerHeartbeatStale";
    });

    if (workerAlert) {
      return workerAlert;
    }

    await sleep(pollIntervalMs);
  }

  throw new Error("PMTLWorkerHeartbeatStale did not appear in Alertmanager within the wait window.");
}

async function simulateWorkerDown() {
  if (!(await fileExists(composeFile))) {
    throw new Error(`Compose file not found: ${composeFile}`);
  }

  if (!(await fileExists(envFile))) {
    throw new Error(`Env file not found: ${envFile}`);
  }

  const stopResult = await runCompose(["stop", "worker"]);
  if (stopResult.code !== 0) {
    throw new Error(`Failed to stop worker: ${stopResult.stderr || stopResult.stdout}`);
  }

  try {
    const healthCheckDeadline = Date.now() + 180000;
    let workerRouteFailed = false;

    while (Date.now() < healthCheckDeadline) {
      const result = await fetchJson(`${cmsBaseUrl}/api/worker/health`);
      if (result.status === 503) {
        workerRouteFailed = true;
        break;
      }

      await sleep(pollIntervalMs);
    }

    if (!workerRouteFailed) {
      throw new Error("CMS worker health route did not switch to 503 after stopping the worker.");
    }

    const alert = await waitForWorkerAlert();
    const alertmanagerLogs = await runCompose(["logs", "--tail", "50", "alertmanager"]);

    return {
      workerHealthRoute: "503",
      alert,
      alertmanagerLogs: {
        code: alertmanagerLogs.code,
        stderr: alertmanagerLogs.stderr.trim(),
      },
    };
  } finally {
    const startResult = await runCompose(["start", "worker"]);
    if (startResult.code !== 0) {
      throw new Error(`Worker restart failed after monitoring test: ${startResult.stderr || startResult.stdout}`);
    }
  }
}

async function checkWorkerMetrics() {
  const metrics = await fetchText(`${cmsBaseUrl}/api/metrics/worker`);
  if (!metrics.ok || !metrics.body.includes("pmtl_worker_healthy")) {
    throw new Error(`Worker metrics endpoint failed (${metrics.status}).`);
  }

  return {
    status: metrics.status,
    containsWorkerHealthMetric: true,
  };
}

async function main() {
  const results: Array<{ step: string; details: unknown }> = [];

  results.push({
    step: "prometheus-targets",
    details: await checkPrometheusTargets(),
  });

  results.push({
    step: "worker-metrics",
    details: await checkWorkerMetrics(),
  });

  results.push({
    step: "web-sentry",
    details: await triggerSentryTest(webBaseUrl, "web"),
  });

  results.push({
    step: "cms-sentry",
    details: await triggerSentryTest(cmsBaseUrl, "cms"),
  });

  results.push({
    step: "worker-down-alert",
    details: await simulateWorkerDown(),
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
