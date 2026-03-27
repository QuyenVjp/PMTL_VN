/**
 * Theme Store — Zustand UI state for dark/light mode
 *
 * Constitution: design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md
 * - "Client state: Zustand (minimal) — chỉ cho UI state (sidebar, modal, theme)"
 *
 * Replaces context/theme-provider.tsx with a simpler Zustand store.
 * DOM side effects (classList, meta tag) are handled in useThemeSync().
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

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
      theme: "system" as Theme,
      setTheme: (theme: Theme) => set({ theme }),
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
