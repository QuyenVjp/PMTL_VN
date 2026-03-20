#!/usr/bin/env node

const fs = require("fs");

const raw = fs.readFileSync(0, "utf8");
const payload = raw ? JSON.parse(raw) : {};
const command = String(payload.tool_input?.command || "").trim();

const denyPatterns = [
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+clean\b/i,
  /\brm\s+-rf\b/i,
  /\bdel\s+\/f\s+\/s\s+\/q\b/i,
  /\bremove-item\b.*-recurse\b.*-force\b/i,
  /\bformat\s+[a-z]:/i
];

if (denyPatterns.some((pattern) => pattern.test(command))) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Blocked destructive shell command. Use a safer repo-specific workflow or get explicit user approval."
      }
    })
  );
  process.exit(0);
}

if (/compose\.prod\.yml|\.env\.prod/i.test(command)) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          "This command references production compose or production env files. Confirm intent before proceeding.",
        additionalContext:
          "Prefer local-dev wrappers unless the user explicitly asked for production-oriented commands."
      }
    })
  );
}
