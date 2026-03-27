# PMTL Admin Canon Repair Prompt

Use this prompt for an implementation-capable AI working directly inside `C:\Users\ADMIN\DEV2\PMTL_VN`.

## Prompt

You are repairing the PMTL admin implementation inside the repo `C:\Users\ADMIN\DEV2\PMTL_VN`.

Your task is not to "make a pretty dashboard". Your task is to bring `apps/admin` back into compliance with PMTL design canon and runtime truth.

You must audit first, then repair, then verify.

---

## Ground truth you must obey

### 1. Design canon

Read these first, in order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `design/README.md`
4. `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`
5. `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
6. `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md`
7. `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`
8. `design/02-platform-baseline/web-runtime/ELDERLY_UX.md`
9. `design/02-platform-baseline/web-runtime/ZUSTAND_POLICY.md`
10. `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md`
11. `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`
12. `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
13. `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md`
14. `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md`

### 2. Starter truth

Use the local starter references as source-of-truth for layout and interaction patterns:

- `tmp/starter-reference/shadcn-admin`
- if needed, also inspect the upstream local reference at `tmp/reference/anthropic/claude-code` for current Claude Code docs, but do not let that override PMTL UI canon

### 3. Runtime truth

Do not treat `design/` as proof that runtime already exists.

`design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` is the runtime truth owner.

If a route or module is still outside the safe scaffold window, do not fake it as "dynamic". Mark it honestly as blocked, or keep it minimal and explicitly non-authoritative.

---

## Important corrections before you start

Do not repeat earlier false assumptions:

- `apps/admin` is already a Vite + React SPA.
- `apps/admin/vite.config.ts` already exists.
- Do not waste time converting the app into Vite. It already is.
- The real problems are:
  - starter fidelity drift
  - canonical admin shell drift
  - missing or incorrect command palette behavior
  - incomplete sidebar/header/user-menu behavior
  - weak DataTable implementation
  - wrong state topology
  - fake CRUD / local-only state
  - missing server-backed flows
  - missing elderly-friendly loading/empty/error states

---

## Primary objective

Repair `apps/admin` so it matches PMTL canon and the `shadcn-admin` interaction model as closely as possible, while staying honest about backend/runtime truth.

The end state must satisfy all of the following:

- keep `apps/admin` as Vite + React + TanStack Router SPA
- keep `shadcn-admin` shell, page anatomy, and interaction model
- use `TanStack Query` for server state
- use `Zustand` only for allowed UI state per `ZUSTAND_POLICY.md`
- use `cmdk` global command palette with hotkey
- use proper DataTable primitives with:
  - server-side pagination
  - filters
  - sorting
  - column visibility
  - bulk actions
  - row actions
  - inline edit only where canon allows
- use high-contrast spacing and elderly-safe interaction rules from `ELDERLY_UX.md`
- use real image avatars, not SVG avatars, for user identity surfaces

---

## Audit phase is mandatory

Before changing code, produce a short repo-local audit note in:

`docs/error/admin-canon-repair-audit.md`

The audit must compare:

1. `apps/admin` current runtime
2. `tmp/starter-reference/shadcn-admin`
3. `ADMIN_ARCHITECTURE.md`
4. `ADMIN_MODULE_SPECS.md`
5. `IMPLEMENTATION_MAPPING.md`

The audit must classify issues into:

- `starter drift`
- `canon drift`
- `state-policy violation`
- `fake CRUD`
- `blocked by backend missing`
- `blocked by runtime wave`
- `perf / bundle / UX issue`

Do not start refactoring blindly before this audit file exists.

---

## Required repair scope

### A. Canonical shell and navigation

Repair the shell so it matches `shadcn-admin` pattern and PMTL module inventory:

- sidebar collapsible
- canonical grouped nav
- active states
- user menu
- workspace switcher if kept
- header search
- global command palette with keyboard hotkey
- dark/light mode that actually works

If any current shell customization drifted away from starter behavior, revert it toward the starter instead of inventing a third style.

### B. DataTable architecture

Create or repair a reusable common DataTable layer in `apps/admin` that can actually support canonical workspaces.

It must cover:

- toolbar
- faceted filters
- text search
- selection column
- bulk action bar
- row action menu
- dialog wiring
- column visibility
- pagination
- loading state
- empty state
- error state

Do not leave low-function hand-written tables where the starter already provides a better pattern.

### C. State topology

Audit every use of local state / Zustand / Query.

Rules:

- `Zustand` is only for theme, sidebar, low-risk preferences, dialog orchestration, and similar UI state
- never use `Zustand` as server cache
- never use it as auth/session source of truth
- never keep canonical entity data there if it belongs in Query
- remove localStorage-backed fake entity persistence

### D. Real vs fake CRUD

You must identify every admin screen that currently only mutates mock data or local state and classify it honestly.

Then:

- if backend owner routes already exist or are allowed in current scaffold wave, wire the screen to real API
- if backend routes do not yet exist but are allowed by current safe scaffold window, scaffold them in `apps/api`
- if backend routes are canon-only but currently outside the safe scaffold window, do not fake them as real; keep the UI honest and document the block

### E. Dashboard

Repair the dashboard so it is not just decorative cards.

It must respect the dashboard spec in `ADMIN_MODULE_SPECS.md`:

- dashboard stats aggregate
- recent posts compact table
- pending reports compact table
- audit log stream
- proper loading / empty / error states

Do not invent random analytics widgets if they are not in canon.

### F. First real admin workspaces

Prioritize canonical workspaces that matter most:

1. `/dashboard`
2. `/nguoi-dung`
3. `/nguoi-dung/phien`
4. `/kiem-duyet/bao-cao`
5. `/he-thong/feature-flags`
6. `/he-thong/audit-logs`
7. `/noi-dung/niem-kinh` only to the extent allowed by current safe scaffold window in `IMPLEMENTATION_MAPPING.md`

Do not claim all 24 workspaces complete unless they actually are.

---

## Backend rules

When backend work is required:

- backend authority is `apps/api`
- do not move authority into `apps/admin`
- use DTOs and validation boundaries
- follow NestJS module ownership properly
- do not leak Prisma models straight to admin frontend
- follow query-key and invalidation canon from `ADMIN_PAGE_API_MAPPING.md`

If a route family belongs to platform or identity, keep it there.

---

## Performance and quality rules

You must improve quality while repairing, not just make screens pass visually.

Required:

- route-level lazy loading where appropriate
- avoid giant all-in-one admin chunks where possible
- keep common table/dialog primitives reusable
- avoid duplicated feature scaffolds where a common primitive already exists
- use image avatars from assets or uploads, not SVG placeholders for user identity
- loading and empty states must remain elderly-friendly

---

## Things you must not do

- do not rewrite the whole app from scratch if a starter-aligned repair is enough
- do not invent a brand-new admin shell
- do not replace `shadcn-admin` interaction patterns with generic AI dashboard cards
- do not mark mock data as "done"
- do not silently keep localStorage CRUD
- do not overuse Zustand
- do not hide backend gaps with frontend tricks
- do not ignore `IMPLEMENTATION_MAPPING.md`

---

## Required verification before claiming success

Run at least:

- `pnpm --filter @pmtl/admin typecheck`
- `pnpm --filter @pmtl/admin build`
- relevant `apps/api` verification commands for any touched backend module
- runtime verification of the repaired admin routes in browser

If you changed query wiring, verify the real route behavior, not just type safety.

---

## Required final report

When done, report exactly:

1. which claims from the original criticism were true
2. which claims were false or overstated
3. which starter drifts were repaired
4. which screens are now truly server-backed
5. which screens are still blocked by backend/runtime wave limits
6. which state-policy violations were removed
7. which verification commands were run
8. remaining production risks

---

## Failure conditions

You failed if:

- the result still behaves like a demo shell
- command palette still is not hotkey-first and fully navigable
- sidebar/header/avatar/user-menu still feel custom and broken instead of starter-faithful
- DataTable still lacks canonical bulk/filter/pagination behavior
- fake CRUD still exists without being clearly marked
- the result ignores elderly UX or canonical loading/empty/error states
- the report pretends everything is done while runtime truth says otherwise

Repair the admin honestly and canonically. Do not improvise.
