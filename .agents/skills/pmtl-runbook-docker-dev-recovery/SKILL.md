---
name: pmtl-runbook-docker-dev-recovery
description: PMTL_VN Docker recovery runbook. Use when Docker Desktop, compose-backed dev services, or local infrastructure stop booting correctly and the agent needs the documented recovery path instead of trial-and-error.
---

# PMTL Runbook Docker Dev Recovery

## Use this first

- `infra/scripts/docker-recover.ps1`
- `docs/troubleshooting.md`
- `docs/runbooks.md`

## Default recovery path

1. Confirm Docker Desktop service availability.
2. Run the recovery script before touching compose files.
3. Re-check compose service health after the engine is ready.
4. Only then restart the PMTL dev stack.

## Command

```powershell
powershell -ExecutionPolicy Bypass -File infra/scripts/docker-recover.ps1
```

If Docker still does not come back, collect diagnostics instead of guessing.
