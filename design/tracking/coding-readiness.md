# Coding Readiness Report (Báo cáo Sẵn sàng Code)

File này trả lời: **"Có thể code ngay chưa? Còn thiếu gì? Lỗi nào sẽ xảy ra?"**

> Cập nhật khi có thay đổi lớn về design hoặc khi một phần chuyển sang `implemented`.
> Date: 2026-03-20

---

## Tổng kết nhanh (Executive Summary)

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Backend architecture | ✅ Sẵn sàng | 10 modules đầy đủ contracts, schemas, use-cases |
| Platform modules | ✅ Sẵn sàng | 11 modules có spec đầy đủ |
| Security baseline | ✅ Sẵn sàng | Auth, upload, CSRF, rate-limit đã chốt |
| DB schema | ✅ Sẵn sàng | Prisma schema plan có: enums, FK graph, naming, merge process — `tracking/prisma-schema-plan.md` |
| UI/UX design | ✅ Sẵn sàng | `design/ui/` có 6 docs: PAGE_INVENTORY, USER_FLOWS, COMPONENT_SPECS, DESIGN_PRINCIPLES, ADMIN_ARCHITECTURE, ELDERLY_UX |
| Frontend architecture | ✅ Sẵn sàng | Full library stack, proxy boundary, SEO, i18n, PWA, caching — `baseline/frontend-architecture.md` |
| Library choices | ✅ Sẵn sàng | Chốt toàn bộ trong `DECISIONS.md` section 14 |
| Bug prediction (8/8) | ✅ Đã fix | Tất cả 8 bugs đã có fix trong design docs — xem Phần 3 |
| Feature flags list | ✅ Sẵn sàng | 8 flags cụ thể — xem Phần 4 |
| Rate-limit values | ✅ Sẵn sàng | 13 endpoints với exact limits — xem Phần 5 |
| Migration order | ✅ Sẵn sàng | 11 bước chi tiết — xem Phần 6 |
| Testing strategy | ✅ Sẵn sàng | Vitest + Supertest, coverage targets, CI/CD, test DB — `baseline/testing-strategy.md` |
| Deploy runbook | ✅ Sẵn sàng | Docker Compose, deploy/rollback commands, SSL verify — `ops/deploy-runbook.md` |
| Migration strategy | ✅ Sẵn sàng | Prisma commands, multi-step examples, seed — `baseline/migration-strategy.md` |
| Infra baseline | ✅ Sẵn sàng | Trimmed to ~170 lines, no duplication — `baseline/infra.md` |
| SVG asset workflow | ✅ Sẵn sàng | Deterministic SVG rulebook cho diagrams/icons/mockups trong `design/` — `SVG_PRECISION_WORKFLOW.md` |
| Skill/tool alignment | ⚠️ Conflict | `.agents/skills/` có 4 skills cũ reference Payload CMS — cần deprecate. 6 SEO/GEO skills mới đã ALIGNED |
| OpenAPI spec | ❌ Thiếu | Phase 1 acceptable — auto-gen từ NestJS Swagger decorators |

---

## Phần 1: Những gì ĐÃ ổn (Không cần sửa trước khi code)

### Backend design — ĐẦY ĐỦ
Mọi domain module (01-10) đều có:
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

### UI/UX design — ĐẦY ĐỦ
- 49 pages: `design/ui/PAGE_INVENTORY.md`
- 7 user flows: `design/ui/USER_FLOWS.md`
- 30+ components: `design/ui/COMPONENT_SPECS.md`
- Design principles: `design/ui/DESIGN_PRINCIPLES.md`
- Admin architecture: `design/ui/ADMIN_ARCHITECTURE.md`
- Elderly UX: `design/ui/ELDERLY_UX.md`

### Frontend strategies — ĐẦY ĐỦ
- SEO: `generateMetadata()`, JSON-LD, sitemap, robots.txt
- i18n: Phase 1 Vietnamese-only, Phase 2+ `next-intl`
- PWA/Offline: Service worker + IndexedDB + delta sync
- Caching: CDN + ISR + TanStack Query + service worker
- Ref: `baseline/frontend-architecture.md`

---

## Phần 2: Gaps còn lại (ít)

### ✅ GAP 1: Prisma schema tổng hợp — FIXED

**Đã tạo**: `tracking/prisma-schema-plan.md` — enums, FK dependency graph, naming conventions, merge process, 11-step migration order.

---

### ✅ GAP 2: Feature flags — FIXED

8 flags cụ thể — xem Phần 4 bên dưới.

---

### ✅ GAP 3: Rate-limit values — FIXED

13 endpoints với exact limits — xem Phần 5 bên dưới.

---

### ⚠️ GAP 4: Skill conflict — CÒN (cần deprecate khi bắt đầu code)

**Vấn đề**: `.agents/skills/` có skills cũ reference Payload CMS:
- `pmtl-vn-architecture` — Payload CMS, không phải NestJS
- `pmtl-scaffold-payload-collection` — Payload collections
- `pmtl-production-baseline` — có thể reference Payload

**Action**: Update hoặc deprecate khi bắt đầu Wave 1. Xem "Skill Alignment" bên dưới.

---

### ❌ GAP 5: OpenAPI spec — ACCEPTABLE

Phase 1: auto-gen từ NestJS Swagger decorators. Không cần design doc riêng.

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

### Skills DEPRECATED / CONFLICT (không dùng):
| Skill | Vấn đề | Action |
|---|---|---|
| `pmtl-vn-architecture` | Describes **Payload CMS** architecture, not NestJS | **Deprecate / Update** |
| `pmtl-scaffold-payload-collection` | Creates Payload collections | **Deprecate** |
| `pmtl-production-baseline` | May reference Payload patterns | **Review & Update** |
| `pmtl-runbook-cms-runtime-errors` | References CMS (Payload) runtime | **Deprecate** |

**Action required**: Update `.agents/skills/pmtl-vn-architecture/SKILL.md` để reflect NestJS design, hoặc add deprecation notice rõ ràng.

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
- [ ] Verify `.agents/skills/pmtl-vn-architecture` đã được update hoặc deprecated
- [ ] Tạo Prisma schema từ migration order ở trên
- [ ] Seed `feature_flags` table với flags list ở Phần 5
- [ ] Confirm rate-limit store: `rate_limit_records` Postgres table (phase 1)
