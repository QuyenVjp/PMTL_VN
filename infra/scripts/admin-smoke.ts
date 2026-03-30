import { chromium, type BrowserContext, type ConsoleMessage, type Page, type Request } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type RouteCheck = {
  path: string;
  sourceFile: string;
};

type RouteResult = {
  path: string;
  sourceFile: string;
  status: "ok" | "warn" | "fail";
  title: string | null;
  heading: string | null;
  primaryAction: string | null;
  dialogOpened: boolean;
  requestFailures: string[];
  consoleErrors: string[];
  notes: string[];
};

const repoRoot = process.cwd();
const adminBaseUrl = process.env.ADMIN_SMOKE_BASE_URL ?? "http://127.0.0.1:3002";
const adminEmail = process.env.ADMIN_SMOKE_EMAIL ?? "admin@pmtl.local";
const adminPassword = process.env.ADMIN_SMOKE_PASSWORD ?? "PmtlAdmin!123";
const outputDir = path.join(repoRoot, "tmp", "runtime");
const reportPath = path.join(outputDir, "admin-smoke-report.json");
const routeInventoryPath = path.join(outputDir, "admin-routes.generated.json");

const routeFiles = [
  {
    file: path.join(repoRoot, "apps", "admin", "src", "routes", "__root.tsx"),
    prefix: null,
  },
  {
    file: path.join(repoRoot, "apps", "admin", "src", "routes", "noi-dung", "niem-kinh", "index.tsx"),
    prefix: "/noi-dung/niem-kinh",
  },
];

const ignorableRequestPattern = /\/favicon\.ico$/i;
const ignorableConsolePatterns = [
  /favicon\.ico/i,
  /The width\(-1\) and height\(-1\) of chart should be greater than 0/i,
];

function ensureOutputDir() {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
}

async function extractRoutes(): Promise<RouteCheck[]> {
  const routes: RouteCheck[] = [];

  for (const routeFile of routeFiles) {
    const content = await readFile(routeFile.file, "utf8");
    const matches = content.matchAll(/path:\s*"([^"]+)"/g);
    for (const match of matches) {
      const routePath = match[1];
      if (!routePath.startsWith("/")) {
        continue;
      }
      if (routePath.startsWith("/auth/")) {
        continue;
      }
      if (routePath === "/") {
        continue;
      }
      if (routeFile.prefix && !routePath.startsWith(routeFile.prefix)) {
        continue;
      }
      routes.push({
        path: routePath,
        sourceFile: path.relative(repoRoot, routeFile.file).replace(/\\/g, "/"),
      });
    }
  }

  const deduped = Array.from(new Map(routes.map((route) => [route.path, route])).values());
  deduped.sort((a, b) => a.path.localeCompare(b.path, "vi"));
  return deduped;
}

function normalizeConsoleMessage(message: ConsoleMessage): string {
  const location = message.location();
  const suffix = location.url ? ` @ ${location.url}:${location.lineNumber}` : "";
  return `${message.type().toUpperCase()}: ${message.text()}${suffix}`;
}

function shouldIgnoreConsoleError(text: string): boolean {
  return ignorableConsolePatterns.some((pattern) => pattern.test(text));
}

function shouldIgnoreRequestFailure(request: Request): boolean {
  return ignorableRequestPattern.test(request.url());
}

async function login(page: Page) {
  await page.goto(`${adminBaseUrl}/auth/dang-nhap`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Mật khẩu").fill(adminPassword);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/dashboard$/, { timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);
}

async function capturePrimaryAction(page: Page): Promise<{ primaryAction: string | null; dialogOpened: boolean; note?: string }> {
  const createButton = page.locator("button").filter({ hasText: /^Tạo\b/ }).first();
  if ((await createButton.count()) === 0) {
    return { primaryAction: null, dialogOpened: false };
  }

  const label = (await createButton.innerText()).trim();
  const beforeUrl = page.url();
  await createButton.click();
  await page.waitForTimeout(500);

  const dialog = page.getByRole("dialog").first();
  const alertDialog = page.getByRole("alertdialog").first();
  const drawer = page.locator("[data-state='open'][data-vaul-drawer-wrapper], [data-slot='sheet-content'][data-state='open']").first();
  const navigated = page.url() !== beforeUrl;

  if ((await dialog.count()) === 0 && (await alertDialog.count()) === 0 && (await drawer.count()) === 0 && !navigated) {
    return {
      primaryAction: label,
      dialogOpened: false,
      note: "Primary action clicked but no dialog surfaced.",
    };
  }

  await page.keyboard.press("Escape").catch(() => undefined);
  await page.waitForTimeout(300);
  return { primaryAction: label, dialogOpened: true };
}

async function inspectRoute(context: BrowserContext, route: RouteCheck): Promise<RouteResult> {
  const page = await context.newPage();
  const requestFailures: string[] = [];
  const consoleErrors: string[] = [];
  const notes: string[] = [];

  page.on("response", async (response) => {
    const status = response.status();
    if (status < 400) {
      return;
    }
    const url = response.url();
    if (ignorableRequestPattern.test(url)) {
      return;
    }
    requestFailures.push(`${status} ${url}`);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }
    const normalized = normalizeConsoleMessage(message);
    if (shouldIgnoreConsoleError(normalized)) {
      return;
    }
    consoleErrors.push(normalized);
  });

  let title: string | null = null;
  let heading: string | null = null;
  let primaryAction: string | null = null;
  let dialogOpened = false;

  try {
    await page.goto(`${adminBaseUrl}${route.path}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
    await page.waitForTimeout(400);

    title = await page.title().catch(() => null);
    heading = (await page.locator("main h1").first().textContent().catch(() => null))?.trim() ?? null;

    const actionState = await capturePrimaryAction(page);
    primaryAction = actionState.primaryAction;
    dialogOpened = actionState.dialogOpened;
    if (actionState.note) {
      notes.push(actionState.note);
    }
  } catch (error) {
    notes.push(error instanceof Error ? error.message : String(error));
  } finally {
    await page.close();
  }

  const actionableNotes = notes.filter((note) => note !== "Primary action clicked but no dialog surfaced.");
  const status: RouteResult["status"] =
    requestFailures.length > 0 || consoleErrors.length > 0
      ? "fail"
      : actionableNotes.length > 0
        ? "warn"
        : "ok";

  return {
    path: route.path,
    sourceFile: route.sourceFile,
    status,
    title,
    heading,
    primaryAction,
    dialogOpened,
    requestFailures,
    consoleErrors,
    notes,
  };
}

function resolveBrowserExecutable(): string | undefined {
  const candidates = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

async function main() {
  ensureOutputDir();
  const routes = await extractRoutes();
  writeFileSync(routeInventoryPath, JSON.stringify(routes, null, 2));

  const executablePath = resolveBrowserExecutable();
  const browser = await chromium.launch({
    headless: true,
    executablePath,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });

  try {
    const loginPage = await context.newPage();
    await login(loginPage);
    await loginPage.close();

    const results: RouteResult[] = [];
    for (const route of routes) {
      results.push(await inspectRoute(context, route));
    }

    const summary = {
      ok: results.every((result) => result.status === "ok"),
      baseUrl: adminBaseUrl,
      routeCount: routes.length,
      failedCount: results.filter((result) => result.status === "fail").length,
      warnedCount: results.filter((result) => result.status === "warn").length,
      generatedAt: new Date().toISOString(),
      results,
    };

    writeFileSync(reportPath, JSON.stringify(summary, null, 2));
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.ok ? 0 : 1);
  } finally {
    await context.close();
    await browser.close();
  }
}

void main().catch((error) => {
  const payload = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  };
  ensureOutputDir();
  writeFileSync(reportPath, JSON.stringify(payload, null, 2));
  console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
});
