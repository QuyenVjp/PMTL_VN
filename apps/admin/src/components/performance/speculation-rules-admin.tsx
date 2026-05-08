import { useEffect } from "react";

const SPECULATION_SCRIPT_ID = "pmtl-admin-speculation-rules";
const DYNAMIC_URL_LIMIT = 6;

const STATIC_PRERENDER_URLS = [
  "/dashboard",
  "/moderation-queue",
  "/users",
  "/stats",
  "/content",
];

const STATIC_PREFETCH_URLS = [
  "/dashboard",
  "/moderation-queue",
  "/users",
  "/stats",
  "/content",
];

const ELDERLY_ROUTES = new Set([
  ...STATIC_PRERENDER_URLS,
  ...STATIC_PREFETCH_URLS,
  "/kiem-duyet/bao-cao",
  "/nguoi-dung",
  "/he-thong/health",
  "/noi-dung/bai-viet",
]);

interface SpeculationRulesPayload {
  prerender: Array<{ source: "list"; urls: string[]; eagerness: "moderate" | "conservative" }>;
  prefetch: Array<{ source: "list"; urls: string[]; eagerness: "moderate" | "conservative" }>;
}

function supportsSpeculationRules(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof HTMLScriptElement === "undefined" || typeof HTMLScriptElement.supports !== "function") {
    return false;
  }

  return HTMLScriptElement.supports("speculationrules");
}

function toPayload(dynamicUrls: Iterable<string>): SpeculationRulesPayload {
  const urls = Array.from(dynamicUrls).slice(0, DYNAMIC_URL_LIMIT);

  return {
    prerender: [
      {
        source: "list",
        urls: STATIC_PRERENDER_URLS,
        // Elderly-first: avoid eager prerender to save data on weak 3G/4G.
        eagerness: "conservative",
      },
      ...(urls.length > 0
        ? [
            {
              source: "list" as const,
              urls,
              eagerness: "conservative" as const,
            },
          ]
        : []),
    ],
    prefetch: [
      {
        source: "list",
        urls: STATIC_PREFETCH_URLS,
        // Elderly-first: conservative prefetch to reduce bandwidth and battery drain.
        eagerness: "conservative",
      },
    ],
  };
}

function removeScript(): void {
  if (typeof document === "undefined") {
    return;
  }

  const existing = document.getElementById(SPECULATION_SCRIPT_ID);
  if (existing instanceof HTMLScriptElement) {
    existing.remove();
  }
}

function writeRules(payload: SpeculationRulesPayload): HTMLScriptElement | null {
  if (typeof document === "undefined") {
    return null;
  }

  removeScript();

  const script = document.createElement("script");
  script.id = SPECULATION_SCRIPT_ID;
  script.type = "speculationrules";
  script.textContent = JSON.stringify(payload);
  document.head.appendChild(script);
  return script;
}

function normalizeCandidatePath(rawHref: string): string {
  try {
    const url = new URL(rawHref, window.location.origin);
    return `${url.pathname}${url.search}`.split("#")[0] ?? "";
  } catch {
    return "";
  }
}

export function SpeculationRulesAdmin() {
  useEffect(() => {
    if (!supportsSpeculationRules()) {
      return;
    }

    const initialScript = writeRules(toPayload([]));
    if (!initialScript) {
      return;
    }
    let activeScript = initialScript;

    // Pair with existing service-worker cache: speculation warms HTML/doc responses,
    // service worker handles offline/static caching. This keeps navigation instant
    // while still saving data for elderly users on weak networks.
    const dynamicUrls = new Set<string>();
    const updateRules = () => {
      const nextScript = writeRules(toPayload(dynamicUrls));
      if (nextScript) {
        activeScript = nextScript;
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const candidate = normalizeCandidatePath(link.getAttribute("href") ?? link.href);
      if (!candidate || !ELDERLY_ROUTES.has(candidate)) {
        return;
      }

      // Dynamic speculation only when user intent is clear (sidebar or table hover).
      const isSidebarIntent = Boolean(link.closest("[data-sidebar], nav, aside"));
      const isTableIntent = Boolean(link.closest("table, [data-table], [role='grid']"));
      if (!isSidebarIntent && !isTableIntent) {
        return;
      }

      if (!dynamicUrls.has(candidate)) {
        dynamicUrls.add(candidate);
        updateRules();
      }
    };

    const handleScrollIntent = () => {
      if (window.scrollY < 220) {
        return;
      }

      const firstRowActionLink = document.querySelector<HTMLAnchorElement>(
        "table a[href], [data-table] a[href], [role='grid'] a[href]",
      );
      if (!firstRowActionLink) {
        return;
      }

      const candidate = normalizeCandidatePath(firstRowActionLink.getAttribute("href") ?? firstRowActionLink.href);
      if (!candidate || !ELDERLY_ROUTES.has(candidate) || dynamicUrls.has(candidate)) {
        return;
      }

      dynamicUrls.add(candidate);
      updateRules();
    };

    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("scroll", handleScrollIntent, { passive: true });

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("scroll", handleScrollIntent);
      activeScript.remove();
    };
  }, []);

  return null;
}
