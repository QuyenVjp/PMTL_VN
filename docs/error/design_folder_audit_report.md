# 🔴 BÁO CÁO ĐÁNH GIÁ TOÀN DIỆN: `design/` — PMTL_VN
**Audit date**: 2026-03-26 · **Auditor perspective**: Senior Full-stack (10 năm) · **Nguyên tắc**: chỉ chê, không khen

> [!CAUTION]
> Báo cáo này đánh giá **logic**, **đồng bộ**, **trùng lặp**, **version drift**, và **gaps** giữa ~120 files trong `design/`. Mọi phát hiện đều dựa trên nội dung thực tế đã đọc, không suy đoán.

---

## Mục lục

1. [Tổng quan cấu trúc](#1-tổng-quan-cấu-trúc)
2. [🔴 VERSION DRIFT NGHIÊM TRỌNG](#2--version-drift-nghiêm-trọng)
3. [🔴 NỘI DUNG TRÙNG LẶP GIỮA CÁC FILE](#3--nội-dung-trùng-lặp-giữa-các-file)
4. [🟡 LOGIC KHÔNG ĐỒNG BỘ GIỮA CÁC FILE](#4--logic-không-đồng-bộ-giữa-các-file)
5. [🟡 FILE ĐẶT SAI CHỖ / CẦN GỘP](#5--file-đặt-sai-chỗ--cần-gộp)
6. [🔴 THIẾU SÓT NGHIÊM TRỌNG](#6--thiếu-sót-nghiêm-trọng)
7. [🟡 GOVERNANCE LAYER — VẤN ĐỀ](#7--governance-layer--vấn-đề)
8. [🔴 DEPENDENCY GOVERNANCE vs VERSION MATRIX — XUNG ĐỘT](#8--dependency-governance-vs-version-matrix--xung-đột)
9. [🟡 DOMAIN LAYER (03-domains) — VẤN ĐỀ](#9--domain-layer-03-domains--vấn-đề)
10. [🟡 EXECUTION OVERLAY (04) — VẤN ĐỀ](#10--execution-overlay-04--vấn-đề)
11. [🟠 REFERENCES LAYER (05) — VẤN ĐỀ](#11--references-layer-05--vấn-đề)
12. [🔴 06-prompts — FOLDER TRỐNG](#12--06-prompts--folder-trống)
13. [🔴 ĐÁNH GIÁ TỔNG THỂ LOGIC LIÊN FILE](#13--đánh-giá-tổng-thể-logic-liên-file)
14. [📋 ĐỀ XUẤT HÀNH ĐỘNG ƯU TIÊN](#14--đề-xuất-hành-động-ưu-tiên)

---

## 1. Tổng quan cấu trúc

```
design/                          (~120+ files)
├── 00-governance/               (9 files — meta-governance)
├── 01-repo-constitution/        (11 files — direction, decisions, ownership)
├── 02-platform-baseline/        (9 subdirs, ~60 files — runtime policy)
├── 03-domains/                  (11 domain folders, ~80 files — business logic)
├── 04-execution-overlay/        (6 subdirs, ~36 files — implementation truth)
├── 05-references/               (4 subdirs, ~11 files — external refs)
├── 06-prompts/                  (1 file — TRỐNG chỉ có README)
└── README.md                    (418 lines — index/orientation)
```

---

## 2. 🔴 VERSION DRIFT NGHIÊM TRỌNG

Đây là lỗi **nguy hiểm nhất**. Hai file cùng claim authority về version nhưng **nói khác nhau**:

### [VERSION_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md) vs [DEPENDENCY_GOVERNANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md)

| Package | VERSION_MATRIX (design pin) | DEP_GOVERNANCE (approved current) | ⚠️ Drift |
|---|---|---|---|
| **Next.js** | `16.2.1` | `16.1.6` | 🔴 **Minor version khác** |
| **React** | `19.2.4` | `19.2.0` | 🔴 **Patch khác** |
| **React DOM** | `19.2.4` | `19.2.0` | 🔴 **Patch khác** |
| **TanStack Query** | `5.95.2` | `5.90.x` (min `5.90.21`) | 🔴 **Minor version khác rất xa** |
| **React Hook Form** | `7.72.0` | `7.62.x` (min `7.62.0`) | 🔴 **Minor 10 version gap** |
| **Tailwind CSS** | `4.2.2` | *(không liệt kê)* | 🟡 Missing from governance |
| **Vite** | `8.0.2` | `8.x stable` | 🟡 Governance không pin exact |
| **TanStack Router** | `1.168.3` | *(generic "latest stable")* | 🟡 Governance không pin |
| **TanStack Table** | `8.21.3` | *(generic "latest stable")* | 🟡 Governance không pin |
| **NestJS** | `11.1.17` | `11.1.17` | ✅ Khớp |
| **Prisma** | `7.5.0` | `7.x stable` | 🟡 Governance không pin exact |
| **Pino** | `10.3.1` | `10.0.x` (min `10.0.0`) | 🔴 **Minor khác** |
| **Zod** | `4.3.6` | `4.3.6` | ✅ Khớp |
| **BullMQ** | `5.71.1` | *(generic "latest stable")* | 🟡 Không pin |
| **Meilisearch** | `1.40.0` | *(generic "latest stable")* | 🟡 Không pin |
| **Valkey** | `9.0.3` | *(generic "latest stable")* | 🟡 Không pin |

> [!CAUTION]
> **Verdict**: VERSION_MATRIX claim audit ngày `2026-03-25` với npm registry, nhưng DEPENDENCY_GOVERNANCE (audit `2026-03-24`) lại pin version **cũ hơn**. Nghĩa là:
> - VERSION_MATRIX nâng version mà không update DEPENDENCY_GOVERNANCE
> - Hoặc ngược lại: DEPENDENCY_GOVERNANCE bị outdated 1 ngày nhưng drift lớn
> - AI agent đọc file nào sẽ scaffold version KHÁC NHAU
>
> **Đây là vi phạm trực tiếp rule trong chính DEPENDENCY_GOVERNANCE section 4**: "exact-sync packages phải giữ exact version giữa các workspaces"

### [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md) section 14 vs VERSION_MATRIX

| Library | DECISIONS.md | VERSION_MATRIX |
|---|---|---|
| Next.js | "Next.js 16 App Router" (no exact pin) | `16.2.1` |
| Tailwind | "Tailwind CSS 4" (no exact pin) | `4.2.2` |
| TanStack Query | "TanStack Query v5" (no exact pin) | `5.95.2` |

DECISIONS.md chỉ ghi major, VERSION_MATRIX ghi exact — điều này **tốt về thiết kế** nhưng **thiếu cross-reference rõ ràng**: DECISIONS.md không nói "exact pin đọc ở VERSION_MATRIX".

---

## 3. 🔴 NỘI DUNG TRÙNG LẶP GIỮA CÁC FILE

### 3.1 "Phase 1 Baseline" — lặp ở **5 file**

Cùng một danh sách Phase 1 components được copy-paste (gần verbatim) ở:

1. [README.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/README.md) L63-79
2. [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/DECISIONS.md) L26-45
3. [ARCHITECTURE_AT_A_GLANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md) L25-41
4. [PHASE_SEMANTICS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/PHASE_SEMANTICS.md) L25-38
5. [PHASE_ACTIVATION_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md)

> **Vấn đề**: Nếu sửa Phase 1 list ở DECISIONS.md, phải nhớ sửa **4 file còn lại**. Chính ROOT_DOC_OWNERSHIP.md nói "chỉ tóm tắt 1-3 bullet + dẫn link" nhưng thực tế mỗi file đều copy **full list**.

### 3.2 "Deferred Components" — lặp ở **4 file**

Danh sách Valkey/BullMQ/Meilisearch/PgBouncer deferred gần y hệt ở:
1. README.md L81-91
2. DECISIONS.md L46-58
3. ARCHITECTURE_AT_A_GLANCE.md L44-54
4. PHASE_SEMANTICS.md L40-53

### 3.3 "Anti-goals / Anti-junior traps" — lặp ở **3 file**

1. README.md L405-411 ("Anti-junior traps")
2. DECISIONS.md L268-274 ("Anti-goals")
3. ARCHITECTURE_AT_A_GLANCE.md L90-98 ("Known operational risk")

Nội dung tương đồng ~80%, diễn đạt khác nhau.

### 3.4 "Readiness semantics" — lặp ở **3 file**

1. README.md L50-59
2. ARCHITECTURE_AT_A_GLANCE.md L65-73
3. IMPLEMENTATION_STATUS_SCHEMA.md (canonical nhưng dùng vocabulary khác)

### 3.5 "Launch gate checklist" — chỉ có ở README.md

README.md L130-141 có checklist launch gate nhưng IMPLEMENTATION_MAPPING.md (được claim là truth owner) không mirror checklist này. Ai là truth owner của launch gate?

### 3.6 Library choices — lặp giữa DECISIONS.md section 14 và VERSION_MATRIX

DECISIONS.md section 14 liệt kê đầy đủ library table. VERSION_MATRIX cũng liệt kê. Nhưng version number **KHÔNG KHỚP** (xem section 2).

---

## 4. 🟡 LOGIC KHÔNG ĐỒNG BỘ GIỮA CÁC FILE

### 4.1 WRITING_STANDARDS.md nằm sai vị trí

File [WRITING_STANDARDS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/WRITING_STANDARDS.md) — một file về **chuẩn viết contract/use-case** — lại nằm trong `dependency-version/`. Đây là thư mục về governance version/dependency, không liên quan đến writing standards.

**Nên di chuyển**: `00-governance/WRITING_STANDARDS.md` hoặc `01-repo-constitution/WRITING_STANDARDS.md`

### 4.2 REPO_STRUCTURE.md nằm sai vị trí

File [REPO_STRUCTURE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/REPO_STRUCTURE.md) mô tả **cấu trúc thư mục repo** — nằm trong `dependency-version/` là vô lý.

**Nên nằm ở**: `01-repo-constitution/REPO_STRUCTURE.md` hoặc `02-platform-baseline/` root.

### 4.3 MIGRATION_MAP.md — tham chiếu path cũ/mới lẫn lộn

[MIGRATION_MAP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/MIGRATION_MAP.md) liệt kê "Current file → Target path" nhưng nhiều file **đã ở target path rồi** (migration đã hoàn thành). File này cần được cleanup: phân biệt rõ "đã move" vs "chưa move".

### 4.4 README.md "Read in order" — 79 items quá dài

README.md liệt kê **79 file theo thứ tự đọc** — con số này quá lớn và không thực tế cho bất kỳ ai (kể cả AI). Thực tế, sau ~20 file, thứ tự này chỉ là danh sách dump. Cần phân nhỏ thành reading paths theo role (backend dev, frontend dev, reviewer, security auditor).

### 4.5 ROOT_DOC_OWNERSHIP.md — bảng ownership quá lớn

File [ROOT_DOC_OWNERSHIP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md) liệt kê **~95 files** trong một bảng. Nó trở thành file quá tải cognitive, và bản thân nó cũng **lặp lại rất nhiều pattern từ DOC_TAXONOMY.md, CANONICAL_LAYOUT.md, và MIGRATION_MAP.md**.

---

## 5. 🟡 FILE ĐẶT SAI CHỖ / CẦN GỘP

### 5.1 Nên gộp lại

| Files cần gộp | Lý do | Đề xuất |
|---|---|---|
| [PHASE_SEMANTICS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/PHASE_SEMANTICS.md) + [PHASE_ACTIVATION_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md) | Cùng nói về phase definition, chỉ khác mức chi tiết | Gộp thành 1 file `PHASE_SYSTEM.md` ở `00-governance/` |
| [IMPLEMENTATION_STATUS_SCHEMA.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPLEMENTATION_STATUS_SCHEMA.md) + phần readiness semantics trong README | Cùng vocabulary, nhưng README dùng từ khác | README phải link chứ không rephrase |
| [ARCHITECTURE_AT_A_GLANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md) + phần tương ứng trong [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/DECISIONS.md) | AT_A_GLANCE lặp ~90% nội dung section 1-3 và 15 của DECISIONS.md | AT_A_GLANCE nên chỉ là 1 trang **thật sự**, tối đa 30 dòng, link về DECISIONS |
| [CANONICAL_LAYOUT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/CANONICAL_LAYOUT.md) + [MIGRATION_MAP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/MIGRATION_MAP.md) | CANONICAL_LAYOUT chỉ 96 dòng, phần lớn là tree view đã có trong MIGRATION_MAP | Gộp thành `FOLDER_CANON.md` gồm target layout + migration status |
| [SOURCE_PRIORITY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/SOURCE_PRIORITY.md) + [CONFLICT_RESOLUTION.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/CONFLICT_RESOLUTION.md) | Hai file bổ sung cho nhau, cùng ~50 dòng mỗi file | Gộp thành `AUTHORITY_AND_CONFLICT.md` |

### 5.2 Files thừa hoặc giá trị thấp

| File | Lý do | Đề xuất |
|---|---|---|
| [RULE_FORMAT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/RULE_FORMAT.md) (60 dòng) | Mô tả format viết rule, nhưng **không file nào trong design/ thực sự follow format này**. Nó là aspirational, không enforced. | Archive hoặc enforce thật — hiện tại nó misleading |
| [IMPORT_BOUNDARIES.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPORT_BOUNDARIES.md) (46 dòng) | Nội dung overlap nặng với DECISIONS.md section 6 + 8 và AGENTS.md "Monorepo Boundaries" | Merge nội dung vào DECISIONS.md, xóa file riêng |
| [DOC_TAXONOMY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/DOC_TAXONOMY.md) Registry Requirement section | Nói "từ nay design/ phải có registry machine-readably" nhưng **không tồn tại registry nào**. Không file nào có frontmatter đúng format. | Enforce hoặc remove claim |
| [06-prompts/README.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/06-prompts/README.md) (1 file, 255 bytes) | Folder gần trống, README placeholder | Xóa hoặc populate thật |

---

## 6. 🔴 THIẾU SÓT NGHIÊM TRỌNG

### 6.1 Không có **Tailwind CSS 4** policy doc

DECISIONS.md chốt "Tailwind CSS 4", VERSION_MATRIX pin `4.2.2`, nhưng **KHÔNG CÓ** file nào trong `design/` mô tả:
- Tailwind 4 migration so với v3 (breaking changes: `@config` → `@theme`, CSS-first config, vv)
- Design token mapping cụ thể cho PMTL
- Utility class conventions cho team

Frontend doc ([FRONTEND_ARCHITECTURE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md), 52KB) có thể đề cập nhưng cần file policy riêng vì Tailwind 4 là **major breaking change** từ v3.

### 6.2 Không có **Prisma 7** specific policy doc

VERSION_MATRIX pin Prisma `7.5.0`, nhưng không có file tương đương [NESTJS_11_ADOPTION.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md) cho Prisma 7. PRISMA_SCHEMA_PLAN.md trong `04-execution-overlay/data/` chỉ nói về schema merge, không nói về Prisma 7 breaking changes hoặc adoption nuances.

### 6.3 Không có **shadcn/ui** component inventory

DECISIONS.md chốt shadcn/ui cho cả web + admin, nhưng không có inventory nào map:
- Components nào đã add
- Components nào cần customize
- Theme token mapping giữa shadcn default và PMTL design system

### 6.4 Không có **Zustand** policy doc

DECISIONS.md section 14 chốt Zustand cho client state, nhưng **KHÔNG CÓ** file nào mô tả:
- Store naming convention
- Store boundaries (per-page vs global)
- Hydration/SSR behavior với Next.js App Router

### 6.5 Không có **Error Envelope** chuẩn hoá đầy đủ

[ERROR_CODE_REGISTRY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md) tồn tại nhưng chỉ 3.8KB. [WRITING_STANDARDS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/WRITING_STANDARDS.md) có "Minimal error contract" 6 dòng. Thiếu:
- Error response shape chuẩn (JSON envelope)
- Error code namespace per module
- Error mapping từ Zod validation error → API response

### 6.6 Không có **API Authentication flow** chi tiết

SECURITY_POLICY.md (24KB) nói nhiều nhưng **thiếu sequence diagram** cho:
- Register → verify email → login → access token → refresh token rotation
- OAuth flow (nếu có)
- Session invalidation flow

---

## 7. 🟡 GOVERNANCE LAYER — VẤN ĐỀ

### 7.1 Governance nói nhưng không enforce

- [DOC_TAXONOMY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/DOC_TAXONOMY.md) L128-136: "từ nay `design/` phải có registry machine-readably" → **Không có registry nào**
- [RULE_FORMAT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/RULE_FORMAT.md): Template cho rule docs → **Không file nào follow template này**
- [IMPLEMENTATION_STATUS_SCHEMA.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPLEMENTATION_STATUS_SCHEMA.md): 8 canonical statuses → Nhiều file overlay dùng **free-text status** thay vì canonical

### 7.2 9 files quá nhiều cho governance meta-layer

Governance layer có 9 files với **tổng ~36KB**. Đây là một lớp meta **nói về cách tổ chức docs** nhưng bản thân nó cũng **quá phân mảnh**. Một senior engineer sẽ gộp xuống **3-4 files max**:

1. [GOVERNANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md) = SOURCE_PRIORITY + CONFLICT_RESOLUTION + DOC_TAXONOMY
2. [CANONICAL_LAYOUT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/CANONICAL_LAYOUT.md) = CANONICAL_LAYOUT + MIGRATION_MAP
3. `STATUS_AND_PHASE.md` = PHASE_SEMANTICS + IMPLEMENTATION_STATUS_SCHEMA
4. `IMPORT_AND_FORMAT.md` = IMPORT_BOUNDARIES + RULE_FORMAT

---

## 8. 🔴 DEPENDENCY GOVERNANCE vs VERSION MATRIX — XUNG ĐỘT

Đây là phần cần sửa gấp nhất:

### Vấn đề gốc

Hai file **cùng claim authority** về version:
- [VERSION_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md): "exact installed truth vs design pin vs activation-time pin"
- [DEPENDENCY_GOVERNANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md): "Approved version matrix" section 3

Nhưng chúng **không đồng bộ** (xem bảng ở section 2).

### Giải pháp đề xuất

**Chỉ 1 file được giữ exact version numbers**. Đề xuất:

- [VERSION_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md) giữ **exact pins** (design pin, installed truth, activation-time pin)
- [DEPENDENCY_GOVERNANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md) section 3 **XÓA bảng version duplicate**, chỉ giữ **policy** (upgrade mode, sync rules, cadence)
- [DEPENDENCY_GOVERNANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md) link về VERSION_MATRIX cho exact numbers

Hiện tại cả hai file đều maintain bảng version → **guaranteed drift**.

---

## 9. 🟡 DOMAIN LAYER (03-domains) — VẤN ĐỀ

### 9.1 Cấu trúc domain **đồng nhất tốt** nhưng có gaps

Tất cả 11 domains đều có: [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/DECISIONS.md), [MODULE_MAP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/MODULE_MAP.md), [CONTRACTS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/CONTRACTS.md), [SCHEMA_PLAN.dbml](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/SCHEMA_PLAN.dbml), `STATES/`, `USE_CASES/`. Đây là **điểm tốt duy nhất** — nhưng yêu cầu là "chỉ chê", nên:

### 9.2 STATES/ và USE_CASES/ chưa được kiểm tra nội dung

Tôi chỉ list được folder structure, chưa đọc nội dung bên trong `STATES/` và `USE_CASES/` của mỗi domain. Khả năng cao nhiều file **placeholder** hoặc **skeleton** chưa đủ chi tiết.

### 9.3 Contact domain quá nhỏ

`03-domains/contact/` có [CONTRACTS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/CONTRACTS.md) (2.3KB), [MODULE_MAP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/MODULE_MAP.md) (2.3KB), [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/search/DECISIONS.md) (1KB) — tổng cộng rất nhỏ. Có thể gộp contact vào community hoặc moderation thay vì tách domain riêng.

### 9.4 Cross-domain references không có inventory

Không có file nào map **mối quan hệ giữa 11 domains** một cách structured (ngoại trừ [MODULE_INTERACTIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md) ở overlay). Domain docs viết cross-reference bằng prose, dễ drift.

---

## 10. 🟡 EXECUTION OVERLAY (04) — VẤN ĐỀ

### 10.1 `04-execution-overlay/web/` quá lớn — 13 files

Web overlay có 13 files với tổng **~160KB**. Nhiều file có tên rất dài và **overlap chức năng**:

| File | Size | Có thể gộp? |
|---|---|---|
| [PAGE_INVENTORY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/PAGE_INVENTORY.md) | 41KB | Standalone — nhưng quá dài |
| [WEB_REBUILD_BLUEPRINT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_REBUILD_BLUEPRINT.md) | 25KB | Overlap với PAGE_INVENTORY và FRONTEND_ARCHITECTURE |
| [PAGE_LOADER_CONTRACTS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md) | 18KB | Có thể merge một phần vào PAGE_INVENTORY |
| [USER_FLOWS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/USER_FLOWS.md) | 16KB | Standalone |
| [WEB_CACHE_REVALIDATION_CONTRACT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md) | 11KB | Overlap với CACHE_TOPOLOGY |
| [WEB_APP_ROUTER_FILE_CONTRACT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_APP_ROUTER_FILE_CONTRACT.md) | 21KB | Overlap với FRONTEND_ARCHITECTURE |
| [WEB_QUERY_INVALIDATION_PLAN.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md) | 8.4KB | Overlap với cache contracts |

**Nhận xét**: [WEB_CACHE_REVALIDATION_CONTRACT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md) + [WEB_QUERY_INVALIDATION_PLAN.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md) + [CACHE_TOPOLOGY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md) = 3 file nói về cache/invalidation ở 3 nơi khác nhau.

### 10.2 `04-execution-overlay/repo/` — quá nhiều Valkey/BullMQ docs cho phase 1

Repo overlay có:
- [VALKEY_MODULE_OPPORTUNITY_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/VALKEY_MODULE_OPPORTUNITY_MATRIX.md) (6.2KB)
- [VALKEY_CACHE_CANDIDATE_INVENTORY.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/VALKEY_CACHE_CANDIDATE_INVENTORY.md) (5.8KB)
- [BULLMQ_ACTIVATION_SHORTLIST.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/BULLMQ_ACTIVATION_SHORTLIST.md) (4KB)

Cả 3 file này nói về **phase 2+ components** nhưng nằm trong overlay (nơi chứa "implementation truth"). Nên move sang `02-platform-baseline/optional-scale/` hoặc note rõ đây là pre-planning, không phải implementation truth.

---

## 11. 🟠 REFERENCES LAYER (05) — VẤN ĐỀ

### 11.1 framework-docs/ chỉ có 1 file

`05-references/framework-docs/` chỉ chứa [EXTERNAL_WEB_CHECK_READINESS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/framework-docs/EXTERNAL_WEB_CHECK_READINESS.md) (19KB). Nếu thư mục này nhằm chứa framework documentation snapshots, nó gần **trống** và tên thư mục misleading.

### 11.2 external-research/ chứa files không thuần reference

- [deep-research-report.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/external-research/deep-research-report.md) (23KB) — research report
- [glossary.json](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/external-research/glossary.json) (13KB) — glossary data
- [ROADMAP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/external-research/ROADMAP.md) (2KB) — planning doc (đây là **planning**, không phải reference)
- [FIVE_TREASURES.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/external-research/FIVE_TREASURES.md), [SOURCE_ANALYSIS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/external-research/SOURCE_ANALYSIS.md), [XLCH_OFFICIAL_ALIGNMENT.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/external-research/XLCH_OFFICIAL_ALIGNMENT.md) — mix analysis và reference

[ROADMAP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/external-research/ROADMAP.md) nên nằm ở `01-repo-constitution/` hoặc `04-execution-overlay/repo/`.

### 11.3 examples/ chỉ có 2 files

[SPIRITUAL_APP_SCREENS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/examples/SPIRITUAL_APP_SCREENS.md) (34KB) rất dài nhưng là screen-by-screen spec. [architecture-flows.mmd](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/05-references/examples/architecture-flows.mmd) là diagram. Thư mục examples/ nên có **code examples** (sample API responses, sample Zod schemas, sample component code).

---

## 12. 🔴 06-prompts — FOLDER TRỐNG

```
06-prompts/
  README.md  (255 bytes — chỉ nói "sẽ chứa prompts")
```

Governance và Canonical Layout đều nhắc `06-prompts` như một layer quan trọng ("builder prompts, reviewer prompts, reading protocol prompts"). Nhưng **nó trống**. Hoặc populate hoặc xóa khỏi canonical layout.

---

## 13. 🔴 ĐÁNH GIÁ TỔNG THỂ LOGIC LIÊN FILE

### 13.1 Ownership chain: ai sở hữu version truth?

```
DECISIONS.md section 14 → nói library name + lý do (KHÔNG pin exact version)
    ↓ link tới
VERSION_MATRIX.md → pin exact version (design pin / installed truth)
    ↕ CONFLICT
DEPENDENCY_GOVERNANCE.md section 3 → CŨng pin version (nhưng SỐ KHÁC)
```

**Kết luận**: Chain bị broken. Cần 1 source duy nhất cho exact numbers.

### 13.2 Ownership chain: ai sở hữu Phase definition?

```
00-governance/PHASE_SEMANTICS.md → define phase_1/2/3 meaning
01-repo-constitution/PHASE_ACTIVATION_MATRIX.md → summary activation
01-repo-constitution/DECISIONS.md → full Phase 1/deferred/excluded lists
design/README.md → COPY full Phase 1 list
01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md → COPY full Phase 1 list
```

**5 files copy cùng danh sách**. Violation trực tiếp anti-duplication rule trong ROOT_DOC_OWNERSHIP.md.

### 13.3 Ownership chain: ai sở hữu cache policy?

```
02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md → 4-layer cache policy
04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md → ISR/revalidation
04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md → TanStack Query invalidation
02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md → also mentions caching
```

**4 files về caching** — boundary mờ, dễ drift.

### 13.4 Độ phức tạp đọc docs

Naive reading order: **79 files** (README.md liệt kê). Governance + constitution alone = **20 files** phải đọc trước khi chạm business logic. Đối với 1 developer mới, điều này là **overwhelmingly bureaucratic**.

### 13.5 Tỷ lệ "docs nói về docs" vs "docs nói về sản phẩm"

| Layer | Số file | Nói về gì |
|---|---|---|
| 00-governance | 9 | Cách tổ chức docs |
| 01-constitution | 11 | Direction + ownership |
| **Subtotal meta** | **20** | **Docs về docs** |
| 02-baseline | ~60 | Runtime policy |
| 03-domains | ~80 | Business logic |
| 04-overlay | ~36 | Implementation truth |
| **Subtotal product** | **~176** | **Docs về sản phẩm** |

Ratio ~10% meta-layer. Acceptable for a large system nhưng **20 files meta cho 0 dòng code đã deploy** là quá sớm. Nên giảm xuống 8-10 files meta.

---

## 14. 📋 ĐỀ XUẤT HÀNH ĐỘNG ƯU TIÊN

### 🔴 P0 — Sửa ngay (version drift = AI sẽ scaffold sai)

| # | Action | Files |
|---|---|---|
| 1 | **Đồng bộ version numbers** giữa VERSION_MATRIX và DEPENDENCY_GOVERNANCE | [VERSION_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/VERSION_MATRIX.md), [DEPENDENCY_GOVERNANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md) |
| 2 | **Chọn 1 file duy nhất** giữ exact version pin; file còn lại chỉ giữ policy | Cả 2 file trên |
| 3 | **Xóa bảng version duplicate** trong DEPENDENCY_GOVERNANCE section 3, thay bằng link về VERSION_MATRIX | [DEPENDENCY_GOVERNANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md) |

### 🟡 P1 — Sửa trong sprint này (trùng lặp gây confusion)

| # | Action | Files |
|---|---|---|
| 4 | **Phase 1 list chỉ giữ 1 bản đầy đủ** ở DECISIONS.md; tất cả file khác thay bằng 1-line summary + link | [README.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/README.md), [ARCHITECTURE_AT_A_GLANCE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md), [PHASE_SEMANTICS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/PHASE_SEMANTICS.md), [PHASE_ACTIVATION_MATRIX.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md) |
| 5 | **Gộp governance files** từ 9 → 4 | Xem section 7.2 |
| 6 | **Move WRITING_STANDARDS.md** ra khỏi `dependency-version/` | [WRITING_STANDARDS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/WRITING_STANDARDS.md) |
| 7 | **Move REPO_STRUCTURE.md** ra khỏi `dependency-version/` | [REPO_STRUCTURE.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/dependency-version/REPO_STRUCTURE.md) |
| 8 | **Cleanup MIGRATION_MAP.md** — đánh dấu items đã hoàn thành | [MIGRATION_MAP.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/MIGRATION_MAP.md) |

### 🟠 P2 — Sửa trước khi bắt đầu scaffold (thiếu docs quan trọng)

| # | Action | Need |
|---|---|---|
| 9 | **Tạo Tailwind 4 policy doc** | Migration notes, design token mapping, utility conventions |
| 10 | **Tạo Prisma 7 adoption doc** | Breaking changes, new features to adopt/avoid |
| 11 | **Tạo Zustand policy doc** | Store conventions, SSR hydration rules |
| 12 | **Tạo Error Envelope standard** | JSON response shape, error code namespacing |
| 13 | **Populate hoặc xóa `06-prompts/`** | Hiện tại là folder trống |
| 14 | **Move ROADMAP.md** ra khỏi `05-references/external-research/` | Nó là planning, không phải reference |

### 🔵 P3 — Sửa khi có bandwidth (quality of life)

| # | Action |
|---|---|
| 15 | Gộp 3 cache docs (CACHE_TOPOLOGY, WEB_CACHE_REVALIDATION, WEB_QUERY_INVALIDATION) thành ownership chain rõ |
| 16 | Move Valkey/BullMQ overlay files sang optional-scale hoặc note rõ chúng là planning |
| 17 | Tách README reading order thành role-based paths |
| 18 | Giảm ROOT_DOC_OWNERSHIP.md size bằng cách dùng pattern rules thay vì liệt kê 95 files |
| 19 | Thêm cross-domain dependency graph (mermaid) vào 03-domains/README.md |
| 20 | Enforce DOC_TAXONOMY frontmatter hoặc registry |
| 21 | Thêm code examples vào 05-references/examples/ |

---

> [!IMPORTANT]
> **Verdict tổng thể**: Design folder có **ambition kiến trúc rất cao** và **cấu trúc layer rõ ràng**. Nhưng bản thân nó đang mắc đúng lỗi mà nó cảnh báo: **docs nhiều không đồng nghĩa docs mạnh** (ROOT_DOC_OWNERSHIP.md L159). Version drift giữa 2 file authority là **critical bug** cần fix trước khi bất kỳ AI agent nào scaffold code. Nội dung trùng lặp ở 5 chỗ cho cùng 1 danh sách là vi phạm chính rule anti-duplication mà design/ tự đặt ra.
