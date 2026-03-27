/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Types allowed in PMTL_VN
    "type-enum": [
      2,
      "always",
      [
        "feat",     // new feature
        "fix",      // bug fix
        "docs",     // documentation only
        "style",    // formatting, missing semicolons, etc (no logic change)
        "refactor", // code change that is neither fix nor feat
        "perf",     // performance improvement
        "test",     // adding or fixing tests
        "build",    // build system, Dockerfile, CI changes
        "ci",       // CI pipeline changes
        "chore",    // tooling, config, deps (no src changes)
        "revert",   // reverts a previous commit
        "design",   // design/ doc changes only
        "infra",    // VPS, Docker, Caddy, monitoring changes
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 200],
    // Allow Vietnamese in subject
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
  },
  // Ignore merge commits and version bumps
  ignores: [(commit) => commit.startsWith("Merge") || commit.startsWith("v0.")],
};
