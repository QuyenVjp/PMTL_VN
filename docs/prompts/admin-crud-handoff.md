# PMTL Admin CRUD Dynamic Implementation Prompt

Use this prompt as-is for an implementation-capable AI working inside the repo `C:\Users\ADMIN\DEV2\PMTL_VN`.

## Prompt

You are working inside the PMTL_VN monorepo at `C:\Users\ADMIN\DEV2\PMTL_VN`.

Your task is to finish the admin implementation properly, with real dynamic CRUD behavior, not mock-only UI.

## Non-negotiable context

- The admin frontend is in `apps/admin`.
- The backend authority is NestJS in `apps/api`.
- Do not invent a new admin design.
- Preserve the `shadcn-admin` starter structure and behavior.
- The current admin already grafted some starter primitives, but several flows are still frontend-only or localStorage-backed.
- Your job is to replace fake/mock/localStorage CRUD with real query/mutation flows where backend owner routes exist, and scaffold the missing backend routes where canon already requires them.

## Read first

1. `AGENTS.md`
2. `apps/admin/AGENTS.override.md` if present
3. `apps/api/AGENTS.override.md` if present
4. `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`
5. `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
6. `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
7. `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md`
8. `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md`
9. `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
10. `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`

## Current frontend state you must respect

- `apps/admin/src/features/users/*` now follows the starter `users` pattern more closely:
  - provider
  - dialogs
  - row actions
  - bulk actions
  - filter toolbar
- But `users` is still localStorage-backed and not server-backed.
- `apps/admin/src/features/workspaces/module-pages.tsx` still contains several admin pages that are using mock data.
- `apps/admin/src/features/workspaces/workspace-table-page.tsx` is a reusable common table shell. Reuse it where appropriate, but do not force every screen into the same lowest-common-denominator flow if starter-specific behavior is better.
- `settings` is frontend-only right now.
- `feature flags`, `audit logs`, `moderation reports`, `sessions`, and `users` need proper query/mutation ownership.

## Primary objective

Implement real dynamic CRUD and list/detail flows for the most important admin surfaces, starting with:

1. `users-admin`
2. `sessions-admin`
3. `moderation-reports`
4. `feature-flags`
5. `audit-logs` read-only dynamic list/detail

## Required implementation rules

- Do not keep fake CRUD that only mutates local state unless the backend canon for that route truly does not exist yet.
- If canon says the route should exist, scaffold the backend route and wire the frontend to it.
- Keep backend authority in `apps/api`, not in `apps/admin`.
- Use Zod validation for DTO boundaries.
- Use structured logging and normal repo conventions.
- Use query key factories and feature-local query/mutation files in `apps/admin/src/features/<feature>/`.
- Do not broad-invalidate all admin queries after mutations.
- Follow invalidation rules from `ADMIN_PAGE_API_MAPPING.md`.
- Keep the `shadcn-admin` starter interaction style:
  - real row action menus
  - invite/edit/delete dialogs
  - bulk action bar
  - filters
  - view options
  - pagination
- Use image avatars, not SVG avatars, for user profile lanes.

## Concrete routes to implement

### 1. Users Admin

Frontend route:
- `/nguoi-dung`

Canonical backend routes:
- `GET /api/admin/users`
- `GET /api/admin/users/:publicId`
- `PATCH /api/admin/users/:publicId/profile`
- `PATCH /api/admin/users/:publicId/role`
- `POST /api/admin/users/:publicId/block`
- `POST /api/admin/users/:publicId/unblock`
- `GET /api/admin/users/:publicId/audit-history`
- `GET /api/admin/users/:publicId/practice-stats`

Frontend expectations:
- server-backed users table
- filter by status and role
- row menu for edit/delete-equivalent admin actions
- invite/add/edit dialogs
- block/unblock flow
- role change flow
- user detail drawer or dialog if useful
- remove localStorage state

### 2. Sessions Admin

Frontend route:
- `/nguoi-dung/phien`

Canonical backend routes:
- `GET /api/admin/sessions`
- `GET /api/admin/sessions/:sessionId`
- `POST /api/admin/sessions/revoke-bulk`
- `POST /api/admin/users/:publicId/sessions/revoke-all`

Frontend expectations:
- dynamic sessions table
- filters for user/status/device if feasible
- revoke single
- revoke bulk
- revoke all by user

### 3. Moderation Reports

Frontend route:
- `/kiem-duyet/bao-cao`

Canonical backend routes:
- `GET /api/moderation/reports`
- `POST /api/moderation/reports/:publicId/decision`

Frontend expectations:
- queue-style table
- report detail
- decision actions
- invalidate affected target surfaces correctly

### 4. Feature Flags

Frontend route:
- `/he-thong/feature-flags`

Canonical backend routes:
- `/api/admin/feature-flags`
- `/api/admin/feature-flags/:key`

Frontend expectations:
- real list
- toggle/update dialog
- dynamic state
- no fake toggles

### 5. Audit Logs

Frontend route:
- `/he-thong/audit-logs`

Canonical backend routes:
- `/api/admin/audit-logs`
- `/api/admin/audit-logs/:publicIdOrId`

Frontend expectations:
- dynamic read-only list
- filters
- detail dialog/drawer

## Backend implementation guidance

- Create or complete feature modules in `apps/api/src/modules` or `apps/api/src/platform` according to repo boundaries.
- If a route family belongs to identity/session/platform, keep it under the correct owner module instead of a random controller.
- Use DTOs that match `API_DTO_SHAPE_PLAN.md`.
- Do not leak Prisma internals directly to the frontend.
- Add the minimum service/repository/controller code needed to make the routes real.
- If seed data is needed for local dev, add it safely.

## Frontend implementation guidance

- Put each admin feature in its own folder:
  - `apps/admin/src/features/users-admin/`
  - `apps/admin/src/features/sessions-admin/`
  - `apps/admin/src/features/moderation-reports/`
  - `apps/admin/src/features/feature-flags/`
  - `apps/admin/src/features/audit-logs/`
- If reusing the current `users` folder is cleaner, keep naming coherent and document the choice.
- Add:
  - `queries.ts`
  - `mutations.ts`
  - `types.ts`
  - table/dialog components as needed
- Use TanStack Query already present in the repo.
- Keep starter-like UX, but content in Vietnamese where appropriate.

## Do not do these things

- Do not invent random new admin pages.
- Do not rewrite the whole admin shell again.
- Do not replace starter patterns with generic AI dashboard cards.
- Do not leave fake CRUD pretending to be real.
- Do not wire everything through a giant global store.
- Do not claim completion without real verification.

## Verification required before claiming success

Run the strongest relevant checks after implementation:

- `pnpm --filter @pmtl/admin typecheck`
- `pnpm --filter @pmtl/admin build`
- relevant `apps/api` typecheck/build/test commands
- run the project and verify the implemented admin routes work in browser

## Required final output

When done, report:

1. which backend routes were implemented or completed
2. which frontend routes are now truly server-backed
3. which screens still remain mock because backend canon is not yet implemented
4. what verification commands were run
5. any remaining production risks

## Quality bar

If your output still behaves like a static demo, you failed.
If your output breaks the `shadcn-admin` interaction model, you failed.
If your output ignores `design/` canon, you failed.

Deliver production-minded CRUD, not a pretty fake shell.
