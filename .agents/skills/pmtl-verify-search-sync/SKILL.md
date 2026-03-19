---
name: pmtl-verify-search-sync
description: PMTL_VN search verification skill. Use when changing search schemas, Meilisearch integration, indexing, fallback search behavior, or search result mapping so index sync is checked with commands and health probes.
---

# PMTL Verify Search Sync

## Default workflow

1. Rebuild or batch reindex posts.
2. Check Meilisearch health.
3. Inspect search-related CMS status or logs if the index does not update.

## Script

Primary entrypoint: `py infra/tools/codex_actions.py search-sync ...`

Compatibility wrapper: `scripts/run_search_sync_check.py`

```bash
py infra/tools/codex_actions.py search-sync --all-pages
py infra/tools/codex_actions.py search-sync --page 1 --limit 100
```

## Read when needed

- `docs/runbooks.md`
- `docs/troubleshooting.md`
- `apps/cms/src/services/search.service.ts`
- `apps/cms/src/integrations/meilisearch/*`
