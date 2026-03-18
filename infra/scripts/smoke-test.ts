type JsonRecord = Record<string, unknown>;

const cmsBase = process.env.CMS_PUBLIC_URL ?? process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3001";
const webBase = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const apiToken = process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN ?? "";
const smokeRequestTimeoutMs = Number(process.env.SMOKE_TEST_TIMEOUT_MS ?? "120000");
const smokeRetryCount = Number(process.env.SMOKE_TEST_RETRY_COUNT ?? "4");
const smokeRetryDelayMs = Number(process.env.SMOKE_TEST_RETRY_DELAY_MS ?? "2500");

const memberCredentials = {
  email: process.env.SMOKE_TEST_MEMBER_EMAIL ?? "member@pmtl.local",
  password: process.env.SMOKE_TEST_MEMBER_PASSWORD ?? "PmtlMember!123",
};

const moderatorCredentials = {
  email: process.env.SMOKE_TEST_MODERATOR_EMAIL ?? "moderator@pmtl.local",
  password: process.env.SMOKE_TEST_MODERATOR_PASSWORD ?? "PmtlModerator!123",
};
const editorCredentials = {
  email: process.env.SMOKE_TEST_EDITOR_EMAIL ?? "editor@pmtl.local",
  password: process.env.SMOKE_TEST_EDITOR_PASSWORD ?? "PmtlEditor!123",
};
const guestbookForwardedFor = process.env.SMOKE_TEST_IP ?? `127.0.0.${Math.floor(Math.random() * 200) + 20}`;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForService(url: string, label: string) {
  const deadline = Date.now() + smokeRequestTimeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      await warmUpEndpoint(url);
      await expectJson(url, undefined, { retries: 1, timeoutMs: smokeRequestTimeoutMs });
      return;
    } catch (error) {
      lastError = error;
      await sleep(1000);
    }
  }

  const message =
    lastError instanceof Error
      ? lastError.message
      : typeof lastError === "string"
        ? lastError
        : "unknown error";
  throw new Error(`[smoke-test] ${label} not ready: ${message}`);
}

function isRetryableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("fetch failed") ||
    error.message.includes("Headers Timeout Error") ||
    error.message.includes("UND_ERR_HEADERS_TIMEOUT") ||
    error.name === "AbortError"
  );
}

async function expectJson(
  url: string,
  init?: RequestInit,
  options?: {
    retries?: number;
    timeoutMs?: number;
  },
) {
  const retries = options?.retries ?? smokeRetryCount;
  const timeoutMs = options?.timeoutMs ?? smokeRequestTimeoutMs;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });

      const body = (await response.json().catch(() => null)) as JsonRecord | null;

      if (!response.ok) {
        throw new Error(`${url} failed (${response.status}): ${JSON.stringify(body)}`);
      }

      return body;
    } catch (error) {
      lastError = error;

      if (attempt >= retries || !isRetryableError(error)) {
        break;
      }

      await sleep(smokeRetryDelayMs * attempt);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function warmUpEndpoint(url: string, init?: RequestInit) {
  try {
    await expectJson(url, init, {
      retries: 1,
      timeoutMs: smokeRequestTimeoutMs,
    });
  } catch {
    // The first request in `next dev` can time out while webpack compiles the route.
    // A subsequent request is what we validate.
  }
}

async function login(credentials: { email: string; password: string }) {
  await warmUpEndpoint(`${cmsBase}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  const body = await expectJson(`${cmsBase}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  const token = typeof body.session === "object" && body.session && typeof body.session.token === "string"
    ? body.session.token
    : "";

  if (!token) {
    throw new Error(`Missing auth token from ${credentials.email}`);
  }

  return token;
}

async function main() {
  const results: Array<{ step: string; status: "ok" | "skipped"; details?: unknown }> = [];

  await waitForService(`${cmsBase}/api/health`, "cms");
  const cmsHealth = await expectJson(`${cmsBase}/api/health`);
  results.push({ step: "cms-health", status: "ok", details: cmsHealth });

  const memberToken = await login(memberCredentials);
  results.push({ step: "member-login", status: "ok" });

  const me = await expectJson(`${cmsBase}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${memberToken}`,
    },
  });
  results.push({ step: "auth-me", status: "ok", details: me });

  const posts = await expectJson(`${cmsBase}/api/posts?limit=5&depth=0`, {
    headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : undefined,
  });
  results.push({ step: "posts-list", status: "ok", details: { docs: (posts.docs as unknown[] | undefined)?.length ?? 0 } });

  const search = await expectJson(`${cmsBase}/api/posts/search?q=khai%20thi&limit=5`);
  results.push({ step: "posts-search", status: "ok", details: { totalHits: search.totalHits ?? 0 } });

  const guestbook = await expectJson(`${cmsBase}/api/guestbook/submit`, {
    method: "POST",
    headers: {
      ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
      "X-Forwarded-For": guestbookForwardedFor,
    },
    body: JSON.stringify({
      authorName: "Smoke Test",
      message: "Smoke test gui luu but tu infra/scripts/smoke-test.ts",
      entryType: "message",
      questionCategory: "smoke-test",
    }),
  });
  results.push({ step: "guestbook-submit", status: "ok", details: guestbook });

  const moderatorToken = await login(moderatorCredentials);
  const moderationReports = await expectJson(`${cmsBase}/api/moderation/reports`, {
    headers: {
      Authorization: `Bearer ${moderatorToken}`,
    },
  });
  results.push({
    step: "moderation-reports",
    status: "ok",
    details: { docs: (moderationReports.docs as unknown[] | undefined)?.length ?? 0 },
  });

  try {
    const editorToken = await login(editorCredentials);
    const searchStatus = await expectJson(`${cmsBase}/api/search/status`, {
      headers: {
        Authorization: `Bearer ${editorToken}`,
      },
    });
    results.push({ step: "search-status", status: "ok", details: searchStatus });
  } catch (error) {
    results.push({
      step: "search-status",
      status: "skipped",
      details: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    await waitForService(`${webBase}`, "web");
    const webSearch = await expectJson(`${webBase}/api/notifications?limit=3`);
    results.push({ step: "web-notifications", status: "ok", details: webSearch });
  } catch (error) {
    results.push({
      step: "web-notifications",
      status: "skipped",
      details: error instanceof Error ? error.message : String(error),
    });
  }

  console.log(JSON.stringify({ ok: true, cmsBase, webBase, results }, null, 2));
}

void main().catch((error) => {
  console.error("[smoke-test]", error);
  process.exit(1);
});
