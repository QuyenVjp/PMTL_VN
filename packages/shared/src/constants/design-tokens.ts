export const PMTL_COLOR_SCALES = {
  gold: {
    50: "#FEF9EF",
    100: "#FCEFD1",
    200: "#F8DFA2",
    300: "#F1CA6A",
    400: "#E2B243",
    500: "#C9971F",
    600: "#A97C17",
    700: "#865E15",
    800: "#614313",
    900: "#3F2B0C",
  },
  cream: {
    50: "#FFFDF8",
    100: "#FBF4E7",
    200: "#F3E6CF",
    300: "#EAD7B4",
    400: "#D9BC88",
    500: "#C6A060",
    600: "#A98244",
    700: "#826334",
    800: "#5C4527",
    900: "#392A18",
  },
  zen: {
    50: "#F6F2EC",
    100: "#E7DED0",
    200: "#CDBEAA",
    300: "#B09B82",
    400: "#8B755E",
    500: "#685545",
    600: "#4E4035",
    700: "#392F28",
    800: "#261F1A",
    900: "#16110F",
  },
} as const;

export const PMTL_RADIUS_TOKENS = {
  xs: "0.375rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
} as const;

export const PMTL_MOTION_TOKENS = {
  fadeIn: "fadeIn 0.3s ease-out",
  slideUp: "slideUp 0.4s ease-out",
  scaleIn: "scaleIn 0.28s ease-out",
} as const;
