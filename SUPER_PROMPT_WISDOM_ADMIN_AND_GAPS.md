# SUPER PROMPT — Wisdom Admin Workspace + Feature Flags Write Path

Repo: `C:\Users\ADMIN\DEV2\PMTL_VN`
Do NOT touch `apps/web`.

## Context

A senior audit pass has confirmed all admin features are implemented and typecheck-clean EXCEPT the following gaps which this prompt addresses:

1. **`wisdom-baihoa` admin workspace** — completely absent (no folder, no queries, no mutations, no UI)
2. **Feature Flags write path** — read-only currently; no PATCH mutation wired

## Read First

- `C:\Users\ADMIN\DEV2\PMTL_VN\AGENTS.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\admin\AGENTS.override.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\apps\api\AGENTS.override.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\.agents\skills\pmtl-admin-ui\SKILL.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\.agents\skills\pmtl-ui-behavior\SKILL.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\.agents\skills\pmtl-cornhub-workflow\SKILL.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\design\04-execution-overlay\admin\APPS_ADMIN_SCAFFOLD_BACKLOG.md` (section 23 — wisdom-baihoa)
- `C:\Users\ADMIN\DEV2\PMTL_VN\design\04-execution-overlay\admin\ADMIN_PAGE_API_MAPPING.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\design\04-execution-overlay\api\API_ROUTE_INVENTORY.md` (wisdom and feature-flags sections)
- `C:\Users\ADMIN\DEV2\PMTL_VN\design\03-domains\wisdom-qa\CONTRACTS.md`
- `C:\Users\ADMIN\DEV2\PMTL_VN\design\03-domains\wisdom-qa\MODULE_MAP.md`

## CornHub — Mandatory

Use CornHub MCP workflow:
1. `corn_session_start`
2. `corn_detect_changes`
3. `corn_code_search`
4. `corn_code_context` (check wisdom-qa module in API, feature-flags in API)
5. `corn_code_impact` before creating shared context/dialog code
6. `corn_knowledge_store` after implementation
7. `corn_quality_report`
8. `corn_session_end`

---

## Task 1 — Feature Flags Write Path

### Current state
- `apps/admin/src/features/system/feature-flags-page.tsx` renders a flag list (read-only)
- `apps/admin/src/features/system/` has NO `mutations.ts`
- There is no PATCH mutation wired anywhere for feature flags

### Required
Verify that the API route `PATCH /admin/feature-flags/:key` exists and is working in `apps/api/src/modules/`.
If it does:
- Add `useUpdateFeatureFlag()` mutation to `apps/admin/src/features/system/` (create `mutations.ts`)
- Wire an edit toggle or inline edit into `feature-flags-page.tsx` so admins can toggle `enabled: boolean` or update `value`
- Add `handleApiError` in onError, invalidate flag list on success
- Gate the write action to `SUPER_ADMIN` role visually (disable the toggle for non-super-admin)

If the API route does NOT exist:
- Implement `PATCH /api/admin/feature-flags/:key` in the relevant API module
- Then wire the FE as above

### Acceptance
- Toggle or edit button is functional, calls real mutation, invalidates list
- `pnpm --filter @pmtl/admin typecheck` → CLEAN
- `pnpm --filter @pmtl/api typecheck` → CLEAN

---

## Task 2 — Wisdom Baihoa Admin Workspace

### Current state
- `apps/admin/src/features/wisdom-baihoa/` does NOT EXIST
- `apps/api/src/modules/wisdom-qa/` EXISTS — verify what routes it exposes for admin
- The router at `apps/admin/src/routes/__root.tsx` likely has no wisdom-admin route

### Design spec (from APPS_ADMIN_SCAFFOLD_BACKLOG.md section 23)

Required query keys:
- `wisdomAdminKeys.list(filters)` — `GET /admin/wisdom/entries`
- `wisdomAdminKeys.detail(publicId)` — `GET /admin/wisdom/entries/:publicId`
- `wisdomAdminKeys.offlineBundles()` — `GET /admin/wisdom/offline-bundles`
- `wisdomAdminKeys.importJobs()` — `GET /admin/wisdom/import-jobs`
- `baihuaAdminKeys.books(filters)` — `GET /admin/wisdom/baihua/books`
- `baihuaAdminKeys.chapter(publicId)` — `GET /admin/wisdom/baihua/chapters/:publicId`

Required mutations:
- `useCreateWisdomEntry()` — `POST /admin/wisdom/entries`
- `useUpdateWisdomEntry()` — `PATCH /admin/wisdom/entries/:publicId`
- `usePublishWisdomEntry()` — `POST /admin/wisdom/entries/:publicId/publish`
- `useTriggerIngestionJob()` — `POST /admin/wisdom/entries/ingestion-jobs`
- `useRebuildOfflineBundles()` — `POST /admin/wisdom/offline-bundles/rebuild`

Required invalidation:
- wisdom list/detail on create/update/publish
- offline-bundles after rebuild
- import-jobs after trigger

### Required UI (minimum Phase 1 shell)

`apps/admin/src/features/wisdom-baihoa/`:
- `queries.ts` — key factories + queryOptions for list and detail
- `mutations.ts` — all write mutations above
- `index.tsx` — WisdomPage with:
  - Table of wisdom entries (publicId, title, status, publishedAt)
  - Row actions: edit, publish, delete
  - Create dialog
  - Confirm dialogs for publish + delete
  - All wired correctly with WorkspaceConfirmDialog + WorkspaceRowActions pattern

Baihua books/chapters section can be Wave 2 — do NOT block on it for this task.

### Router registration

After creating the feature, register a new route in `apps/admin/src/routes/__root.tsx`:
- path: `/noi-dung/tri-tue` or appropriate Vietnamese path matching design
- component: WisdomPage (lazy imported)
- add to sidebar nav if applicable

### API verification

Before building FE, audit `apps/api/src/modules/wisdom-qa/`:
- Verify the required admin routes exist
- If any required route is missing, implement it following existing patterns in content.controller.ts and content.service.ts
- Run `pnpm --filter @pmtl/api typecheck` after any API changes

### Acceptance
- Wisdom admin page loads, shows entries table
- Create/edit/publish/delete all functional
- `pnpm --filter @pmtl/admin typecheck` → CLEAN
- `pnpm --filter @pmtl/api typecheck` → CLEAN
- No dead menu items or unreachable dialogs

---

## Shared Rules

- Use `WorkspaceConfirmDialog` for all confirm actions
- Use `WorkspaceRowActions` for all row menus
- Every mutation must have `handleApiError` in `onError`
- Every mutation must invalidate relevant query keys in `onSuccess`
- Vietnamese text must preserve proper dấu
- Do not touch `apps/web`
- Do not leave TODOs or partial scaffolding

## Required Verification Commands

```
pnpm --filter @pmtl/admin typecheck
pnpm --filter @pmtl/api typecheck
```

## Final Response Format

Return exactly:
1. API audit result (what wisdom-qa routes exist vs required)
2. Feature Flags: what was changed
3. Wisdom Admin: what was implemented
4. Exact files changed
5. Typecheck results
6. CornHub tools used
7. Residual risks
