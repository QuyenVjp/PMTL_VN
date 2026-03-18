---
name: pmtl-runbook-cms-runtime-errors
description: PMTL_VN CMS incident runbook. Use when debugging recurring CMS runtime failures around auth, search, monitoring, health checks, or request guards so the agent follows known diagnostics before patching code.
---

# PMTL Runbook CMS Runtime Errors

## Read in this order

1. `docs/troubleshooting.md`
2. `docs/runbooks.md`
3. `apps/cms/src/routes/auth.ts` when the incident is auth-related
4. `apps/cms/src/services/search.service.ts` when the incident is search-related

## Incident approach

- Reproduce or identify the failing endpoint.
- Check health and logs before changing code.
- Prefer the documented command path for reindex, monitoring, and rollback.
- Capture exact failing command, route, and error message in the final note.

## Typical incident buckets

- auth cookie or session mismatches
- OAuth callback or redirect mismatch
- search reindex or Meilisearch sync failures
- monitoring health or worker heartbeat issues
