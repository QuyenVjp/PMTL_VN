# dharma-compliance — Admin Scaffold Gap Analysis

> **Status:** PARTIALLY BLOCKED — admin scaffold not permitted under current canon
> **Authored:** 2026-04-20
> **Evidence base:** `design/03-domains/dharma-compliance/CONTRACTS.md`,
> `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`,
> `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`,
> `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`,
> `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`,
> `apps/admin/AGENTS.override.md`
>
> **Not a product decision.** This document records what is missing. It does not approve,
> pre-approve, or imply direction for any future admin surface. All product decisions must be
> made separately and reflected in the relevant design files before any scaffold is allowed.

---

## 1. Purpose

This document records why the admin scaffold for `dharma-compliance` is currently blocked
in its entirety, what design artifacts are missing, and what decisions must be made and
committed to canon before any implementation work can begin.

It also records the **split coverage problem** specific to this domain: some surfaces
(`charities`, `fraud-alerts`) have partial contract backing in `CONTRACTS.md` but are
missing the full admin triple canon (MODULE_SPECS + PAGE_API_MAPPING + API_ROUTE_INVENTORY),
while other surfaces (`purity-vows`, `guidance-queue`) have **no contract backing at all** —
not even a domain contract entry.

The existing `/phap-luat/*` frontend routes do not constitute a scaffold decision.
Runtime-ahead FE code is not canon approval. Per `IMPLEMENTATION_MAPPING.md`:
> "Runtime cũ trong repo không được tính là implementation hợp lệ cho direction mới
> chỉ vì nó đang tồn tại."

---

## 2. Current State

### 2.1 — What the canon says

The `dharma-compliance` domain has the following canonical coverage:

| File | Coverage |
|------|----------|
| `design/03-domains/dharma-compliance/CONTRACTS.md` | Admin routes defined for: `charities` CRUD + lifecycle, `fraud-alerts` list + resolve, `interactions` list, `status` summary. Route prefix: `/api/admin/dharma-compliance/*`. |
| `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` | **No entry.** Zero admin workspace specs for any dharma-compliance surface. |
| `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | **No row.** No mapping for any `/phap-luat/*` admin route to any API group or query key family. |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` | **No rows** for `/admin/dharma-compliance/*`. The public routes `GET /dharma-compliance/approved-accounts`, `GET /dharma-compliance/charities`, `GET /dharma-compliance/charities/:publicId` exist as public surfaces but are not admin-facing. |
| `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | No `dharma-compliance` admin surface listed in any scaffold wave or implementation milestone. |

### 2.2 — Contract-backed surfaces (partial backing only)

The following surfaces appear in `CONTRACTS.md` admin routes and therefore have domain
contract backing. This means they are eligible for **hygiene-only treatment** (query wiring,
read-only detail sheets, and existing contract-aligned mutations). They are NOT eligible for
full scaffold until the admin triple canon is present.

| Surface | CONTRACTS.md admin routes |
|---------|--------------------------|
| Tổ chức từ thiện (charities) | `GET`, `POST` `/api/admin/dharma-compliance/charities`; `GET`, `PATCH` `/:publicId`; `POST /:publicId/verify`, `suspend`, `revoke`; `GET`, `POST`, `PATCH` rules sub-routes |
| Cảnh báo gian lận (fraud-alerts) | `GET /api/admin/dharma-compliance/fraud-alerts`; `GET /:publicId`; `PATCH /:publicId/resolve` |
| Tương tác (interactions) | `GET /api/admin/dharma-compliance/interactions` |
| Tổng quan hệ thống (status) | `GET /api/admin/dharma-compliance/status` |

### 2.3 — Surfaces with no contract at all

The following surfaces exist in the runtime FE but have **zero backing** in any design
document — not in `CONTRACTS.md`, not in any admin triple file, not in any implementation
milestone. They are not hygiene-eligible: the data models, route shapes, and business rules
are entirely invented.

| Surface | FE route | What it currently calls (non-canonical) |
|---------|----------|----------------------------------------|
| Lời nguyện thanh tu (purity-vows) | `/phap-luat/loi-nguyen-thanh-tu` | `GET /admin/dharma-compliance/vows` — not in CONTRACTS.md |
| Hàng đợi hướng dẫn (guidance-queue) | `/phap-luat/hang-doi-huong-dan` | `GET /admin/dharma-compliance/vows/guidance-queue`; previously also `PATCH /admin/dharma-compliance/vows/guidance/:id/respond` (removed 2026-04-20) — neither route in CONTRACTS.md |

The domain that owns purity vows (`vows-merit`) has not published any admin CONTRACTS.md
entry for these surfaces. The guidance queue mechanism does not correspond to any existing
domain contract in the repo.

### 2.4 — What exists in runtime FE today

The following routes exist in `apps/admin/src/routes/__root.tsx` under the
"Tuân thủ Pháp luật" sidebar group:

```
/phap-luat/to-chuc-tu-thien   → DharmaComplianceCharityPage (contract-backed GET)
/phap-luat/canh-bao-gian-lan  → DharmaComplianceFraudAlertsPage (contract-backed GET)
/phap-luat/loi-nguyen-thanh-tu → DharmaCompliancePurityVowsPage (NO contract)
/phap-luat/hang-doi-huong-dan  → DharmaComplianceGuidanceQueuePage (NO contract)
```

**Write actions active after 2026-04-20 freeze pass:**

| Action | Route called | Status |
|--------|-------------|--------|
| Create charity | `POST /admin/dharma-compliance/charities` | Contract-backed (CONTRACTS.md); allowed in hygiene tier |
| Update charity status | `PATCH /admin/dharma-compliance/charities/:publicId/status` | Contract-backed; allowed in hygiene tier |
| Resolve fraud alert | `PATCH /admin/dharma-compliance/fraud-alerts/:publicId/resolve` | Contract-backed; allowed in hygiene tier |
| Respond guidance | `PATCH /admin/dharma-compliance/vows/guidance/:id/respond` | **Removed 2026-04-20** — no contract |

**Classification:** runtime-ahead artifacts missing the admin triple canon.
Hygiene-tier actions (contract-backed read/write) are permitted to remain; scaffold
expansion is blocked.

---

## 3. Canon Gaps

The following design artifacts are entirely absent and must be created before any scaffold
is permitted. These gaps apply to all four surfaces, including the contract-backed ones.

### Gap 1 — No ADMIN_MODULE_SPECS entry

`ADMIN_MODULE_SPECS.md` defines the spec template every admin workspace must satisfy before
code is written: route, columns, detail view, create flow, bulk actions, role requirements,
audit events, query invalidation rules, API dependency, feature flag dependency, empty/loading
states, operational notes. No such entry exists for any dharma-compliance admin workspace.

This gap applies even to the contract-backed charities and fraud-alerts surfaces. Having
routes in `CONTRACTS.md` is necessary but not sufficient — the admin workspace spec must
independently define the operator UX, role narrowing, and audit expectations.

### Gap 2 — No ADMIN_PAGE_API_MAPPING row

`ADMIN_PAGE_API_MAPPING.md` is the canonical mapping between admin page routes, API route
groups, and query key families. No row exists for any `/phap-luat/*` admin path. Without a
registered query key family, the FE code invents its own keys outside the design-controlled
namespace, making cache invalidation reasoning and cross-surface invalidation impossible.

**Current query key families in FE (all unregistered in canonical mapping):**
- `charityKeys.all = ["charities"]`
- `fraudAlertKeys.all = ["fraud-alerts"]`
- `vowKeys.all = ["purity-vows"]`
- `guidanceKeys.all = ["guidance-queue"]`

None of these are registered in `ADMIN_PAGE_API_MAPPING.md`. They are tolerated in the
hygiene tier for contract-backed surfaces only. They must not be expanded.

### Gap 3 — No admin API routes in route inventory

`API_ROUTE_INVENTORY.md` contains no admin-scoped routes for `/admin/dharma-compliance/*`.
The existing public routes (`GET /dharma-compliance/charities`, etc.) are public-facing and
do not satisfy the admin route inventory requirement.

Until admin-scoped routes exist in the inventory, the route authority for admin operations
is undefined in the rebuild direction.

### Gap 4 — No purity-vows or guidance-queue domain contract anywhere

For charities and fraud-alerts: `CONTRACTS.md` provides domain contract backing.
For purity-vows and guidance-queue: **no contract exists in any file in this repo.**

- Purity vows belong to the `vows-merit` domain. `design/03-domains/vows-merit/CONTRACTS.md`
  (if it exists) has not published any admin route or data model for this surface. No schema,
  no route, no invariant is defined for admin-facing vow monitoring.
- Guidance queue has no identified domain owner in the current design hierarchy.
  It is unclear whether it belongs to `dharma-compliance`, `identity`, or a yet-undefined
  pastoral-support module.

These surfaces cannot be hygiene-tier treated. They are **fully frozen** until contracts
are published.

### Gap 5 — No polarity statement between public routes and admin surfaces

`CONTRACTS.md` defines public routes (`GET /api/dharma-compliance/charities`, etc.) that
serve a different consumer than the admin routes. The following polarities are unresolved:

- Whether admin operators editing a charity record affect the public-facing approved-accounts
  list in real time or on a publish gate
- Whether fraud alert resolution triggers any notification or audit event visible to the
  public surface or only to internal admin operators
- Whether interaction logs visible to admin are the same projection as or a superset of
  what the interceptor records for moderation purposes

---

## 4. Required Decisions Before Scaffold

The following questions must be answered and their answers committed to the relevant
design files. These are questions, not decisions. No answer is pre-approved by this document.

**For charities and fraud-alerts (contract-backed):**

- Does the admin charity workspace require a publish-gate before the approved-accounts public
  list is updated, or is every PATCH immediately visible publicly?
- Which admin roles can `verify`, `suspend`, `revoke` a charity? Is SUPER_ADMIN the only
  actor, or can ADMIN role perform these lifecycle transitions?
- What audit events does each lifecycle transition emit? The CONTRACTS.md documents the routes
  but not the audit event vocabulary.
- Does the admin charity list require pagination, filter chips (by status, type), or search?
  ADMIN_MODULE_SPECS must answer this before a table spec is valid.
- Is the fraud alert resolve action one-click or does it require a resolution note?
  CONTRACTS.md shows `PATCH /:publicId/resolve` with a body but does not specify whether
  the resolution field is required or what length constraints apply.

**For interactions:**

- What is the intended use of `GET /api/admin/dharma-compliance/interactions`?
  Is this a compliance audit log, an operator moderation queue, or a monitoring dashboard?
  The answer determines whether the surface is read-only forever or has operational actions.

**For purity-vows and guidance-queue:**

- Which domain owns purity-vow admin monitoring? Is it `vows-merit`, `dharma-compliance`,
  or a shared compliance module?
- What data model backs purity vows? The current FE models fields (`purityLevel`,
  `sleepArrangement`, `kissAllowed`, `hugAllowed`) that have no corresponding schema in any
  design document.
- Does a guidance-queue mechanism exist at all in the product roadmap? If yes, which domain
  owns it and what is its lifecycle (submit → pending → answered)?
- Is the guidance-queue a pastoral support feature (requiring a separate module) or a
  moderation queue variant (extending `dharma-compliance`)?

---

## 5. Minimum Canon Package Required

### For charities and fraud-alerts (contract-backed surfaces)

Before any scaffold expansion beyond current hygiene tier is permitted:

**5.1 — ADMIN_MODULE_SPECS entry** for each workspace:
- Route and page title
- Table columns, default sort, filter options
- Detail view fields
- Create flow spec (applicable: `POST /admin/dharma-compliance/charities` is in contract)
- Lifecycle actions with role narrowing (verify / suspend / revoke for charities;
  resolve for fraud-alerts)
- Audit events emitted by each admin action
- Empty, loading, error, success states
- Query invalidation rules keyed to the registered query key family
- API dependency list citing specific rows from the route inventory

**5.2 — ADMIN_PAGE_API_MAPPING rows** for each page route:
- Admin page route (e.g., `/admin/phap-luat/to-chuc-tu-thien` — canonical path TBD)
- Primary API route group
- Registered query key family name
- Invalidation rules

**5.3 — API_ROUTE_INVENTORY rows** for admin routes:
- All `GET`, `POST`, `PATCH` routes for charities and fraud-alerts as listed in `CONTRACTS.md`
  must appear in the inventory with HTTP method, path, owning module, and auth scope
- The existing public routes in the inventory do not satisfy this requirement

### For purity-vows and guidance-queue (no-contract surfaces)

Before any work beyond freezing the current FE is permitted:

**5.4 — Domain contract** in the appropriate domain's `CONTRACTS.md`:
- Full data model ownership statement
- Public and admin route list
- Canonical invariants and lifecycle rules
- Error expectations
- Module owner

**5.5 — All three admin triple documents** (MODULE_SPECS + PAGE_API_MAPPING + API_ROUTE_INVENTORY)
must then exist before any scaffold is permitted — same requirement as any other surface.

Partial completion of any tier does not unlock scaffold on any surface.

---

## 6. Proposed Non-Goals

The following are not goals of any dharma-compliance admin surface unless explicitly decided
and added to the canon. Listed here to prevent scope creep during any future design work.

- **Bulk charity status changes** — bulk verify/suspend/revoke requires careful audit
  semantics; not defined in CONTRACTS.md and must not be assumed from the list view.
- **Real-time fraud alert stream** — no streaming mechanism is defined for any admin surface
  in the current design.
- **Admin-initiated bank account regex updates** — `CONTRACTS.md` notes that regex patterns
  need quarterly updates but does not define an admin UI for this. It is not a form surface.
- **Admin view of member interaction content** — `GET /api/admin/dharma-compliance/interactions`
  likely exposes flagged content; what is visible, to whom, and under what privacy policy
  is not defined. Do not build a content viewer for this until the policy is published.
- **Purity vow admin write actions** — even if a purity-vow admin monitoring surface is
  eventually canonized, admin write operations on member vow records require explicit
  member-data polarity decisions that do not currently exist.
- **Guidance respond write flow** — the `useRespondGuidance` mutation calling
  `PATCH /admin/dharma-compliance/vows/guidance/:id/respond` was removed 2026-04-20.
  It must not be restored until the guidance-queue domain contract and admin triple exist.
- **Automated fraud severity escalation from admin** — CONTRACTS.md defines auto-escalation
  rules at the application layer (interceptor-driven); admin UI does not need to replicate
  or override these rules without an explicit product decision.

---

## 7. Freeze Rule For Current Runtime

The following rules apply to the existing `/phap-luat/*` frontend routes in `apps/admin`
until the exit criteria in Section 8 are fully met.

**Tier A — Contract-backed surfaces (charities, fraud-alerts):**

- **Allowed:** Read-only list views, detail sheets, and the existing contract-aligned
  write mutations (`useCreateCharity`, `useUpdateCharityStatus`, `useResolveFraudAlert`).
  These call routes present in `CONTRACTS.md` and their query invalidation is limited to
  the currently unregistered but tolerated key families.
- **Forbidden:** Any new mutation hook beyond the three above. Any new route call not
  listed in `CONTRACTS.md`. Any new query key family. Any create/edit flow for fraud-alerts
  (CONTRACTS.md does not define admin-initiated alert creation). Any rules sub-route UI
  (`GET /api/admin/dharma-compliance/charities/:publicId/rules/*`) — these are in
  CONTRACTS.md but have no MODULE_SPECS entry defining the rules tab/panel spec.

**Tier B — No-contract surfaces (purity-vows, guidance-queue):**

- **Allowed:** Read-only list view that fetches from the currently non-canonical GET endpoint.
  The table will return empty or 404 in the rebuild runtime. This is an acceptable degraded
  state until contracts exist.
- **Forbidden:** Any write mutation. Any new query key family. Any detail sheet with actions.
  Any attempt to wire these surfaces to real backend routes before a domain contract is
  published. The removed `useRespondGuidance` must not be restored in any form.

**General freeze rules:**

- No new query key families may be added to `dharma-compliance/queries.ts` beyond:
  `charityKeys`, `fraudAlertKeys`, `vowKeys`, `guidanceKeys`.
  Adding a new key without a corresponding `ADMIN_PAGE_API_MAPPING.md` row is forbidden.
- No new pages or sub-routes may be added under `/phap-luat/*`.
- No new sidebar entries may be added to the "Tuân thủ Pháp luật" group.
- No CRUD expansion is permitted on any surface in this cluster.

Violations of this freeze rule must be reverted before the next canon review.

---

## 8. Exit Criteria

### 8A — Charities + Fraud-alerts scaffold unlock

The scaffold block for charities and fraud-alerts is lifted when **all** of the following
are true and verified:

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | A workspace spec exists in `ADMIN_MODULE_SPECS.md` for the charities admin surface | PR merged to `design/` |
| 2 | A workspace spec exists in `ADMIN_MODULE_SPECS.md` for the fraud-alerts admin surface | PR merged to `design/` |
| 3 | Rows exist in `ADMIN_PAGE_API_MAPPING.md` for each page route with canonical query key families | PR merged to `design/` |
| 4 | All admin charity and fraud-alert routes from `CONTRACTS.md` appear in `API_ROUTE_INVENTORY.md` | PR merged to `design/` |
| 5 | Role narrowing (which admin roles can verify/suspend/revoke vs. read-only) is documented in CONTRACTS.md or MODULE_SPECS | PR merged to `design/` |
| 6 | Audit event vocabulary for each lifecycle action is defined | PR merged to `design/` |
| 7 | All ownership questions in Section 4 (for charities/fraud-alerts) have explicit answers in merged design docs | Design review sign-off |

### 8B — Purity-vows + Guidance-queue scaffold unlock

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | Domain contract published in the owning domain's `CONTRACTS.md` (domain TBD per Section 4) | PR merged to `design/` |
| 2 | All three admin triple documents exist: MODULE_SPECS entry + PAGE_API_MAPPING rows + API_ROUTE_INVENTORY rows | PR merged to `design/` |
| 3 | Data model owner identified and schema exists in migration | Design + backend review |
| 4 | Module ownership (vows-merit vs. dharma-compliance vs. new module) resolved | Product decision log |
| 5 | All ownership questions in Section 4 (for purity-vows / guidance-queue) have answers | Design review sign-off |

Partial completion of 8A does not unlock 8B. Each surface family requires independent
verification of its own exit criteria.

---

*This document must be updated if any of the referenced source files change in a way that
affects the gap analysis. It must not be used to rationalize incremental additions to the
current frozen FE surface. Runtime FE existence does not constitute design approval.*
