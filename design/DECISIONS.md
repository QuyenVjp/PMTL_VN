# DECISIONS (Quyết định kiến trúc hợp nhất)

File này là `canonical decision baseline (nền tảng quyết định chuẩn)` của `design/`.
Nó hợp nhất phần quyết định cốt lõi và phần governance ở mức đủ dùng, để giảm drift giữa nhiều root docs.

Nếu một file khác mô tả khác file này, ưu tiên file này trước, rồi mới tới:

- `baseline/security.md`
- `baseline/nest-baseline.md`
- `baseline/repo-structure.md`
- `baseline/platform-modules.md`
- `tracking/implementation-mapping.md`

## 1. Current direction (Hướng đi hiện tại)

- Hướng chính là `design-first rebuild`
- runtime target là:
  - `apps/web`
  - `apps/api`
  - `apps/admin`
- backend authority là `NestJS`
- database source of truth là `Postgres`
- auth authority duy nhất là `apps/api`

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

## 3. Deferred until measured pain (Tạm hoãn cho tới khi có nỗi đau đo được)

- `Valkey`
- `BullMQ`
- `apps/worker`
- `outbox_events`
- `Meilisearch`
- `PgBouncer`
- `Prometheus/Grafana/Alertmanager`
- tracing
- `pgvector`

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
- chỉ bật `Meilisearch` khi search đã đủ core
- nếu async reliability đã bật, business event quan trọng phải đi theo:

```txt
canonical write -> outbox_events -> dispatcher -> execution queue -> worker
```

- taxonomy đầy đủ của event nào đi outbox: xem `tracking/outbox-event-taxonomy.md`
- khi outbox chưa bật (phase 1), event "outbox required" phải dùng inline sync hoặc fire-and-forget có log — không được im lặng bỏ qua

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
| Rate-limit store phase 1 là gì? | `rate_limit_records` Postgres table — không phải Valkey | `baseline/startup-dependency-order.md` |
| Platform modules khởi động thứ tự nào? | config → logging → errors/validation → sessions → feature-flags/rate-limit/storage → audit → health/metrics | `baseline/startup-dependency-order.md` |
| Event nào đủ quan trọng để đi outbox? | Xem taxonomy đầy đủ per module | `tracking/outbox-event-taxonomy.md` |
| Search unified index field mapping từ đâu? | Content (post/guide/chant/sutra) + Wisdom-QA (wisdom/qa) với shape chuẩn | `06-search/unified-index-mapping.md` |
| Offline bundle delta sync như thế nào? | BundleVersion integer + offlineBundleEntries table + delta API | `10-wisdom-qa/offline-bundle-delta-sync.md` |
| Assisted entry workflow cụ thể ra sao? | Schema riêng + audit bắt buộc + immutable flag + member rights rõ | `09-vows-merit/assisted-entry-workflow.md` |
| Advisory ownership: Calendar hay Wisdom-QA? | Calendar owns composition + schedule; Wisdom-QA owns text + provenance | `07-calendar/advisory-ownership.md` |
| Moderation summary drift xử lý thế nào? | On-demand recompute API — không phải real-time job | `05-moderation/module-map.md` |

## 14. Library choices (Chọn thư viện — chốt)

### Backend (`apps/api`)

| Concern | Library | Lý do |
|---|---|---|
| Framework | NestJS | Module system, DI, guards, pipes |
| ORM | Prisma | Type-safe, migration, schema-first |
| Validation | Zod | Runtime validation, shared schemas |
| Logger | Pino (nestjs-pino) | Structured, fast, JSON |
| API docs | Swagger / OpenAPI | Auto-generated từ NestJS |
| Password hash | Argon2id | OWASP recommended |
| MIME detection | file-type (npm) | Magic bytes, không dựa extension |
| UUID | crypto.randomUUID() | Built-in Node.js |

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

### Shared (`packages/shared`)

- Zod schemas — single source of truth cho validation FE + BE
- TypeScript types inferred từ Zod
- Pure utility functions — framework-agnostic

> **Pattern ref**: Admin architecture based on [shadcn-admin](https://github.com/satnaing/shadcn-admin)
> **Design ref**: `design/ui/DESIGN_PRINCIPLES.md`, `design/ui/ADMIN_ARCHITECTURE.md`

---

## 10. Anti-goals (Những điều không làm)

- không bật infra nặng chỉ để “trông enterprise”
- không dùng search/cache/queue làm source of truth
- không thêm auth authority thứ hai
- không để business logic bám vào local file path
- không gọi là production-safe nếu chưa restore pass

## 11. Student note (Ghi chú cho sinh viên)

Điều quan trọng nhất không phải “có nhiều service”.
Điều quan trọng nhất là:

- ownership rõ
- write-path rõ
- policy rõ
- restore được

Hệ nhỏ nhưng hiểu rõ vẫn tốt hơn hệ đẹp trên giấy mà không ai vận hành nổi.
