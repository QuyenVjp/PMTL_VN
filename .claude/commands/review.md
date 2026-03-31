---
description: Full code review — arch-check + quality-gate pass
argument-hint: [file or module to review]
---

Run a full review for: $ARGUMENTS

1. Use the `arch-check` skill to flag contract violations.
2. Use the `pmtl-quality-gate` agent for broader review and verification readiness.
3. Summarize: CRITICAL findings first, then HIGH, then nice-to-haves.
4. Confirm verification command to run before declaring ready.
