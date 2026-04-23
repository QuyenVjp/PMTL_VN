# sacred-forms — Admin Scaffold Gap Analysis

> **Status:** BLOCKED — admin scaffold not permitted under current canon
> **Authored:** 2026-04-20
> **Evidence base:** `design/03-domains/sacred-forms/CONTRACTS.md`,
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

This document records why the admin scaffold for `sacred-forms` is currently blocked,
what design artifacts are missing, and what decisions must be made and committed to canon
before any implementation work can begin.

It exists to prevent runtime-ahead FE code from being treated as canon approval.
The existing `/don-phap-bao/*` frontend routes do not constitute a scaffold decision.

The `sacred-forms` domain has the strongest CONTRACTS.md backing of any blocked domain:
the contract file defines a full admin route surface covering templates, applicants,
prerequisites, disposals, burn ceremony, probations, and status. Despite this, **no
admin triple canon artifact exists** (no ADMIN_MODULE_SPECS entry, no ADMIN_PAGE_API_MAPPING
row, no API_ROUTE_INVENTORY row). The gap is not about missing contracts — it is about
missing platform elevation of those contracts into the admin canon.

---

## 2. Current State

### 2.1 — What the canon says

The `sacred-forms` domain has the following canonical coverage:

| File | Coverage |
|------|----------|
| `design/03-domains/sacred-forms/CONTRACTS.md` | Full admin route surface: template CRUD + prerequisite management + applicant lifecycle (review / approve / reject / burn) + validation waiver + disposal management + probations + status overview. All routes under `/api/admin/sacred-forms/*`. |
| `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` | **No entry.** Zero admin workspace specs for any sacred-forms surface. |
| `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | **No row.** No mapping for any `/don-phap-bao/*` admin route to any API group or query key family. |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` | **Zero entries** for `sacred-forms` or `/admin/sacred-forms/*`. Not one route from CONTRACTS.md appears in the inventory. |
| `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | No sacred-forms admin surface listed in any scaffold wave or implementation milestone. |

### 2.2 — What the canon does NOT contain

- No `API_ROUTE_INVENTORY.md` row for any sacred-forms route (public or admin).
- No `ADMIN_MODULE_SPECS.md` workspace entry for any sacred-forms admin surface.
- No `ADMIN_PAGE_API_MAPPING.md` row for any `/don-phap-bao/*` page route.
- No backend role guard stated for any admin route in CONTRACTS.md.
  CONTRACTS.md defines route shapes and lifecycle rules but does not state which guard
  (`admin+`, `super-admin`, `monk+`, or a custom role) governs each admin route.
- No audit events for admin write operations (create template, approve applicant, waive
  prerequisite, burn, complete disposal). CONTRACTS.md references `reviewer_user_id`
  but does not define an audit event vocabulary.
- No module ownership statement for the admin controller.

### 2.3 — What exists in runtime FE today

The following routes exist in `apps/admin/src/routes/__root.tsx` under
the Thanh Tịnh Pháp sidebar cluster:

```
/don-phap-bao/mau-don         → SacredFormTemplatesPage  (template list + create)
/don-phap-bao/don-dang-ky     → SacredFormApplicantsPage (applicant review queue)
/don-phap-bao/quy-tac-xu-ly   → DisposalPolarityPage     (disposal polarity rules view)
```

These were built as operational UIs. The template create flow and applicant review
actions call endpoints in the old runtime. They have no backing in the NestJS rebuild
route inventory.

**Classification:** runtime-ahead artifacts. Per `IMPLEMENTATION_MAPPING.md`:
> "Runtime cũ trong repo không được tính là implementation hợp lệ cho direction mới
> chỉ vì nó đang tồn tại."

The CONTRACTS.md admin route definitions describe intended behavior but do not constitute
API_ROUTE_INVENTORY registration. A domain contract is not a platform approval.

---

## 3. Canon Gaps

### Gap 1 — No ADMIN_MODULE_SPECS entry (applies to all 3 surfaces)

`ADMIN_MODULE_SPECS.md` defines the spec template every admin workspace must satisfy
before code is written: route, columns, detail view, create flow, bulk actions, role
requirements, audit events, query invalidation rules, API dependency, feature flag
dependency, empty/loading states, operational notes.

No such entry exists for any sacred-forms admin surface. The burn ceremony flow,
prerequisite waiver flow, and disposal polarity rules all require separate UX specs
before any scaffold is valid.

### Gap 2 — No ADMIN_PAGE_API_MAPPING row (applies to all 3 surfaces)

`ADMIN_PAGE_API_MAPPING.md` is the canonical mapping between admin page routes, API
route groups, and query key families. No row exists for any `/don-phap-bao/*` path.

Current query key families in FE (all unregistered):
- `sacredFormKeys.all = ["sacred-forms"]`

This key is unregistered in the canonical mapping. It must not be expanded.

### Gap 3 — No API_ROUTE_INVENTORY registration (applies to all sacred-forms routes)

`API_ROUTE_INVENTORY.md` contains zero rows for sacred-forms. This includes both
the public routes and the admin routes. The entire domain is absent from the rebuild
route inventory. No route from CONTRACTS.md can be referenced by MODULE_SPECS without
first being registered in the inventory.

### Gap 4 — No backend role guard in CONTRACTS.md

CONTRACTS.md defines route shapes and notes `reviewer_user_id` as required for approval,
but does not state which backend role guard applies to each admin route. The applicant
lifecycle includes sensitive operations (waive prerequisite, burn sacred form) that require
explicit role guard definition before implementation is validated as correct.

### Gap 5 — No audit events for admin write operations

CONTRACTS.md notes that waive-prerequisite requires `evidence_note` and `approver`
(audit fields), and that burn creates a probation. But it does not define the audit event
vocabulary (event names, payloads, which storage layer receives them). Admin write
operations on sacred liturgical records without defined audit events cannot be implemented
as canon-correct.

---

## 4. Required Decisions Before Scaffold

The following questions must be answered and committed to the relevant design files.
These are questions, not decisions.

**Template management:**
- Which admin roles can create, update, and archive sacred form templates?
  CONTRACTS.md defines `POST /api/admin/sacred-forms` but does not state role guard.
- Is template create a single-step form or a multi-step wizard
  (form metadata + prerequisites inline vs. separate steps)?
- Does a template publish gate exist before it becomes visible to public applicants?

**Applicant review:**
- Which admin roles can review, approve, reject, or waive prerequisites for an applicant?
  Are these the same role or differentiated (e.g., monks can waive prerequisites but
  not approve)?
- What audit events are emitted by approve, reject, and waive-prerequisite?
- Is the applicant review surface a queue (showing only `under_review` items) or a
  full list with status filters?

**Burn ceremony:**
- `POST /api/admin/sacred-forms/applicants/:publicId/burn` validates time gate and
  weather gate. Does the admin UX surface the time gate as a pre-flight check UI,
  or does it submit and handle the 400 inline?
- Is burn restricted to specific admin roles (`monk+`) or available to any admin?
- Does the burn action emit a dedicated audit event beyond the probation creation?

**Disposal polarity:**
- `DisposalPolarityPage` exists in the runtime FE. Is this a read-only reference view
  (showing the polarity rules) or an admin-managed configuration surface
  (allowing operators to add/edit polarity rules)?
  CONTRACTS.md defines polarity as canonical invariants (constant map), not editable config.
  If the page is reference-only, it does not require API routes and must be noted as such
  in MODULE_SPECS.

**Probations:**
- `GET /api/admin/sacred-forms/probations` is in CONTRACTS.md.
  Does the admin probations view require any write actions (manually unlock a probation)?
  Or is it read-only monitoring of the daily cronjob auto-unlock?

---

## 5. Minimum Canon Package Required

Before any admin scaffold for `sacred-forms` is permitted, all five of the following
artifacts must exist, be reviewed, and be merged into the design canon. Partial completion
does not unlock scaffold.

### 5.1 — ADMIN_MODULE_SPECS entry

A new section must be written in
`design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` for each
sacred-forms admin workspace. Minimum coverage per workspace:

- Route and page title
- Table/list view spec (columns, default sort, filter chips)
- Detail view spec (including sub-tabs for prerequisites, disposals, validations)
- Create flow spec (template creation, applicant intake if admin-initiated)
- Lifecycle action specs (review, approve, reject, waive, burn, complete disposal)
- **Role requirements** — which admin roles can perform each action
- Audit events emitted by each admin action
- Empty, loading, error, and success states
- Query invalidation rules
- **API dependency** — explicit row references from API_ROUTE_INVENTORY, not inferred
- Operational notes (burn time gate UI behavior, weather gate confirmation flow)

### 5.2 — ADMIN_PAGE_API_MAPPING rows

New rows must be added to
`design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
for each sacred-forms admin page route: page path, primary API route group,
registered query key family, and invalidation rules.

Until these rows exist, no query key family for sacred-forms admin is canon.

### 5.3 — API_ROUTE_INVENTORY registration

All sacred-forms routes (public and admin) must be added to
`design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`.
Each row: HTTP method, path, owning module, auth scope.
The entire domain is currently absent from the inventory.

### 5.4 — Role guard and audit events in CONTRACTS.md

`design/03-domains/sacred-forms/CONTRACTS.md` must be updated to include:

- Backend role guard for each admin route
- Audit event vocabulary for each admin write operation
- Module owner for the admin controller

### 5.5 — Disposal polarity surface classification

A decision must be committed stating whether `DisposalPolarityPage` is:
(a) a **read-only reference view** (no API routes needed, page renders the constant map),
or (b) an **admin-managed config surface** (requires API routes, schema, and write spec).

If (a): the MODULE_SPECS entry must state `static-reference: no API dependency`
and the ADMIN_PAGE_API_MAPPING row must note `no query key family required`.
If (b): additional routes must be added to CONTRACTS.md, API_ROUTE_INVENTORY, and a
full create/edit spec must be written in MODULE_SPECS.

---

## 6. Proposed Non-Goals

The following are not goals of any future sacred-forms admin surface unless explicitly
decided and added to the canon.

- **Bulk approve or bulk reject applicants** — the lifecycle requires `reviewer_user_id`
  per applicant; bulk actions would need explicit audit semantics not yet defined.
- **Admin-initiated probation unlock** — CONTRACTS.md defines auto-unlock via daily
  cronjob; admin manual override requires a separate access-control decision.
- **Weather API integration UI** — the weather gate is a backend advisory; whether
  the admin UI surfaces live weather data is not defined.
- **Admin view of member public route data** (`GET /api/sacred-forms`,
  `GET /api/sacred-forms/my-applications`) — these are member-facing routes;
  admin visibility policy is not defined.
- **Automated prerequisite satisfaction from admin** — prerequisites are met by member
  practice history (engagement module query); admin cannot mark a prerequisite met
  by fiat without an explicit product decision.
- **Sacred form template versioning** — not defined in CONTRACTS.md.

---

## 7. Freeze Rule For Current Runtime

The following rules apply to the existing `/don-phap-bao/*` frontend routes in
`apps/admin` until the exit criteria in Section 8 are fully met.

**The current `/don-phap-bao/*` FE is runtime-ahead.** These routes were built against
endpoints in the old runtime. They do not represent approved admin workspaces in the
NestJS rebuild direction.

**No further write action is allowed on these routes.** Specifically:

- No new query key families may be introduced for any `/don-phap-bao/*` surface.
  The current `sacredFormKeys` family is tolerated but must not be expanded.
- No new routes may be added to the `/don-phap-bao/*` group.
- No new mutation hooks (`useMutation`) may be added beyond what already exists.
- `DisposalPolarityPage` must remain a static view. No write actions may be added
  to this surface until the surface classification decision in Section 5.5 is resolved.
- No new sub-routes (e.g., `/don-phap-bao/phap-danh`, `/don-phap-bao/xac-nhan`)
  may be added to this cluster.
- Existing read-only hygiene support (WorkspaceDetailSheet, WorkspaceDataTable)
  does not constitute canon approval.

Violations of this freeze rule must be reverted before the next canon review.

---

## 8. Exit Criteria

The sacred-forms admin scaffold block is lifted when **all** of the following
are true and verified:

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | `API_ROUTE_INVENTORY.md` rows exist for all sacred-forms public and admin routes | PR merged to `design/` |
| 2 | Backend role guard is stated in `CONTRACTS.md` for all admin routes | PR merged to `design/` |
| 3 | Audit event vocabulary is defined in `CONTRACTS.md` for all admin write operations | PR merged to `design/` |
| 4 | Module owner for the admin controller is stated in `CONTRACTS.md` | PR merged to `design/` |
| 5 | A workspace spec exists in `ADMIN_MODULE_SPECS.md` for the templates surface | PR merged to `design/` |
| 6 | A workspace spec exists in `ADMIN_MODULE_SPECS.md` for the applicants surface (including sub-specs for prerequisites, disposals, validations, burn) | PR merged to `design/` |
| 7 | The DisposalPolarityPage surface classification is committed (static-reference vs. config surface) | PR merged to `design/` |
| 8 | `ADMIN_PAGE_API_MAPPING.md` rows exist for each page route with canonical query key families | PR merged to `design/` |
| 9 | All ownership questions in Section 4 have explicit answers in merged design docs | Design review sign-off |

Scaffold work may only begin after all 9 criteria are checked.

---

*This document must be updated if any of the referenced source files change in a way
that affects the gap analysis. It must not be used to rationalize incremental additions
to the current frozen FE surface.*
