"use client";

import { useEffect } from "react";

const SPECULATION_SCRIPT_ID = "pmtl-web-speculation-rules";
const WEB_DYNAMIC_URL_LIMIT = 8;

const WEB_PRERENDER_URLS = ["/kinh-dien", "/loi-nguyen", "/wisdom-qa", "/tim-kiem"];
const WEB_PREFETCH_URLS = ["/cong-dong"];

interface WebSpeculationPayload {
  prerender: Array<{ source: "list"; urls: string[]; eagerness: "moderate" | "conservative" }>;
  prefetch: Array<{ source: "list"; urls: string[]; eagerness: "moderate" | "conservative" }>;
}

function supportsSpeculationRules(): boolean {
  if (typeof HTMLScriptElement === "undefined" || typeof HTMLScriptElement.supports !== "function") {
    return false;
  }

  return HTMLScriptElement.supports("speculationrules");
}

function ensureScript(): HTMLScriptElement | null {
  const existing = document.getElementById(SPECULATION_SCRIPT_ID);
  if (existing instanceof HTMLScriptElement) {
    return existing;
  }

  const script = document.createElement("script");
  script.id = SPECULATION_SCRIPT_ID;
  script.type = "speculationrules";
  document.head.appendChild(script);
  return script;
}

function buildPayload(dynamicUrls: Iterable<string>): WebSpeculationPayload {
  const urls = Array.from(dynamicUrls).slice(0, WEB_DYNAMIC_URL_LIMIT);

  return {
    prerender: [
      {
        source: "list",
        urls: WEB_PRERENDER_URLS,
        eagerness: "moderate",
      },
      ...(urls.length > 0
        ? [
            {
              source: "list" as const,
              urls,
              eagerness: "moderate" as const,
            },
          ]
        : []),
    ],
    prefetch: [
      {
        source: "list",
        urls: WEB_PREFETCH_URLS,
        eagerness: "conservative",
      },
    ],
  };
}

function normalizePath(rawHref: string): string {
  try {
    const url = new URL(rawHref, window.location.origin);
    return url.pathname;
  } catch {
    return "";
  }
}

const DYNAMIC_ROUTE_PREFIXES = ["/kinh-dien", "/loi-nguyen"];

export function SpeculationRules() {
  useEffect(() => {
    if (!supportsSpeculationRules()) {
      return;
    }

    const script = ensureScript();
    if (!script) {
      return;
    }

    const dynamicUrls = new Set<string>();
    script.textContent = JSON.stringify(buildPayload(dynamicUrls));

    const updateScript = () => {
      script.textContent = JSON.stringify(buildPayload(dynamicUrls));
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

      const path = normalizePath(link.getAttribute("href") ?? link.href);
      if (!path || !DYNAMIC_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        return;
      }

      if (!dynamicUrls.has(path)) {
        dynamicUrls.add(path);
        updateScript();
      }
    };

    const handleScroll = () => {
      if (window.scrollY < 320) {
        return;
      }

      const firstReadingLink = document.querySelector<HTMLAnchorElement>(
        "a[href^='/kinh-dien'], a[href^='/loi-nguyen']",
      );
      if (!firstReadingLink) {
        return;
      }

      const path = normalizePath(firstReadingLink.getAttribute("href") ?? firstReadingLink.href);
      if (!path || dynamicUrls.has(path)) {
        return;
      }

      dynamicUrls.add(path);
      updateScript();
    };

    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
