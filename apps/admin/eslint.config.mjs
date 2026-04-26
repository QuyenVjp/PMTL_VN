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
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
}, {
  files: [".storybook/*.ts"],
  languageOptions: {
    parserOptions: {
      projectService: {
        allowDefaultProject: [".storybook/*.ts"],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
}, ...storybook.configs["flat/recommended"]];
