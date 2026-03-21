# Coding Readiness Report (Báo cáo Sẵn sàng Code)

File này trả lời: **"Có thể code ngay chưa? Còn thiếu gì? Lỗi nào sẽ xảy ra?"**

> Cập nhật khi có thay đổi lớn về design hoặc khi một phần chuyển sang `implemented`.
> Date: 2026-03-21

---

## Tổng kết nhanh (Executive Summary)

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Backend architecture | ✅ Sẵn sàng | 11 modules có docs core; contact use-cases, Little House content/admin surface, Daily Practice content/admin surface, Life Release content/admin surface, search ops, notification ops, assisted-entry path đã được khóa trong design |
| Platform modules | ✅ Sẵn sàng | 11 modules có spec đầy đủ |
| Security baseline | ✅ Sẵn sàng | Auth, upload, CSRF, rate-limit đã chốt |
| DB schema | ✅ Sẵn sàng | Prisma schema plan có: enums, FK graph, naming, merge process — `tracking/prisma-schema-plan.md` |
| UI/UX design | ✅ Sẵn sàng | `design/ui/` có 7 docs: PAGE_INVENTORY, USER_FLOWS, COMPONENT_SPECS, DESIGN_PRINCIPLES, ADMIN_ARCHITECTURE, ELDERLY_UX, ADMIN_MODULE_SPECS |
| Frontend architecture | ✅ Sẵn sàng | Full library stack, proxy boundary, SEO, PWA, caching; đã bổ sung Next.js 16 cache rules + TanStack Query v5 option discipline — `baseline/frontend-architecture.md` |
| Library choices | ✅ Sẵn sàng | Chốt toàn bộ trong `DECISIONS.md` section 14; đã thêm Prisma safety defaults (`omit`, `strictUndefinedChecks`, `Prisma.skip`) |
| Bug prediction (8/8) | ✅ Đã fix | Tất cả 8 bugs đã có fix trong design docs — xem Phần 3 |
| Feature flags list | ✅ Sẵn sàng | 8 flags cụ thể — xem Phần 4 |
| Rate-limit values | ✅ Sẵn sàng | 13 endpoints với exact limits — xem Phần 5 |
| Migration order | ✅ Sẵn sàng | 12 bước chi tiết — xem Phần 6 |
| Testing strategy | ✅ Sẵn sàng | Vitest + Supertest, coverage targets, CI/CD, test DB — `baseline/testing-strategy.md` |
| Deploy runbook | ✅ Sẵn sàng | Docker Compose, deploy/rollback commands, SSL verify — `ops/deploy-runbook.md` |
| Migration strategy | ✅ Sẵn sàng | Prisma commands, multi-step examples, seed — `baseline/migration-strategy.md` |
| Infra baseline | ✅ Sẵn sàng | Trimmed to ~170 lines, no duplication — `baseline/infra.md` |
| SVG asset workflow | ✅ Sẵn sàng | Deterministic SVG rulebook cho diagrams/icons/mockups trong `design/` — `SVG_PRECISION_WORKFLOW.md` |
| Skill/tool alignment | ✅ Fixed | AGENTS routing đã chốt NestJS rebuild; các skills Payload legacy đã bị deprecate hoặc loại khỏi luồng code mới |
| OpenAPI spec | ✅ Sẵn sàng | Strategy chốt: auto-gen từ NestJS Swagger decorators — xem GAP 5 bên dưới |
| Deferred/excluded advanced tech design | ✅ Sẵn sàng | Các component `planned` / `explicit exclusion` đều có design doc rõ — xem `DECISIONS.md` section 15 |
| Email provider decision | ✅ Sẵn sàng | Brevo SMTP chốt, delivery failure policy, retry, anti-enumeration — `baseline/email-provider-decision.md` |
| Storage lifecycle | ✅ Sẵn sàng | 5 cleanup jobs, asset states, upload quota — `baseline/storage-lifecycle.md` |
| Cache topology | ✅ Sẵn sàng | 4-layer cache, invalidation rules, ISR, TanStack Query staleTime — `baseline/cache-topology.md` |
| Secret management | ✅ Sẵn sàng | Rotation procedures per secret, compromise response, .gitignore — `baseline/secret-management.md` |
| CI/CD gates | ✅ Sẵn sàng | GitHub Actions, 4 automated + 1 human gate, rollback, concurrency + least-privilege permissions + cache guidance — `baseline/cicd-deploy-gates.md` |
| WAF + anti-bot | ✅ Sẵn sàng | Cloudflare WAF rules, honeypot, CSP nonce, security headers — `baseline/waf-antibot-strategy.md` |
| Health contract | ✅ Sẵn sàng | Exact check lists per endpoint, failure runbook — `ops/health-contract.md` |
| Admin module specs | ✅ Sẵn sàng | 24 workspaces với filters/bulk/states/query-invalidation — `design/ui/ADMIN_MODULE_SPECS.md` |
| Env inventory | ✅ Sẵn sàng | 50+ env vars bao gồm Phase 2+ và CI/CD secrets — `tracking/env-inventory.md` |
| pgvector decision | ✅ Sẵn sàng | Explicit exclusion với trigger conditions rõ — `baseline/pgvector-decision.md` |
| Push notification architecture | ✅ Sẵn sàng | VAPID Web Push, worker handler, service worker, admin ops — `08-notification/push-notification-architecture.md` |
| Observability architecture | ✅ Sẵn sàng | Phase 1 health/metrics, Phase 2 Prometheus/Grafana, Phase 3 OTEL — `baseline/observability-architecture.md` |

**VERDICT**: `DESIGN-READY FOR FULL-STACK IMPLEMENTATION PLANNING`
Tất cả hạng mục design trọng yếu đều ✅ ở mức thiết kế. File này **không** có nghĩa runtime đã sẵn sàng hoặc launch đã an toàn.

### Readiness split bắt buộc

| Readiness | Ý nghĩa | Owner file |
|---|---|---|
| `design-ready` | design đủ rõ để bắt đầu implementation planning | file này |
| `implementation-ready` | artifact runtime cụ thể đã được map đủ rõ để bắt đầu code module đó | `tracking/implementation-mapping.md` |
| `launch-ready` | launch blockers thật đã pass, gồm restore drill, runtime evidence, và rollout proof | `README.md` + `tracking/implementation-mapping.md` |

Coding agent có thể bắt đầu Wave 1, nhưng vẫn còn runtime evidence blockers trước launch như restore drill pass, implementation proof, và post-code OpenAPI coverage proof.

---

## Phần 1: Những gì ĐÃ ổn (Không cần sửa trước khi code)

### Backend design — ĐẦY ĐỦ
Mọi domain module (01-11) đều có:
- `module-map.md` — objectives, ownership, boundaries
- `contracts.md` — routes, input/output, error codes
- `schema.dbml` — DB schema per module
- `flows.mmd` — state machines
- `use-cases/` — write-path documentation

### Platform modules — ĐẦY ĐỦ
11 platform modules có spec trong `baseline/platform-modules.md` và `baseline/startup-dependency-order.md`.

### Security — ĐẦY ĐỦ
- Auth model (15min/30day tokens, rotation, Argon2id): `baseline/security.md`
- Upload hardening (MIME, allowlist, delete auth): `baseline/security.md`
- CSRF/CORS/CSP: `baseline/security.md`
- Permission matrix per module: `01-identity/PERMISSION_MATRIX.md`

### Tracking docs — ĐẦY ĐỦ
- Error codes: `tracking/error-code-registry.md`
- Audit events: `tracking/audit-policy.md`
- Module interactions: `tracking/module-interactions.md`
- Outbox taxonomy: `tracking/outbox-event-taxonomy.md`
- API route inventory: `tracking/api-route-inventory.md`
- Env variables: `tracking/env-inventory.md`

### UI/UX design — ĐẦY ĐỦ (7 docs)
- Route inventory đầy đủ: `design/ui/PAGE_INVENTORY.md`
- User flows public/member/admin: `design/ui/USER_FLOWS.md`
- 30+ components: `design/ui/COMPONENT_SPECS.md`
- Design principles: `design/ui/DESIGN_PRINCIPLES.md`
- Admin architecture: `design/ui/ADMIN_ARCHITECTURE.md`
- Elderly UX: `design/ui/ELDERLY_UX.md`
- Admin module specs (24 workspaces): `design/ui/ADMIN_MODULE_SPECS.md`

### Frontend strategies — ĐẦY ĐỦ
- SEO: `generateMetadata()`, JSON-LD, sitemap, robots.txt
- Lỗi đã chốt: Vietnamese-only, không dùng i18n framework (xem `DECISIONS.md` section 12)
- PWA/Offline: Service worker + IndexedDB + delta sync
- Caching: CDN + ISR + TanStack Query + service worker
- Ref: `baseline/frontend-architecture.md`

---

## Phần 2: Gaps còn lại (ít)

### ✅ GAP 1: Prisma schema tổng hợp — FIXED

**Đã tạo**: `tracking/prisma-schema-plan.md` — enums, FK dependency graph, naming conventions, merge process, 12-step migration order.

---

### ✅ GAP 2: Feature flags — FIXED

8 flags cụ thể — xem Phần 4 bên dưới.

---

### ✅ GAP 3: Rate-limit values — FIXED

13 endpoints với exact limits — xem Phần 5 bên dưới.

---

### ✅ GAP 4: Skill conflict — FIXED ở routing layer

**Trạng thái hiện tại**:
- `AGENTS.md` đã chốt `design-first` + `apps/web + apps/api + apps/admin`
- các skill Payload cũ đã được đánh dấu deprecated trong repo routing
- không còn coi chúng là blocker cho design readiness

**Lưu ý**:
- khi code thật, vẫn chỉ dùng skill/routing đã align với NestJS rebuild

---

### ✅ GAP 5: OpenAPI spec — CLOSED IN DESIGN

**Strategy**: auto-gen từ NestJS `@nestjs/swagger` decorators. Không cần viết spec bằng tay.

**Ownership**: `apps/api` — mọi controller và DTO trong `apps/api` chịu trách nhiệm decorator coverage.

**Decorator standard** (bắt buộc cho tất cả public routes):
- `@ApiTags('module-name')` — trên mỗi controller class
- `@ApiOperation({ summary: '...' })` — trên mỗi route handler
- `@ApiResponse({ status: 200, type: ResponseDto })` — success case
- `@ApiResponse({ status: 400/401/403/404 })` — error cases liên quan
- `@ApiProperty()` hoặc `@ApiPropertyOptional()` — trên mọi field trong request/response DTO

**Source of truth cho schema**: Zod schemas trong `packages/shared` → infer TypeScript types → dùng `nestjs-zod` (`createZodDto()`) để tự động extract `@ApiProperty` từ Zod, hoặc annotate thủ công DTO nếu không dùng `nestjs-zod`.

**Generated output**:
- Swagger UI: `GET /api/docs` (disabled in production, enabled in dev + staging)
- Raw JSON spec: `GET /api/docs-json` (có thể export ra `docs/openapi.json` khi build)

**Completion criteria** (what counts as implemented):
- Tất cả routes public trong `api-route-inventory.md` có `@ApiOperation` + `@ApiTags`
- Tất cả request/response DTOs có `@ApiProperty` coverage đầy đủ
- `GET /api/docs` trả 200 OK trong môi trường dev
- Không có route nào hiện là `{}` (empty schema) trong Swagger UI

**Note**: OpenAPI spec là runtime artifact — nó không thể được hoàn chỉnh hoàn toàn trong design phase. Gap này được đóng ở design level bằng cách chốt strategy, ownership, và completion criteria. Coding agent biết chính xác phải làm gì.

---

## Phần 3: Lỗi sẽ xảy ra nếu code ngay (Bug prediction) — ĐÃ FIX TẤT CẢ

### ✅ Bug 1: Module sẽ import lẫn nhau (circular dependency) — FIXED
**Fix đã áp dụng**: Thêm "Cross-module communication" section vào `baseline/nest-baseline.md`.
Chốt: modules communicate qua exported service interface, không import toàn bộ module. Bidirectional → dùng event pattern.
**Ref**: `baseline/nest-baseline.md` mục "Cross-module communication"

---

### ✅ Bug 2: Audit fail không block write-path — FIXED
**Fix đã áp dụng**: Thêm "Audit transaction enforcement" section vào `baseline/nest-baseline.md`.
Chốt: audit mandatory events PHẢI trong cùng `prisma.$transaction()`. AuditService có `appendInTransaction()` cho writes, `appendAsync()` chỉ cho read analytics.
**Ref**: `baseline/nest-baseline.md` mục "Audit transaction enforcement"

---

### ✅ Bug 3: Rate-limit bị bypass trên refresh endpoint — FIXED
**Fix đã áp dụng**: Thêm `refresh token` vào danh sách rate-limit bắt buộc trong `baseline/security.md`.
Chốt: `/api/auth/refresh` phải có 30 req / 15 phút / per-IP.
**Ref**: `baseline/security.md` phần rate-limit

---

### ✅ Bug 4: Search trả data chưa published — FIXED
**Fix đã áp dụng**: Thêm mandatory WHERE clause vào `06-search/unified-index-mapping.md`.
Chốt: `WHERE status = 'published' AND published_at IS NOT NULL AND published_at <= NOW()`. Wisdom-QA thêm `review_status IN ('translated_reviewed', 'source_verified')`. Filter ở repository layer.
**Ref**: `06-search/unified-index-mapping.md` phần "Phase 1 query contract"

---

### ✅ Bug 5: Calendar advisory copy text vào event record — FIXED (đã có từ trước)
**Doc đã có**: `07-calendar/advisory-ownership.md` chốt rõ Calendar chỉ lưu `sourceRefs`, không copy text.
**Ref**: `07-calendar/advisory-ownership.md`

---

### ✅ Bug 6: Upload không có MIME sniffing — chỉ check extension — FIXED
**Fix đã áp dụng**: Thêm `file-type` npm library requirement vào `baseline/security.md` với code examples đúng/sai.
Chốt: dùng `fileTypeFromBuffer(buffer)` so sánh với allowlist, không dùng extension check.
**Ref**: `baseline/security.md` phần upload hardening

---

### ✅ Bug 7: Assisted entry dùng chung schema với member self-create — FIXED (đã có từ trước)
**Doc đã có**: `09-vows-merit/assisted-entry-workflow.md` có `AssistedLifeReleaseSchema` riêng.
**Ref**: `09-vows-merit/assisted-entry-workflow.md`

---

### ✅ Bug 8: Frontend gọi API trực tiếp bypass proxy — FIXED
**Fix đã áp dụng**: Viết lại toàn bộ `baseline/frontend-architecture.md` với proxy boundary enforcement.
Chốt: Browser KHÔNG BAO GIỜ gọi `apps/api` trực tiếp. Server Components → server-side fetch. Client Components → `/api/proxy/*` route handler. `API_INTERNAL_URL` chỉ server-side biết.
**Ref**: `baseline/frontend-architecture.md` mục "Proxy boundary"

---

## Phần 4: Feature Flags plan

Danh sách flags cần tạo trong `feature_flags` table khi launch:

| Flag key | Mô tả | Default | Module |
|---|---|---|---|
| `community.post.enabled` | Cho phép member tạo community post | `false` | Community |
| `community.guestbook.enabled` | Cho phép submit guestbook | `true` | Community |
| `search.meilisearch.enabled` | Dùng Meilisearch thay SQL | `false` | Search |
| `notification.push.enabled` | Cho phép push notifications | `false` | Notification |
| `wisdom.offline.enabled` | Cho phép download offline bundles | `false` | Wisdom-QA |
| `vow.assisted_entry.enabled` | Cho phép admin assisted entry | `false` | Vows-Merit |
| `calendar.reminder.enabled` | Bật tự động nhắc nhở tu tập | `false` | Calendar |
| `outbox.enabled` | Bật outbox event system | `false` | Platform |

**Seed required**: Tất cả flags trên phải được seed khi init DB.
Cộng thêm 1 flag test để verify feature_flags table hoạt động.

---

## Phần 5: Rate-limit values per endpoint

| Endpoint group | Limit | Window | Scope |
|---|---|---|---|
| `POST /api/auth/login` | 10 | 15 phút | per-IP + per-email |
| `POST /api/auth/register` | 5 | 1 giờ | per-IP |
| `POST /api/auth/forgot-password` | 5 | 1 giờ | per-IP + per-email |
| `POST /api/auth/refresh` | 30 | 15 phút | per-IP |
| `POST /api/auth/reset-password` | 5 | 1 giờ | per-token |
| `POST /api/auth/verify-email` | 5 | 15 phút | per-IP |
| `POST /api/media/upload` | 20 | 1 giờ | per-account |
| `POST /api/community/posts` | 10 | 1 giờ | per-account |
| `POST /api/community/comments` | 30 | 1 giờ | per-account |
| `POST /api/community/guestbook` | 5 | 1 giờ | per-IP |
| `GET /api/search` | 100 | 1 phút | per-IP |
| `POST /api/vows` | 10 | 1 giờ | per-account |
| `POST /api/practice-logs` | 50 | 1 giờ | per-account |

---

## Phần 6: Migration order (DB init sequence)

Thứ tự tạo tables, không được đảo:

```
Bước 1 — Platform tables (không foreign key nào phụ thuộc):
  - feature_flags
  - audit_logs
  - rate_limit_records

Bước 2 — Identity (base cho mọi thứ khác):
  - users
  - sessions

Bước 3 — Content (media trước vì nhiều tables reference):
  - media_assets
  - categories
  - tags
  - posts
  - hub_pages
  - beginner_guides
  - downloads
  - chant_items
  - chant_plans
  - sutras → sutra_volumes → sutra_chapters → sutra_glossary

Bước 4 — Community (reference users + posts):
  - post_comments
  - community_posts → community_comments
  - guestbook_entries

Bước 5 — Engagement (reference users + content):
  - sutra_bookmarks
  - sutra_reading_progress
  - chant_preferences
  - practice_logs
  - practice_sheets
  - ngoi_nha_nho_sheets

Bước 6 — Moderation (reference community):
  - moderation_reports

Bước 7 — Search (projection):
  - search_index_metadata (if needed)

Bước 8 — Calendar:
  - events
  - event_agenda_items
  - event_speakers
  - event_ctas
  - event_gallery_media
  - event_files
  - lunar_events → lunar_event_overrides
  - personal_practice_calendar_read_model

Bước 9 — Notification:
  - push_subscriptions
  - push_jobs

Bước 10 — Vows & Merit (reference users + content):
  - vows → vow_progress_entries
  - life_release_journal

Bước 11 — Wisdom QA:
  - authority_profiles
  - wisdom_entries
  - qa_entries
  - audio_talk_entries
  - video_talk_entries
  - offline_bundles → offline_bundle_entries
  - offline_sync_states

Bước 12 — Contact (reference users):
  - contact_info
  - volunteers
```

---

## Phần 7: Skill alignment với NestJS rebuild

### Skills ALIGNED (dùng được):
- `.claude/skills/arch-check` ✅ — check code vs NestJS design
- `.claude/skills/module-scaffold` ✅ — scaffold NestJS modules
- `.claude/skills/use-case-write` ✅ — viết use-case docs
- `.agents/skills/pmtl-fe-implementation` ✅ — Next.js frontend rules
- `.agents/skills/pmtl-fe-craft` ✅ — frontend craftsmanship
- `.agents/skills/pmtl-ui-behavior` ✅ — UI interaction rules
- `.agents/skills/pmtl-ui-style-system` ✅ — design variants
- `.agents/skills/pmtl-vercel-precision` ✅ — UI refinement
- `.agents/skills/pmtl-verify-quality-gate` ✅ — quality checks
- `.agents/skills/pmtl-creative-designer` ✅ — visual identity
- `.agents/skills/shadcn/ui` ✅ — component library
- `seo-content-writer` ✅ — viết nội dung chuẩn SEO tiếng Việt
- `on-page-seo-auditor` ✅ — audit on-page SEO cho từng route
- `technical-seo-checker` ✅ — kiểm tra technical SEO (Core Web Vitals, structured data)
- `meta-tags-optimizer` ✅ — tối ưu meta tags, OG tags, `og:locale: vi_VN`
- `schema-markup-generator` ✅ — tạo Schema.org JSON-LD (Article, FAQPage, HowTo, Book, Event)
- `geo-content-optimizer` ✅ — GEO optimization cho AI citation (ChatGPT, Perplexity, Google AI Overviews)
- `svg-precision` ✅ — deterministic SVG cho icons, diagrams, charts, UI mockups tĩnh, technical drawings trong `design/`

### Skills DEPRECATED / CONFLICT (không dùng cho code mới):
| Skill | Vấn đề | Action |
|---|---|---|
| `pmtl-scaffold-payload-collection` | Creates Payload collections | **Deprecate** |
| `pmtl-production-baseline` | May reference Payload patterns | **Review & Update** |
| `pmtl-runbook-cms-runtime-errors` | References CMS (Payload) runtime | **Deprecate** |

**Action required**: coi các skill deprecated ở trên là historical/no-route entries; không dùng chúng cho chat mới, không giữ chúng trong checklist active của rebuild.

---

## Phần 8: Recommended coding order (Thứ tự code khuyến nghị)

```
Wave 1 — Foundation (Nền tảng)
  1. Monorepo setup (pnpm, turborepo, tsconfig)
  2. apps/api: NestJS bootstrap + platform modules (config, logging, errors, validation)
  3. apps/api: sessions + auth (01-identity)
  4. apps/api: audit_logs + feature_flags + rate_limit_records
  5. apps/api: /health/* + /metrics

Wave 2 — Core Content
  6. apps/api: 02-content (posts, guides, media upload)
  7. apps/web: layout + nav + public pages (homepage, post, guide)
  8. Verify restore drill passes

Wave 3 — Core Practice
  9. apps/api: 04-engagement (practice sheets, Ngôi Nhà Nhỏ)
  10. apps/web: member pages (dashboard, tu-tap, nha-nho)
  11. apps/api: 07-calendar (lunar calendar, advisory)

Wave 4 — Community + Moderation
  12. apps/api: 03-community + 05-moderation
  13. apps/web: community pages, comment section
  14. apps/admin: moderation queue

Wave 5 — Vows + Wisdom
  15. apps/api: 09-vows-merit (vows, life release)
  16. apps/api: 10-wisdom-qa (wisdom entries, search)
  17. apps/web: vow pages, wisdom search

Wave 6 — Notifications + Offline
  18. apps/api: 08-notification (push subscriptions)
  19. apps/web: offline bundles, PWA setup
  20. apps/api: 06-search (phase 1 SQL, phase 2+ Meilisearch)
```

---

## Checklist trước khi code Wave 1

- [ ] Đọc `DECISIONS.md` + `baseline/nest-baseline.md`
- [ ] Đọc `baseline/startup-dependency-order.md`
- [ ] Đọc `01-identity/use-cases/manage-auth-session.md` (launch blocker)
- [ ] Đọc `02-content/use-cases/upload-media-asset.md` (launch blocker)
- [ ] Verify skill routing đang dùng khớp `AGENTS.md` của repo
- [ ] Tạo Prisma schema từ migration order ở trên
- [ ] Seed `feature_flags` table với flags list ở Phần 5
- [ ] Confirm rate-limit store: `rate_limit_records` Postgres table (phase 1)
