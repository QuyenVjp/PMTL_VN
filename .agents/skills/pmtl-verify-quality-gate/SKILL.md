---
name: pmtl-verify-quality-gate
description: PMTL_VN verification skill for code quality gates. Use after meaningful changes to run the strongest relevant checks, usually targeted tests, typecheck, lint, and build-oriented validation, instead of relying on manual confidence.
---

# PMTL Verify Quality Gate

Use this skill after implementation, not before.

## Default order

1. Targeted tests for touched areas.
2. Typecheck for the affected package or the monorepo.
3. Lint for the affected package or the monorepo.
4. Build or smoke verification when contracts changed.

## Script

Primary entrypoint: `py infra/tools/codex_actions.py quality-gate ...`

Compatibility wrapper: `scripts/run_quality_gate.py`

Example:

```bash
py infra/tools/codex_actions.py quality-gate --scope all
py infra/tools/codex_actions.py quality-gate --scope web --skip-tests
```
