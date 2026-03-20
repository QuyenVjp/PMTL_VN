#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stateDir = path.join(projectDir, ".claude", "state");
const stateFile = path.join(stateDir, "verification-needed.json");

const raw = fs.readFileSync(0, "utf8");
const payload = raw ? JSON.parse(raw) : {};

const toolInput = payload.tool_input || {};
const files = [];

if (typeof toolInput.file_path === "string") {
  files.push(toolInput.file_path);
}
if (typeof toolInput.path === "string") {
  files.push(toolInput.path);
}

const normalized = files.map((file) =>
  file.replace(/\\/g, "/").replace(projectDir.replace(/\\/g, "/"), "")
);

let verify = [];

if (normalized.some((file) => file.startsWith("/apps/web") || file.startsWith("/packages/ui"))) {
  verify.push("just verify-web");
}
if (
  normalized.some(
    (file) =>
      file.startsWith("/apps/api") ||
      file.startsWith("/infra") ||
      file.startsWith("/packages/shared")
  )
) {
  verify.push("just verify-cms");
}
if (normalized.some((file) => /auth|session|cookie/i.test(file))) {
  verify.push("just auth-check");
}
if (normalized.some((file) => /search|meili/i.test(file))) {
  verify.push("just search-check");
}
if (verify.length === 0) {
  verify.push("pnpm lint", "pnpm typecheck");
}

verify = [...new Set(verify)];

fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(
  stateFile,
  JSON.stringify(
    {
      files: normalized,
      verify,
      updatedAt: new Date().toISOString()
    },
    null,
    2
  )
);

const extra = [
  `Touched files: ${normalized.join(", ") || "(unknown)"}.`,
  `Recommended targeted verification: ${verify.join(" | ")}.`
];

if (normalized.some((file) => /AGENTS\.md|CLAUDE\.md|\.claude\/agents|\.claude\/hooks|\.mcp\.json/i.test(file))) {
  extra.push("This change touched agent conventions or Claude tooling. Keep documentation and repo rules aligned.");
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: extra.join(" ")
    }
  })
);
