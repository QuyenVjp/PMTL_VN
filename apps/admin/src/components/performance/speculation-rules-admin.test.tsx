// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SpeculationRulesAdmin } from "./speculation-rules-admin";

describe("SpeculationRulesAdmin", () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    container?.remove();
    root = null;
    container = null;
    vi.restoreAllMocks();
  });

  it("injects speculationrules script when browser supports API", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const supportsSpy = vi.fn(() => true);
    Object.defineProperty(window.HTMLScriptElement, "supports", {
      configurable: true,
      value: supportsSpy,
    });

    act(() => {
      root?.render(<SpeculationRulesAdmin />);
    });

    const script = document.head.querySelector("#pmtl-admin-speculation-rules");
    expect(script).not.toBeNull();
    expect(script?.getAttribute("type")).toBe("speculationrules");
    expect(script?.textContent).toContain("dashboard");
    expect(supportsSpy).toHaveBeenCalledWith("speculationrules");
  });

  it("replaces the speculationrules script instead of mutating an already processed script", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    Object.defineProperty(window.HTMLScriptElement, "supports", {
      configurable: true,
      value: vi.fn(() => true),
    });

    act(() => {
      root?.render(<SpeculationRulesAdmin />);
    });

    const initialScript = document.head.querySelector("#pmtl-admin-speculation-rules");
    const nav = document.createElement("nav");
    const link = document.createElement("a");
    link.href = "/noi-dung/bai-viet";
    nav.appendChild(link);
    document.body.appendChild(nav);

    act(() => {
      link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
    });

    const updatedScript = document.head.querySelector("#pmtl-admin-speculation-rules");
    expect(updatedScript).not.toBe(initialScript);
    expect(updatedScript?.textContent).toContain("/noi-dung/bai-viet");
  });
});
