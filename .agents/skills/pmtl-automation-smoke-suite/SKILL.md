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

Run `scripts/run_smoke_suite.py`.

```bash
python .agents/skills/pmtl-automation-smoke-suite/scripts/run_smoke_suite.py --suite smoke
python .agents/skills/pmtl-automation-smoke-suite/scripts/run_smoke_suite.py --suite monitoring
```

Use this skill when the command itself is the task or part of verification.
