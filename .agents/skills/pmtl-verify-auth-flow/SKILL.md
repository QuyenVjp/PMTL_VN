---
name: pmtl-verify-auth-flow
description: PMTL_VN auth verification skill. Use when touching register, login, logout, forgot-password, reset-password, profile, session cookies, proxy auth guards, or OAuth callbacks so auth behavior is verified instead of assumed.
---

# PMTL Verify Auth Flow

## What to verify

- CMS health before auth checks.
- Login and session token issuance.
- `GET /api/auth/me`.
- Profile or protected-route behavior when the change touches those paths.
- Cookie or proxy behavior when the bug is session-related.

## Script

Run `scripts/run_auth_flow_check.py`. It wraps the repo smoke test and extracts the auth-relevant steps.

```bash
python .agents/skills/pmtl-verify-auth-flow/scripts/run_auth_flow_check.py
```

## Read when needed

- `docs/api/contracts.md`
- `docs/troubleshooting.md`
- `apps/cms/src/routes/auth.ts`
- `apps/web/src/proxy.ts`
