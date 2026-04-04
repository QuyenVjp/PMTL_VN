/**
 * Theme configuration for the admin customizer.
 *
 * Each color theme shifts the primary OKLCH hue while keeping
 * neutral grays consistent across all themes.
 */

export const colorThemes = {
  default: {
    label: "Vàng kim",
    preview: "oklch(0.65 0.16 65)",
  },
  teal: {
    label: "Ngọc lam",
    preview: "oklch(0.55 0.12 180)",
  },
  blue: {
    label: "Xanh biển",
    preview: "oklch(0.52 0.16 245)",
  },
  violet: {
    label: "Tím",
    preview: "oklch(0.50 0.18 295)",
  },
  rose: {
    label: "Hồng sen",
    preview: "oklch(0.55 0.18 350)",
  },
  red: {
    label: "Đỏ son",
    preview: "oklch(0.55 0.20 20)",
  },
  orange: {
    label: "Cam",
    preview: "oklch(0.65 0.16 55)",
  },
  green: {
    label: "Xanh lá",
    preview: "oklch(0.50 0.14 145)",
  },
} as const;

export type ColorTheme = keyof typeof colorThemes;

export const radii = [0, 0.3, 0.5, 0.75, 1] as const;

export type RadiusOption = (typeof radii)[number];
