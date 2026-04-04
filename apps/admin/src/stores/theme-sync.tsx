/**
 * ThemeSync — DOM side effect component for theme store
 *
 * Handles: document.documentElement classList (mode + color theme),
 * --radius CSS variable, meta theme-color tag,
 * and system preference media query listener.
 * Render once in the app root, after Zustand store is available.
 */
import { useEffect } from "react";
import { useThemeStore } from "./theme.js";

import type { ColorTheme } from "@/configs/themes";

function resolveTheme(theme: "dark" | "light" | "system"): "dark" | "light" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyMode(resolved: "dark" | "light") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);

  const metaThemeColor = document.querySelector("meta[name='theme-color']");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", resolved === "dark" ? "#020817" : "#ffffff");
  }
}

function applyColorTheme(colorTheme: ColorTheme) {
  const root = document.documentElement;
  // Remove existing theme-* classes
  Array.from(root.classList)
    .filter((cls) => cls.startsWith("theme-"))
    .forEach((cls) => root.classList.remove(cls));

  // "default" uses base :root/:dark vars — no class needed
  if (colorTheme !== "default") {
    root.classList.add(`theme-${colorTheme}`);
  }
}

function applyRadius(radius: number) {
  document.documentElement.style.setProperty("--radius", `${radius}rem`);
}

export function ThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  const colorTheme = useThemeStore((s) => s.colorTheme);
  const radius = useThemeStore((s) => s.radius);

  // Sync dark/light mode
  useEffect(() => {
    applyMode(resolveTheme(theme));

    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyMode(resolveTheme("system"));
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Sync color theme class
  useEffect(() => {
    applyColorTheme(colorTheme);
  }, [colorTheme]);

  // Sync radius CSS variable
  useEffect(() => {
    applyRadius(radius);
  }, [radius]);

  return null;
}
