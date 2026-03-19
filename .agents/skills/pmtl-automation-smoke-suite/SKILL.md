---
name: pmtl-automation-smoke-suite
description: PMTL_VN automation skill for repeatable smoke and monitoring commands. Use when the task needs to run repo-backed smoke tests, monitoring drills, or Telegram alert checks through a stable wrapper instead of ad hoc shell typing.
---

# PMTL Automation Smoke Suite

## Supported suites

- `smoke`
- `monitoring`
- `telegram`

## Script

Primary entrypoint: `py infra/tools/codex_actions.py smoke-suite ...`

Compatibility wrapper: `scripts/run_smoke_suite.py`

```bash
py infra/tools/codex_actions.py smoke-suite --suite smoke
py infra/tools/codex_actions.py smoke-suite --suite monitoring
```

Use this skill when the command itself is the task or part of verification.
