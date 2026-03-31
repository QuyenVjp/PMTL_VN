---
description: Create a structured git commit with context
argument-hint: [optional commit message hint]
---

Create a structured commit for the current changes.

1. Run `git diff --stat HEAD` to see what changed.
2. Run `git status` to see untracked files.
3. Draft a commit message following: <type>(<scope>): <description>
   - Types: feat, fix, refactor, docs, chore, test, perf
   - Scope: module or area (e.g. auth, search, web, api)
4. Confirm the message with the user before committing.
5. Stage and commit. Never use --no-verify.
6. If Stop hook fires (verification pending), run the suggested check first.

Hint from user: $ARGUMENTS
