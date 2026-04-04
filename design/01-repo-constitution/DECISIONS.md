# DECISIONS (Quyết định kiến trúc hợp nhất)

File này là `canonical decision baseline (nền tảng quyết định chuẩn)` của `design/`.
Nó hợp nhất phần quyết định cốt lõi và phần governance ở mức đủ dùng, để giảm drift giữa nhiều root docs.

Nếu một file khác mô tả khác file này, ưu tiên file này trước, rồi mới tới:

- `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
- `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
- `design/01-repo-constitution/REPO_STRUCTURE.md`
- `design/02-platform-baseline/api-runtime/PLATFORM_MODULES.md`
- `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`

## 1. Current direction (Hướng đi hiện tại)

- Hướng chính là `design-first rebuild`
- runtime target là:
  - `apps/web`
  - `apps/api`
  - `apps/admin`
- backend authority là `NestJS`
- database source of truth là `Postgres`
- auth authority duy nhất là `apps/api`
- external scaffold registries như `Servercn` chỉ được dùng làm `design reference`, không phải runtime source of truth

## 2. Phase 1 baseline (Nền tảng giai đoạn 1)

Phải có:

- `apps/web`
- `apps/api`
- `apps/admin`
- `Postgres`
- `Caddy`
- `storage abstraction + local disk adapter`
- structured logs
- `/health/*`
- `/metrics`
- auth/session hardening
- upload hardening
- `audit_logs`
- `feature_flags`
- app-layer rate limit
- backup + restore discipline
- `Launch Core A`
  - câu pháp cú mỗi ngày trên member dashboard
  - lịch ăn chay/ngày âm phổ thông
  - tủ sách cá nhân
  - reading list
- `Launch Core B`
  - Wisdom-QA hub
  - search lời dạy với source/provenance rõ
  - không AI tư vấn, không model-generated doctrine
- `Launch Core C`
  - offline bundle cho Bạch Thoại
  - tải gói, xem offline, version sync cơ bản

## 3. Deferred until measured pain (Tạm hoãn cho tới khi có nỗi đau đo được)

- `Valkey`
- `BullMQ`
- `apps/worker`
- `outbox_events`
- `Meilisearch` theo mặc định là deferred; **nhưng PMTL hiện chốt `Search-first launch`**, nên được phép bật ngay từ launch với `SQL fallback` và không kéo theo queue stack nặng
- `PgBouncer`
- `Prometheus/Grafana/Alertmanager`
- tracing
- `Servercn` như runtime scaffold source

> **`pgvector` không phải deferred — là `explicit exclusion`.** Xem section 15 và `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md`.

## 4. Canonical ownership rules (Quy tắc sở hữu chuẩn gốc)

- `Postgres` là `source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)` duy nhất
- `apps/api` sở hữu:
  - business write-path
  - auth
  - access control
  - module contracts
  - orchestration
- `Valkey` nếu có chỉ giữ:
  - cache
  - queue
  - rate-limit coordination
- `Meilisearch` nếu có chỉ là `search projection (phản chiếu tìm kiếm)`

## 5. Auth and security posture (Tư thế auth và bảo mật)

- `NestJS auth` là auth authority duy nhất
- browser flow dùng:
  - short-lived access token
  - refresh token rotation
  - secure `HttpOnly` cookie khi phù hợp
- security phải được viết thành policy thật, không chỉ checklist
- upload phải có:
  - type allowlist
  - size limit
  - MIME sniffing
  - delete authorization

## 6. Boundary rules (Quy tắc ranh giới)

- mọi boundary quan trọng phải có schema runtime rõ
- `Zod` là baseline validation
- TypeScript type không thay thế runtime validation
- validation không thay:
  - authz
  - business invariants
  - replay protection
  - query cost guard

## 7. Async and search rules (Quy tắc bất đồng bộ và tìm kiếm)

- phase 1 ưu tiên sync/simple path nếu còn dễ hiểu và đủ an toàn
- chỉ bật `outbox + dispatcher + queue + worker` khi side effect đủ chậm hoặc failure cost đủ cao
- search phase 1 có thể `Postgres-first`
- `Meilisearch` chỉ được bật khi:
  - SQL-first path không còn đủ về latency hoặc scope tìm kiếm, hoặc
  - sản phẩm chọn `Search-first launch` vì public search là core surface từ ngày đầu
- PMTL hiện chốt `Search-first launch` vì search lời dạy là core surface của Wisdom-QA ngay từ ngày đầu
- nếu bật `Meilisearch` sớm:
  - vẫn phải giữ `SQL fallback`
  - vẫn không được coi `Meilisearch` là source of truth
  - không được kéo theo `outbox/BullMQ/apps/worker` một cách ngầm định
- direct sync / manual reindex là launch profile hợp lệ; queue sync chỉ mở khi measured pain thật sự xuất hiện
- nếu async reliability đã bật, business event quan trọng phải đi theo:

```txt
canonical write -> outbox_events -> dispatcher -> execution queue -> worker
```

- taxonomy đầy đủ của event nào đi outbox: xem `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md`
- khi outbox chưa bật (phase 1), event "outbox required" phải dùng inline sync hoặc fire-and-forget có log intent + log outcome + retry/alert/manual-recovery path rõ — không được im lặng bỏ qua

## 8. Repo structure rule (Quy tắc cấu trúc repo)

- `apps/web`: public frontend
- `apps/api`: backend authority
- `apps/admin`: custom admin UI
- `packages/shared`: framework-agnostic only
- `apps/api/src/platform/*` giữ control-plane modules
- `apps/api/src/modules/*` giữ domain modules

## 9. Required before launch (Bắt buộc trước khi ra mắt)

- session persistence thật
- `audit_logs`
- `feature_flags`
- rate limit path rõ
- local storage abstraction
- upload hardening
- `/health/live`, `/health/ready`, `/health/startup`
- `/metrics`
- restore drill pass

## 10. Karma / Immutable Ledger Pattern (Mô hình bất biến cho nghiệp/công đức)

BRD Phase 20 đề cập "Event Sourcing" cho karma tracking. Cần chốt rõ để tránh nhầm lẫn:

- **Cái được phép:** `KarmaEvent` model là append-only — chỉ INSERT, không bao giờ UPDATE hoặc DELETE. Đây là business invariant đơn giản, thực hiện được trong Prisma CRUD bình thường.
- **Cái không làm:** Full CQRS / Event Sourcing architecture (read models, event replay, projections, aggregates, event store infrastructure) **không được áp dụng ở Phase 1**. Kiến trúc CRUD + Prisma vẫn là baseline.
- **Trigger để xem xét lại:** Khi karma ledger có > 10M events AND query cost vượt SLO — lúc đó mới xét đến projection layer.

```
// ĐÚNG — append-only trong Prisma CRUD bình thường:
prisma.karmaEvent.create({ data: { ... } })       // ✅ INSERT only

// SAI — vi phạm karma law:
prisma.karmaEvent.update(...)                       // ❌ Không được
prisma.karmaEvent.delete(...)                       // ❌ Không được
```

> Chú ý: Quy tắc này chỉ áp dụng cho các model thuộc family `KarmaEvent`, `MeritLedger`, `DebtRecord`. Các model nghiệp vụ thông thường vẫn dùng full CRUD.

## 11. External Service Dependencies (Dịch vụ ngoài — GPS, Thời tiết, Thiên văn)

BRD Phase 20 và Phase 23 giới thiệu các external dependencies nghiêm trọng:

| Service | Mô tả | Trạng thái | Phase |
|---|---|---|---|
| GPS / Location Services | Browser Geolocation API cho location-bound vow và spatial environment checks | **Deferred** | Phase 2+ |
| Weather API | Thời tiết cho phóng sinh safety check | **Deferred** | Phase 2+ |
| Celestial Calculation API | Calamity year (Thái Tuế), lunar phase calculations ngoài calendar module | **Deferred** | Phase 2+ |
| DeviceOrientation API | `beta`/`gamma` axes cho posture enforcement | **Phase 1 (no backend)** — FE-only, graceful degrade nếu browser chặn permission |

**Bắt buộc trước khi bật GPS/Location:**
- Privacy policy cập nhật (thu thập vị trí người dùng)
- Fallback rõ ràng khi GPS off / API down / browser chặn permission
- Cost estimate cho API calls
- Không lưu raw GPS coordinates vào DB theo mặc định — chỉ dùng proximity detection ephemeral

> Xem thêm: `design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md` — GPS/Weather/Celestial rows.

## 12. Audience & language (Đối tượng & ngôn ngữ)

- Dự án **chỉ dành cho người Việt Nam** — không có kế hoạch quốc tế hóa
- Không cần i18n framework (next-intl, react-i18next, etc.)
- `lang="vi"` hardcoded trong HTML
- URL slugs tiếng Việt (ví dụ: `/bai-viet/`, `/tu-tap/`, `/kinh-sach/`)
- Meta tags: `og:locale: vi_VN`, hreflang không cần
- SEO tập trung vào Google.com.vn, Cốc Cốc, và GEO (AI citations)
- Social sharing: Zalo + Facebook VN
- Fonts: Noto Serif (headings), Inter (body) — hỗ trợ Vietnamese diacritics đầy đủ

## 13. Resolved ambiguities (Các điểm mơ hồ đã được chốt)

Các quyết định này từng không rõ — đã chốt và ghi vào doc riêng:

| Câu hỏi | Quyết định | Doc |
|---|---|---|
| Rate-limit store phase 1 là gì? | `rate_limit_records` Postgres table — không phải Valkey | `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md` |
| Platform modules khởi động thứ tự nào? | config → logging → errors/validation → sessions → feature-flags/rate-limit/storage → audit → health/metrics | `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md` |
| Event nào đủ quan trọng để đi outbox? | Xem taxonomy đầy đủ per module | `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md` |
| Search unified index field mapping từ đâu? | Content (post/guide/chant/sutra) + Wisdom-QA (wisdom/qa) với shape chuẩn | `design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md` |
| Offline bundle delta sync như thế nào? | BundleVersion integer + offlineBundleEntries table + delta API | `design/03-domains/wisdom-qa/REFERENCES/OFFLINE-BUNDLE-DELTA-SYNC.MD` |
| Assisted entry workflow cụ thể ra sao? | Schema riêng + audit bắt buộc + immutable flag + member rights rõ | `design/03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md` |
| Advisory ownership: Calendar hay Wisdom-QA? | Calendar owns composition + schedule; Wisdom-QA owns text + provenance | `design/03-domains/calendar/REFERENCES/ADVISORY-OWNERSHIP.MD` |
| Moderation summary drift xử lý thế nào? | On-demand recompute API — không phải real-time job | `design/03-domains/moderation/MODULE_MAP.md` |

## 14. Library choices (Chọn thư viện — chốt)

Exact version pins không sống ở file này.
File này chỉ chốt `library family + rationale`; số version exact phải đọc ở [VERSION_MATRIX.md](../02-platform-baseline/dependency-version/VERSION_MATRIX.md).

### Backend (`apps/api`)

| Concern | Library | Lý do |
|---|---|---|
| Framework | NestJS | Module system, DI, guards, pipes |
| ORM | Prisma | Type-safe, migration, schema-first; prefer `omit` for sensitive fields + `strictUndefinedChecks` + `Prisma.skip` discipline |
| Validation | Zod | Runtime validation, shared schemas |
| Logger | Pino (nestjs-pino) | Structured, fast, JSON |
| API docs | Swagger / OpenAPI | Auto-generated từ NestJS |
| Password hash | Argon2id | OWASP recommended |
| MIME detection | file-type (npm) | Magic bytes, không dựa extension |
| UUID | crypto.randomUUID() | Built-in Node.js |

Backend adoption docs:

- Prisma 7 runtime/adoption policy: [PRISMA_7_POLICY.md](../02-platform-baseline/data-runtime/PRISMA_7_POLICY.md)
- API error envelope contract: [ERROR_ENVELOPE_CONTRACT.md](../02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md)
- Auth/session sequence canon: [AUTH_SESSION_FLOW.md](../02-platform-baseline/security-runtime/AUTH_SESSION_FLOW.md)

### Frontend — Web (`apps/web`)

| Concern | Library | Lý do |
|---|---|---|
| Framework | Next.js 16 App Router | SSR, Server Components, SEO |
| UI | shadcn/ui | Composable, accessible, Tailwind-native |
| Styling | Tailwind CSS 4 | Utility-first, design tokens |
| Forms | React Hook Form + Zod | Shared validation schemas |
| Server state | TanStack Query v5 | Cache, dedup, optimistic |
| Client state | Zustand | Minimal, UI-only state |
| Icons | Lucide React | Tree-shakable |
| Toast | Sonner | Accessible stacking |
| Date | date-fns | Lightweight |
| Markdown | react-markdown + rehype-sanitize | Server-side safe |

Frontend policy docs:

- Tailwind CSS 4 policy: [TAILWIND_CSS_4_POLICY.md](../02-platform-baseline/web-runtime/TAILWIND_CSS_4_POLICY.md)
- shadcn/ui inventory and acquisition rules: [SHADCN_UI_INVENTORY.md](../02-platform-baseline/web-runtime/SHADCN_UI_INVENTORY.md)
- Zustand boundaries and hydration rules: [ZUSTAND_POLICY.md](../02-platform-baseline/web-runtime/ZUSTAND_POLICY.md)

**Next.js 16 cache rule**:
- Public deterministic reads ưu tiên `use cache` + `cacheTag`
- `cacheComponents: true` cho `apps/web`
- `after()` chỉ dành cho post-response side effects không-authoritative, tức không thuộc request-response contract và chỉ best-effort

### Frontend — Admin (`apps/admin`)

| Concern | Library | Lý do |
|---|---|---|
| Build | Vite | Fast SPA build |
| Framework | React 19 | SPA, no SSR needed |
| Router | TanStack Router | Type-safe, file-based |
| Tables | TanStack Table | Sort, filter, paginate, column toggle |
| UI | shadcn/ui | Shared design language |
| Charts | Recharts (shadcn/ui charts) | Dashboard widgets |
| Command | cmdk | ⌘K palette |
| State/Forms/Query/Icons/Toast | Same as web | Consistency |

**TanStack Query rule**:
- query key và queryFn phải co-locate qua `queryOptions()` / `infiniteQueryOptions()`
- conditional query ưu tiên `skipToken`
- long-list/search/feed ưu tiên cursor-based `useInfiniteQuery()` khi UX phù hợp

### Shared (`packages/shared`)

- Zod schemas — single source of truth cho validation FE + BE
- TypeScript types inferred từ Zod
- Pure utility functions — framework-agnostic

> **Pattern ref**: Admin architecture based on [shadcn-admin](https://github.com/satnaing/shadcn-admin)
> **Design ref**: `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`, `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`

---

## 15. Deferred / excluded advanced tech — explicit decisions with design-ready status (2026-03-21)

Các component dưới đây là `planned` hoặc `explicit exclusion` nhưng đều đã có design doc rõ.
Coding agent có thể activate phần `planned` ngay khi trigger được đáp ứng, và phải giữ nguyên phần `explicit exclusion` cho tới khi trigger reconsideration được thỏa.

| Component | Status | Trigger | Design doc |
|---|---|---|---|
| Valkey | planned | rate_limit Postgres table shows lock contention | `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md` |
| BullMQ + apps/worker | planned | request > 2s due to background work | `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` |
| outbox + dispatcher | planned | side effect failure cost > complexity cost | `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md` |
| Meilisearch | planned | SQL search p95 vượt SLO public search trong `design/02-platform-baseline/deploy-ops/SLA_SLO.md`, multi-type search scope rõ, hoặc project explicit chọn `Search-first launch` | `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` |
| PgBouncer | planned | db connections > 80% max_connections | `design/02-platform-baseline/optional-scale/PGBOUNCER_STRATEGY.md` |
| Cloudflare R2 | planned | local disk > 70% OR restore drift > 5% | `design/02-platform-baseline/optional-scale/R2_MIGRATION_PLAN.md` |
| Web Push (VAPID) | planned | PWA active + feature flag | `design/02-platform-baseline/optional-scale/PUSH_NOTIFICATION_ARCHITECTURE.md` |
| Prometheus + Grafana | planned | specific metric use case needed | `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` |
| OpenTelemetry | planned | cross-service trace needed | `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` |
| pgvector | **explicit exclusion** | Meilisearch stable 3+ months + semantic use case | `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` |

## 16. Additional design decisions chốt (2026-03-21)

| Decision | Chốt | Doc |
|---|---|---|
| Email provider | Brevo SMTP (generic SMTP-first, no vendor lock-in) | `design/02-platform-baseline/security-runtime/EMAIL_PROVIDER_DECISION.md` |
| Storage lifecycle | 5 cleanup jobs, upload quota per role, asset state machine | `design/02-platform-baseline/data-runtime/STORAGE_LIFECYCLE.md` |
| Cache topology | 4 layers: Cloudflare → ISR → TanStack Query → Valkey | `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md` |
| Secret management | VPS env_file Phase 1; rotation procedures per secret type | `design/02-platform-baseline/security-runtime/SECRET_MANAGEMENT.md` |
| AI debugging discipline | LLM debug output is hypothesis-only until backed by runtime evidence and verification | `design/02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md` |
| Dependency governance | approved version matrix + stable/RC policy + cadence + advisory intake + migration checklists | `design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md` |
| Managed-platform learnings | import secure defaults, operator UX, observability, AI-readable docs patterns; never import browser-to-DB authority or vendor-owned business boundaries | `design/02-platform-baseline/dependency-version/MANAGED_PLATFORM_PATTERNS.md` |
| CI/CD gates | GitHub Actions; 4 automated gates + 1 human gate; no deploy without backup | `design/02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md` |
| WAF + anti-bot | Cloudflare free tier (Bot Fight Mode + OWASP WAF) + app-layer honeypot | `design/02-platform-baseline/edge-delivery/WAF_ANTIBOT_STRATEGY.md` |
| Health contract | 3 endpoints with exact check lists; /health/ready checks DB + migrations + flags | `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md` |
| Admin module completeness | 24 workspaces fully specified with filters/bulk/states/query-invalidation | `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` |
| REVALIDATE_SECRET | Shared secret between api and web for on-demand ISR revalidation | `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md` |
| API_INTERNAL_URL | Server-to-server URL, never exposed to browser — server components only | `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` |

## 16.1 Launch profile chốt thêm (2026-03-26)

| Decision | Chốt | Doc |
|---|---|---|
| Launch shape | `Search-first launch` thay vì `Simple launch` | `design/02-platform-baseline/edge-delivery/HIGH_TRAFFIC_RESILIENCE.md` |
| Search stack | `Meilisearch + SQL fallback` từ launch; không AI tư vấn | `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` |
| Core member value | daily wisdom + lunar vegetarian guidance + bookshelf + reading list | `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` |
| Offline value | Bạch Thoại offline bundles ở mức tải gói + đọc offline + version sync cơ bản | `design/03-domains/wisdom-qa/CONTRACTS.md` |
| Heavy infra stance | stack nặng được cấu hình sẵn theo lane dormant/preconfigured, nhưng không auto-activate trước measured pain | `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md` |

## 17. Anti-goals (Những điều không làm)

- không bật infra nặng chỉ để “trông enterprise”
- không dùng search/cache/queue làm source of truth
- không thêm auth authority thứ hai
- không để business logic bám vào local file path
- không gọi là production-safe nếu chưa restore pass

## 18. Student note (Ghi chú cho sinh viên)

Điều quan trọng nhất không phải “có nhiều service”.
Điều quan trọng nhất là:

- ownership rõ
- write-path rõ
- policy rõ
- restore được

Hệ nhỏ nhưng hiểu rõ vẫn tốt hơn hệ đẹp trên giấy mà không ai vận hành nổi.
