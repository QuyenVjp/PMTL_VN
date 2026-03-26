# Coding Readiness Report (Báo cáo Sẵn sàng Code)

File này trả lời: **"Có thể code ngay chưa? Còn thiếu gì? Lỗi nào sẽ xảy ra?"**

> Cập nhật khi có thay đổi lớn về design hoặc khi một phần chuyển sang `implemented`.
> Date: 2026-03-22

---

## Tổng kết nhanh (Executive Summary)

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Backend architecture | ✅ Design-ready | 11 modules có docs core; controller/provider/module discipline của Nest đã khóa trong `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`, feature-status đọc ở `design/02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md`, exact version/runtime pins đọc ở `design/02-platform-baseline/dependency-version/VERSION_MATRIX.md`, còn `design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md` chỉ giữ Nest 11 scaffold nuance; readiness này chỉ nói design đủ để lập kế hoạch scaffold, không có nghĩa apps/api đã implementation-ready rộng |
| Platform modules | ✅ Design-ready | 11 modules có spec đầy đủ; Phase 1 vẫn chỉ được scaffold theo thứ tự Step 0-4 trong [APPS_API_SCAFFOLD_ORDER.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md) |
| Security baseline | ✅ Design-locked | Auth, upload, CSRF, rate-limit đã chốt ở mức design; launch blockers runtime vẫn còn trong `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` |
| DB schema | ✅ Sẵn sàng | Prisma schema plan có: enums, FK graph, naming, merge process — `design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md` |
| UI/UX design | ✅ Sẵn sàng | `design/02-platform-baseline/web-runtime/` và `design/04-execution-overlay/web/` đã có owner docs cho IA/navigation, landing, homepage, app screens, tokens, and route contracts; xem `ROOT_DOC_OWNERSHIP.md` |
| Frontend architecture | ✅ Sẵn sàng | Full library stack, proxy boundary, SEO, PWA, caching; đã bổ sung Next.js 16 cache rules + TanStack Query v5 option discipline — `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` |
| Library choices | ✅ Sẵn sàng | Chốt toàn bộ trong `DECISIONS.md` section 14; đã thêm Prisma safety defaults (`omit`, `strictUndefinedChecks`, `Prisma.skip`) |
| Zod 4 policy | ✅ Design-locked | source-of-truth chain, schema placement, error policy, metadata/JSON Schema/codecs stance — `design/02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md` |
| Bug prediction (8/8) | ✅ Đã fix | Tất cả 8 bugs đã có fix trong design docs — xem Phần 3 |
| Feature flags list | ✅ Sẵn sàng | 8 flags cụ thể — xem Phần 4 |
| Rate-limit values | ✅ Design-locked | 13 endpoints với exact limits — xem Phần 5; wiring chỉ được cắm khi route tương ứng tới đúng scaffold step |
| Webhook replay protection | ✅ Sẵn sàng | signature verify + dedup persistence đã chốt ở `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` + `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` |
| Migration order | ✅ Sẵn sàng | 12 bước chi tiết — xem Phần 6 |
| Testing strategy | ✅ Sẵn sàng | Vitest + Supertest, coverage targets, CI/CD, test DB — `design/02-platform-baseline/deploy-ops/TESTING_STRATEGY.md` |
| Deploy runbook | ✅ Sẵn sàng | Docker Compose, deploy/rollback commands, SSL verify — `design/02-platform-baseline/deploy-ops/DEPLOY_RUNBOOK.md` |
| Migration strategy | ✅ Sẵn sàng | Prisma commands, multi-step examples, seed — `design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md` |
| Infra baseline | ✅ Sẵn sàng | Trimmed to ~170 lines, no duplication — `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md` |
| SVG asset workflow | ✅ Sẵn sàng | Deterministic SVG rulebook cho diagrams/icons/mockups trong `design/` — `design/05-references/starter-patterns/SVG_PRECISION_WORKFLOW.md` |
| Skill/tool alignment | ✅ Fixed | AGENTS routing đã chốt NestJS rebuild; các skills CMS legacy đã bị deprecate hoặc loại khỏi luồng code mới; external baseline hiện chỉ dùng `Gemini + Copilot` |
| OpenAPI spec | ✅ Design-locked | Strategy chốt: auto-gen từ NestJS Swagger decorators — xem GAP 5 bên dưới; runtime artifact vẫn pending implementation |
| Deferred/excluded advanced tech design | ✅ Sẵn sàng | Các component `planned` / `explicit exclusion` đều có design doc rõ — xem `DECISIONS.md` section 15 |
| Email provider decision | ✅ Sẵn sàng | Brevo SMTP chốt, delivery failure policy, retry, anti-enumeration — `design/02-platform-baseline/security-runtime/EMAIL_PROVIDER_DECISION.md` |
| Storage lifecycle | ✅ Sẵn sàng | 5 cleanup jobs, asset states, upload quota — `design/02-platform-baseline/data-runtime/STORAGE_LIFECYCLE.md` |
| Cache topology | ✅ Sẵn sàng | 4-layer cache, invalidation rules, ISR, TanStack Query staleTime — `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md` |
| Secret management | ✅ Sẵn sàng | Rotation procedures per secret, compromise response, .gitignore — `design/02-platform-baseline/security-runtime/SECRET_MANAGEMENT.md` |
| CI/CD gates | ✅ Sẵn sàng | GitHub Actions, 4 automated + 1 human gate, rollback, concurrency + least-privilege permissions + cache guidance — `design/02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md` |
| WAF + anti-bot | ✅ Sẵn sàng | Cloudflare WAF rules, honeypot, CSP nonce, security headers — `design/02-platform-baseline/edge-delivery/WAF_ANTIBOT_STRATEGY.md` |
| External web-check readiness | ✅ Sẵn sàng ở mức design | owner split giữa design-vs-runtime evidence cho TLS/headers/DNS/crawl/metadata/email-auth đã được khóa — `design/05-references/framework-docs/EXTERNAL_WEB_CHECK_READINESS.md` |
| Health contract | ✅ Sẵn sàng | Exact check lists per endpoint, failure runbook — `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md` |
| Admin module specs | ✅ Sẵn sàng | 24 workspaces với filters/bulk/states/query-invalidation — `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` |
| Admin page/API/query mapping | ✅ Sẵn sàng | page route -> API group -> query keys -> invalidation rules — `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` |
| Admin scaffold backlog | ✅ Sẵn sàng | rollout order + `queries.ts` / `mutations.ts` plan cho từng feature — `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md` |
| Admin feature query plan | ✅ Sẵn sàng | query key factory plan + query/mutation export plan + invalidation graph per feature — `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md` |
| Wisdom naming & IA canon | ✅ Sẵn sàng | route slug, hub IA, glossary, source taxonomy, FAQ/warnings cho BTPP và Little House cross-surface — `design/03-domains/wisdom-qa/REFERENCES/BTPP-LIBRARY-CANON.MD` |
| Wisdom translation automation | ✅ Sẵn sàng | auto-ingest/auto-translate lane đã có orchestrator + duplicate guard + slug preview + import-job lifecycle ở design level — `design/02-platform-baseline/optional-scale/TRANSLATION_AUTOMATION_ARCHITECTURE.md` |
| Wisdom-QA family audit | ✅ Sẵn sàng | audit theo family, anti-drift rules, và gap list để scaffold không đoán taxonomy — `design/04-execution-overlay/api/WISDOM_QA_FAMILY_AUDIT.md` |
| XLCH official alignment | ✅ Sẵn sàng | official family map và alignment backlog từ `xlch.org` đã được ghi riêng để tránh gộp sai BTPP/Hỏi đáp/Khai thị — `design/05-references/external-research/XLCH_OFFICIAL_ALIGNMENT.md` |
| Env inventory | ✅ Sẵn sàng | 50+ env vars bao gồm Phase 2+ và CI/CD secrets — `design/04-execution-overlay/repo/ENV_INVENTORY.md` |
| pgvector decision | ✅ Sẵn sàng | Explicit exclusion với trigger conditions rõ — `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` |
| Push notification architecture | ✅ Sẵn sàng | VAPID Web Push, worker handler, service worker, admin ops — `design/02-platform-baseline/optional-scale/PUSH_NOTIFICATION_ARCHITECTURE.md` |
| Observability architecture | ✅ Sẵn sàng | Phase 1 health/metrics, Phase 2 Prometheus/Grafana, Phase 3 OTEL — `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` |
| Verification toolchain matrix | ✅ Design-locked | Trail of Bits skills đã được khóa vào testing/debugging/security verification thay vì chỉ inventory/catalog |

**VERDICT**: `DESIGN-READY FOR PHASED IMPLEMENTATION PLANNING`
Tất cả hạng mục design trọng yếu đều ✅ ở mức thiết kế. File này **không** có nghĩa runtime đã sẵn sàng hoặc launch đã an toàn.

### Readiness split bắt buộc

| Readiness | Ý nghĩa | Owner file |
|---|---|---|
| `design-ready` | design đủ rõ để bắt đầu implementation planning | file này |
| `implementation-ready` | artifact runtime cụ thể đã được map đủ rõ để bắt đầu code module đó | `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` |
| `launch-ready` | launch blockers thật đã pass, gồm restore drill, runtime evidence, và rollout proof | `DECISIONS.md` section 9 + `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` |

Coding agent có thể bắt đầu Wave 1, nhưng chỉ theo thứ tự scaffold đã khóa. Với `apps/api`, cửa sổ an toàn hiện tại là Step `0 -> 7` theo [APPS_API_SCAFFOLD_ORDER.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md), và ở Step 7 vẫn chỉ được làm `5` content routes đầu tiên.
Các route khác đang xuất hiện trong inventory không mặc định trở thành Wave 1 scaffold target.
Slice E2E đầu tiên nên dùng để kiểm tra design-to-code là `chanting environment rules`, không phải member dashboard.
Riêng `apps/api`, thứ tự scaffold và blocker cụ thể đã được tách thành [APPS_API_SCAFFOLD_ORDER.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md) để tránh dựng sai từ commit đầu.

---

## Phần 1: Những gì ĐÃ ổn (Không cần sửa trước khi code)

### Backend design — ĐẦY ĐỦ
Mọi domain module canonical đều có:
- `module-map.md` — objectives, ownership, boundaries
- `contracts.md` — routes, input/output, error codes
- `schema.dbml` — DB schema per module
- `flows.mmd` — state machines
- `use-cases/` — write-path documentation

### Platform modules — ĐẦY ĐỦ
11 platform modules có spec trong `design/02-platform-baseline/api-runtime/PLATFORM_MODULES.md` và `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md`.

### Security — ĐẦY ĐỦ
- Auth model (15min/30day tokens, rotation, Argon2id): `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
- Upload hardening (MIME, allowlist, delete auth): `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
- CSRF/CORS/CSP: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`
- Permission matrix per module: `design/03-domains/identity/REFERENCES/PERMISSION_MATRIX.md`

### Tracking docs — ĐẦY ĐỦ
- Error codes: `design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md`
- Audit events: `design/04-execution-overlay/api/AUDIT_POLICY.md`
- Module interactions: `design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md`
- Outbox taxonomy: `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md`
- API route inventory: `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
- Env variables: `design/04-execution-overlay/repo/ENV_INVENTORY.md`

### Verification toolchain — ĐÃ KHÓA

Trail of Bits skills không còn chỉ là inventory. Chúng đã được cắm vào verification canon như sau:

| Lane | Owner docs | Tooling stance |
|---|---|---|
| schema/parser/filter invariants | `design/02-platform-baseline/deploy-ops/TESTING_STRATEGY.md` | `trailofbits-property-based-testing` adopted-when-fit |
| suspected security finding verification | `design/02-platform-baseline/deploy-ops/TESTING_STRATEGY.md`, `design/02-platform-baseline/security-runtime/FAILURE_MODES.md` | `trailofbits-fp-check` required before final verdict |
| security bug variant hunt | `design/02-platform-baseline/security-runtime/FAILURE_MODES.md`, `design/02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md` | `trailofbits-variant-analysis` recommended |
| static security scanning | `design/02-platform-baseline/security-runtime/FAILURE_MODES.md` | `trailofbits-semgrep` / `trailofbits-codeql` adopted when lane justifies |
| dependency / CI security review | `design/02-platform-baseline/security-runtime/FAILURE_MODES.md` | `trailofbits-supply-chain-risk-auditor`, `trailofbits-agentic-actions-auditor` recommended |
| disputed fix / high-risk patch review | `design/02-platform-baseline/deploy-ops/TESTING_STRATEGY.md`, `design/02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md` | `trailofbits-second-opinion` recommended |

### UI/UX design — ĐẦY ĐỦ
- Route inventory đầy đủ: `design/04-execution-overlay/web/PAGE_INVENTORY.md`
- User flows public/member/admin: `design/04-execution-overlay/web/USER_FLOWS.md`
- 30+ components: `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md`
- Design principles: `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md`
- Admin architecture: `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`
- Elderly UX: `design/02-platform-baseline/web-runtime/ELDERLY_UX.md`
- Admin module specs (24 workspaces): `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
- IA + URL/navigation owner: `design/02-platform-baseline/web-runtime/NAVIGATION_ARCHITECTURE.md`
- Landing/homepage/app-screen specs: `design/02-platform-baseline/web-runtime/LANDING_PAGE_DESIGN.md`, `design/02-platform-baseline/web-runtime/HOMEPAGE_CONSTITUTION.md`, `design/05-references/examples/SPIRITUAL_APP_SCREENS.md`

### Frontend strategies — ĐẦY ĐỦ
- SEO: `generateMetadata()`, JSON-LD, sitemap, robots.txt
- Lỗi đã chốt: Vietnamese-only, không dùng i18n framework (xem `DECISIONS.md` section 12)
- PWA/Offline: Service worker + IndexedDB + delta sync
- Caching: CDN + ISR + TanStack Query + service worker
- Ref: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`

---

## Phần 2: Gaps còn lại (ít)

### ✅ GAP 1: Prisma schema tổng hợp — FIXED

**Đã tạo**: `design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md` — enums, FK dependency graph, naming conventions, merge process, 12-step migration order.

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
- các skill CMS cũ đã được đánh dấu deprecated trong repo routing
- không còn coi chúng là blocker cho design readiness

**Lưu ý**:
- khi code thật, vẫn chỉ dùng skill/routing đã align với NestJS rebuild

---

### ✅ GAP 5: OpenAPI spec — DESIGN-CLOSED, RUNTIME PENDING

**Strategy**: OpenAPI runtime artifact đi qua `@nestjs/swagger`, nhưng contract authority vẫn là owner docs + Zod schemas. Không viết spec bằng tay, và cũng không biến swagger decorators thành source of truth thứ hai.

**Ownership**: `apps/api` giữ runtime generation ownership; owner docs và shared Zod contracts giữ schema semantics.

**Decorator standard** (bắt buộc cho tất cả public routes):
- `@ApiTags('module-name')` — trên mỗi controller class
- `@ApiOperation({ summary: '...' })` — trên mỗi route handler
- `@ApiResponse({ status: 200, type: ResponseDto })` — success case
- `@ApiResponse({ status: 400/401/403/404 })` — error cases liên quan
- field-level swagger metadata phải được derive từ contract helper/Zod bridge khi có thể; chỉ annotate thủ công khi helper chưa cover được case đó

**Source of truth cho schema**: Zod schemas trong `packages/shared` hoặc contract owner tương đương → infer TypeScript types → map sang OpenAPI qua bridge/helper chung. Nếu phải dùng DTO transport class, nó chỉ là documentation shell, không phải nơi tự phát minh schema semantics.

**Generated output**:
- Swagger UI: `GET /api/docs` (disabled in production, enabled in dev + staging)
- Raw JSON spec: `GET /api/docs-json` (có thể export ra `docs/openapi.json` khi build)

**Completion criteria** (what counts as implemented):
- Tất cả routes public trong [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md) có `@ApiOperation` + `@ApiTags`
- Tất cả request/response surfaces map được từ contract owner sang OpenAPI, không drift khỏi owner docs
- security schemes trong Swagger phản ánh đúng:
  - browser/web-admin = cookie-first auth contract
  - automation/internal = selective bearer khi thật sự tồn tại
- `GET /api/docs` trả 200 OK trong môi trường dev
- Không có route nào hiện là `{}` (empty schema) trong Swagger UI

**Note**: OpenAPI spec là runtime artifact — nó không thể được hoàn chỉnh hoàn toàn trong design phase. Gap này được đóng ở design level bằng cách chốt strategy, ownership, và completion criteria. Nó chưa được coi là `implemented` cho tới khi `/api/docs` chạy thật trong `apps/api` và chứng minh docs không drift khỏi Zod/owner contracts.

---

## Phần 3: Lỗi sẽ xảy ra nếu code ngay (Bug prediction) — ĐÃ FIX TẤT CẢ

### ✅ Bug 1: Module sẽ import lẫn nhau (circular dependency) — FIXED
**Fix đã áp dụng**: Thêm "Cross-module communication" section vào `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`.
Chốt: modules communicate qua exported service interface, không import toàn bộ module. Bidirectional → dùng event pattern.
**Ref**: `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md` mục "Cross-module communication"

---

### ✅ Bug 2: Audit fail không block write-path — FIXED
**Fix đã áp dụng**: Thêm "Audit transaction enforcement" section vào `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`.
Chốt: audit mandatory events PHẢI trong cùng `prisma.$transaction()`. AuditService có `appendInTransaction()` cho writes, `appendAsync()` chỉ cho read analytics.
**Ref**: `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md` mục "Audit transaction enforcement"

---

### ✅ Bug 3: Rate-limit bị bypass trên refresh endpoint — FIXED
**Fix đã áp dụng**: Thêm `refresh token` vào danh sách rate-limit bắt buộc trong `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`.
Chốt: `/api/auth/refresh` phải có 30 req / 15 phút / per-IP.
**Ref**: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` phần rate-limit

---

### ✅ Bug 4: Search trả data chưa published — FIXED
**Fix đã áp dụng**: Thêm mandatory WHERE clause vào `design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md`.
Chốt: `WHERE status = 'published' AND published_at IS NOT NULL AND published_at <= NOW()`. Wisdom-QA thêm `review_status IN ('translated_reviewed', 'source_verified')`. Filter ở repository layer.
**Ref**: `design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md` phần "Phase 1 query contract"

---

### ✅ Bug 5: Calendar advisory copy text vào event record — FIXED (đã có từ trước)
**Doc đã có**: `design/03-domains/calendar/REFERENCES/ADVISORY-OWNERSHIP.MD` chốt rõ Calendar chỉ lưu `sourceRefs`, không copy text.
**Ref**: `design/03-domains/calendar/REFERENCES/ADVISORY-OWNERSHIP.MD`

---

### ✅ Bug 6: Upload không có MIME sniffing — chỉ check extension — FIXED
**Fix đã áp dụng**: Thêm `file-type` npm library requirement vào `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` với code examples đúng/sai.
Chốt: dùng `fileTypeFromBuffer(buffer)` so sánh với allowlist, không dùng extension check.
**Ref**: `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` phần upload hardening

---

### ✅ Bug 7: Assisted entry dùng chung schema với member self-create — FIXED (đã có từ trước)
**Doc đã có**: `design/03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md` có `AssistedLifeReleaseSchema` riêng.
**Ref**: `design/03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md`

---

### ✅ Bug 8: Frontend gọi API trực tiếp bypass proxy — FIXED
**Fix đã áp dụng**: Viết lại toàn bộ `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` với proxy boundary enforcement.
Chốt: Browser KHÔNG BAO GIỜ gọi `apps/api` trực tiếp. Server Components → server-side fetch. Client Components → `/api/proxy/*` route handler. `API_INTERNAL_URL` chỉ server-side biết.
**Ref**: `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` mục "Proxy boundary"

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

Các giá trị dưới đây là `design-locked limits`, không có nghĩa tất cả limiter đã được code ngay từ Step 1.
Limiter nào được cắm ở bước nào phải bám [APPS_API_SCAFFOLD_ORDER.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md), đặc biệt:
- `/api/auth/refresh` thuộc identity Step 5
- upload limiter thuộc storage/upload boundary Step 6
- content/community/vows/engagement limiter chỉ cắm khi route write-path tương ứng thật sự được scaffold

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
| `POST /api/community/posts/:publicId/comments` | 30 | 1 giờ | per-account |
| `POST /api/guestbook` | 5 | 1 giờ | per-IP |
| `GET /api/search` | 100 | 1 phút | per-IP |
| `POST /api/vows` | 10 | 1 giờ | per-account |
| `PUT /api/engagement/practice-logs/self` | 50 | 1 giờ | per-account |

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
| `pmtl-scaffold-payload-collection` | Creates legacy CMS collections | **Deprecate** |
| `pmtl-production-baseline` | May reference legacy CMS patterns | **Review & Update** |
| `pmtl-runbook-cms-runtime-errors` | References legacy CMS runtime | **Deprecate** |

**Action required**: coi các skill deprecated ở trên là historical/no-route entries; không dùng chúng cho chat mới, không giữ chúng trong checklist active của rebuild.

---

## Phần 8: Recommended coding order (Thứ tự code khuyến nghị)

```
Wave 1 — Foundation (Nền tảng)
  1. Monorepo setup (pnpm, turborepo, tsconfig)
  2. apps/api: NestJS bootstrap + platform modules (config, logging, errors, validation)
  3. apps/api: sessions + auth (`identity`)
  4. apps/api: audit_logs + feature_flags + rate_limit_records
  5. apps/api: /health/* + /metrics

Wave 2 — Core Content
  6. apps/api: `content` (posts, guides, media upload)
  7. apps/web: layout + nav + public pages (homepage, post, guide)
  8. Verify restore drill passes

Wave 3 — Core Practice
  9. apps/api: `engagement` (practice sheets, Ngôi Nhà Nhỏ)
  10. apps/web: member pages (dashboard, tu-tap, nha-nho)
  11. apps/api: `calendar` (lunar calendar, advisory)

Wave 4 — Community + Moderation
  12. apps/api: `community` + `moderation`
  13. apps/web: community pages, comment section
  14. apps/admin: moderation queue

Wave 5 — Vows + Wisdom
  15. apps/api: `vows-merit` (vows, life release)
  16. apps/api: `wisdom-qa` (wisdom entries, search)
  17. apps/web: vow pages, wisdom search

Wave 6 — Notifications + Offline
  18. apps/api: `notification` (push subscriptions)
  19. apps/web: offline bundles, PWA setup
  20. apps/api: `search` (phase 1 SQL, phase 2+ Meilisearch)
```

---

## Checklist trước khi code Wave 1

- [ ] Đọc `DECISIONS.md` + `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
- [ ] Đọc `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md`
- [ ] Đọc `design/03-domains/identity/USE_CASES/manage-auth-session.md` (launch blocker)
- [ ] Đọc `design/03-domains/content/USE_CASES/upload-media-asset.md` (launch blocker)
- [ ] Verify skill routing đang dùng khớp `AGENTS.md` của repo
- [ ] Tạo Prisma schema từ migration order ở trên
- [ ] Seed `feature_flags` table với flags list ở Phần 4
- [ ] Confirm rate-limit store: `rate_limit_records` Postgres table (phase 1)
