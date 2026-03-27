import globals from "globals";

import { baseConfig } from "../../packages/config/eslint/base.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
];
