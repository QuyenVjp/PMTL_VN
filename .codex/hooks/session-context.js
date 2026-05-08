#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Clear stale verification state from a previous session that ended without verify
const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const staleState = path.join(projectDir, ".claude", "state", "verification-needed.json");
try {
  if (fs.existsSync(staleState)) fs.unlinkSync(staleState);
} catch {}

const context = [
  "PMTL_VN session bootstrap:",
  "- Read AGENTS.md, TEAM_GUIDE.md, and .vscode/.instructions.md before making architectural assumptions.",
  "- Prefer repo wrappers: just dev-core/dev-full/verify-web/verify-cms/verify-all.",
  "- Treat design/ as the rebuild source of truth.",
  "- Use subagents for architecture, frontend, backend, verification, and ops work instead of overloading one thread.",
  "- External review workers are available: claude-worker, codex-worker, copilot-worker, and gemini-worker via python infra/tools/external_agent.py.",
  "- In new chats, phrases like 'use multi-cli router' or the command /multi-cli-router should trigger the repo-local multi-worker routing skill.",
  "- Preferred repo wrapper: python infra/tools/codex_actions.py multi-cli-router --task \"<task>\" --speed fast with optional --compare.",
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
