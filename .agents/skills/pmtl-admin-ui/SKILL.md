---
name: pmtl-admin-ui
description: PMTL_VN admin UI implementation and review lane. Use for apps/admin workspace screens, DataTable/filter/bulk-action flows, query-state wiring, operational dashboards, and admin-shell surfaces that must stay clarity-first and canon-aligned.
---

# PMTL Admin UI

## Purpose

Keep `apps/admin` implementation disciplined, query-aware, and operationally clear instead of drifting into generic dashboard UI or overdesigned marketing surfaces.

## Use When

- Building or refactoring admin workspaces in `apps/admin`.
- Implementing admin tables, filters, row actions, bulk actions, detail drawers, moderation flows, or operational dashboards.
- Reviewing admin-shell structure, admin query-state wiring, or invalidation-sensitive admin UI.

## Required Inputs

- target admin page route or workspace
- current API route group and DTO owner docs
- query key / invalidation scope expected after the edit

## Expected Output

- Admin UI that matches PMTL workspace canon, keeps action clarity high, and does not invent business authority in the frontend.
- Query-state and invalidation behavior that match admin owner docs instead of ad hoc component fetches.

## Read First

1. `AGENTS.md`
2. `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`
3. `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
4. `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
5. `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md`
6. `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md`
7. `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
8. `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`

## Execution Approach

1. Confirm the admin workspace owner docs before touching layout or actions.
2. Start from workspace purpose, table/filter state, and route-level action narrowing.
3. Keep query keys and invalidation aligned with admin owner docs.
4. Prefer clear table/filter/form behavior over decorative flourish.
5. Finish with targeted verification for the exact workspace touched.

## Core rules

- `apps/admin` is not a business-authority surface; it reflects backend policy, it does not invent it.
- Default to clarity-first admin UI: tables, filters, summaries, and mutations should read fast under operational pressure.
- Do not over-brand admin pages; premium polish is allowed, but admin surfaces prioritize legibility and action safety over visual theater.
- Do not invent new query keys, invalidation rules, or bulk-action semantics outside admin owner docs.
- Do not let page gate imply action permission. Backend route guard and policy projection win.
- Use admin feature-local query/mutation files instead of scattering fetch logic across components.
- Keep destructive and high-risk actions explicit, confirmable, and stateful.

## File placement

- Admin routes / shell entry: `apps/admin/src/app` or repo-equivalent admin routing layer
- Workspace features: `apps/admin/src/features/<workspace>`
- Admin shared UI primitives: `apps/admin/src/components` or `packages/ui` when truly shared
- Query/mutation ownership: feature-local `queries.ts`, `mutations.ts`, and related hooks/helpers

## Verification

- Run `py infra/tools/codex_actions.py quality-gate --scope admin` after meaningful changes when that scope exists; otherwise run the strongest admin-targeted checks available.
- Recheck against:
  - `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
  - `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
  - `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md`
- If the workspace touches search, auth, or runtime ops, pair with the narrower verification lane instead of trusting admin UI alone.

## Do not

- Do not use `frontend-design` as the primary authority for admin workspaces.
- Do not collapse admin query state into one global store when feature-local factories are the canon.
- Do not broaden invalidation to “refresh all admin” after every mutation.
- Do not turn operational pages into analytics theater with charts/widgets the owner docs never requested.

## References

- `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`
- `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
- `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
- `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md`
- `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md`
- `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
- `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`

## Pair with

- `pmtl-ui-behavior` for accessibility, focus, and interaction-state discipline.
- `pmtl-ui-style-system` for restrained visual hierarchy.
- `ui-ux-pro-max` only as a secondary critique lane for dense tables/forms/dashboard readability.
