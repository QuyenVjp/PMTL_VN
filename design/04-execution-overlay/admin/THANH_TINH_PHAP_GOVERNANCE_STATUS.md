# Thanh Tịnh Pháp — Cluster Governance Status Board

> **Purpose:** Single-source governance reference for all admin surfaces under the "Thanh Tịnh Pháp" menu cluster.
> **Authored:** 2026-04-20
> **Status:** Living document — must be updated when any referenced canon file changes.
>
> **Evidence base:**
> - `apps/admin/AGENTS.override.md`
> - `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
> - `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
> - `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
> - `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`
> - `design/03-domains/altar-management/CONTRACTS.md` + `ADMIN_GAP.md`
> - `design/03-domains/dharma-compliance/CONTRACTS.md` + `ADMIN_GAP.md`
> - `design/03-domains/events/CONTRACTS.md`
> - `design/03-domains/life-liberation/CONTRACTS.md`
> - `design/03-domains/sacred-forms/CONTRACTS.md`
> - `design/03-domains/little-house/CONTRACTS.md`
> - `apps/admin/src/routes/__root.tsx` (FE route inventory)
>
> **Not a product decision.** This document records current governance state only.
> It does not approve, pre-approve, or imply direction for any future admin surface.

---

## 1. Classification Definitions

| Classification | Meaning | What is allowed |
|---|---|---|
| **CANON-BACKED** | All three admin triple docs present: `ADMIN_MODULE_SPECS` + `ADMIN_PAGE_API_MAPPING` + `API_ROUTE_INVENTORY`. | Full scaffold permitted per spec. |
| **HYGIENE-ONLY** | Domain `CONTRACTS.md` has admin routes. Admin triple is entirely absent. | Read-only list views, detail sheets. Existing contract-aligned mutations only. No new routes, no new query key families, no CRUD expansion. |
| **BLOCKED / STOP** | No domain contract for any admin surface (or `CONTRACTS.md` is member-only). | FE may remain in degraded/read-only state. No write actions of any kind. No new UI expansion. |

> **Important note on content module overlap:**
> `ADMIN_MODULE_SPECS §5` (`/noi-dung/ngoi-nha-nho`) covers the **content guides** module for little-house via `/api/admin/content/little-house/*`.
> `ADMIN_MODULE_SPECS §19` (`/he-thong/lich`) covers the **calendar** module via `/api/admin/calendar/events`.
> Neither satisfies the admin triple requirement for the operational little-house NNN records (`/api/admin/little-house/*`) or the events domain surface (`/api/admin/events/*`). These are separate modules with separate route namespaces and separate spec requirements.

---

## 2. Sub-cluster Overview

| Sub-cluster | FE prefix | Domain | Gap doc |
|---|---|---|---|
| Tuân thủ Pháp luật | `/phap-luat/*` | `dharma-compliance` | `design/03-domains/dharma-compliance/ADMIN_GAP.md` ✅ |
| Sự kiện Phật pháp | `/su-kien/*` | `events` | ❌ Not yet created |
| Phóng sinh | `/phong-sinh/*` | `life-liberation` | ❌ Not yet created |
| Đơn Pháp Bảo | `/don-phap-bao/*` | `sacred-forms` | ❌ Not yet created |
| Sớ (Ngôi Nhà Nhỏ) | `/so/*` | `little-house` (operational) | ❌ Not yet created |
| Bàn thờ | `/ban-tho/*` | `altar-management` | `design/03-domains/altar-management/ADMIN_GAP.md` ✅ |

---

## 3. Surface Status Board

Evidence column key:
- `CONTRACTS.md admin` — domain contract has admin-facing routes for this surface
- `MODULE_SPECS` — `ADMIN_MODULE_SPECS.md` has a workspace spec for this operational surface (content-module overlaps do NOT count)
- `PAGE_API_MAPPING` — `ADMIN_PAGE_API_MAPPING.md` has a row for this page route + API group + query key family (content-module overlaps do NOT count)
- `API_INVENTORY` — `API_ROUTE_INVENTORY.md` has admin-scoped route rows for this domain's operational surface

### 3.1 Tuân thủ Pháp luật (`/phap-luat/*`) — dharma-compliance

| Surface | FE route | CONTRACTS.md admin | MODULE_SPECS | PAGE_API_MAPPING | API_INVENTORY | Classification |
|---|---|---|---|---|---|---|
| Tổ chức từ thiện (list) | `/phap-luat/to-chuc-tu-thien` | ✅ GET+POST `/api/admin/dharma-compliance/charities` | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |
| Tổ chức từ thiện (tạo mới) | `/phap-luat/to-chuc-tu-thien/tao-moi` | ✅ POST route | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |
| Tổ chức từ thiện (detail) | `/phap-luat/to-chuc-tu-thien/$charityId` | ✅ GET+lifecycle routes | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |
| Cảnh báo gian lận | `/phap-luat/canh-bao-gian-lan` | ✅ GET+PATCH resolve | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |
| Lời nguyện thanh tu | `/phap-luat/loi-nguyen-thanh-tu` | ❌ No contract anywhere | ❌ | ❌ | ❌ | **BLOCKED / STOP** |
| Hàng đợi hướng dẫn | `/phap-luat/hang-doi-huong-dan` | ❌ No contract anywhere | ❌ | ❌ | ❌ | **BLOCKED / STOP** |

**Allowed scope now:**
- Charities / fraud-alerts: read-only list, detail sheet; `useCreateCharity`, `useUpdateCharityStatus`, `useResolveFraudAlert` (all have `CONTRACTS.md` backing)
- Purity-vows / guidance-queue: read-only list only; FE will return degraded/empty in rebuild runtime; `useRespondGuidance` was removed 2026-04-20

**Freeze rule:**
- Tier A (charities, fraud-alerts): no new mutations beyond the three above; no rules-tab expansion; no lifecycle UI (verify/suspend/revoke) until `MODULE_SPECS` defines role narrowing
- Tier B (purity-vows, guidance-queue): no write actions, no restored mutations, no new query keys

**Unlock docs required:**
- Tier A: `MODULE_SPECS` entry × 2 (charities, fraud-alerts) + `PAGE_API_MAPPING` rows + `API_ROUTE_INVENTORY` admin rows + role narrowing + audit event vocabulary
- Tier B: Domain contract in owning `CONTRACTS.md` (owner TBD: vows-merit vs. dharma-compliance) + full admin triple × 2

**Gap doc:** `design/03-domains/dharma-compliance/ADMIN_GAP.md` — exit criteria at §8A (charities/fraud-alerts, 7 criteria) and §8B (purity-vows/guidance-queue, 5 criteria)

---

### 3.2 Sự kiện Phật pháp (`/su-kien/*`) — events

| Surface | FE route | CONTRACTS.md admin | MODULE_SPECS | PAGE_API_MAPPING | API_INVENTORY | Classification |
|---|---|---|---|---|---|---|
| Sự kiện (list) | `/su-kien/danh-sach` | ✅ GET `/api/admin/events` | ❌ (§19 = calendar module, not events domain) | ❌ (calendar row `/api/admin/calendar/events` ≠ events domain) | ❌ | **HYGIENE-ONLY** |
| Sự kiện (tạo mới) | `/su-kien/danh-sach/tao-moi` | ✅ POST `/api/admin/events` | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |
| Sự kiện (detail) | `/su-kien/danh-sach/$publicId` | ✅ GET+lifecycle routes | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |

> **Critical note — route family conflict:** `events/CONTRACTS.md` defines admin routes at `/api/admin/events/*`.
> `ADMIN_MODULE_SPECS §19` and the `ADMIN_PAGE_API_MAPPING` calendar row cover the **calendar** module at `/api/admin/calendar/events` — a distinct module with distinct data ownership (lunar overrides, advisory previews, scheduling).
> These are two separate route namespaces. The `/su-kien/*` FE cluster calls the events domain (`/api/admin/events/*`), which has **zero admin triple coverage**.
> The route family conflict (events domain vs. calendar module) must be explicitly resolved in a future design pass before any events operational scaffold is permitted.

**Allowed scope now:** Read-only list; read-only detail sheet. Existing create form may be tolerated but no new action surfaces (publish, violations tab, monetization rules, access-log view).

**Freeze rule:** No new mutations, no new query keys for any `/su-kien/*` surface; no check-in write actions; no violation management UI.

**Unlock docs required:** `MODULE_SPECS` entry for events operational workspace (distinct from §19 calendar) + `PAGE_API_MAPPING` row for `/su-kien/danh-sach` with canonical query key family + `API_ROUTE_INVENTORY` admin rows for `/admin/events/*` + route family conflict resolution statement.

**Gap doc:** ❌ Not yet created.

---

### 3.3 Phóng sinh (`/phong-sinh/*`) — life-liberation

| Surface | FE route | CONTRACTS.md admin | MODULE_SPECS | PAGE_API_MAPPING | API_INVENTORY | Classification |
|---|---|---|---|---|---|---|
| Hồ sơ phóng sinh | `/phong-sinh/ho-so` | ✅ GET+write `/api/admin/life-liberation/releases/*` | ❌ (§ content module only: `/api/admin/content/life-release/*`) | ❌ (`/noi-dung/phong-sanh` = content guides, not operational) | ❌ | **HYGIENE-ONLY** |
| Thống kê loài | `/phong-sinh/thong-ke` | ✅ GET `/api/admin/life-liberation/species` | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |

> **Content module overlap note:** `ADMIN_PAGE_API_MAPPING` has a row for `/admin/noi-dung/phong-sanh` → `/api/admin/content/life-release/*`. This covers the content workspace (guides, variants, FAQ, downloads). It does NOT cover the operational life-liberation admin surface (`/api/admin/life-liberation/releases`, `/api/admin/life-liberation/species`, `/api/admin/life-liberation/audits`). These are different API groups and different admin workspaces.

**Allowed scope now:** Read-only release list; read-only species list. No audit write, no candidate management, no status transitions from admin.

**Freeze rule:** No new mutations, no audit write hooks, no candidate approval/rejection UI.

**Unlock docs required:** `MODULE_SPECS` entry for life-liberation operational workspace + `PAGE_API_MAPPING` row for `/phong-sinh/*` + `API_ROUTE_INVENTORY` admin rows for `/admin/life-liberation/*`.

**Gap doc:** ❌ Not yet created.

---

### 3.4 Đơn Pháp Bảo (`/don-phap-bao/*`) — sacred-forms

| Surface | FE route | CONTRACTS.md admin | MODULE_SPECS | PAGE_API_MAPPING | API_INVENTORY | Classification |
|---|---|---|---|---|---|---|
| Mẫu đơn | `/don-phap-bao/mau-don` | ✅ GET+POST+PATCH `/api/admin/sacred-forms` | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |
| Đơn đăng ký | `/don-phap-bao/don-dang-ky` | ✅ applicants + review/approve/reject/waive | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |
| Quy tắc xử lý (disposal) | `/don-phap-bao/quy-tac-xu-ly` | ✅ disposal + burn routes | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |

**Allowed scope now:** Read-only template list; read-only applicant list/detail; read-only disposal rules display. No review/approve/reject actions; no burn trigger; no prerequisite waive.

**Freeze rule:** No new mutations (review/approve/reject/waive/burn must not be wired until `MODULE_SPECS` defines role narrowing and audit event vocabulary). No new query keys beyond what currently exists.

**Unlock docs required:** `MODULE_SPECS` entry for sacred-forms operational workspace (covering templates, applicants, disposals tabs) + `PAGE_API_MAPPING` rows for `/don-phap-bao/*` + `API_ROUTE_INVENTORY` admin rows for `/admin/sacred-forms/*` + role narrowing for review/approve/reject (who can approve, who can waive prerequisites).

**Gap doc:** ❌ Not yet created.

---

### 3.5 Sớ — Ngôi Nhà Nhỏ (`/so/*`) — little-house (operational)

| Surface | FE route | CONTRACTS.md admin | MODULE_SPECS | PAGE_API_MAPPING | API_INVENTORY | Classification |
|---|---|---|---|---|---|---|
| Danh sách sớ | `/so/danh-sach` | ✅ GET+detail routes `/api/admin/little-house/*` | ❌ (§5 = content guides `/api/admin/content/little-house/*`) | ❌ (`/noi-dung/ngoi-nha-nho` = content guides, not operational) | ❌ | **HYGIENE-ONLY** |
| Hàng đợi gian lận (sớ) | `/so/gian-lan` | ✅ frauds CRUD + confirm/revoke | ❌ | ❌ | ❌ | **HYGIENE-ONLY** |

> **Content module overlap note:** `ADMIN_MODULE_SPECS §5` and `ADMIN_PAGE_API_MAPPING` row `/admin/noi-dung/ngoi-nha-nho` cover the content workspace (`/api/admin/content/little-house/*` — guides, case variants, FAQ, downloads). This is the editorial content module. The operational little-house admin surface for NNN records, recitation tracking, combustion logs, and fraud management at `/api/admin/little-house/*` has zero admin triple coverage.

**Allowed scope now:** Read-only NNN list, detail (with recitation/dotting/combustion sub-data); read-only fraud queue list and detail. No status transitions, no combustion trigger, no fraud confirm/revoke actions.

**Freeze rule:** No fraud confirm/revoke mutations; no NNN status-change mutations; no new query keys.

**Unlock docs required:** `MODULE_SPECS` entry for little-house operational workspace + `PAGE_API_MAPPING` rows for `/so/*` + `API_ROUTE_INVENTORY` admin rows for `/admin/little-house/*`.

**Gap doc:** ❌ Not yet created.

---

### 3.6 Bàn thờ (`/ban-tho/*`) — altar-management

| Surface | FE route | CONTRACTS.md admin | MODULE_SPECS | PAGE_API_MAPPING | API_INVENTORY | Classification |
|---|---|---|---|---|---|---|
| Vật phẩm bàn thờ | `/ban-tho/vat-pham` | ❌ CONTRACTS.md = Phase 1 member-only (`/api/engagement/altar/*`), zero admin routes | ❌ | ❌ | ❌ | **BLOCKED / STOP** |
| Nhật ký xác nhận | `/ban-tho/nhat-ky` | ❌ No admin contract | ❌ | ❌ | ❌ | **BLOCKED / STOP** |
| Quy trình bàn thờ | `/ban-tho/quy-trinh` | ❌ No admin contract | ❌ | ❌ | ❌ | **BLOCKED / STOP** |

**Allowed scope now:** Read-only item list (degraded — no rebuild API backing); read-only validation log list; static procedures display. Write path `useUpdateAltarCondition` was removed 2026-04-20. `ConditionUpdateDialog` and `altar-management/mutations.ts` were deleted 2026-04-20.

**Freeze rule:** Per `ADMIN_GAP.md §7`: no new query key families; no new `/ban-tho/*` routes; no CRUD expansion; no new mutation hooks. Current read-only hygiene support is tolerated; no further action until all 7 exit criteria in `ADMIN_GAP.md §8` are met.

**Unlock docs required (5 artifacts, all required):**
1. `ADMIN_MODULE_SPECS.md` entry for altar-management admin workspace
2. `ADMIN_PAGE_API_MAPPING.md` row for `/ban-tho/*` with registered query key family
3. `API_ROUTE_INVENTORY.md` admin-scoped route rows for altar item / validation log operations
4. `altar-management/CONTRACTS.md` admin route group section with role guard and audit events
5. Polarity statement (member `/me/altar/*` vs. admin surface) in `CONTRACTS.md` or `DECISIONS.md`

**Gap doc:** `design/03-domains/altar-management/ADMIN_GAP.md` — full 7-criteria exit checklist at §8.

---

## 4. Canon Triple Coverage Matrix

| Domain | CONTRACTS.md admin routes | ADMIN_MODULE_SPECS | PAGE_API_MAPPING | API_ROUTE_INVENTORY | Overall verdict |
|---|---|---|---|---|---|
| dharma-compliance — charities, fraud-alerts | ✅ | ❌ | ❌ | ❌ | HYGIENE-ONLY |
| dharma-compliance — purity-vows, guidance-queue | ❌ | ❌ | ❌ | ❌ | BLOCKED / STOP |
| events (operational surface) | ✅ | ❌ (§19 = calendar, not events domain) | ❌ (calendar row ≠ events domain row) | ❌ | HYGIENE-ONLY |
| life-liberation (operational surface) | ✅ | ❌ (content guide module only) | ❌ (content guide row only) | ❌ | HYGIENE-ONLY |
| sacred-forms | ✅ | ❌ | ❌ | ❌ | HYGIENE-ONLY |
| little-house (operational NNN surface) | ✅ | ❌ (content guide module only) | ❌ (content guide row only) | ❌ | HYGIENE-ONLY |
| altar-management | ❌ (member-only Phase 1) | ❌ | ❌ | ❌ | BLOCKED / STOP |

---

## 5. Active Mutations Inventory

Only mutations that were active as of 2026-04-20 freeze pass are listed.

| Hook | Feature file | Route called | CONTRACTS.md backing | Status |
|---|---|---|---|---|
| `useCreateCharity` | `dharma-compliance/mutations.ts` | `POST /admin/dharma-compliance/charities` | ✅ | Active — hygiene-allowed |
| `useUpdateCharityStatus` | `dharma-compliance/mutations.ts` | `PATCH /admin/dharma-compliance/charities/:publicId/status` | ✅ | Active — hygiene-allowed |
| `useResolveFraudAlert` | `dharma-compliance/mutations.ts` | `PATCH /admin/dharma-compliance/fraud-alerts/:publicId/resolve` | ✅ | Active — hygiene-allowed |
| `useRespondGuidance` | ~~dharma-compliance/mutations.ts~~ | ~~PATCH .../vows/guidance/:id/respond~~ | ❌ No contract | **Removed 2026-04-20** — must not be restored |
| `useUpdateAltarCondition` | ~~altar-management/mutations.ts~~ (deleted) | ~~PATCH /admin/altar-management/items/:publicId/condition~~ | ❌ No contract | **Removed 2026-04-20** — file deleted |

---

## 6. Query Key Family Status

| Key family | Feature file | Registered in PAGE_API_MAPPING | Contract backing | Status |
|---|---|---|---|---|
| `charityKeys` | `dharma-compliance/queries.ts` | ❌ | ✅ | Tolerated — must not expand |
| `fraudAlertKeys` | `dharma-compliance/queries.ts` | ❌ | ✅ | Tolerated — must not expand |
| `vowKeys` | `dharma-compliance/queries.ts` | ❌ | ❌ | Tolerated (read-only, degraded) — must not expand |
| `guidanceKeys` | `dharma-compliance/queries.ts` | ❌ | ❌ | Tolerated (read-only, degraded) — must not expand |

No query key families exist for events (`/su-kien/*`), life-liberation (`/phong-sinh/*`), sacred-forms (`/don-phap-bao/*`), little-house operational (`/so/*`), or altar-management (`/ban-tho/*`) in their respective feature folders. Any key invented in those feature files without a `PAGE_API_MAPPING.md` row is out-of-design.

---

## 7. Gap Doc Coverage and Priority

| Domain | Gap doc | Priority to create | Note |
|---|---|---|---|
| altar-management | `design/03-domains/altar-management/ADMIN_GAP.md` ✅ | — | Complete with 5-artifact exit criteria |
| dharma-compliance | `design/03-domains/dharma-compliance/ADMIN_GAP.md` ✅ | — | Complete with split-tier (8A + 8B) exit criteria |
| events | ❌ | HIGH | Route family conflict (events domain vs. calendar module) is unresolved and undocumented |
| life-liberation | ❌ | MEDIUM | Contract-backed but operational surface entirely undocumented |
| sacred-forms | ❌ | MEDIUM | Contract-backed and most complex lifecycle; no gap doc records the scope freeze |
| little-house (operational) | ❌ | MEDIUM | Content/operational split is easy to confuse; needs explicit gap doc |

---

## 8. Governance Rules for This Cluster

The following rules apply to all surfaces in this cluster until the relevant exit criteria are met.

1. **No surface may be promoted from HYGIENE-ONLY to CANON-BACKED without all three admin triple docs merged to `design/`.** Domain `CONTRACTS.md` alone is not sufficient.

2. **No surface may be promoted from BLOCKED/STOP to HYGIENE-ONLY without a domain contract.** FE existence is not design approval. Per `IMPLEMENTATION_MAPPING.md`: "Runtime cũ trong repo không được tính là implementation hợp lệ cho direction mới chỉ vì nó đang tồn tại."

3. **No new query key families may be added to any feature folder in this cluster** without a corresponding `ADMIN_PAGE_API_MAPPING.md` row. Any key invented without that row is out-of-design.

4. **No new sidebar entries may be added** to any sub-cluster group without the target surface being promoted to at least HYGIENE-ONLY classification with a published domain contract.

5. **The removed mutations (`useRespondGuidance`, `useUpdateAltarCondition`) must not be restored** in any form until the respective domain contracts and admin triple are published.

6. **This document must be updated** any time a referenced source file changes in a way that affects the governance state of any surface. It must not be used to rationalize additions to frozen surfaces.

---

*This board is a read-only governance reference. It does not grant permission. It does not record product decisions. It exists to prevent incremental scope creep from being treated as implicit canon approval.*
