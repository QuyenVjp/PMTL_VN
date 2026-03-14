import globals from "globals";

import { baseConfig } from "./base.mjs";

export const nextConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
