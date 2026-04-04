/**
 * Theme Store — Zustand UI state for dark/light mode, color theme, radius
 *
 * Constitution: design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md
 * - "Client state: Zustand (minimal) — chỉ cho UI state (sidebar, modal, theme)"
 *
 * Replaces context/theme-provider.tsx with a simpler Zustand store.
 * DOM side effects (classList, meta tag) are handled in ThemeSync.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ColorTheme, RadiusOption } from "@/configs/themes";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

interface ThemeState {
  theme: Theme;
  colorTheme: ColorTheme;
  radius: RadiusOption;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setRadius: (radius: RadiusOption) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS = {
  theme: "light" as Theme,
  colorTheme: "default" as ColorTheme,
  radius: 0.5 as RadiusOption,
};

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTheme: (theme: Theme) => set({ theme }),
      setColorTheme: (colorTheme: ColorTheme) => set({ colorTheme }),
      setRadius: (radius: RadiusOption) => set({ radius }),
      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    { name: "pmtl-admin-theme" },
  ),
);

/** Derived selector — resolves "system" to actual dark/light */
export function useResolvedTheme(): ResolvedTheme {
  const theme = useThemeStore((s) => s.theme);
  return resolveTheme(theme);
}

/** Hook-compatible API matching the old useTheme() signature */
export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const resolvedTheme = resolveTheme(theme);
  return { theme, resolvedTheme, setTheme };
}
