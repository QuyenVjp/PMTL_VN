# Báo Cáo Audit Design/ — PMTL_VN
> Người review: Senior Fullstack 10 năm | Ngày: 2026-03-21 | Scope: `design/` folder toàn bộ

> **Verification note (2026-03-21):** Phần version/web-check trong báo cáo này **không phải source of truth**. Một số claim đã được kiểm chứng là stale hoặc sai thực tế; ưu tiên `design/DECISIONS.md`, `design/README.md`, và các doc owner hiện hành.

---

## TL;DR

Design tổng thể **rất tốt** — ownership rõ, phase-gating nghiêm túc, không over-engineer. Tuy nhiên báo cáo này chỉ còn giá trị như **review checklist/hypothesis list**. Nhiều claim version/web-check ban đầu đã được xác minh là stale hoặc sai; phần actionable phải đối chiếu với root docs hiện hành sau khi fix.

---

## PHẦN 1 — VERSION CHECK & CẦN NÂNG

> **Status sau verify/fix:** Bảng bên dưới là nội dung audit gốc, **không còn authoritative**. Một số dòng đã được sửa ở root docs hoặc bị bác bỏ vì sai thực tế. Không dùng bảng này làm source of truth cho version decisions.

### 1.1 Các version cũ được pin cứng trong design docs

| Thành phần | Version design | Version mới nhất 2026 | Severity | File cần sửa |
|---|---|---|---|---|
| **Node.js** | `20.18.0` (LTS Iron) | `22.x LTS` (Jod, active LTS từ 10/2024) | 🔴 High | [baseline/cicd-deploy-gates.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md) line 44 |
| **Next.js** | `16 App Router` ❌ CHƯA TỒN TẠI | `15 App Router` (current stable) | 🔴 Critical | [baseline/frontend-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md) + [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md) |
| **FID metric** | FID (deprecated 3/2024) | INP — Interaction to Next Paint | 🔴 High | [baseline/frontend-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md) line 465 |
| **Meilisearch** | `v1.9` | `v1.12` (stable) | 🟡 Medium | [06-search/meilisearch-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/meilisearch-architecture.md) line 470 |
| **PostgreSQL** | `16` | `17` (stable, released 9/2024) | 🟡 Medium | [baseline/cicd-deploy-gates.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md) line 55, [testing-strategy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/testing-strategy.md) line 108 |
| **pnpm/action-setup** | `@v3` | `@v4` (breaking: bỏ `run_install`) | 🟡 Medium | [baseline/cicd-deploy-gates.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md) line 42 |
| **PgBouncer** | `1.23` | `1.24` (stable) | 🟢 Low | [baseline/pgbouncer-strategy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/pgbouncer-strategy.md) line 138 |
| **Prisma** | Không pin version | Nên ghi `Prisma 6.x` — có breaking changes | 🟡 Medium | [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md) section 14 |

### 1.2 Version được nhắc tên nhưng KHÔNG pin (không cần lo)

| Thành phần | Version trong design | Status |
|---|---|---|
| **Tailwind CSS** | `4` | ✅ OK — v4 stable 2025 |
| **TanStack Query** | `v5` | ✅ OK — current stable |
| **React** | `19` | ✅ OK — current stable |
| **shadcn/ui** | Không pin | ✅ OK — copy-paste, không phải package |
| **actions/checkout** | `@v4` | ✅ OK |
| **actions/setup-node** | `@v4` | ✅ OK |
| **Vitest** | Không pin | ✅ OK |

---

### 1.3 Các thay đổi cần apply vào design docs

#### 🔴 Fix ngay — sai thực tế:

**1. Next.js 16 → Next.js 15** ([baseline/frontend-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md) + [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md))

```diff
- Framework | **Next.js 16 App Router** | Server Components, SEO, streaming
+ Framework | **Next.js 15 App Router** | Server Components, SEO, streaming
```

Next.js 16 chưa release. Design forward-dated sai. Cần clarify là `15.x`.

---

**2. FID → INP** ([baseline/frontend-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md) — Performance budget table line 465)

```diff
- | FID (First Input Delay)           | < 100ms |
+ | INP (Interaction to Next Paint)   | < 200ms |
```

Google loại FID khỏi Core Web Vitals từ 3/2024. Trong cùng file này, line 362 đã đúng INP — nhưng bảng performance budget cuối file vẫn FID. Mâu thuẫn nội bộ.

---

**3. Node.js 22 LTS** ([baseline/cicd-deploy-gates.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md) line 44)

```diff
-     with: { node-version: '20.18.0' }
+     with: { node-version: '22.x' }
```

Node.js 20 hết LTS maintenance 04/2026. Nên chuyển sang 22 trước launch.

---

**4. pnpm/action-setup v4** ([baseline/cicd-deploy-gates.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md) line 42)

```diff
-   - uses: pnpm/action-setup@v3
+   - uses: pnpm/action-setup@v4
```

v4 bỏ `run_install` option, dùng `pnpm install` riêng.

---

#### 🟡 Nên fix trước coding Wave 1:

**5. PostgreSQL 17** (3 files: [cicd-deploy-gates.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md), [testing-strategy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/testing-strategy.md), [ops/deploy-runbook.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/ops/deploy-runbook.md))

```diff
-     image: postgres:16
+     image: postgres:17
```

Postgres 17 stable 9/2024, cải thiện JSON, parallel query, vacuum.

---

**6. Meilisearch v1.12** ([06-search/meilisearch-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/meilisearch-architecture.md) line 470)

```diff
-     image: getmeili/meilisearch:v1.9
+     image: getmeili/meilisearch:v1.12
```

v1.12 có cải thiện Vietnamese tokenizer, typo tolerance, API response shape nhỏ.

---

**7. PgBouncer 1.24** ([baseline/pgbouncer-strategy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/pgbouncer-strategy.md) line 138)

```diff
-     image: pgbouncer/pgbouncer:1.23
+     image: pgbouncer/pgbouncer:1.24
```

---

**8. Prisma 6 + breaking changes note** ([DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md) section 14)

```diff
- | ORM | Prisma | Type-safe, migration, schema-first |
+ | ORM | Prisma 6 | Type-safe, migration, schema-first. Note: v6 changes datasource config syntax; enable `strictUndefinedChecks` |
```

Prisma 6 có `omit` field modifier, `strictUndefinedChecks`, thay đổi `preview features` default.

---

## PHẦN 2 — CHƯA TẬN DỤNG HẾT CÔNG DỤNG THƯ VIỆN/INFRA

### 2.1 Next.js 15 — Còn bỏ sót

| Feature | Trạng thái trong design | Đề xuất |
|---|---|---|
| **Server Actions pattern** | Mention mơ hồ "hoặc proxy" | Cần chốt: Server Actions dùng cho Server Component mutations (không cần proxy), proxy route handler chỉ cho Client Component → ảnh hưởng architecture |
| **`unstable_after()` API** | Không đề cập | Chạy code after response gửi (view count, analytics) mà không block user — relevant với `practice_log` read-heavy analytics |
| **Partial Prerendering (PPR)** | Không đề cập | Trộn static + dynamic trong 1 page. Relevant cho homepage: phần tĩnh render nhanh, sponsored block dynamic |
| **`use cache` directive + `cacheTag()`** | Không đề cập | Next.js 15 Dynamic IO: thay thế `revalidate: 300` config bằng granular cache tags. [baseline/cache-topology.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cache-topology.md) Layer 2 cần update |

### 2.2 Prisma 6 — Chưa exploit

| Feature | Trạng thái | Đề xuất |
|---|---|---|
| **`omit` field modifier** | Không đề cập | Hide `passwordHash` tại query level thay vì loại bỏ trong mapper. Giảm risk leak |
| **`strictUndefinedChecks`** | Không đề cập | Catch `undefined` vs `null` bug lúc compile time — đây là bug source phổ biến |
| **Prisma Accelerate** | Không đề cập | Phase 2 option thay PgBouncer: edge-compatible connection pooling, có sẵn trong Prisma platform |

### 2.3 TanStack Query v5 — Còn pattern cũ

| Feature | Trạng thái | Đề xuất |
|---|---|---|
| **`useSuspenseQuery`** | Không đề cập | Kết hợp React Suspense + streaming — thay `isLoading` boilerplate |
| **`skipToken`** | Không đề cập | Thay `enabled: !!userId` pattern — cleaner conditional fetch |
| **`useInfiniteQuery` với cursor** | Không đề cập | Relevant cho community posts list, search results — design đang assume pagination nhưng không nói pattern |

### 2.4 Cloudflare Free Tier — Đang bỏ sót

| Feature | Trạng thái | Đề xuất |
|---|---|---|
| **Cloudflare Web Analytics** | Không đề cập | Free, không cần tracking script, GDPR-safe. Có thể thay GA hoàn toàn |
| **R2 + Workers image transform** | R2 Phase 2 có design, nhưng không mention Workers | Cloudflare Workers Image Resizing: serve R2 assets với resize on-the-fly, không cần `@vercel/og` hay sharp |

### 2.5 Pino — Cần thêm config security

| Feature | Trạng thái | Đề xuất (add vào [observability-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/observability-architecture.md)) |
|---|---|---|
| **`redact` config** | Không đề cập | `redact: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token']` — bắt buộc cho production |
| **Custom serializers** | Không đề cập | Tránh log raw `req`, `res` object có thể chứa sensitive data |

### 2.6 GitHub Actions — CI chưa tối ưu

| Feature | Trạng thái | Đề xuất (add vào [cicd-deploy-gates.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md)) |
|---|---|---|
| **pnpm store caching** | Không đề cập | `actions/cache` với `~/.local/share/pnpm/store` — giảm CI time 60-80% |
| **Concurrency groups** | Không đề cập | Cancel running workflow khi push mới — tránh queue backup |

### 2.7 Valkey — Missing pattern

| Feature | Trạng thái | Đề xuất |
|---|---|---|
| **Keyspace notifications** | Không đề cập | Subscribe to expired keys → auto-trigger cleanup cho `rate_limit_records` TTL cleanup thay vì cron |

---

## PHẦN 3 — LOGIC TRÙNG / LẶP / CẦN CONSOLIDATE

### 3.1 🔴 Rate-limit values — 3 nơi định nghĩa, không rõ canonical

| File | Nội dung |
|---|---|
| [baseline/security.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/security.md) | Danh sách endpoints + một số limit (e.g. refresh: 30 req/15min) |
| [tracking/coding-readiness.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/coding-readiness.md) | "Exact values từng endpoint" (Phần 5) |
| [baseline/waf-antibot-strategy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/waf-antibot-strategy.md) | Cloudflare edge rules (20 req/min cho auth) |

**Vấn đề:** Cloudflare edge = 20 req/min, app layer = 30 req/15min — hai con số khác nhau. Developer sẽ không biết nên implement số nào ở Nest guard.

**Đề xuất:** [tracking/coding-readiness.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/coding-readiness.md) Phần 5 là canonical cho **app-layer** limits. [security.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/security.md) và [waf-antibot-strategy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/waf-antibot-strategy.md) nên reference sang đó thay vì redeclare.

---

### 3.2 🟡 Health check contract — 2 files, không rõ file nào canonical

| File | Nội dung |
|---|---|
| [baseline/observability-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/observability-architecture.md) | Full contract: `/health/live`, `/ready`, `/startup` với JSON shape |
| [ops/health-contract.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/ops/health-contract.md) | "Exact check lists" (per README) |

**Đề xuất:** Declare [ops/health-contract.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/ops/health-contract.md) là canonical. [observability-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/observability-architecture.md) chỉ summary + link.

---

### 3.3 🔴 FID vs INP — Mâu thuẫn nội bộ trong cùng 1 file

Trong [baseline/frontend-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md):
- **Line 362**: Core Web Vitals targets: LCP < 2.5s, **CLS < 0.1, INP < 200ms** ✅
- **Line 465** (Performance budget table): **FID < 100ms** ❌ (deprecated)

Cùng 1 file, 2 section nói 2 metric khác nhau. Rất confusing.

---

### 3.4 🟡 Library list — Duplicate giữa 2 files

| File | Nội dung |
|---|---|
| [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md) section 14 | Full library table cho BE, FE web, FE admin, shared |
| [baseline/frontend-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md) | Stack table cũng đầy đủ tương đương |

Nếu thay 1 thư viện → phải update 2 chỗ. **Đề xuất:** [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md) là canonical, [frontend-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md) chỉ reference.

---

### 3.5 🟡 Cache invalidation — 3 layer, không có single invalidation chain

| File | Nội dung |
|---|---|
| [baseline/cache-topology.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cache-topology.md) | ISR tags list |
| [tracking/outbox-event-taxonomy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/outbox-event-taxonomy.md) | Events trigger revalidation |
| [baseline/valkey-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/valkey-architecture.md) | Valkey key invalidation khi outbox event |

Không có single diagram/table: khi `content.post.published` fire → phải xóa cache nào, theo thứ tự nào (Valkey → ISR → Cloudflare purge).

**Đề xuất:** Thêm "Invalidation chain per event" table vào [baseline/cache-topology.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cache-topology.md).

---

### 3.6 🟡 `publicId` convention — 3 nguồn khác nhau

| File | Nội dung |
|---|---|
| [tracking/prisma-schema-plan.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/prisma-schema-plan.md) | "VarChar(36) cho UUID format" |
| Module [.dbml](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/schema.dbml) files | Mix: `varchar`, `varchar(32)`, `varchar(36)` |
| [baseline/nest-baseline.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/nest-baseline.md) | `crypto.randomUUID()` nhưng không nói schema type |

Khi scaffold, developer sẽ phải đọc 3 file để biết convention. Cần single Prisma snippet canonical:

```prisma
publicId  String  @unique @default(uuid()) @db.VarChar(36)
```

**Đề xuất:** Add snippet này vào [tracking/prisma-schema-plan.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/prisma-schema-plan.md) phần "Common patterns" (đã có section, chỉ thiếu snippet rõ).

---

### 3.7 🟡 Auth module vs Identity module — Ranh giới mờ

[baseline/repo-structure.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/repo-structure.md) define:
- `apps/api/src/common/auth/` — guards, decorators, JWT strategy
- `apps/api/src/modules/identity/` — identity domain (register, login, session)

Không có line rõ ràng: `JwtAuthGuard` sống ở `common/auth/` hay `modules/identity/auth.guard.ts`? Khi scaffold, AI agent sẽ đặt nhầm.

**Đề xuất:** Thêm 2 dòng vào [baseline/repo-structure.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/repo-structure.md):
- `common/auth/`: Guards, decorators, JWT strategy — cross-module usage
- `modules/identity/`: Auth business logic (login, register, session, refresh) — identity domain owner

---

### 3.8 🟡 Email service — Platform hay notification domain?

| File | Nội dung |
|---|---|
| [baseline/email-provider-decision.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/email-provider-decision.md) | `Owner: apps/api/src/platform/notification/email.service.ts` |
| [tracking/env-inventory.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/env-inventory.md) | `Owner: notification` (ambiguous — platform hay domain?) |
| `08-notification/` | Notification domain module |

Email là **platform concern** (auth flows dùng email) nhưng file location nói `platform/notification/`. Nếu `08-notification/` cũng có service, sẽ confusing. Cần note rõ trong design.

---

### 3.9 🟢 Outbox event type strings — Defined inline nhiều chỗ

[bullmq-worker-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/bullmq-worker-architecture.md), [meilisearch-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/meilisearch-architecture.md), [cache-topology.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cache-topology.md) đều dùng hardcode string như `'content.post.published'`. Design nên note: đây là taxonomy từ [tracking/outbox-event-taxonomy.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/outbox-event-taxonomy.md), không được tự define inline → tránh typo drift.

---

### 3.10 🟢 Platform module startup — Mention ở 2 chỗ

| File | Nội dung |
|---|---|
| [baseline/startup-dependency-order.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/startup-dependency-order.md) | Canonical startup order với fail behaviors |
| [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md) section 13 | Cũng mention "Platform modules initialized" |

Không conflict nhưng người đọc [DECISIONS.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md) có thể nghĩ đó là đủ. Cần note link rõ trong DECISIONS.md.

---

### 3.11 🟡 "published content" filter — 2 service implementations, dễ drift

[meilisearch-architecture.md](file:///c:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/meilisearch-architecture.md) define cả SQL fallback và Meilisearch path. Cả hai apply `status = 'published' AND publishedAt <= NOW()`. Trong code thật sẽ là 2 nơi với cùng logic.

**Đề xuất:** Design nên note: cần shared `isPublished()` Prisma where-clause builder hoặc trong `packages/shared` để 2 service dùng chung, tránh 1 chỗ miss check mà content draft bị leak search.

---

## PHẦN 4 — PRIORITY ACTION LIST

### 🔴 Fix ngay trong design (sai thực tế):

| # | Action | File |
|---|---|---|
| 1 | Next.js `16` → `15` | `frontend-architecture.md`, `DECISIONS.md` |
| 2 | FID → INP trong performance budget table | `frontend-architecture.md` line 465 |
| 3 | Node.js `20.18.0` → `22.x` trong CI | `cicd-deploy-gates.md` line 44 |
| 4 | `pnpm/action-setup@v3` → `@v4` | `cicd-deploy-gates.md` line 42 |

### 🟡 Fix trước khi bắt đầu code Wave 1:

| # | Action | File |
|---|---|---|
| 5 | PostgreSQL `16` → `17` | 3 files |
| 6 | Meilisearch `v1.9` → `v1.12` | `meilisearch-architecture.md` |
| 7 | PgBouncer `1.23` → `1.24` | `pgbouncer-strategy.md` |
| 8 | Prisma 6 note + `strictUndefinedChecks` + `omit` | `DECISIONS.md` |
| 9 | Rate-limit canonical: chốt 1 bảng master | `coding-readiness.md` |
| 10 | Cache invalidation chain per event | `cache-topology.md` |
| 11 | publicId canonical Prisma snippet | `prisma-schema-plan.md` |
| 12 | Auth boundary: `common/auth/` vs `modules/identity/` | `repo-structure.md` |
| 13 | `use cache` + PPR + Server Actions clarify | `frontend-architecture.md`, `cache-topology.md` |

### 🟢 Nice-to-have (không block coding):

| # | Action | File |
|---|---|---|
| 14 | pnpm store caching trong CI | `cicd-deploy-gates.md` |
| 15 | `pino.redact` config | `observability-architecture.md` |
| 16 | Health contract canonical ownership | `ops/health-contract.md` vs `observability-architecture.md` |
| 17 | Cloudflare Analytics mention | `baseline/infra.md` External Services |
| 18 | `useSuspenseQuery` + `useInfiniteQuery` note | `frontend-architecture.md` |
| 19 | Library table canonical: DECISIONS.md only | `frontend-architecture.md` |

---

## PHẦN 5 — THIẾT KẾ TỐT (ĐỪNG PHÁ)

- ✅ **Phase-gating đo được**: Mọi deferred component có trigger condition cụ thể (p95 > X ms, connection > Y%) — không deploy vì cảm giác cần
- ✅ **Postgres là single source of truth**: Cache/search chỉ là projection, không làm canonical
- ✅ **Proxy boundary bắt buộc**: Browser không bao giờ gọi `apps/api` trực tiếp — security đúng
- ✅ **Audit in transaction**: Cùng `$transaction` với write — cực phổ biến bị miss ở các project khác
- ✅ **Zod shared schemas**: `packages/shared` — FE + BE cùng source, không drift
- ✅ **Rollback path cho mọi component**: Mọi Phase 2+ feature có rollback rõ ràng
- ✅ **Anti-enumeration từ đầu**: Email leak là vuln thường bị miss giai đoạn design
- ✅ **MIME sniffing bằng magic bytes**: `file-type` thay extension check — đúng, nhiều team làm sai
- ✅ **pgvector explicit exclusion** (không phải deferred): Trưởng thành về architecture decision — tránh bị feature creep
- ✅ **No i18n**: Project scope rõ, không over-engineer cho audience không tồn tại
- ✅ **Idempotency bắt buộc cho mọi queue handler**: Thiếu idempotency là bug phổ biến nhất của distributed systems
- ✅ **Dead-letter queue + admin redrive**: Không bỏ failed job im lặng
