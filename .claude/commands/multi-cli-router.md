---
description: Route a task through the PMTL multi-CLI worker matrix
argument-hint: [task]
model: sonnet
allowed-tools: Bash(py *)
---

Use the repo-local skill `pmtl-multi-cli-orchestrator` and the deterministic repo wrapper.

Task: $ARGUMENTS

Execution rules:

1. If no task text was provided, ask the user for the task in one sentence.
2. Start from PMTL repo policy and current workspace context.
3. If the task is trivial or fully covered by the active PMTL skill stack, stay local and say so briefly.
4. Otherwise run:

!`py infra/tools/codex_actions.py multi-cli-router --task "$ARGUMENTS" --speed fast`

5. Summarize the routing choice and the worker result for the user.
6. Merge only validated findings back into the main answer. External workers are advisory, not the policy authority.
