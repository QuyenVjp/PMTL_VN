# Doc Conflict Reconcile — Admin/API Compliance Audit

Ngày: 2026-07-13  
Source: `docs/audits/ADMIN_API_COMPLIANCE_AUDIT_2026-07-13.md` §8  
Task: Plans.md `0.1`  
Precedence rule: `design/` is SSOT unless code has a newer, intentional Phase-1 decision recorded below.

## Summary

| # | Conflict | Owner (SSOT) | Decision |
|---|---|---|---|
| 1 | AGENTS.md April top-five gaps vs DESIGN_GAP_ANALYSIS May | `DESIGN_GAP_ANALYSIS.md` | April list is **stale**; AGENTS.md points to May snapshot + residual verification backlog only |
| 2 | IMPLEMENTATION_MAPPING scaffold Step 7 vs many “implemented” claims | `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | **Two layers**: (A) historical scaffold window is archival; (B) per-row status table is current runtime claim; do not treat Step 7 as a hard ceiling for existing code |
| 3 | Dev restore drill “implemented” vs production restore pending | `IMPLEMENTATION_MAPPING.md` restore row + launch gates | Dev drill **implemented**; production restore remains **launch gate** (Plans 9.4) — not a contradiction |
| 4 | Identity roles `super_admin/admin/member` vs overlays `editor+/moderator+` | `design/03-domains/identity/DECISIONS.md` | **Runtime role set** = `SUPER_ADMIN \| ADMIN \| MEMBER`. Overlay `editor+/moderator+` are **capability aliases** mapping to `ADMIN+` until fine-grained roles exist |
| 5 | Admin auth sample only `admin` | Runtime `RolesGuard` + identity canon | Guards must accept `ADMIN` **and** `SUPER_ADMIN`. Samples that omit super_admin are **non-authoritative** |
| 6 | Content write routes `/api/admin/content/posts/*` vs inventory `/content/posts*` | **Code** `apps/api/src/modules/content/content.controller.ts` | Canonical admin write owner is `/admin/content/posts/*`. Inventory paths without `admin/` prefix are **public/read or legacy inventory labels** |
| 7 | Contact `/contact/info` vs `/contact-info` | Code `contact.controller.ts` | Public: existing controller paths as implemented. Admin: `/admin/contact-info`, `/admin/volunteers`. Prefer hyphenated admin paths in new docs |
| 8 | Search outbox-required vs Phase 1 direct sync | `design/03-domains/search/USE_CASES/index-published-post.md` + `REFERENCES/UNIFIED_INDEX_MAPPING.md` | **Phase 1** = direct sync / SQL fallback / manual reindex. **Outbox-driven Meili** = Phase 2+ when enabled |
| 9 | Notification Phase 1 “record only” vs queue async default | `design/03-domains/notification/CONTRACTS.md` | **Phase 1** records jobs/subscriptions; delivery may be manual/process/redrive. Async queue is **not** a launch blocker |
| 10 | Admin error DTO `traceId` + string field errors vs API error owner | `design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md` | API owner wins: envelope requires `code/message/status/requestId`; `traceId` **optional** (observability). Field errors = structured details (arrays/objects), not free-form strings |

## Detailed owners & required doc edits

### 1. Top-five gap list

- **Owner:** root `DESIGN_GAP_ANALYSIS.md` (May 2026).
- **Edit:** `AGENTS.md` section “Design Gap Analysis & Refactor Roadmap” must stop listing April CRITICAL missing items as current truth.
- **Replace with:** pointer to `DESIGN_GAP_ANALYSIS.md` + residual verification backlog (Plans Phase 8).

### 2. IMPLEMENTATION_MAPPING dual claims

- **Owner:** `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`.
- **Rule for agents:**
  - “Current safe scaffold window” = historical onboarding guidance; do **not** use it to delete or freeze already-implemented modules.
  - Per-row `implemented` timestamps are the runtime claim surface.
  - When adding new modules, still prefer scaffold order for greenfield work.

### 3. Restore drill

- **Owner:** same mapping file restore row + `design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md` (if present).
- **Rule:** Dev drill evidence ≠ production launch gate. Plans task `9.4` owns production drill.

### 4–5. Roles

- **Owner:** `design/03-domains/identity/DECISIONS.md` Decision 3.
- **Runtime enum (Prisma / Nest):** `MEMBER | ADMIN | SUPER_ADMIN`.
- **Overlay vocabulary mapping (until IAM expands):**
  - `member` → `MEMBER`
  - `editor+` → `ADMIN` or `SUPER_ADMIN`
  - `moderator+` → `ADMIN` or `SUPER_ADMIN`
  - `admin+` → `ADMIN` or `SUPER_ADMIN`
- **Code rule:** any `@Roles("ADMIN")` that must include super admin should use both, or a shared helper; never hard-block `SUPER_ADMIN` on admin surfaces.

### 6. Content write routes

- **Owner (runtime):** Nest controllers under `apps/api/src/modules/content/`.
- **Admin write authority:** `@Controller("admin/content/posts")` (and sibling admin content controllers).
- **Inventory:** update claims over time to list both public and admin prefixes; until then treat inventory bare `/content/posts` write rows as **stale labels**.

### 7. Contact paths

- **Owner (runtime):** `apps/api/src/modules/contact/contact.controller.ts`.
- **Admin:** `/admin/contact-info`, `/admin/volunteers`.
- **Public:** keep as implemented on the contact controllers; new design docs use hyphenated names for admin.

### 8. Search outbox

- **Owner:** search domain Phase table in `design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md` + use case `index-published-post.md`.
- **Phase 1 launch path:** direct sync / SQL / manual reindex is valid.
- **CONTRACTS.md outbox language** applies when outbox/Meili projection phase is enabled — not as a blocker for current Phase 1 code.

### 9. Notification queue

- **Owner:** `design/03-domains/notification/CONTRACTS.md` Phase 1 section.
- **Phase 1:** persist subscription + job records; process/redrive may be admin-triggered.
- **Queue/worker delivery** is deferred runtime (not Plans P0).

### 10. Error DTO

- **Owner:** `design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md`.
- **Canonical shape:** `{ error: { code, message, status, requestId, details? } }`.
- **`traceId`:** optional enrichment from tracing when present; Admin UI must tolerate absence.
- **Field errors:** under `details` as structured map/array per Zod validation projection — not a parallel free-string DTO.

## Non-goals of this reconcile

- No wholesale rewrite of route inventory.
- No new IAM roles (`editor`, `moderator`) in Prisma this task.
- No production restore drill (9.4).

## Verification

- [x] Decision note published (this file).
- [ ] `AGENTS.md` top-five section rewritten to May residual backlog.
- [ ] Cross-links from Plans.md `0.1` DoD point here.

## History

- 2026-07-13: Initial reconcile from Admin/API compliance audit §8.
