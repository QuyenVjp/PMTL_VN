# little-house — Admin Scaffold Gap Analysis

> **Status:** SPLIT — content workspace canon-complete; operational queues blocked
> **Authored:** 2026-04-20
> **Evidence base:** `design/03-domains/little-house/CONTRACTS.md`,
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

This document records the canonical split within the `little-house` admin cluster:

**Layer 1 — Content workspace (canon-complete):**
`/noi-dung/ngoi-nha-nho` is a fully canonized admin surface. It has an API_ROUTE_INVENTORY
entry, an ADMIN_PAGE_API_MAPPING row, and an ADMIN_MODULE_SPECS entry. No action required.
This layer must not be confused with the operational queues below.

**Layer 2 — Operational queues (blocked):**
`/so/danh-sach` and `/so/gian-lan` are runtime-ahead operational queue UIs. They have
CONTRACTS.md backing (little-house admin routes) but are missing the complete admin triple
canon. These surfaces are frozen until the admin triple is supplied.

This document exclusively concerns Layer 2. It does not revisit or modify Layer 1 canon.

---

## 2. Current State

### 2.1 — Layer 1: Content workspace (canon-complete, no action required)

| Artifact | Status |
|----------|--------|
| `API_ROUTE_INVENTORY.md` | ✓ Registered: `/admin/content/little-house/*` (editor+, content module) |
| `ADMIN_MODULE_SPECS.md` | ✓ Entry exists: Tab-based workspace, `editor+`, API deps = `/api/admin/content/little-house/*` |
| `ADMIN_PAGE_API_MAPPING.md` | ✓ Row exists: `/admin/noi-dung/ngoi-nha-nho` → query key family `['admin-little-house', ...]` |
| FE route | ✓ `/noi-dung/ngoi-nha-nho` → LittleHousePage (Phase 1, implemented) |

**The content workspace is done.** It owns editorial content (guides, case variants, FAQ,
downloads) for the Ngôi Nhà Nhỏ practice. It does not manage NNN records, recitations,
fraud cases, or combustion logs. These are operational data, not content.

### 2.2 — Layer 2: Operational queues (blocked)

The following FE routes exist in `apps/admin/src/routes/__root.tsx`:

```
/so/danh-sach   → LhRecordsPage     (NNN record list + detail)
/so/gian-lan    → LhFraudQueuePage  (fraud alert management)
```

These call endpoints in the old runtime that correspond to admin routes defined in
`CONTRACTS.md`. They do not have backing in the NestJS rebuild route inventory.

| Artifact | Status |
|----------|--------|
| `design/03-domains/little-house/CONTRACTS.md` | ✓ Admin routes defined: NNN list/detail + recitations + dotting sessions + combustion logs + fraud CRUD + lifecycle + status + completion-stats |
| `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` | ✗ No entry for operational surfaces |
| `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | ✗ No row for `/so/danh-sach` or `/so/gian-lan` |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` | ✗ No entry for `/admin/little-house/*` operational routes |

**Classification:** runtime-ahead artifacts for Layer 2. Per `IMPLEMENTATION_MAPPING.md`:
> "Runtime cũ trong repo không được tính là implementation hợp lệ cho direction mới
> chỉ vì nó đang tồn tại."

The CONTRACTS.md admin route definitions are domain contract backing. This means the
operational surfaces are eligible for hygiene-only treatment (read-only query wiring
and existing contract-aligned mutations). They are NOT eligible for full scaffold until
the admin triple canon is present.

### 2.3 — Contract-backed operational routes (partial backing)

`CONTRACTS.md` defines the following admin operational routes:

| Route group | Routes in CONTRACTS.md |
|-------------|------------------------|
| NNN list + detail | `GET /api/admin/little-house`, `GET /api/admin/little-house/:publicId` |
| NNN sub-views | `GET /api/admin/little-house/:publicId/recitations`, `dotting-sessions`, `combustion-logs` |
| Fraud management | `GET`, `POST /api/admin/little-house/frauds`; `GET`, `PATCH /:publicId`; `POST /:publicId/confirm`; `POST /:publicId/revoke` |
| Operational summaries | `GET /api/admin/little-house/status`; `GET /api/admin/little-house/completion-stats` |

All of these are contract-backed. None are registered in `API_ROUTE_INVENTORY.md`.

### 2.4 — What the canon does NOT contain

- No `API_ROUTE_INVENTORY.md` row for any `/admin/little-house/*` operational route.
- No `ADMIN_MODULE_SPECS.md` workspace entry for NNN records or fraud management surfaces.
- No `ADMIN_PAGE_API_MAPPING.md` row for `/so/danh-sach` or `/so/gian-lan`.
- No backend role guard stated in CONTRACTS.md for any admin route.
  CONTRACTS.md notes `403` when "role không đủ để quản lý fraud hoặc revocation" but does
  not state which guard applies.
- No audit events defined for admin fraud operations (confirm, revoke).
  CONTRACTS.md states fraud revocation "cần audit log chi tiết" in the AI/codegen notes
  but does not define the event vocabulary as a canonical contract requirement.
- No module owner statement for the admin operational controller.
- No polarity statement between content workspace (Layer 1) and operational queues (Layer 2).
  The content workspace owns editorial text under the `content` module (`editor+`).
  The operational queues manage member NNN records under the `little-house` module (`admin+`
  or equivalent). These are different data owners and must not be conflated.

---

## 3. Canon Gaps (Layer 2 only)

### Gap 1 — No ADMIN_MODULE_SPECS entry

No workspace spec exists for:
- NNN record list + detail surface (with sub-tabs for recitations, dotting, combustion)
- Fraud management surface (with confirm / revoke lifecycle)

The fraud revocation flow has high-stakes UX: it permanently revokes member merit,
requires admin confirmation, and must not be auto-triggered. The MODULE_SPECS entry must
define the confirmation dialog, role requirements, and audit event before any scaffold
of this action is permitted.

### Gap 2 — No ADMIN_PAGE_API_MAPPING row

No row exists for `/so/danh-sach` or `/so/gian-lan`. Current query key families in FE:
- `lhKeys.all = ["little-house"]`

This family is unregistered in the canonical mapping. It must not be expanded.

The existing row for `/admin/noi-dung/ngoi-nha-nho` (Layer 1) uses the
`['admin-little-house', ...]` family and does not satisfy this gap.
Content workspace and operational queues are separate admin surfaces with separate
data owners and separate query namespaces.

### Gap 3 — No API_ROUTE_INVENTORY registration

None of the operational admin routes from CONTRACTS.md appear in `API_ROUTE_INVENTORY.md`.
The content module routes (`/admin/content/little-house/*`, editor+) are registered but
cover a completely different concern. They do not satisfy the operational route inventory gap.

### Gap 4 — No backend role guard in CONTRACTS.md

CONTRACTS.md notes that fraud management and revocation are role-restricted but does not
state the guard. Given that fraud revocation permanently revokes member merit records,
the role guard must be explicitly defined before implementation.

### Gap 5 — No audit events for admin write operations

Fraud confirm and revoke must emit audit events. CONTRACTS.md states in its AI/codegen
section that revocation must "ghi audit log chi tiết: fraud_type, severity, evidence,
reviewer" but does not define these as canonical audit events with named event types.
The event vocabulary must be defined in CONTRACTS.md before any implementation is valid.

### Gap 6 — No content/operational polarity statement

The content workspace (Layer 1) and operational queues (Layer 2) are owned by different
concerns:
- Content workspace: editorial content, owned by `content` module, `editor+` role
- Operational queues: member NNN records and fraud cases, owned by `little-house` module,
  `admin+` or similar role

This polarity is not stated in any design document. A polarity statement must clarify:
- Which module owns the admin operational controller
- Whether admin operators read member NNN records via the same Prisma models as the
  member-facing engagement routes
- Whether the operational admin view is a monitoring surface or an override surface

---

## 4. Required Decisions Before Scaffold

The following questions must be answered and committed to the relevant design files.
These are questions, not decisions.

**NNN record list surface:**
- Which admin roles can view NNN records and their sub-views (recitations, dotting,
  combustion)?
- Is the NNN admin view a monitoring surface (read-only across all members) or an
  operational override surface (admin can correct or advance a member NNN status)?
- `GET /api/admin/little-house/status` returns a system overview. Is this a dedicated
  dashboard surface or a stats card on the NNN list page?

**Fraud management surface:**
- Which admin roles can create, confirm, and revoke fraud flags?
  Given that revocation permanently revokes merit, is this restricted to `super-admin`?
- What audit events are emitted by fraud confirm and fraud revoke?
- Does the fraud revoke action require a two-step confirmation UI?

**Completion stats:**
- `GET /api/admin/little-house/completion-stats` returns time-series aggregates.
  Is this surfaced in the NNN list page as a stats panel, or as a separate analytics
  surface? The answer determines whether it needs its own MODULE_SPECS entry.

**Route paths:**
- Under what canonical admin path prefix do the NNN operational routes live?
  Current FE uses `/so/danh-sach` and `/so/gian-lan`. Are these the canonical paths
  for the rebuild, or will they be renamed?

---

## 5. Minimum Canon Package Required

Before any admin scaffold for little-house operational queues is permitted, all of the
following artifacts must exist, be reviewed, and be merged into the design canon.
The Layer 1 content workspace is already complete and is not part of this requirement.

### 5.1 — ADMIN_MODULE_SPECS entry (operational surfaces only)

A new section in `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
must be written for:
- NNN record list + detail workspace (with sub-tab specs for recitations, dotting,
  combustion)
- Fraud management workspace (with confirm/revoke lifecycle specs and confirmation dialog)

Each entry must cover: route, columns, detail view, lifecycle actions, role requirements,
audit events, empty/loading/error states, query invalidation rules, API dependency list,
feature flag dependency, operational notes.

### 5.2 — ADMIN_PAGE_API_MAPPING rows

New rows must be added to `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
for `/so/danh-sach` and `/so/gian-lan` (or their canonical renamed paths), with
registered query key families and invalidation rules.

The existing row for `/admin/noi-dung/ngoi-nha-nho` does not satisfy this requirement.
Content workspace and operational queues are separate admin surfaces with separate
data owners and separate cache namespaces.

### 5.3 — API_ROUTE_INVENTORY registration

All operational admin routes from CONTRACTS.md must be added to
`design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`:
- NNN routes: list, detail, recitations, dotting-sessions, combustion-logs
- Fraud routes: list, detail, create, update, confirm, revoke
- Summary routes: status, completion-stats

Each row must state: HTTP method, path, owning module, auth scope.

The existing content module routes (`/admin/content/little-house/*`) are already
registered and do not satisfy this requirement.

### 5.4 — Role guard and audit events in CONTRACTS.md

`design/03-domains/little-house/CONTRACTS.md` must be updated to include:
- Backend role guard for each admin route
- Audit event vocabulary for fraud confirm and fraud revoke
- Module owner for the admin operational controller

### 5.5 — Content/operational polarity statement

A polarity statement must be added to either `CONTRACTS.md` or
`design/03-domains/little-house/DECISIONS.md` that explicitly addresses:
- Which module owns the admin operational controller (distinct from `content` module)
- Whether admin operators read member NNN records via shared or separate Prisma projections
- Whether the operational admin surface is monitoring-only or includes write operations
  on member NNN records

---

## 6. Proposed Non-Goals

The following are not goals of any future little-house operational admin surface unless
explicitly decided and added to the canon.

- **Admin-initiated NNN status override** — the NNN lifecycle is member-driven; admin
  override of member NNN records (e.g., forcing status from `in_progress` to `burnt`)
  requires a separate access-control decision not currently defined.
- **Real-time NNN monitoring stream** — no streaming mechanism is defined for this domain.
- **Admin dotting session management** — dotting is member-performed; admin read access
  to dotting logs is defined in CONTRACTS.md but admin write access is not defined.
- **Admin combustion log correction** — combustion is member-confirmed; admin write access
  to combustion logs is not defined.
- **Bulk NNN audit** — not defined in CONTRACTS.md.
- **Integrated content + operational admin surface** — the content workspace and
  operational queues must remain separate admin surfaces with separate data owners.
  Merging them would conflate `content` module and `little-house` module ownership.

---

## 7. Freeze Rule For Current Runtime

The following rules apply to the existing `/so/*` frontend routes in `apps/admin`
until the exit criteria in Section 8 are fully met.

**The `/noi-dung/ngoi-nha-nho` content workspace is NOT subject to this freeze.**
It is canon-complete (Layer 1). Only the `/so/*` operational queues are frozen.

**The current `/so/*` FE is runtime-ahead.** These routes were built against endpoints
in the old runtime. They do not represent approved admin workspaces in the NestJS rebuild.

**No further write action is allowed on these routes.** Specifically:

- No new query key families may be introduced for any `/so/*` surface.
  The current `lhKeys` family is tolerated but must not be expanded.
- No new routes may be added to the `/so/*` group.
- No new mutation hooks (`useMutation`) may be added beyond what already exists.
- No NNN status write actions (advance, flag, complete) may be added to any surface
  until the operational MODULE_SPECS and route inventory are in place.
- No integration between `/noi-dung/ngoi-nha-nho` (content workspace) and `/so/*`
  (operational queues) may be implemented at the routing or query-invalidation level.
- Existing read-only hygiene support (WorkspaceDetailSheet, WorkspaceDataTable)
  does not constitute canon approval.

Violations of this freeze rule must be reverted before the next canon review.

---

## 8. Exit Criteria

The little-house operational scaffold block is lifted when **all** of the following
are true and verified:

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | Backend role guard is stated in `CONTRACTS.md` for all operational admin routes | PR merged to `design/` |
| 2 | Audit event vocabulary is defined in `CONTRACTS.md` for fraud confirm and fraud revoke | PR merged to `design/` |
| 3 | Module owner for the admin operational controller is stated in `CONTRACTS.md` | PR merged to `design/` |
| 4 | `API_ROUTE_INVENTORY.md` rows exist for all operational admin routes (NNN + fraud + summary) | PR merged to `design/` |
| 5 | `ADMIN_MODULE_SPECS.md` workspace spec exists for the NNN record list + detail surface | PR merged to `design/` |
| 6 | `ADMIN_MODULE_SPECS.md` workspace spec exists for the fraud management surface (with confirm/revoke lifecycle) | PR merged to `design/` |
| 7 | `ADMIN_PAGE_API_MAPPING.md` rows exist for `/so/danh-sach` and `/so/gian-lan` with canonical query key families | PR merged to `design/` |
| 8 | Polarity statement between content workspace (Layer 1) and operational queues (Layer 2) is written and merged | PR merged to `design/` |
| 9 | All ownership questions in Section 4 have explicit answers in merged design docs | Design review sign-off |

Layer 1 (`/noi-dung/ngoi-nha-nho`) is already complete and is not part of these criteria.
Scaffold for Layer 2 may only begin after all 9 criteria are checked.

---

*This document must be updated if any of the referenced source files change in a way that
affects the gap analysis. It must not be used to rationalize incremental additions to the
current frozen FE surface. The canon split between content workspace and operational queues
must be preserved in any future design work.*
