# IMPLEMENTATION_MAPPING (Ánh xạ triển khai)

File này tồn tại để chặn ảo giác `design = runtime (thiết kế tức là đã chạy thật)`.
Nó không dùng để khoe roadmap (lộ trình). Nó dùng để trả lời một câu duy nhất:

`quyết định nào đã map sang artifact (sản phẩm mã nguồn) thật của NestJS rebuild?`

## Current truth (Thực trạng hiện tại)

- Current direction (Hướng đi hiện tại) là `rebuild backend (xây dựng lại hệ thống phía sau)` với NestJS.
- Runtime (môi trường thực thi) cũ trong repo không được tính là implementation (triển khai) hợp lệ cho direction (hướng đi) mới chỉ vì nó đang tồn tại.
- Ở thời điểm docs (tài liệu) này được viết, baseline rebuild (nền tảng xây dựng lại) chưa có artifact runtime (môi trường thực thi thực tế) thật để đánh dấu là `implemented (đã triển khai)`.
- Vì vậy bảng dưới đây chủ yếu liệt kê các `launch blockers (vật cản ngăn chặn ra mắt)`, `planned targets (mục tiêu đã lập kế hoạch)`, và `explicit exclusions (các phần bị loại rõ ràng)`, nhưng từng dòng đều chỉ rõ artifact (thành phần mã nguồn) sẽ phải xuất hiện ở đâu.

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
| `rate_limit_records` Postgres table (giới hạn tần suất) — **phase 1 đã chốt dùng Postgres table, không phải Valkey** | migration/schema + rate-limit guard | required before launch | auth/search/write/upload phải có limiter path rõ ràng; migrate sang Valkey khi volume gây lock contention đo được |
| local storage abstraction (lớp trừu tượng lưu trữ nội bộ) | storage interface (giao diện lưu trữ) + local adapter (bộ chuyển đổi nội bộ) + media metadata schema (lược đồ dữ liệu truyền thông) | required before launch | upload/delete/url logic (lý thuyết tải/xóa/địa chỉ) không phụ thuộc trực tiếp vào đường dẫn nội bộ (local path) |
| upload hardening (thắt chặt bảo mật tải lên) | upload controller/service + MIME sniffing (kiểm tra loại tệp) + allowlist (danh sách cho phép) + delete auth (ủy quyền xóa) | required before launch | từ chối (reject) file sai loại/dung lượng, ủy quyền xóa (delete auth) rõ ràng, nhật ký (audit) có ghi lại |
| `/health/live`, `/health/ready`, `/health/startup` (kiểm tra sức khỏe hệ thống) | health module/routes | required before launch | các đường dẫn live/ready/startup trả đúng contract (hợp đồng nghiệp vụ) giai đoạn 1 |
| `/metrics` tối thiểu | metrics endpoint (điểm truy cập chỉ số) + counters (bộ đếm) cơ bản | required before launch | các chỉ số request/error/upload/rate-limit có thể được scrape (thu thập) nội bộ |
| backup + restore drill (sao lưu + diễn tập phục hồi) | runbook (tài liệu vận hành) + restore drill record (nhật ký diễn tập phục hồi) | required before launch | [restore-drill-log.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/restore-drill-log.md) có evidence (bằng chứng) thật |

## First risky write-paths (Các luồng ghi dữ liệu rủi ro đầu tiên)

| Write-path doc (Tài liệu luồng ghi) | Expected rebuild artifact (Thành phần dự kiến) | Status (Trạng thái) | Launch note (Ghi chú ra mắt) |
|---|---|---|---|
| [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-identity/use-cases/manage-auth-session.md) | auth controller + auth service + session/token tables + audit append + rate limit | required before launch | Lỗi bảo mật (Auth bug) là vật cản ra mắt (launch blocker) |
| [upload-media-asset.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/use-cases/upload-media-asset.md) | upload controller + media service + storage adapter + media_assets table + asset status handling | required before launch | Ranh giới tải lên (Upload boundary) là vật cản ra mắt (launch blocker) |

## Deferred and explicitly excluded advanced components (Các thành phần nâng cao đang tạm hoãn hoặc bị loại rõ ràng)

Full architecture docs exist cho toàn bộ các component `planned`, và decision doc rõ ràng tồn tại cho component `explicit exclusion`.
Coding agent có thể activate phần `planned` mà không cần phát minh lại kiến trúc, nhưng không được tự ý bật phần `explicit exclusion` trước khi trigger reconsideration được đáp ứng.

| Decision | Expected code location | Status | Trigger | Design doc |
|---|---|---|---|---|
| `Valkey` | `apps/api/src/platform/valkey/` — `ValkeyModule`, `ValkeyService` | planned | rate_limit_records Postgres table shows lock contention OR cache miss rate measured | `baseline/valkey-architecture.md` |
| `BullMQ` + `apps/worker` | producer: `apps/api/src/platform/queue/`; consumer: `apps/worker/src/handlers/` | planned | background work makes request > 2s OR manual retry unacceptable | `baseline/bullmq-worker-architecture.md` |
| `outbox_events` + dispatcher | `apps/api/src/platform/outbox/` — `OutboxService`, `OutboxDispatcherCron` | planned | side effect failure cost > complexity cost | `baseline/outbox-dispatcher-model.md` |
| `Meilisearch` | `apps/api/src/modules/search/adapters/meilisearch.adapter.ts`; feature flag: `search.meilisearch.enabled` | planned | SQL search p95 > 500ms OR Meilisearch is core feature | `06-search/meilisearch-architecture.md` |
| `PgBouncer` | `infra/pgbouncer/pgbouncer.ini`; `infra/docker/docker-compose.pgbouncer.yml` | planned | db_connection_count > 80% of max_connections sustained | `baseline/pgbouncer-strategy.md` |
| Cloudflare R2 | `apps/api/src/platform/storage/adapters/r2.adapter.ts`; `STORAGE_ADAPTER=r2` | planned | local disk > 70% OR restore drift > 5% | `baseline/r2-migration-plan.md` |
| Web Push (VAPID) | `apps/api/src/modules/notification/push.service.ts`; `apps/web/public/sw.js` | planned | PWA active + feature flag `notification.push.enabled` | `08-notification/push-notification-architecture.md` |
| Prometheus + Grafana | `infra/prometheus/`, `infra/grafana/`, `infra/alertmanager/` | planned | specific metric use case + team needs shared visibility | `baseline/observability-architecture.md` |
| OpenTelemetry | `apps/api/src/platform/telemetry/otel.ts`; `OTEL_ENABLED=true` | planned | cross-service latency diagnosis needed | `baseline/observability-architecture.md` |
| pgvector | `apps/api/src/platform/embedding/`; `prisma/schema.prisma` extension | **explicit exclusion** | Meilisearch stable 3+ months AND specific semantic search use case measured | `baseline/pgvector-decision.md` |

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
| `baseline/startup-dependency-order.md` | Thứ tự khởi động platform modules + fail behavior |
| `tracking/outbox-event-taxonomy.md` | Event nào đi outbox, event nào sync/fire-and-forget |
| `06-search/unified-index-mapping.md` | Field mapping từ Content + Wisdom-QA vào unified index |
| `10-wisdom-qa/offline-bundle-delta-sync.md` | Schema versioning và delta sync cho offline bundles |
| `09-vows-merit/assisted-entry-workflow.md` | Workflow + audit khi admin tạo record thay member |
| `07-calendar/advisory-ownership.md` | Ranh giới Calendar vs Wisdom-QA trong advisory compose |
| `07-calendar/organizational-events-architecture.md` | Nâng event baseline lên event tổ chức có agenda/speakers/ctas/assets |
| `07-calendar/use-cases/manage-organizational-event-agenda.md` | Write-path cho agenda có cấu trúc và reorder |
| `07-calendar/use-cases/reschedule-or-cancel-event.md` | Write-path lifecycle reschedule/cancel event |
| `02-content/little-house-experience-architecture.md` | Kiến trúc content/admin/tracker cho Ngôi Nhà Nhỏ |
| `02-content/daily-practice-experience-architecture.md` | Kiến trúc content/admin/tracker cho Kinh Bài Tập Hằng Ngày |
| `02-content/daily-practice-content-inventory.md` | Inventory canonical cho groups, guides, presets, FAQ, downloads của daily practice |
| `02-content/use-cases/publish-little-house-guide.md` | Write-path chuẩn để publish guide Ngôi Nhà Nhỏ |
| `02-content/life-release-experience-architecture.md` | Kiến trúc content/admin/journal bridge cho Phóng Sanh |
| `02-content/life-release-content-inventory.md` | Inventory canonical cho nghi thức, variants, warnings, FAQ, downloads của Phóng Sanh |
| `02-content/life-release-guide-nghi-thuc-co-ban.md` | Canonical content cho route nghi thức cơ bản của Phóng Sanh |
| `02-content/life-release-guide-cho-ban-than.md` | Canonical content cho variant Phóng Sanh hồi hướng cho bản thân |
| `02-content/life-release-guide-cho-nguoi-khac.md` | Canonical content cho variant Phóng Sanh hồi hướng cho người khác |
| `02-content/life-release-guide-luu-y-va-chuan-bi.md` | Canonical content cho checklist, warning, và preparation guide của Phóng Sanh |
| `02-content/life-release-guide-xu-ly-khi-co-loai-vat-tu-vong.md` | Canonical content cho flow xử lý phát sinh có species-specific counts |
| `02-content/life-release-guide-hoi-dap.md` | FAQ seed và support content cho Phóng Sanh |
| `02-content/media-library-experience-architecture.md` | Kiến trúc hub thư viện ảnh/video pháp môn và owner split với Wisdom-QA, Calendar |
| `02-content/media-library-content-inventory.md` | Inventory canonical cho hub, collections, featured slots, admin workspace của thư viện pháp môn |
| `02-content/use-cases/publish-media-library-collection.md` | Write-path chuẩn để publish media collections |
| `02-content/use-cases/publish-life-release-guide.md` | Write-path chuẩn để publish guide Phóng Sanh |
| `10-wisdom-qa/baihua-audiobook-text-first-architecture.md` | Kiến trúc text-first cho nguồn audiobook Bạch thoại theo sách / chương / audio companion |
| `10-wisdom-qa/baihua-audiobook-ingestion-inventory.md` | Inventory các lớp dữ liệu cần ingest từ source audiobook |
| `10-wisdom-qa/use-cases/ingest-baihua-audiobook-source.md` | Write-path chuẩn để nhập source audiobook vào book/chapter records |
| `09-vows-merit/use-cases/create-assisted-life-release-entry.md` | Write-path assisted entry cho life release journal |
| `11-contact/use-cases/update-contact-info.md` | Write-path cho singleton contact info |
| `11-contact/use-cases/manage-volunteer-directory.md` | Write-path cho CRUD + sort phụng sự viên |

## New design docs added — 2026-03-21 batch (Tài liệu thiết kế mới — đợt 2026-03-21)

Các file sau được thêm để lấp gap deferred tech, ops, security, và admin completeness:

| File | Lấp gap gì | Phase |
|---|---|---|
| `baseline/valkey-architecture.md` | Full Valkey topology, key namespaces, rate-limit migration, failure modes, rollback | Phase 2+ |
| `baseline/bullmq-worker-architecture.md` | Queue definitions, job schemas, idempotency, dead-letter, worker entrypoint | Phase 2+ |
| `baseline/outbox-dispatcher-model.md` | outbox_events schema, dispatcher cron, retry/dead-letter model, redrive | Phase 2+ |
| `06-search/meilisearch-architecture.md` | Index settings, sync strategy, SQL fallback contract, admin reindex ops | Phase 2+ |
| `baseline/pgbouncer-strategy.md` | Pool mode, config, trigger threshold, Docker Compose setup, rollback | Phase 2+ |
| `baseline/observability-architecture.md` | Phase 1 health/metrics, Phase 2 Prometheus/Grafana/Alertmanager, Phase 3 OTEL | All phases |
| `baseline/pgvector-decision.md` | Explicit exclusion with boundary, trigger conditions, artifact list if activated | Excluded |
| `baseline/r2-migration-plan.md` | Migration steps, dual-read period, storage adapter interface, rollback | Phase 2+ |
| `08-notification/push-notification-architecture.md` | VAPID Web Push, subscription lifecycle, worker handler, service worker, admin ops | Phase 2+ |
| `baseline/email-provider-decision.md` | Brevo SMTP config, delivery failure policy, retry semantics, anti-enumeration | Phase 1 |
| `baseline/storage-lifecycle.md` | Asset states, cleanup jobs (orphan/rejected/soft-delete), upload quota, disk monitoring | Phase 1+ |
| `baseline/cache-topology.md` | Cloudflare edge, Next.js ISR, TanStack Query staleTime, Valkey cache, invalidation rules | All phases |
| `baseline/secret-management.md` | Secret inventory, rotation procedures per secret type, compromise response, .gitignore | Phase 1 |
| `baseline/cicd-deploy-gates.md` | GitHub Actions CI pipeline, deploy gates, CD pipeline, branch protection, rollback | Phase 1+ |
| `baseline/waf-antibot-strategy.md` | Cloudflare WAF rules, Bot Fight Mode, Turnstile, honeypot, security headers, CSP nonce | Phase 1+ |
| `ops/health-contract.md` | Per-endpoint health check specification, check list, failure runbook, admin dashboard | Phase 1 |
| `design/ui/ADMIN_MODULE_SPECS.md` | Per-module admin workspace: 24 modules with filters/bulk/states/query-invalidation | Phase 1+ |

## Review rule (Quy tắc rà soát)

Mỗi khi một decision (quyết định) đổi trạng thái sang `implemented (đã triển khai)`, phải cập nhật đồng thời:

- file này
- doc owner (tài liệu sở hữu) liên quan
- code reference (tham chiếu mã nguồn) cụ thể
- nếu là ops/runtime feature (tính năng vận hành/thực thi), thêm evidence (bằng chứng) hoặc command (lệnh) vào runbook (tài liệu vận hành) tương ứng
