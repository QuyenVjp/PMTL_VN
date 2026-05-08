#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const stateFile = path.join(projectDir, ".claude", "state", "verification-needed.json");

if (!fs.existsSync(stateFile)) {
  process.exit(0);
}

try {
  const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
  const verify = Array.isArray(state.verify) ? state.verify.join(" | ") : "run the relevant targeted checks";
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason: `Code changed in this session. Run or explicitly justify skipping targeted verification before stopping. Suggested: ${verify}`
    })
  );
} catch (error) {
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason:
        "Code changed in this session and verification state could not be read. Run the relevant targeted checks before stopping."
    })
  );
}
