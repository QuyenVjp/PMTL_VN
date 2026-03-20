#!/usr/bin/env node

const context = [
  "PMTL_VN session bootstrap:",
  "- Read AGENTS.md, TEAM_GUIDE.md, and .vscode/.instructions.md before making architectural assumptions.",
  "- Prefer repo wrappers: just dev-core/dev-full/verify-web/verify-cms/verify-all.",
  "- Treat design/ as the rebuild source of truth.",
  "- Use subagents for architecture, frontend, backend, verification, and ops work instead of overloading one thread.",
  "- Update docs when changing conventions, security posture, or project rules."
].join("\n");

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: context
    }
  })
);
