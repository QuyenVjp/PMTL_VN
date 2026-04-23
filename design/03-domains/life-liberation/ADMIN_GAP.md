# life-liberation — Admin Scaffold Gap Analysis

> **Status:** SPLIT — content workspace canon-complete; operational queues blocked
> **Authored:** 2026-04-20
> **Evidence base:** `design/03-domains/life-liberation/CONTRACTS.md`,
> `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`,
> `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`,
> `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`,
> `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`,
> `apps/admin/AGENTS.override.md`
>
> **Not a product decision.** This doc describes what is missing. It does not approve,
> pre-approve, or imply direction for any future admin surface. All product decisions must
> be made separately and reflected in the relevant design files before any scaffold is allowed.

---

## 1. Purpose

This document records the canonical split within the `life-liberation` admin cluster:

**Layer 1 — Content workspace (canon-complete):**
`/noi-dung/phong-sanh` is a fully canonized admin surface. It has API_ROUTE_INVENTORY
entries, an ADMIN_PAGE_API_MAPPING row, and an ADMIN_MODULE_SPECS entry. No action required.
This layer must not be confused with the operational queues below.

**Layer 2 — Operational queues (blocked):**
`/phong-sinh/ho-so` and `/phong-sinh/thong-ke` are runtime-ahead operational queue UIs.
They have CONTRACTS.md backing (life-liberation admin routes) but are missing the complete
admin triple canon. These surfaces are frozen until the admin triple is supplied.

A third surface exists in the route inventory — `POST /admin/vows/assisted-entry/life-release`
— which is a `vows-merit` module route, not a `life-liberation` operational route. Its
presence in the inventory does not satisfy any gap in the life-liberation operational canon.
These are different modules with different ownership and must not be conflated.

This document exclusively concerns Layer 2. It does not revisit or modify Layer 1 canon.

---

## 2. Current State

### 2.1 — Layer 1: Content workspace (canon-complete, no action required)

| Artifact | Status |
|----------|--------|
| `API_ROUTE_INVENTORY.md` | ✓ Registered: `/admin/content/life-release/*` (editor+, content module) |
| `ADMIN_MODULE_SPECS.md` | ✓ Entry exists: Tab-based workspace, `editor+`, API deps = `/api/admin/content/life-release/*` |
| `ADMIN_PAGE_API_MAPPING.md` | ✓ Row exists: `/admin/noi-dung/phong-sanh` → query key family `['admin-life-release', ...]` |
| FE routes | ✓ `/noi-dung/phong-sanh`, `/noi-dung/phong-sanh/tao-moi`, `/noi-dung/phong-sanh/$publicId` (Phase 1, implemented) |

**The content workspace is done.** It owns editorial content (guides, ritual variants, FAQ,
downloads) for the Phóng Sinh practice. It does not manage life release records, species
registrations, candidate tracking, mortality audits, or proxy releases. These are operational
data, not content.

### 2.2 — Layer 2: Operational queues (blocked)

The following FE routes exist in `apps/admin/src/routes/__root.tsx` under
the "Thanh Tịnh Pháp — Phóng sinh" sidebar cluster:

```
/phong-sinh/ho-so     → LifeReleaseListPage   (release record list + detail)
/phong-sinh/thong-ke  → SpeciesSummaryPage    (species summary / statistics)
```

These call endpoints in the old runtime that correspond to admin routes defined in
`CONTRACTS.md`. They do not have backing in the NestJS rebuild route inventory.

| Artifact | Status |
|----------|--------|
| `design/03-domains/life-liberation/CONTRACTS.md` | ✓ Admin routes defined: release list/detail + candidates + proxy + dedications + audits + species CRUD + status summary |
| `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` | ✗ No entry for operational surfaces |
| `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | ✗ No row for `/phong-sinh/ho-so` or `/phong-sinh/thong-ke` |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` | ✗ No entry for `/admin/life-liberation/*` operational routes |

**Classification:** runtime-ahead artifacts for Layer 2. Per `IMPLEMENTATION_MAPPING.md`:
> "Runtime cũ trong repo không được tính là implementation hợp lệ cho direction mới
> chỉ vì nó đang tồn tại."

The CONTRACTS.md admin route definitions are domain contract backing. This means the
operational surfaces are eligible for hygiene-only treatment (read-only query wiring
and existing contract-aligned mutations). They are NOT eligible for full scaffold until
the admin triple canon is present.

### 2.3 — The vows-merit assisted-entry route is NOT operational life-liberation canon

`API_ROUTE_INVENTORY.md` contains the following entry:

```
POST /admin/vows/assisted-entry/life-release   vows-merit   admin+
```

This route is:
- Owned by `vows-merit` module, not `life-liberation`
- Scoped to assisted data entry (admin helping a member record a past phóng sinh event)
- A narrow write path, not an operational workspace for managing releases, audits, or species

This entry does not satisfy Gap 3 (no API_ROUTE_INVENTORY registration for life-liberation
operational routes). It must not be cited as evidence that life-liberation admin routes
are partially registered. The assisted-entry route and the operational admin workspace
are different surfaces under different module ownership.

### 2.4 — Contract-backed operational routes (partial backing)

`CONTRACTS.md` defines the following admin operational routes:

| Route group | Routes in CONTRACTS.md |
|-------------|------------------------|
| Release list + detail | `GET /api/admin/life-liberation/releases`, `GET /api/admin/life-liberation/releases/:publicId` |
| Release sub-views | `GET /api/admin/life-liberation/releases/:publicId/candidates`, `proxy`, `dedications`, `audits` |
| Release write | `POST /api/admin/life-liberation/releases/:publicId/candidates`; `PATCH /:candidatePublicId`; `POST`, `PATCH` audits |
| Species management | `GET`, `POST /api/admin/life-liberation/species`; `PATCH /api/admin/life-liberation/species/:speciesId` |
| Status summary | `GET /api/admin/life-liberation/status` |

All of these are contract-backed. None are registered in `API_ROUTE_INVENTORY.md`.

### 2.5 — What the canon does NOT contain

- No `API_ROUTE_INVENTORY.md` row for any `/admin/life-liberation/*` operational route.
- No `ADMIN_MODULE_SPECS.md` workspace entry for release management or species management.
- No `ADMIN_PAGE_API_MAPPING.md` row for `/phong-sinh/ho-so` or `/phong-sinh/thong-ke`.
- No backend role guard stated in CONTRACTS.md for any admin route.
  CONTRACTS.md notes `403` when "role không đủ để tạo/cập nhật release hoặc audit" but
  does not state which guard applies.
- No audit event vocabulary for admin write operations. CONTRACTS.md defines audit log
  semantics for predatory species releases (`LIFE_RELEASE_PREDATORY_SPECIES`, `riskLevel: HIGH`)
  but this is a member-side event triggered at release creation, not an admin write event.
- No module ownership statement for the admin operational controller.
- No polarity statement between the content workspace (Layer 1) and operational queues
  (Layer 2), or between the `life-liberation` operational admin and the `vows-merit`
  assisted-entry route.

---

## 3. Canon Gaps (Layer 2 only)

### Gap 1 — No ADMIN_MODULE_SPECS entry

No workspace spec exists for:
- Release record list + detail surface (with sub-tabs for candidates, proxy, dedications,
  audits)
- Species management surface (with species create/edit and predatory species flagging)

The mortality audit flow is particularly high-stakes: an `excessive_loss` finding requires
a compensation recommendation from the auditor. The MODULE_SPECS entry must define the
audit form, the excessive-loss alert UI, and the auditor role requirement before any
scaffold of this action is permitted.

### Gap 2 — No ADMIN_PAGE_API_MAPPING row

No row exists for `/phong-sinh/ho-so` or `/phong-sinh/thong-ke`. Current query key
families in FE (all unregistered):
- `lifeReleaseKeys.all = ["life-releases"]`

This family is unregistered in the canonical mapping. It must not be expanded.

The existing row for `/admin/noi-dung/phong-sanh` (Layer 1) uses the
`['admin-life-release', ...]` family and does not satisfy this gap.
Content workspace and operational queues are separate admin surfaces with different
data owners, different module controllers, and different cache namespaces.

### Gap 3 — No API_ROUTE_INVENTORY registration

None of the operational admin routes from CONTRACTS.md appear in `API_ROUTE_INVENTORY.md`.
The content module routes (`/admin/content/life-release/*`, editor+) are registered but
cover editorial content, not operational data. They do not satisfy this gap.

The `vows-merit` assisted-entry route (`POST /admin/vows/assisted-entry/life-release`)
is registered but is a different module serving a different purpose. It does not satisfy
this gap.

### Gap 4 — No backend role guard in CONTRACTS.md

CONTRACTS.md notes that release and audit operations are role-restricted but does not
state the guard. The mortality audit write path and the species registration path require
explicit role definition, because incorrect role guards on these paths could allow
unauthorized modification of audited ecological records.

### Gap 5 — No audit events for admin write operations

CONTRACTS.md defines a member-side audit log for predatory species releases
(`LIFE_RELEASE_PREDATORY_SPECIES`). Admin write operations — candidate updates, audit
creation, audit amendment, species creation — do not have defined audit events.
Admin writes on audited ecological records must have canonical event definitions before
any scaffold is valid.

### Gap 6 — No polarity statement between the three layers

Three distinct surfaces share the `life-liberation` / `life-release` namespace:
- Layer 1: `content` module, editorial (`editor+`), content routes
- Layer 2: `life-liberation` module, operational admin (`admin+` or similar), release
  and species management
- Assisted-entry: `vows-merit` module, admin-assisted member entry (`admin+`)

The relationship between these layers is undefined. A polarity statement must clarify:
- Whether the operational admin view reads from the same `life_releases` Prisma models
  as the member-facing `POST /api/life-liberation/releases` path
- Whether admin operators can modify member-submitted release records or only manage
  candidates, audits, and species
- Whether the `lifeReleaseKeys` FE cache family used by Layer 2 must be isolated from
  the `admin-life-release` family used by Layer 1

---

## 4. Required Decisions Before Scaffold

The following questions must be answered and committed to the relevant design files.
These are questions, not decisions.

**Release management surface:**
- Which admin roles can view the full release list and sub-views (candidates, proxy,
  dedications, audits)?
- Is the admin release view monitoring-only (read across all member releases) or does it
  include write operations on release records themselves?
- `POST /api/admin/life-liberation/releases/:publicId/candidates` and `PATCH` candidate
  are in CONTRACTS.md. Who is the intended actor — a volunteer coordinator, a monk, or
  any admin? The predatory species follow-up context suggests an auditor role.

**Mortality audit flow:**
- Which admin roles can create and amend audits? Is this restricted to a designated
  auditor role or available to any admin?
- When `excessive_loss` is flagged, does the admin UI require the auditor to enter a
  compensation recommendation before the audit can be saved? Or is it advisory?
- What audit events are emitted by audit create and audit amendment?

**Species management surface:**
- Is species management (`POST`, `PATCH /api/admin/life-liberation/species`) a separate
  admin workspace from the release list, or a configuration panel within the same surface?
- Which admin roles can register or modify species?
- Does species registration include setting the `predatory` flag that triggers the
  habitat verification requirement? If so, what safeguard prevents incorrect flagging?

**Statistics surface:**
- `SpeciesSummaryPage` maps to `/phong-sinh/thong-ke`. Does this surface correspond to
  `GET /api/admin/life-liberation/status` (release counts by status, audits pending,
  predatory releases), or is it a species-level aggregation with different data?
  The answer determines whether it is covered by the status route or needs a new route.

**Path canonicalization:**
- Under what canonical admin path prefix do the operational routes live?
  Current FE uses `/phong-sinh/ho-so` and `/phong-sinh/thong-ke`. Are these the
  canonical paths for the rebuild, or will they be renamed?

---

## 5. Minimum Canon Package Required

Before any admin scaffold for life-liberation operational queues is permitted, all of the
following artifacts must exist, be reviewed, and be merged into the design canon.
The Layer 1 content workspace is already complete and is not part of this requirement.

### 5.1 — ADMIN_MODULE_SPECS entry (operational surfaces only)

A new section in `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
must be written for:
- Release record list + detail workspace (with sub-tab specs for candidates, proxy,
  dedications, audits; including the excessive-loss audit alert flow)
- Species management workspace (with create/edit spec and predatory-flag UI spec)

Each entry must cover: route, columns, detail view, lifecycle actions, role requirements,
audit events, empty/loading/error states, query invalidation rules, API dependency list,
feature flag dependency, operational notes (predatory species constraints, 30-day
follow-up notification behavior).

### 5.2 — ADMIN_PAGE_API_MAPPING rows

New rows must be added to `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
for `/phong-sinh/ho-so` and `/phong-sinh/thong-ke` (or their canonical renamed paths),
with registered query key families and invalidation rules.

The existing row for `/admin/noi-dung/phong-sanh` does not satisfy this requirement.
Content workspace and operational queues are separate admin surfaces with different
data owners and different cache namespaces.

### 5.3 — API_ROUTE_INVENTORY registration

All operational admin routes from CONTRACTS.md must be added to
`design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`:
- Release routes: list, detail, candidates (GET + POST + PATCH), proxy, dedications, audits
  (GET + POST + PATCH)
- Species routes: list (GET), create (POST), update (PATCH)
- Status summary: `GET /admin/life-liberation/status`

Each row must state: HTTP method, path, owning module (`life-liberation`), auth scope.

The existing content module routes (`/admin/content/life-release/*`) and the
`vows-merit` assisted-entry route do not satisfy this requirement.

### 5.4 — Role guard and audit events in CONTRACTS.md

`design/03-domains/life-liberation/CONTRACTS.md` must be updated to include:

- Backend role guard for each admin route
- Audit event vocabulary for admin write operations (candidate update, audit create,
  audit amendment, species registration)
- Module owner for the admin operational controller (distinct from `content` module
  and `vows-merit` module)

### 5.5 — Polarity statement

A polarity statement must be added to either `CONTRACTS.md` or
`design/03-domains/life-liberation/DECISIONS.md` that explicitly addresses:

- Which module owns the admin operational controller (distinct from `content` and
  `vows-merit`)
- Whether admin operators read from the same `life_releases` Prisma models as the
  member-facing public routes, or via a separate admin projection
- Whether the operational admin surface includes any write operations on member-submitted
  release records, or is limited to candidates, audits, and species
- How the operational admin cache namespace (`lifeReleaseKeys`) relates to the content
  workspace cache namespace (`admin-life-release`) — they must remain isolated

---

## 6. Proposed Non-Goals

The following are not goals of any future life-liberation operational admin surface unless
explicitly decided and added to the canon.

- **Admin-initiated release status override** — the release lifecycle is member-driven
  (`planned → in_progress → completed → audited`); admin status override requires a
  separate access-control decision not currently defined.
- **Real-time release monitoring** — no streaming mechanism is defined for this domain.
- **Admin modification of proxy release anonymity settings** — `sponsor_silence_lock` is
  a member-set field; admin override requires explicit product decision.
- **Admin management of money transfer confirmations** — CONTRACTS.md defines this as a
  member self-reported offline ritual; admin UI cannot verify or override.
- **Automated compensation quantity calculation** — CONTRACTS.md explicitly states
  compensation quantity is entered manually by the auditor, not auto-calculated.
- **Species deletion** — CONTRACTS.md defines species update (`PATCH`) but not deletion;
  removing a species with existing release records raises integrity concerns not addressed
  in any design document.
- **Integrated content + operational admin surface** — the content workspace and
  operational queues must remain separate admin surfaces with separate data owners.
  Merging them would conflate `content` module and `life-liberation` module ownership.

---

## 7. Freeze Rule For Current Runtime

The following rules apply to the existing `/phong-sinh/*` frontend routes in `apps/admin`
until the exit criteria in Section 8 are fully met.

**The `/noi-dung/phong-sanh` content workspace is NOT subject to this freeze.**
It is canon-complete (Layer 1). Only the `/phong-sinh/*` operational queues are frozen.

**The current `/phong-sinh/*` FE is runtime-ahead.** These routes were built against
endpoints in the old runtime. They do not represent approved admin workspaces in the
NestJS rebuild direction.

**No further write action is allowed on these routes.** Specifically:

- No new query key families may be introduced for any `/phong-sinh/*` surface.
  The current `lifeReleaseKeys` family is tolerated but must not be expanded.
- No new routes may be added to the `/phong-sinh/*` group.
- No new mutation hooks (`useMutation`) may be added beyond what already exists.
- No mortality audit write flow may be added to any surface until the operational
  MODULE_SPECS and route inventory are in place.
- No species create/edit write actions may be added until the MODULE_SPECS species
  management spec is in place.
- No integration between `/noi-dung/phong-sanh` (content workspace) and `/phong-sinh/*`
  (operational queues) may be implemented at the routing or query-invalidation level.
- The `vows-merit` assisted-entry route must not be used to justify any new operational
  action on the life-liberation surfaces.
- Existing read-only hygiene support (WorkspaceDetailSheet, WorkspaceDataTable)
  does not constitute canon approval.

Violations of this freeze rule must be reverted before the next canon review.

---

## 8. Exit Criteria

The life-liberation operational scaffold block is lifted when **all** of the following
are true and verified:

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | Backend role guard is stated in `CONTRACTS.md` for all operational admin routes | PR merged to `design/` |
| 2 | Audit event vocabulary is defined in `CONTRACTS.md` for admin write operations (candidate update, audit create/amend, species create/update) | PR merged to `design/` |
| 3 | Module owner for the admin operational controller is stated in `CONTRACTS.md` (distinct from `content` and `vows-merit`) | PR merged to `design/` |
| 4 | `API_ROUTE_INVENTORY.md` rows exist for all operational admin routes (releases + candidates + proxy + dedications + audits + species + status) | PR merged to `design/` |
| 5 | `ADMIN_MODULE_SPECS.md` workspace spec exists for the release record list + detail surface (including audit sub-tab and excessive-loss flow) | PR merged to `design/` |
| 6 | `ADMIN_MODULE_SPECS.md` workspace spec exists for the species management surface | PR merged to `design/` |
| 7 | `ADMIN_PAGE_API_MAPPING.md` rows exist for `/phong-sinh/ho-so` and `/phong-sinh/thong-ke` with canonical query key families | PR merged to `design/` |
| 8 | Polarity statement between content workspace (Layer 1), operational queues (Layer 2), and vows-merit assisted-entry is written and merged | PR merged to `design/` |
| 9 | All ownership questions in Section 4 have explicit answers in merged design docs | Design review sign-off |

Layer 1 (`/noi-dung/phong-sanh`) is already complete and is not part of these criteria.
Scaffold for Layer 2 may only begin after all 9 criteria are checked.

---

*This document must be updated if any of the referenced source files change in a way that
affects the gap analysis. It must not be used to rationalize incremental additions to the
current frozen FE surface. The canon split between content workspace and operational queues
must be preserved in any future design work. The vows-merit assisted-entry route is not
life-liberation operational canon and must not be cited as partial canon coverage.*
