// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import globals from "globals";

import { baseConfig } from "../../packages/config/eslint/base.mjs";

export default [...baseConfig, {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
}, {
  files: [".storybook/*.ts", "scripts/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: [".storybook/*.ts", "scripts/*.ts"],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
}, ...storybook.configs["flat/recommended"]];
