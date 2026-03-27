/**
 * ThemeSync — DOM side effect component for theme store
 *
 * Handles: document.documentElement classList, meta theme-color tag,
 * and system preference media query listener.
 * Render once in the app root, after Zustand store is available.
 */
import { useEffect } from "react";
import { useThemeStore } from "./theme.js";

function resolveTheme(theme: "dark" | "light" | "system"): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyTheme(resolved: "dark" | "light") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  const metaThemeColor = document.querySelector("meta[name='theme-color']");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", resolved === "dark" ? "#020817" : "#ffffff");
  }
}

export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(resolveTheme(theme));

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme(resolveTheme("system"));
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return null;
}
