#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync(0, "utf8");
const payload = raw ? JSON.parse(raw) : {};
const command = String(payload.tool_input?.command || "").trim();

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stateFile = path.join(projectDir, ".claude", "state", "verification-needed.json");

const verificationPatterns = [
  /\bjust\s+verify-web\b/i,
  /\bjust\s+verify-cms\b/i,
  /\bjust\s+verify-all\b/i,
  /\bjust\s+auth-check\b/i,
  /\bjust\s+search-check\b/i,
  /\bpnpm\s+lint\b/i,
  /\bpnpm\s+typecheck\b/i,
  /\bpnpm\s+test\b/i,
  /\bpnpm\s+build\b/i
];

if (verificationPatterns.some((pattern) => pattern.test(command))) {
  try {
    if (fs.existsSync(stateFile)) {
      fs.unlinkSync(stateFile);
    }
  } catch (error) {
    process.stderr.write(`Failed to clear verification state: ${error.message}\n`);
  }
}
