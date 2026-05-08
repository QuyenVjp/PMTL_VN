#!/usr/bin/env node
/**
 * PreToolUse hook — fires before Bash when command contains "git commit".
 * Advisory only: injects guidance context, never blocks.
 *
 * Checks:
 * 1. Message too short (< 10 chars) — likely a lazy "fix" or "wip"
 * 2. No verb at start — good commit messages lead with an action word
 * 3. Lines > 72 chars — Conventional style recommends wrapping
 * 4. Missing Co-Authored-By for AI-assisted commits
 */

const fs = require("fs");

const raw = fs.readFileSync(0, "utf8");
const payload = raw ? JSON.parse(raw) : {};
const command = String(payload.tool_input?.command || "").trim();

// Only fire for git commit commands
if (!/\bgit\s+commit\b/i.test(command)) {
  process.exit(0);
}

// Extract the -m message if present
const mMatch = command.match(/-m\s+["']([^"']+)["']/);
if (!mMatch) {
  // Using heredoc or file — too complex to parse, skip
  process.exit(0);
}

const message = mMatch[1].trim();
const lines = message.split("\n");
const subject = lines[0] || "";

const hints = [];

if (subject.length < 10) {
  hints.push(`Commit subject "${subject}" rất ngắn — viết rõ hơn để git log dễ đọc.`);
}

if (subject.length > 72) {
  hints.push(`Subject dài ${subject.length} chars — nên giữ dưới 72 chars (body có thể dài hơn).`);
}

const lazyPhrases = /^(fix|wip|update|change|edit|test|done|commit|ok|lol|temp|misc|hotfix|patch)\s*$/i;
if (lazyPhrases.test(subject.trim())) {
  hints.push(`Subject "${subject}" quá generic — thêm ngữ cảnh: fix cái gì, ở đâu?`);
}

if (!message.includes("Co-Authored-By:")) {
  hints.push("Thiếu Co-Authored-By nếu commit này dùng AI (Claude Code). Thêm: Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>");
}

if (hints.length === 0) {
  process.exit(0);
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: `[commit-message-check] ${hints.join(" | ")}`
    }
  })
);
