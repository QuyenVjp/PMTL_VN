# altar-management — Admin Scaffold Gap Analysis

> **Status:** BLOCKED — admin scaffold not permitted under current canon
> **Authored:** 2026-04-20
> **Evidence base:** `design/03-domains/altar-management/CONTRACTS.md`,
> `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`,
> `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`,
> `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`,
> `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`,
> `apps/admin/AGENTS.override.md`
>
> **Not a product decision.** This doc describes what is missing. It does not approve, pre-approve,
> or imply direction for any future admin surface. All product decisions must be made separately
> and reflected in the relevant design files before any scaffold is allowed.

---

## 1. Purpose

This document records why the admin scaffold for `altar-management` is currently blocked,
what design artifacts are missing, and what decisions must be made and committed to canon
before any implementation work can begin.

It exists to prevent runtime-ahead FE code from being treated as canon approval.
The existing `/ban-tho/*` frontend routes do not constitute a scaffold decision.

---

## 2. Current State

### What the canon says

The `altar-management` domain has the following canonical coverage:

| File | Coverage |
|------|----------|
| `design/03-domains/altar-management/CONTRACTS.md` | 4 `member`-auth routes under `/api/engagement/altar/*` in `EngagementModule`. Owner: `AltarValidationService / AltarItemProtocolService`. |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` line 159 | `GET /content/practice-support/altar-care` — public content read (altar-care instructional text, owned by `content` module). |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` lines 274–275 | `GET /admin/content/practice-support/altar-care` and `PATCH /admin/content/practice-support/altar-care` — content management of altar-care guidance text, `editor+`, owner `content`. This is editorial content, not altar item inventory management. |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` lines 457–459 | `GET /me/altar`, `GET /me/altar/:publicId`, `POST /me/altar` — member-side engagement altar logs, `member+`, owner `vows-merit`. |

### What the canon does NOT contain

- No entry in `ADMIN_MODULE_SPECS.md` for an altar-management admin workspace.
- No row in `ADMIN_PAGE_API_MAPPING.md` for any altar-management admin route family.
- No admin-scoped routes in `API_ROUTE_INVENTORY.md` for altar item inventory, condition management, or validation log review.
- No query key family registered for an altar-management admin surface.
- No role or ownership statement covering admin operators over altar item records.

### What exists in runtime FE today

The following routes exist in `apps/admin/src/routes/__root.tsx`:

```
/ban-tho/vat-pham     → AltarItemsPage
/ban-tho/nhat-ky      → ValidationLogsPage
/ban-tho/quy-trinh    → AltarProceduresPage
```

These were built as operational queue UIs. They render item lists, condition badges, and
validation logs sourced from endpoints that exist in the old runtime but have no backing in
the NestJS rebuild route inventory.

**Classification:** runtime-ahead artifacts. Per `IMPLEMENTATION_MAPPING.md`:
> "Runtime cũ trong repo không được tính là implementation hợp lệ cho direction mới
> chỉ vì nó đang tồn tại."

A WorkspaceDetailSheet hygiene pass was applied to these tables (2026-04-20) to keep
the UX consistent with other admin surfaces. That hygiene action does not constitute
canon approval of the surface itself.

---

## 3. Canon Gaps

The following design artifacts are entirely absent and must be created before any scaffold
is permitted:

### Gap 1 — No ADMIN_MODULE_SPECS entry

`ADMIN_MODULE_SPECS.md` defines the spec template every admin workspace must satisfy before
code is written (route, columns, detail view, create flow, bulk actions, role requirements,
audit events, query invalidation rules, API dependency, feature flag dependency, empty/loading
states, operational notes). No such entry exists for any altar-management admin workspace.

Without this, there is no authoritative definition of what the workspace is, who can use it,
or what actions it permits.

### Gap 2 — No ADMIN_PAGE_API_MAPPING row

`ADMIN_PAGE_API_MAPPING.md` is the canonical mapping between admin page routes, API route
groups, and query key families. No row exists for `/admin/ban-tho/*` or any altar-management
admin path. Without a registered query key family, any FE code invents its own keys outside
the design-controlled namespace, making cache invalidation reasoning impossible.

### Gap 3 — No admin API routes in route inventory

`API_ROUTE_INVENTORY.md` contains no admin routes for altar item CRUD, condition updates,
validation log listing, or protocol management. The only admin-adjacent route for this domain
(`/admin/content/practice-support/altar-care`) is a content-module editorial route for
managing instructional text — it does not manage altar item records or practitioner-submitted
validation logs.

### Gap 4 — No admin role / ownership statement in CONTRACTS.md

`CONTRACTS.md` defines 4 member-auth routes owned by `EngagementModule`. It does not define
any admin-facing capability, does not assign a backend role guard for admin operations, and
does not state whether admin operators should ever have write access to altar item records
or validation logs.

### Gap 5 — No polarity statement between member-side and any future admin surface

`/me/altar/*` (vows-merit, member+) is the member engagement altar log flow. It is unclear
whether a future admin surface would:
- read-only audit these logs (monitoring view)
- write-correct them on behalf of members (operational override)
- be a separate inventory system independent of member logs
- be scoped to the `engagement` module owner or reassigned to `admin-ops`

This polarity is unresolved. Any scaffold attempt without resolving it risks inventing
incorrect data ownership, incorrect API boundaries, and incorrect audit event semantics.

---

## 4. Required Decisions Before Scaffold

The following questions must be answered and their answers committed to the relevant
design files. These are questions, not decisions. No answer is pre-approved by this document.

**Ownership and module boundary:**
- Does an altar-management admin surface belong in `EngagementModule` (extending the
  existing member-side owner), or does it require a new admin-ops module?
- If it extends `EngagementModule`, what role narrowing applies at the backend route level?
- If it requires a new module, how does it reference or query data owned by the
  `AltarValidationService`?

**Surface scope:**
- Is the admin surface read-only (audit/monitoring of member-submitted validation logs),
  or does it include write operations (condition override, item registration, log correction)?
- If write operations are included, what audit events do they emit?
- Are altar item records (physical objects belonging to individual members) visible to all
  admin roles, or only to roles with explicit vows-merit or engagement authority?

**Route and route authority:**
- Under what path prefix do admin altar routes live? The existing `CONTRACTS.md` uses
  `/api/engagement/altar/*`. An admin surface may or may not share this prefix.
- Which backend guard (`admin+`, `vows-merit admin`, `super-admin`) applies?
- Does the admin surface interact with the same Prisma models as the member surface,
  or does it need a separate read-projection?

**Member data polarity:**
- When an admin views `/me/altar` logs of a member, is that a privileged read of member
  engagement data, or a separate admin projection?
- If members own their altar validation records, what consent or policy boundary governs
  admin visibility?

**Feature flag gating:**
- Does this surface require a feature flag for phased rollout?
- Is the surface linked to any vows-merit product milestone that has its own launch gate?

---

## 5. Minimum Canon Package Required

Before any admin scaffold for `altar-management` is permitted, all five of the following
artifacts must exist, be reviewed, and be merged into the design canon. Partial completion
does not unlock scaffold.

### 5.1 — ADMIN_MODULE_SPECS entry

A new section in `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` must be
written following the spec template defined at the top of that file. It must cover at minimum:

- Route and page title
- Table/list view spec (columns, default sort, filter chips)
- Detail view spec
- Create flow (if applicable — must not be assumed)
- Bulk actions (if applicable)
- **Role requirements** — which admin roles can read, which can write
- Audit events triggered by admin actions
- Empty, loading, error, and success states
- Query invalidation rules
- **API dependency** — explicit route list from the route inventory, not inferred
- Feature flag dependency (if any)
- Operational notes

This entry must not pre-invent routes or claim they exist. It must reference routes already
present in the route inventory at the time of writing.

### 5.2 — ADMIN_PAGE_API_MAPPING row

A new row must be added to `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
covering the admin page route, the primary API route group, the registered query key family,
and the invalidation rules. Until this row exists, no query key family for altar-management
admin is canon. Any key invented in FE code without this row is out-of-design.

### 5.3 — API_ROUTE_INVENTORY admin routes

One or more admin-scoped route rows must be added to `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`.
Each row must state: HTTP method, controller-level path, owning module, and auth scope.
Routes must follow the URL prefix convention defined at the top of that file (no `/api/` prefix
in the inventory itself; the `CONTRACTS.md` of the relevant module uses full `/api/...` paths).

The existing `/admin/content/practice-support/altar-care` entry does not satisfy this
requirement — it covers instructional text content, not altar item or log management.

### 5.4 — Role and ownership statement in CONTRACTS.md

`design/03-domains/altar-management/CONTRACTS.md` must be updated to include:

- An explicit admin API route group section (currently the file only documents member routes)
- The backend role guard that applies to each admin route
- The module owner (whether `EngagementModule` or a separate admin-ops module)
- The audit events triggered by admin write operations

### 5.5 — Polarity statement between member-side and admin surface

A polarity statement must be written and added to either `CONTRACTS.md` or a new
`DECISIONS.md` update (see `design/03-domains/altar-management/DECISIONS.md`) that
explicitly addresses:

- Whether `/me/altar/*` (vows-merit, member+) data is accessible to admin operators
  and under what read policy
- Whether admin writes (if permitted) are isolated from or visible through the same
  Prisma models as member submissions
- Whether the admin surface is a monitoring view, an operational override surface,
  or an independent inventory system
- Which product scenario drives the need for an admin surface at all

---

## 6. Proposed Non-Goals

The following are not goals of any future altar-management admin surface unless explicitly
decided and added to the canon. They are listed here to prevent scope creep during
any future design work.

- **Full member altar log CRUD from admin** — `CONTRACTS.md` defines member-owned engagement
  records; admin override of member records requires a separate access-control decision.
- **Real-time ceremony monitoring** — no streaming or live-update capability is defined
  in any design document for this domain.
- **Integration with AI image rejection** — `CONTRACTS.md` invariant `ai_generated_sacred_image_rejected`
  is a validation rule for member submission, not an admin moderation queue.
- **Altar item physical inventory with barcodes or UUIDs** — `CONTRACTS.md` invariant
  `uuid_on_sacred_item_forbidden` explicitly forbids UUIDs on sacred items; an admin
  inventory system that assigns IDs to physical altar items would contradict this invariant.
- **Admin damage report processing queue** — `POST /api/engagement/altar/damage-report`
  injects an urgent task; whether admin operators manage that task queue is not defined.

These are explicitly non-goals until a product decision contradicts them and is committed
to the relevant design file.

---

## 7. Freeze Rule For Current Runtime

The following rules apply to the existing `/ban-tho/*` frontend routes in `apps/admin`
until the exit criteria in Section 8 are fully met.

**The current `/ban-tho/*` FE is runtime-ahead.** These routes were built against
endpoints in the old runtime. They do not represent an approved admin workspace in the
NestJS rebuild direction.

**No further write action is allowed on these routes.** Specifically:

- No new query key families may be introduced for any `/ban-tho/*` surface.
  Any key not registered in `ADMIN_PAGE_API_MAPPING.md` is out-of-design.
- No new routes may be added to the `/ban-tho/*` group.
  Adding `/ban-tho/new-surface` is forbidden until the exit criteria are satisfied.
- No CRUD expansion is permitted. The existing surfaces show read-only lists and
  detail sheets. No create, edit, delete, or status-change mutation may be added
  to these surfaces.
- No new mutation hooks (`useMutation`) may be added to `altar-management` feature
  files beyond what already exists for the `ConditionUpdateDialog`.
- Existing read-only hygiene support (WorkspaceDetailSheet, WorkspaceRowActions,
  WorkspaceDataTable) does not constitute canon approval. Hygiene alignment to the
  admin UX standard was applied to avoid UI regression, not to validate the surface.

Violations of this freeze rule must be reverted before the next canon review.

---

## 8. Exit Criteria

The altar-management admin scaffold block is lifted when **all** of the following
are true and verified:

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | A new workspace spec exists in `ADMIN_MODULE_SPECS.md` for the altar-management admin surface | PR merged to `design/` |
| 2 | A new row exists in `ADMIN_PAGE_API_MAPPING.md` with the correct route, API group, and query key family | PR merged to `design/` |
| 3 | Admin-scoped route rows exist in `API_ROUTE_INVENTORY.md` for the intended operations | PR merged to `design/` |
| 4 | `CONTRACTS.md` has been updated with an admin route group section, backend role guard, module owner, and audit events | PR merged to `design/` |
| 5 | A polarity statement covering member-side vs. admin-surface data access has been written and merged | PR merged to `design/` (either `CONTRACTS.md` or `DECISIONS.md`) |
| 6 | All ownership questions in Section 4 have explicit answers in the merged design docs | Design review sign-off |
| 7 | The team has confirmed which non-goals in Section 6 remain non-goals and which (if any) are now in-scope | Product decision log |

Scaffold work may only begin after all 7 criteria are checked. Partial completion does not
grant partial scaffold permission.

---

*This document must be updated if any of the referenced source files change in a way that
affects the gap analysis. It must not be used to rationalize incremental additions to the
current frozen FE surface.*
