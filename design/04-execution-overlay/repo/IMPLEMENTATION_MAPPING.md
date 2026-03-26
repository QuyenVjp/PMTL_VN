# IMPLEMENTATION_MAPPING (Ánh xạ triển khai)

File này tồn tại để chặn ảo giác `design = runtime (thiết kế tức là đã chạy thật)`.
Nó không dùng để khoe roadmap (lộ trình). Nó dùng để trả lời một câu duy nhất:

`quyết định nào đã map sang artifact (sản phẩm mã nguồn) thật của NestJS rebuild?`

## Current truth (Thực trạng hiện tại)

- Current direction (Hướng đi hiện tại) là `rebuild backend (xây dựng lại hệ thống phía sau)` với NestJS.
- Runtime (môi trường thực thi) cũ trong repo không được tính là implementation (triển khai) hợp lệ cho direction (hướng đi) mới chỉ vì nó đang tồn tại.
- Last verified ở mức design vào `2026-03-21`; cho tới khi xuất hiện artifact runtime thật có đường dẫn rõ trong `apps/api`, `apps/web`, `apps/admin`, bảng này vẫn phải mặc định nghiêng về `required before launch` hoặc `planned`, không được tự suy ra `implemented`.
- Vì vậy bảng dưới đây chủ yếu liệt kê các `launch blockers (vật cản ngăn chặn ra mắt)`, `planned targets (mục tiêu đã lập kế hoạch)`, và `explicit exclusions (các phần bị loại rõ ràng)`, nhưng từng dòng đều chỉ rõ artifact (thành phần mã nguồn) sẽ phải xuất hiện ở đâu.

## Current safe scaffold window (Cửa sổ scaffold an toàn hiện tại)

Ở thời điểm hiện tại, `apps/api` chỉ được coi là an toàn để bắt đầu scaffold theo thứ tự:

1. Step 0 — app shell
2. Step 1 — common technical baseline
3. Step 2 — Prisma + persistence foundation
4. Step 3 — platform modules block auth/launch
5. Step 4 — health + metrics + startup truth
6. Step 5 — identity first risky write-path
7. Step 6 — storage-backed upload boundary
8. Step 7 — content module **chỉ với 5 route đầu tiên**

Mọi route khác xuất hiện trong `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` vẫn là canon inventory, chưa tự động trở thành scaffold target.

## First vertical slice to implement first (Vertical slice đầu tiên nên làm)

Slice đầu tiên được khuyến nghị để thử E2E thật là:

- public page `/niem-kinh/luu-y-moi-truong-va-thoi-gian`
- `GET /content/chanting/environment-rules`
- `GET /content/chanting/environment-rules/:groupKey`
- admin lane `/admin/noi-dung/niem-kinh` chỉ cho tab `Môi trường & thời gian`

Lý do chọn:

- read-mostly, không cần auth member để bootstrap public page
- owner module đơn: `content`
- DTO/page-loader/route/admin mapping đã khóa xong
- không đòi Prisma graph phức tạp, queue, notification delivery, hay multi-module aggregate orchestration
- scope đủ trọn để kiểm tra design -> `packages/shared` -> `apps/api` -> `apps/web` -> `apps/admin`

Không chọn làm slice đầu tiên:

- `/dashboard`
  - vì là aggregate 5 module (`identity + calendar + engagement + vows-merit + notification`)
- `/thong-bao`
  - vì còn phase-gating capability/reminder semantics và auth-required member flow
- `/ngoai-tuyen`
  - vì kéo theo delta sync, offline state, và Wisdom-QA bundle complexity

## Current launch value packages

### Launch Core A

- câu pháp cú mỗi ngày trên member dashboard
- lịch ăn chay/ngày âm phổ thông
- tủ sách cá nhân
- reading list

### Launch Core B

- Wisdom-QA hub
- search lời dạy bằng `Meilisearch + SQL fallback`
- source/provenance rõ
- không AI tư vấn

### Launch Core C

- offline bundle cho Bạch Thoại
- tải gói
- xem offline
- version sync cơ bản

Rule:

- các core packages này được coi là `launch value`, không bị đẩy lùi chỉ vì infra lane của chúng từng được ghi là phase-later
- heavy stack supporting them chỉ được activate đến mức tối thiểu product cần thật

### Slice boundary (ranh giới bắt buộc)

Nếu code slice này, phạm vi được phép chỉ gồm:

- content read models cho `chanting/environment-rules`
- admin CRUD tối thiểu cho environment-rule groups/rules
- public loader/page cho `/niem-kinh/luu-y-moi-truong-va-thoi-gian`
- admin tab render cho workspace `Niệm kinh` phần environment rules

Không được lôi thêm:

- `chant item` full detail
- `chant plan` implementation
- member tracker state
- notification logic
- dashboard aggregate
- worker/queue/search side effects

### Acceptance target

Slice này chỉ được coi là pass khi:

1. public page render hoàn toàn từ `ChantEnvironmentRulesPageDto`
2. admin tab không hardcode bucket/rule wording ngoài canon DTO
3. `reference-only` rules không bị product hóa thành calculator / interpretation UX
4. web/admin đều dùng cùng vocabulary cho 6 buckets canon

## Web rebuild starter reference

Nếu reset `apps/web` để scaffold lại từ starter sạch, phải theo:

- [web-rebuild-blueprint.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_REBUILD_BLUEPRINT.md)

Blueprint đó chốt:
- starter stack cho `apps/web`
- route group skeleton
- visual/system baseline
- wave order để rebuild web mà không lệch `design/`
- query key/invalidation canon cho web phải đọc thêm ở [web-query-invalidation-plan.md](/C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md)

## Status semantics (Ý nghĩa các trạng thái)

- `implemented`: đã triển khai
  - đã có artifact (thành phần mã nguồn) thật và có thể chỉ ra đường dẫn hoặc runtime surface (bề mặt thực thi) cụ thể
- `required before launch`: yêu cầu trước khi ra mắt
  - launch blocker (vật cản ngăn chặn ra mắt) của quá trình rebuild
- `planned`: đã lập kế hoạch
  - hướng đi đã chốt nhưng chưa phải là baseline phase 1 (nền tảng giai đoạn 1)
- `forbidden for now`: hiện đang bị cấm
  - không được tự ý kích hoạt
- `explicit exclusion`: loại rõ ràng khỏi hướng hiện tại
  - không phải `planned`; chỉ được xem xét lại khi decision doc nêu trigger reconsideration rõ ràng

## Không được đánh dấu implemented (đã triển khai) nếu thiếu:

- route/controller (đường dẫn/bộ điều hướng) hoặc HTTP surface (bề mặt HTTP) tương ứng
- service/module (lớp nghiệp vụ/mô-đun) tương ứng
- schema/migration (lược đồ/di cư dữ liệu) hoặc persistence artifact (thành phần lưu trữ vĩnh viễn) tương ứng
- runtime behavior (hành vi thực thi) kiểm chứng được

## Phase 1 launch blockers (Các vật cản ra mắt giai đoạn 1)

| Decision / requirement (Quyết định / Yêu cầu) | Expected artifact in rebuild (Thành phần dự kiến) | Status (Trạng thái) | What counts as implemented (Tiêu chuẩn hoàn thành) |
|---|---|---|---|
| `NestJS auth` là auth authority (quyền lực xác thực) duy nhất | `apps/api/src/modules/identity/*` + `apps/api/src/platform/sessions/*` | required before launch | login/refresh/logout/reset routes (đường dẫn đăng nhập/làm mới/đăng xuất/thiết lập lại) + guards (bộ canh phòng) + token/session persistence (lưu trữ token/phiên) |
| NestJS application baseline (Nền tảng ứng dụng NestJS) | app bootstrap (khởi động ứng dụng), global pipes/filters (bộ lọc/đường ống toàn cục), logger module (mô-đun nhật ký), guard chain (chuỗi canh phòng) | required before launch | Prisma + Zod pipe + Pino + global exception filter (bộ lọc ngoại lệ toàn cục) + error envelope (vỏ bọc lỗi chuẩn) phải hiện diện |
| access token + refresh rotation (xoay vòng token làm mới) | auth service (lớp nghiệp vụ xác thực) + token/session schema (lược đồ token/phiên) | required before launch | refresh (làm mới) xoay vòng được, token cũ bị revoke (thu hồi), logout-all (đăng xuất tất cả) hoạt động |
| `audit_logs` (nhật ký kiểm tra) | migration/schema (di cư/lược đồ) + append helper (hàm ghi nhật ký) + first audited routes (các đường dẫn được kiểm tra đầu tiên) | required before launch | ít nhất auth/admin/upload actions (các hành động xác thực/quản trị/tải lên) đã được append audit (ghi nhật ký kiểm tra) thật |
| `feature_flags` (cờ tính năng) | migration/schema (di cư/lược đồ) + evaluation service (lớp đánh giá tính năng) + first flag consumer (thành phần sử dụng cờ đầu tiên) | required before launch | có ít nhất 1 feature (tính năng) thật đi qua flag (cờ) |
| `sessions` (phiên đăng nhập) | migration/schema (di cư/lược đồ) + session persistence service (lớp lưu trữ phiên) | required before launch | logout/logout-all/revoke (đăng xuất/đăng xuất hết/thu hồi) không được là giả lập |
| `rate_limit_records` Postgres table (giới hạn tần suất) — **phase 1 đã chốt dùng Postgres table, không phải Valkey** | migration/schema + rate-limit guard | required before launch | auth/search/write/upload phải có limiter path rõ ràng; trigger evaluate Valkey khi `rate_limit_records` query p95 `> 100ms` sustained `15 phút` hoặc lock waits lặp lại theo `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md` |
| local storage abstraction (lớp trừu tượng lưu trữ nội bộ) | storage interface (giao diện lưu trữ) + local adapter (bộ chuyển đổi nội bộ) + media metadata schema (lược đồ dữ liệu truyền thông) | required before launch | upload/delete/url logic (lý thuyết tải/xóa/địa chỉ) không phụ thuộc trực tiếp vào đường dẫn nội bộ (local path) |
| upload hardening (thắt chặt bảo mật tải lên) | upload controller/service + MIME sniffing (kiểm tra loại tệp) + allowlist (danh sách cho phép) + delete auth (ủy quyền xóa) | required before launch | từ chối (reject) file sai loại/dung lượng, ủy quyền xóa (delete auth) rõ ràng, nhật ký (audit) có ghi lại |
| webhook replay protection (chống phát lại webhook) | signature verify guard + `webhook_delivery_dedup` persistence + replay-window policy | required before launch | webhook không được coi là implemented nếu chưa có provider/event-id dedup artifact + signature verification + neutral error response |
| `/health/live`, `/health/ready`, `/health/startup` (kiểm tra sức khỏe hệ thống) | health module/routes | required before launch | các đường dẫn live/ready/startup trả đúng contract (hợp đồng nghiệp vụ) giai đoạn 1 |
| `/metrics` tối thiểu | metrics endpoint (điểm truy cập chỉ số) + counters (bộ đếm) cơ bản | required before launch | các chỉ số request/error/upload/rate-limit có thể được scrape (thu thập) nội bộ |
| backup + restore drill (sao lưu + diễn tập phục hồi) | runbook (tài liệu vận hành) + restore drill record (nhật ký diễn tập phục hồi) | required before launch | [restore-drill-log.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md) có evidence (bằng chứng) thật |

## First risky write-paths (Các luồng ghi dữ liệu rủi ro đầu tiên)

| Write-path doc (Tài liệu luồng ghi) | Expected rebuild artifact (Thành phần dự kiến) | Status (Trạng thái) | Launch note (Ghi chú ra mắt) |
|---|---|---|---|
| [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/identity/USE_CASES/manage-auth-session.md) | auth controller + auth service + session/token tables + audit append + rate limit | required before launch | Lỗi bảo mật (Auth bug) là vật cản ra mắt (launch blocker) |
| [upload-media-asset.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/03-domains/content/USE_CASES/upload-media-asset.md) | upload controller + media service + storage adapter + media_assets table + asset status handling | required before launch | Ranh giới tải lên (Upload boundary) là vật cản ra mắt (launch blocker) |

## Deferred and explicitly excluded advanced components (Các thành phần nâng cao đang tạm hoãn hoặc bị loại rõ ràng)

Full architecture docs exist cho toàn bộ các component `planned`, và decision doc rõ ràng tồn tại cho component `explicit exclusion`.
Coding agent có thể activate phần `planned` mà không cần phát minh lại kiến trúc, nhưng không được tự ý bật phần `explicit exclusion` trước khi trigger reconsideration được đáp ứng.

| Decision | Expected code location | Status | Trigger | Design doc |
|---|---|---|---|---|
| `Valkey` | `apps/api/src/platform/valkey/` — `ValkeyModule`, `ValkeyService` | planned | rate_limit_records Postgres table shows lock contention OR cache miss rate measured | `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md` |
| `BullMQ` + `apps/worker` | producer: `apps/api/src/platform/queue/`; consumer: `apps/worker/src/handlers/` | planned | background work makes request > 2s OR manual retry unacceptable | `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` |
| `outbox_events` + dispatcher | `apps/api/src/platform/outbox/` — `OutboxService`, `OutboxDispatcherCron` | planned | side effect failure cost > complexity cost | `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md` |
| `Meilisearch` | `apps/api/src/modules/search/adapters/meilisearch.adapter.ts`; runtime authority: `SEARCH_ENGINE=meilisearch` | planned | SQL search p95 vượt SLO public search đã chốt trong `design/02-platform-baseline/deploy-ops/SLA_SLO.md` hoặc multi-type search requirement xuất hiện rõ | `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` |
| `PgBouncer` | `infra/pgbouncer/pgbouncer.ini`; `infra/docker/docker-compose.pgbouncer.yml` | planned | db_connection_count > 80% of max_connections sustained | `design/02-platform-baseline/optional-scale/PGBOUNCER_STRATEGY.md` |
| Cloudflare R2 | `apps/api/src/platform/storage/adapters/r2.adapter.ts`; `STORAGE_ADAPTER=r2` | planned | local disk > 70% OR restore drift > 5% | `design/02-platform-baseline/optional-scale/R2_MIGRATION_PLAN.md` |
| Web Push (VAPID) | `apps/api/src/modules/notification/push.service.ts`; `apps/web/public/sw.js` | planned | PWA active + feature flag `notification.push.enabled` | `design/02-platform-baseline/optional-scale/PUSH_NOTIFICATION_ARCHITECTURE.md` |
| Prometheus + Grafana | `infra/prometheus/`, `infra/grafana/`, `infra/alertmanager/` | planned | specific metric use case + team needs shared visibility | `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` |
| OpenTelemetry | `apps/api/src/platform/telemetry/*`; `apps/worker/src/platform/telemetry/*`; `infra/otel/otelcol.config.yaml`; `OTEL_ENABLED=true` | planned | cross-service latency diagnosis needed | `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` |
| pgvector | `apps/api/src/platform/embedding/`; `prisma/schema.prisma` extension | **explicit exclusion** | Meilisearch stable 3+ months theo định nghĩa trong `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` AND specific semantic search use case measured | `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` |

### Launch-profile override

- `Meilisearch` hiện được promote từ `planned by trigger` thành `launch-active target` do PMTL chọn `Search-first launch`
- `Valkey`, `BullMQ`, `apps/worker`, `outbox`, `PgBouncer`, `Prometheus/Grafana`, `OTEL` vẫn là dormant lanes: cấu hình/owner path có thể scaffold sẵn, nhưng chưa là launch dependency mặc định

## Forbidden for current phase (Bị cấm trong giai đoạn hiện tại)

| Decision / requirement (Quyết định / Yêu cầu) | Status (Trạng thái) | Why (Tại sao) |
|---|---|---|
| tracing backend (hệ thống truy vết phía sau) | forbidden for now | chưa vượt qua các tiêu chuẩn về logs/restore/runbook |
| queue (hàng đợi) trước khi có idempotency policy (chính sách bất biến) | forbidden for now | tránh tự tạo ra các tác động phụ bị trùng lặp (duplicate side effects) |
| public upload (tải lên công khai) thiếu sniffing/delete auth (kiểm tra/ủy quyền xóa) | forbidden for now | vi phạm ranh giới bảo mật (security boundary) |

## New design docs added (Tài liệu thiết kế mới)

Các file sau đã được thêm để lấp gap thiết kế — phải review trước khi code module tương ứng:

| File | Lấp gap gì |
|---|---|
| `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md` | Thứ tự khởi động platform modules + fail behavior |
| `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md` | Event nào đi outbox, event nào sync/fire-and-forget |
| `design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md` | Field mapping từ Content + Wisdom-QA vào unified index |
| `design/03-domains/wisdom-qa/REFERENCES/OFFLINE-BUNDLE-DELTA-SYNC.MD` | Schema versioning và delta sync cho offline bundles |
| `design/03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md` | Workflow + audit khi admin tạo record thay member |
| `design/03-domains/calendar/REFERENCES/ADVISORY-OWNERSHIP.MD` | Ranh giới Calendar vs Wisdom-QA trong advisory compose |
| `design/03-domains/calendar/organizational-events-architecture.md` | Nâng event baseline lên event tổ chức có agenda/speakers/ctas/assets |
| `design/03-domains/calendar/USE_CASES/manage-organizational-event-agenda.md` | Write-path cho agenda có cấu trúc và reorder |
| `design/03-domains/calendar/USE_CASES/reschedule-or-cancel-event.md` | Write-path lifecycle reschedule/cancel event |
| `design/03-domains/content/little-house-experience-architecture.md` | Kiến trúc content/admin/tracker cho Ngôi Nhà Nhỏ |
| `design/03-domains/content/daily-practice-experience-architecture.md` | Kiến trúc content/admin/tracker cho Kinh Bài Tập Hằng Ngày |
| `design/03-domains/content/daily-practice-content-inventory.md` | Inventory canonical cho groups, guides, presets, FAQ, downloads của daily practice |
| `design/03-domains/content/USE_CASES/publish-little-house-guide.md` | Write-path chuẩn để publish guide Ngôi Nhà Nhỏ |
| `design/03-domains/content/life-release-experience-architecture.md` | Kiến trúc content/admin/journal bridge cho Phóng Sanh |
| `design/03-domains/content/life-release-content-inventory.md` | Inventory canonical cho nghi thức, variants, warnings, FAQ, downloads của Phóng Sanh |
| `design/03-domains/content/life-release-guide-nghi-thuc-co-ban.md` | Canonical content cho route nghi thức cơ bản của Phóng Sanh |
| `design/03-domains/content/life-release-guide-cho-ban-than.md` | Canonical content cho variant Phóng Sanh hồi hướng cho bản thân |
| `design/03-domains/content/life-release-guide-cho-nguoi-khac.md` | Canonical content cho variant Phóng Sanh hồi hướng cho người khác |
| `design/03-domains/content/life-release-guide-luu-y-va-chuan-bi.md` | Canonical content cho checklist, warning, và preparation guide của Phóng Sanh |
| `design/03-domains/content/life-release-guide-xu-ly-khi-co-loai-vat-tu-vong.md` | Canonical content cho flow xử lý phát sinh có species-specific counts |
| `design/03-domains/content/life-release-guide-hoi-dap.md` | FAQ seed và support content cho Phóng Sanh |
| `design/03-domains/content/media-library-experience-architecture.md` | Kiến trúc hub thư viện ảnh/video pháp môn và owner split với Wisdom-QA, Calendar |
| `design/03-domains/content/media-library-content-inventory.md` | Inventory canonical cho hub, collections, featured slots, admin workspace của thư viện pháp môn |
| `design/03-domains/content/USE_CASES/publish-media-library-collection.md` | Write-path chuẩn để publish media collections |
| `design/03-domains/content/USE_CASES/publish-life-release-guide.md` | Write-path chuẩn để publish guide Phóng Sanh |
| `design/03-domains/wisdom-qa/baihua-audiobook-text-first-architecture.md` | Kiến trúc text-first cho nguồn audiobook Bạch thoại theo sách / chương / audio companion |
| `design/03-domains/wisdom-qa/baihua-audiobook-ingestion-inventory.md` | Inventory các lớp dữ liệu cần ingest từ source audiobook |
| `design/03-domains/wisdom-qa/USE_CASES/ingest-baihua-audiobook-source.md` | Write-path chuẩn để nhập source audiobook vào book/chapter records |
| `design/03-domains/vows-merit/USE_CASES/create-assisted-life-release-entry.md` | Write-path assisted entry cho life release journal |
| `design/03-domains/contact/USE_CASES/update-contact-info.md` | Write-path cho singleton contact info |
| `design/03-domains/contact/USE_CASES/manage-volunteer-directory.md` | Write-path cho CRUD + sort phụng sự viên |

## New design docs added — 2026-03-21 batch (Tài liệu thiết kế mới — đợt 2026-03-21)

Các file sau được thêm để lấp gap deferred tech, ops, security, và admin completeness:

| File | Lấp gap gì | Phase |
|---|---|---|
| `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md` | Full Valkey topology, key namespaces, rate-limit migration, failure modes, rollback | Phase 2+ |
| `design/04-execution-overlay/repo/VALKEY_MODULE_OPPORTUNITY_MATRIX.md` | Module-by-module matrix cho lane Valkey: module nào đáng bật, trigger nào đủ mạnh, anti-goal gì phải tránh | Phase 2+ |
| `design/04-execution-overlay/repo/VALKEY_CACHE_CANDIDATE_INVENTORY.md` | Inventory cache families, TTL classes, invalidation owner, do-not-cache list cho Valkey | Phase 2+ |
| `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` | Queue definitions, job schemas, idempotency, dead-letter, worker entrypoint | Phase 2+ |
| `design/04-execution-overlay/repo/BULLMQ_ACTIVATION_SHORTLIST.md` | Shortlist workload nào được promote lên BullMQ đầu tiên, trigger nào đủ mạnh, exclusions | Phase 2+ |
| `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md` | outbox_events schema, dispatcher cron, retry/dead-letter model, redrive | Phase 2+ |
| `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` | Index settings, sync strategy, SQL fallback contract, admin reindex ops | Phase 2+ |
| `design/02-platform-baseline/optional-scale/PGBOUNCER_STRATEGY.md` | Pool mode, config, trigger threshold, Docker Compose setup, rollback | Phase 2+ |
| `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` | Phase 1 health/metrics, Phase 2 Prometheus/Grafana/Alertmanager, Phase 3 OTEL | All phases |
| `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` | Explicit exclusion with boundary, trigger conditions, artifact list if activated | Excluded |
| `design/02-platform-baseline/optional-scale/R2_MIGRATION_PLAN.md` | Migration steps, dual-read period, storage adapter interface, rollback | Phase 2+ |
| `design/02-platform-baseline/optional-scale/PUSH_NOTIFICATION_ARCHITECTURE.md` | VAPID Web Push, subscription lifecycle, worker handler, service worker, admin ops | Phase 2+ |
| `design/02-platform-baseline/security-runtime/EMAIL_PROVIDER_DECISION.md` | Brevo SMTP config, delivery failure policy, retry semantics, anti-enumeration | Phase 1 |
| `design/02-platform-baseline/data-runtime/STORAGE_LIFECYCLE.md` | Asset states, cleanup jobs (orphan/rejected/soft-delete), upload quota, disk monitoring | Phase 1+ |
| `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md` | Cloudflare edge, Next.js ISR, TanStack Query staleTime, Valkey cache, invalidation rules | All phases |
| `design/02-platform-baseline/deploy-ops/VALKEY_RUNTIME_DRILL.md` | Activation/fallback/rollback drill cho Valkey + Redis Insight operator runbook | Phase 2+ |
| `design/02-platform-baseline/security-runtime/SECRET_MANAGEMENT.md` | Secret inventory, rotation procedures per secret type, compromise response, .gitignore | Phase 1 |
| `design/02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md` | GitHub Actions CI pipeline, deploy gates, CD pipeline, branch protection, rollback | Phase 1+ |
| `design/02-platform-baseline/edge-delivery/WAF_ANTIBOT_STRATEGY.md` | Cloudflare WAF rules, Bot Fight Mode, Turnstile, honeypot, security headers, CSP nonce | Phase 1+ |
| `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md` | Per-endpoint health check specification, check list, failure runbook, admin dashboard | Phase 1 |
| `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` | Per-module admin workspace: 24 modules with filters/bulk/states/query-invalidation | Phase 1+ |

## Review rule (Quy tắc rà soát)

Mỗi khi một decision (quyết định) đổi trạng thái sang `implemented (đã triển khai)`, phải cập nhật đồng thời:

- file này
- doc owner (tài liệu sở hữu) liên quan
- code reference (tham chiếu mã nguồn) cụ thể
- nếu là ops/runtime feature (tính năng vận hành/thực thi), thêm evidence (bằng chứng) hoặc command (lệnh) vào runbook (tài liệu vận hành) tương ứng

## Design-only readiness matrix (Ma trận sẵn sàng ở mức thiết kế)

Mục này tồn tại để chặn kiểu `đã có design khá nhiều rồi nên chắc code được`.
`Ready for implementation` ở đây vẫn chỉ là readiness của tài liệu, không phải runtime completeness.

| Surface | Design status | Còn thiếu để giảm invention | Owner docs phải đồng bộ |
|---|---|---|---|
| member page aggregates | ready at design level | giữ đồng bộ nếu route/DTO/loader của `/dashboard`, `/thong-bao`, `/ngoai-tuyen`, `/lich-ca-nhan` đổi | `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`, `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`, `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` |
| public search + wisdom hub | ready at design level | giữ `tab`, `engine`, `tabCounts`, `filterFacets`, pagination canon đồng bộ giữa `/tim-kiem`, `/bach-thoai`, `/hoi-dap` | `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`, `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`, `design/03-domains/search/*`, `design/03-domains/wisdom-qa/*`, `design/02-platform-baseline/web-runtime/SEARCH_UX_CONTRACT.md` |
| admin query invalidation | ready at design level | khi mở mutation mới phải cập nhật cùng lúc mapping `mutation -> query key -> public/cache owner` | `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`, `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`, `design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md` |
| launch blocker runtime modules | ready at design level, runtime evidence pending | design đã chốt artifact/env/health owner; vẫn chưa được coi là implemented nếu chưa có code path + verification thật | file này + use-case owner + runbook tương ứng |
| ops recovery / restore | contract-complete, runtime evidence pending | command/evidence template đã chốt; còn thiếu drill record pass và artifact pinning thật | `design/02-platform-baseline/deploy-ops/*`, `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md`, `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md` |

## Evidence contract before status changes

Từ giờ một dòng trong file này chỉ được đổi trạng thái khi có đủ evidence tier tương ứng:

| Target status | Minimum evidence required |
|---|---|
| `implemented` | code path cụ thể + runtime surface cụ thể + verification command hoặc record cụ thể |
| `required before launch` giữ nguyên | phải có owner doc, artifact path kỳ vọng, và launch rationale rõ |
| `planned` | phải có trigger + design doc + expected code location |
| `forbidden for now` / `explicit exclusion` | phải có reason + reconsideration trigger nếu applicable |

Evidence hợp lệ gồm:

- file path thật trong `apps/api`, `apps/web`, `apps/admin`, `infra`
- command/runbook step có thể lặp lại
- log record, drill record, hoặc health contract reference cụ thể
- không dùng câu kiểu `đã có baseline`, `đã discussed`, `đã phase-gated` như evidence

### Page-level evidence split

Với feature có page surface, evidence không đủ nếu chỉ có backend route:

- API tier: route + auth scope + DTO/error contract owner rõ
- Web tier: page loader contract hoặc query strategy owner rõ theo `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`
- Admin tier nếu có: query/invalidation mapping owner rõ theo admin mapping docs

Không được đổi status thành `implemented` cho page-level feature nếu backend đã có route nhưng web/admin fetch strategy vẫn còn để người triển khai tự chọn.

## Family-level acceptance criteria

Mỗi family dưới đây phải đạt đủ điều kiện mới được coi là `implementation-ready` ở mức tài liệu.

| Family | Acceptance criteria tối thiểu |
|---|---|
| page aggregate | có route canon, DTO owner row, loader owner row, auth/cache/error-state owner rõ |
| public detail/list route | có field projection ổn định, pagination/filter semantics rõ nếu là list, không leak internal fields |
| admin workspace | có page route canon, API route group canon, query key family, invalidation rules, role narrowing note |
| self-owned member write-path | có owner use-case, idempotency semantics, audit expectation nếu cần, explicit deny cho cross-user writes |
| assisted-entry/support write-path | có support scope canon, actor/owner audit fields, immutable marker hoặc correction rule rõ |
| platform runtime module | có expected code location, env contract, failure posture, health/metrics expectation nếu launch-critical |
| async/downstream lane | có outbox-vs-sync decision rõ, retry/recovery path, idempotency owner, subscriber/consumer boundary rõ |

### Không được coi là đủ nếu chỉ có một nửa chuỗi

- có `schema.dbml` nhưng chưa có route/DTO owner
- có route canon nhưng chưa có page aggregate contract
- có admin page nhưng chưa có invalidation/role narrowing rule
- có async note nhưng chưa nói rõ sync fallback, outbox trigger, hay recovery path

## P0 doc upgrades to finish before broad scaffold

Các nâng cấp dưới đây nên hoàn tất trước khi AI hoặc dev scaffold rộng:

| Priority | Doc | Upgrade cần có | Vì sao |
|---|---|---|---|
| P0 | `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md` | đóng `request/response/error/projection owner` cho page aggregate và search families | chặn controller/query layer tự bịa field và envelope |
| P0 | `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md` | chốt `max calls`, `cache mode`, `auth mode`, `error-state owner` cho page bootstrap | chặn web tự fan-out và tự nghĩ empty/degraded behavior |
| P0 | file này | chốt `design-only readiness` và `evidence contract` trước khi đổi trạng thái | chặn cảm giác `design đã đủ` nhưng chưa có bằng chứng để implement/launch |

## Enterprise handoff rule

Nếu một team khác hoặc external worker nhận task từ `design/`, handoff chỉ được coi là sạch khi:

1. surface có row trong bảng readiness ở trên
2. page/API/ops owner docs không mâu thuẫn route canon
3. artifact expectation đủ cụ thể để người nhận task không phải hỏi lại `viết ở đâu`, `fetch bao nhiêu lần`, `ai owner error state`
4. status trong file này không vượt quá mức evidence hiện có
