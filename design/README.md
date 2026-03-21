# PMTL_VN Design

Thư mục này chốt architecture (kiến trúc), boundary (ranh giới trách nhiệm), ownership (quyền sở hữu dữ liệu), và launch guardrails (rào chắn bảo vệ khi ra mắt) cho PMTL_VN.
Nó không phải bằng chứng rằng runtime (môi trường thực thi) đã tồn tại.

## Current truth (Thực trạng hiện tại)

- Đây là `target design (thiết kế mục tiêu)` cho hướng `rebuild backend (xây dựng lại hệ thống phía sau)` với NestJS.
- Không file nào trong `design/` được coi là `implemented (đã triển khai)` nếu chưa có:
  - code reference (tham chiếu mã nguồn)
  - route/module/service (đường dẫn/mô-đun/lớp xử lý nghiệp vụ) tương ứng
  - schema/migration (lược đồ/di cư dữ liệu) tương ứng
  - runtime artifact (sản phẩm thực thi) tương ứng
- File khóa sổ chuyện này là [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md).
- Các rule cho major versions hiện hành đã được rà lại ở mức design vào `2026-03-21`; nếu audit cũ mâu thuẫn, ưu tiên các root docs hiện hành thay vì audit notes.

## Orientation in 2 files

- Muốn hiểu kiến trúc trong 1 phút: [architecture-at-a-glance.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/architecture-at-a-glance.md)
- Muốn biết tech nào được bật khi nào: [phase-activation-matrix.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/phase-activation-matrix.md)

## Readiness semantics

- `design-ready`: design đủ rõ để bắt đầu implementation planning
- `implementation-ready`: artifact runtime dự kiến và owner code path đã được map đủ cụ thể
- `launch-ready`: launch blockers thật đã pass, gồm runtime evidence như restore drill

Không được dùng `design-ready` để ám chỉ runtime đã tồn tại.

## First-launch scope (Phạm vi ra mắt lần đầu)

### In scope (Nằm trong phạm vi)

- `apps/web`
- `apps/api`
- `apps/admin`
- `Postgres`
- `Caddy`
- local storage abstraction (lớp trừu tượng lưu trữ nội bộ)
- auth/session hardening (thắt chặt bảo mật phiên đăng nhập)
- upload hardening (thắt chặt bảo mật tải tập tin)
- audit logs (nhật ký kiểm tra)
- feature flags (cờ tính năng)
- backup + restore discipline (kỷ luật sao lưu và phục hồi)

### Explicitly deferred (Tạm hoãn rõ ràng)

- `Valkey`
- `BullMQ`
- `apps/worker` (tiến trình xử lý nền)
- `outbox_events` (sự kiện chờ phát đi)
- `Meilisearch`
- `PgBouncer`
- Prometheus/Grafana/Alertmanager (bộ công cụ giám sát và cảnh báo)
- tracing (truy vết thực thi)

### Explicitly excluded for current direction (Loại khỏi hướng hiện tại một cách rõ ràng)

- `pgvector` — không phải deferred; chỉ xem xét lại khi trigger trong `baseline/pgvector-decision.md` được đáp ứng

### Forbidden for now (Bị cấm ở hiện tại)

- bật queue (hàng đợi) trước khi có idempotency (tính lặp lại không đổi kết quả) + retry policy (chính sách thử lại)
- bật Meilisearch trước khi search SQL (tìm kiếm bằng cơ sở dữ liệu) đo được là đau (chậm)
- public upload (tải lên công khai) trước khi chốt MIME sniffing (kiểm tra loại tập tin) + delete authorization (ủy quyền xóa)
- tự host stack observability (hệ thống giám sát) nặng khi chưa từng restore DB (phục hồi cơ sở dữ liệu) thành công
- gọi là production-safe (an toàn vận hành) nếu chưa có restore drill pass (buổi diễn tập phục hồi thành công)

## Repo quickstart (Khởi động nhanh kho mã nguồn)

### Prerequisites (Điều kiện tiên quyết)

- `Node.js` LTS
- `pnpm`
- Docker / Docker Compose khi cần chạy local services (dịch vụ nội bộ)

### Commands (Các lệnh)

- install (cài đặt): `pnpm install`
- dev (phát triển): `pnpm dev`
- test (kiểm thử): `pnpm test`
- lint (kiểm tra lỗi trình bày): `pnpm lint`
- typecheck (kiểm tra kiểu): `pnpm typecheck`
- build (xây dựng bản chạy): `pnpm build`

### Runtime entrypoints (Các điểm đầu vào thực thi)

- `apps/web`: public frontend (giao diện công khai)
- `apps/api`: backend chính (hệ thống xử lý chính)
- `apps/admin`: admin UI riêng (giao diện quản trị)
- `infra`: deploy/proxy/ops scripts (kịch bản triển khai và vận hành)
- `design`: target architecture (kiến trúc mục tiêu) + contracts (hợp đồng nghiệp vụ) + launch gates (cổng kiểm soát ra mắt)

## Launch gate (Cổng kiểm soát ra mắt)

- [ ] auth/session policy finalized (chốt xong chính sách phiên đăng nhập)
- [ ] upload/media policy finalized (chốt xong chính sách truyền thông/tải lên)
- [ ] restore drill passed (diễn tập phục hồi đã vượt qua)
- [ ] `audit_logs` implemented (đã triển khai nhật ký kiểm tra)
- [ ] `feature_flags` implemented (đã triển khai cờ tính năng)
- [ ] first incident runbook written (đã viết xong tài liệu xử lý sự cố đầu tiên)
- [ ] first risky write-path reviewed end-to-end (đã rà soát xong luồng ghi dữ liệu rủi ro đầu tiên từ đầu đến cuối)

## Read in order (Thứ tự đọc)

1. [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md)
2. [ROOT_DOC_OWNERSHIP.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ROOT_DOC_OWNERSHIP.md)
3. [domain-map.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/domain-map.md)
4. [execution-map.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/execution-map.md)
5. [architecture-principles.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/architecture-principles.md)
6. [repo-structure.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/repo-structure.md)
7. [platform-modules.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/platform-modules.md)
8. [nest-baseline.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/nest-baseline.md)
9. [security.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/security.md)
10. [infra.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/infra.md)
11. [servercn-design-reference.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/servercn-design-reference.md)
12. [terminology.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/terminology.md)
13. [source-analysis.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/source-analysis.md)
14. [writing-standards.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/writing-standards.md)
15. [api-route-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/api-route-inventory.md)
16. [env-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/env-inventory.md)
17. [error-code-registry.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/error-code-registry.md)
18. [migration-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/migration-strategy.md)
19. [testing-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/testing-strategy.md)
20. [frontend-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md)
21. [deploy-runbook.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/deploy-runbook.md)
22. [backup-restore.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/backup-restore.md)
23. [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)
24. [startup-dependency-order.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/startup-dependency-order.md)
25. [outbox-event-taxonomy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/outbox-event-taxonomy.md)
26. [apps-api-scaffold-order.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/apps-api-scaffold-order.md)
27. [restore-drill-log.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/restore-drill-log.md)
28. [DESIGN_PRINCIPLES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/DESIGN_PRINCIPLES.md)
29. [ADMIN_ARCHITECTURE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/ADMIN_ARCHITECTURE.md)
30. [coding-readiness.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/coding-readiness.md)
31. [prisma-schema-plan.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/prisma-schema-plan.md)
32. [ELDERLY_UX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/ELDERLY_UX.md)
33. [SVG_PRECISION_WORKFLOW.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/SVG_PRECISION_WORKFLOW.md)
34. [CORE_PRACTICE_CONSTITUTION.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/CORE_PRACTICE_CONSTITUTION.md)
35. [ui/LANDING_PAGE_DESIGN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/LANDING_PAGE_DESIGN.md)
36. [ui/SPIRITUAL_APP_SCREENS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/SPIRITUAL_APP_SCREENS.md)
37. [ui/NAVIGATION_ARCHITECTURE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/NAVIGATION_ARCHITECTURE.md)
38. [ui/ADMIN_MODULE_SPECS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/ADMIN_MODULE_SPECS.md)
39. [baseline/observability-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/observability-architecture.md)
40. [baseline/valkey-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/valkey-architecture.md)
41. [baseline/bullmq-worker-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/bullmq-worker-architecture.md)
42. [baseline/outbox-dispatcher-model.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/outbox-dispatcher-model.md)
43. [06-search/meilisearch-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/meilisearch-architecture.md)
44. [baseline/pgbouncer-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/pgbouncer-strategy.md)
45. [baseline/r2-migration-plan.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/r2-migration-plan.md)
46. [baseline/email-provider-decision.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/email-provider-decision.md)
47. [baseline/storage-lifecycle.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/storage-lifecycle.md)
48. [baseline/cache-topology.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cache-topology.md)
49. [baseline/secret-management.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/secret-management.md)
50. [baseline/cicd-deploy-gates.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md)
51. [baseline/waf-antibot-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/waf-antibot-strategy.md)
52. [baseline/pgvector-decision.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/pgvector-decision.md)
53. [08-notification/push-notification-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/08-notification/push-notification-architecture.md)
54. [ops/health-contract.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/health-contract.md)

## Key docs by purpose (Nhóm tài liệu chính)

### Backend baseline
| File | Nội dung |
|---|---|
| [startup-dependency-order.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/startup-dependency-order.md) | Thứ tự khởi động platform modules + fail behavior |
| [outbox-event-taxonomy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/outbox-event-taxonomy.md) | Event nào đi outbox, event schema, idempotency |
| [unified-index-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/unified-index-mapping.md) | Field mapping Content + Wisdom-QA → search index |
| [offline-bundle-delta-sync.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/10-wisdom-qa/offline-bundle-delta-sync.md) | Delta sync schema cho offline bundles |
| [assisted-entry-workflow.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/09-vows-merit/assisted-entry-workflow.md) | Workflow admin nhập liệu thay member |
| [advisory-ownership.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/07-calendar/advisory-ownership.md) | Ranh giới Calendar vs Wisdom-QA |
| [organizational-events-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/07-calendar/organizational-events-architecture.md) | Kiến trúc sự kiện tổ chức: agenda, speakers, CTA, assets |
| [daily-practice-experience-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/daily-practice-experience-architecture.md) | Kiến trúc public/admin/tracker cho Kinh Bài Tập Hằng Ngày |
| [daily-practice-content-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/daily-practice-content-inventory.md) | Inventory canonical cho groups, guides, presets, FAQ, downloads |
| [life-release-experience-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-experience-architecture.md) | Kiến trúc public/admin/journal bridge cho Phóng Sanh |
| [life-release-content-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-content-inventory.md) | Inventory canonical cho nghi thức, variants, warnings, FAQ, downloads của Phóng Sanh |
| [life-release-guide-nghi-thuc-co-ban.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-guide-nghi-thuc-co-ban.md) | Canonical guide cho route nghi thức cơ bản của Phóng Sanh |
| [life-release-guide-cho-ban-than.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-guide-cho-ban-than.md) | Canonical guide cho variant Phóng Sanh hồi hướng cho bản thân |
| [life-release-guide-cho-nguoi-khac.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-guide-cho-nguoi-khac.md) | Canonical guide cho variant Phóng Sanh hồi hướng cho người khác |
| [life-release-guide-luu-y-va-chuan-bi.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-guide-luu-y-va-chuan-bi.md) | Checklist, guardrails, và warning đạo đức cho Phóng Sanh |
| [life-release-guide-xu-ly-khi-co-loai-vat-tu-vong.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-guide-xu-ly-khi-co-loai-vat-tu-vong.md) | Guide nhạy cảm cho flow phát sinh khi có loài vật tử vong |
| [life-release-guide-hoi-dap.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/life-release-guide-hoi-dap.md) | FAQ seed cho Phóng Sanh |
| [media-library-experience-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/media-library-experience-architecture.md) | Kiến trúc hub thư viện ảnh/video pháp môn và owner split với Wisdom-QA, Calendar |
| [media-library-content-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/media-library-content-inventory.md) | Inventory canonical cho hub, collections, featured slots, và admin workspace của thư viện pháp môn |
| [baihua-audiobook-text-first-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/10-wisdom-qa/baihua-audiobook-text-first-architecture.md) | Kiến trúc text-first cho nguồn audiobook Bạch thoại theo sách / chương / audio companion |
| [baihua-audiobook-ingestion-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/10-wisdom-qa/baihua-audiobook-ingestion-inventory.md) | Inventory các lớp dữ liệu cần ingest từ source audiobook |
| [prisma-schema-plan.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/prisma-schema-plan.md) | Merge 10 .dbml → Prisma schema, enums, FK graph, naming |

### Infra & Ops — Phase 2+ ready design docs
| File | Nội dung |
|---|---|
| [valkey-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/valkey-architecture.md) | Valkey topology, key namespaces, rate-limit migration, failure modes, rollback |
| [bullmq-worker-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/bullmq-worker-architecture.md) | Queue definitions, job schemas, idempotency, dead-letter, worker entrypoint |
| [outbox-dispatcher-model.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/outbox-dispatcher-model.md) | outbox_events schema, dispatcher cron, retry/dead-letter, redrive API |
| [meilisearch-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/06-search/meilisearch-architecture.md) | Index settings, sync strategy, SQL fallback contract, monitoring |
| [pgbouncer-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/pgbouncer-strategy.md) | Pool mode, trigger threshold, Docker Compose config, rollback |
| [r2-migration-plan.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/r2-migration-plan.md) | Storage adapter interface, 8-step migration, dual-read period, rollback |
| [push-notification-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/08-notification/push-notification-architecture.md) | VAPID Web Push, subscription lifecycle, worker handler, admin ops |
| [observability-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/observability-architecture.md) | Phase 1 health+metrics, Phase 2 Prometheus+Grafana+Alertmanager, Phase 3 OTEL |
| [pgvector-decision.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/pgvector-decision.md) | Explicit exclusion with boundary, trigger conditions, artifact list if activated |

### Security & Ops — Phase 1 required
| File | Nội dung |
|---|---|
| [email-provider-decision.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/email-provider-decision.md) | Brevo SMTP, delivery failure policy, retry semantics, anti-enumeration |
| [storage-lifecycle.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/storage-lifecycle.md) | Asset state machine, 5 cleanup jobs, upload quota, disk monitoring |
| [cache-topology.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cache-topology.md) | 4-layer cache, invalidation rules, ISR, TanStack Query staleTime, Valkey cache |
| [secret-management.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/secret-management.md) | Secret inventory, rotation procedures, compromise response, .gitignore enforcement |
| [cicd-deploy-gates.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/cicd-deploy-gates.md) | GitHub Actions CI/CD, 4 automated gates + 1 human gate, auto-rollback |
| [waf-antibot-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/waf-antibot-strategy.md) | Cloudflare WAF rules, Bot Fight Mode, honeypot, CSP nonce, security headers |
| [health-contract.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/health-contract.md) | Exact check lists for /health/live, /health/ready, /health/startup |

### UI/UX design (7 files)
| File | Nội dung |
|---|---|
| [PAGE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/PAGE_INVENTORY.md) | Route inventory đầy đủ cho public/member/admin surfaces, kể cả Little House, Kinh Bài Tập, Phóng Sanh, search ops, notification ops |
| [USER_FLOWS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/USER_FLOWS.md) | Các user journeys chính cho onboarding, daily practice, event attendance, admin operations, assisted entry |
| [COMPONENT_SPECS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/COMPONENT_SPECS.md) | Specs cho 30+ components kể cả elderly-specific rules và companion-guide patterns |
| [DESIGN_PRINCIPLES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/DESIGN_PRINCIPLES.md) | Color system, typography, spacing, interaction patterns, premium details |
| [ADMIN_ARCHITECTURE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/ADMIN_ARCHITECTURE.md) | shadcn-admin: Vite + React SPA, sidebar, DataTable, command palette |
| [ELDERLY_UX.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/ELDERLY_UX.md) | Elderly-specific UX rules per module |
| [ADMIN_MODULE_SPECS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ui/ADMIN_MODULE_SPECS.md) | 24 admin workspaces với filters, bulk actions, states, query invalidation rules |

### Deterministic SVG assets
| File | Nội dung |
|---|---|
| [SVG_PRECISION_WORKFLOW.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/SVG_PRECISION_WORKFLOW.md) | Khi nào dùng `svg-precision`, output path nào trong `design/`, và quy tắc spec JSON + SVG + preview |

### Coding readiness
| File | Nội dung |
|---|---|
| [coding-readiness.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/coding-readiness.md) | 8/8 bugs fixed, feature flags, rate-limits, migration order, coding waves |
| [apps-api-scaffold-order.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/apps-api-scaffold-order.md) | thứ tự scaffold `apps/api`, blocker theo bước, file/module tối thiểu trước khi sang bước sau |

## Where each rule lives (Quy tắc nằm ở đâu)

- Decision baseline hợp nhất (Nền tảng quyết định hợp nhất): [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md)
- Repo structure baseline (Nền tảng cấu trúc thư mục): [repo-structure.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/repo-structure.md)
- Platform/control-plane baseline (Nền tảng mô-đun hệ thống cốt lõi): [platform-modules.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/platform-modules.md)
- Root-doc ownership (Quyền sở hữu của file gốc): [ROOT_DOC_OWNERSHIP.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ROOT_DOC_OWNERSHIP.md)
- Terminology + notation (Thuật ngữ và quy tắc ghi chú): [terminology.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/terminology.md)
- Source-derived feature surface (Bề mặt chức năng rút ra từ nguồn): [source-analysis.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/source-analysis.md)
- Writing standards (Chuẩn viết contract và use-case): [writing-standards.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/writing-standards.md)
- API route inventory (Danh mục route API): [api-route-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/api-route-inventory.md)
- Env inventory (Danh mục biến môi trường): [env-inventory.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/env-inventory.md)
- Error code registry (Danh mục mã lỗi): [error-code-registry.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/error-code-registry.md)
- Migration strategy (Chiến lược migration): [migration-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/migration-strategy.md)
- Testing strategy (Chiến lược kiểm thử): [testing-strategy.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/testing-strategy.md)
- Frontend architecture (Kiến trúc frontend): [frontend-architecture.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/frontend-architecture.md)
- Infra phase rules (Quy tắc phân pha hạ tầng): [infra.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/infra.md)
- NestJS app contract (Hợp đồng ứng dụng NestJS): [nest-baseline.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/nest-baseline.md)
- Servercn design reference (Tài liệu tham chiếu Servercn cho giai đoạn design-first): [servercn-design-reference.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/servercn-design-reference.md)
- Security contract (Hợp đồng bảo mật): [security.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/security.md)
- Deterministic SVG workflow (Quy trình SVG có cấu trúc ổn định): [SVG_PRECISION_WORKFLOW.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/SVG_PRECISION_WORKFLOW.md)
- Deploy procedure (Quy trình triển khai): [deploy-runbook.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/deploy-runbook.md)
- Failure behavior (Hành vi khi lỗi): [failure-modes.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/failure-modes.md)
- SLO targets and how to measure them (Mục tiêu chất lượng dịch vụ và cách đo): [sla-slo.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/sla-slo.md)
- Recovery procedure (Quy trình phục hồi): [backup-restore.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/ops/backup-restore.md)
- Runtime mapping status (Trạng thái ánh xạ thực thi): [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)

## Module reading rule (Quy tắc đọc theo mô-đun)

- Chọn đúng owner module (mô-đun sở hữu) trước.
- Đọc `module-map.md` (bản đồ mô-đun).
- Đọc `contracts.md` (hợp đồng nghiệp vụ).
- Đọc use-case (kịch bản sử dụng) tương ứng.
- Với flow (luồng) nguy hiểm, đọc thêm:
  - [manage-auth-session.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/01-identity/use-cases/manage-auth-session.md)
  - [upload-media-asset.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-content/use-cases/upload-media-asset.md)

## First implementation wave (Làn sóng triển khai đầu tiên)

Nếu đang rebuild (xây dựng lại) từ đầu một mình, mặc định chỉ ưu tiên 4 cụm trước:

1. `apps/api` baseline + `platform modules`
2. `01-identity`
3. `02-content`
4. upload/media boundary (ranh giới tải lên/truyền thông)
5. `03-community`

Các module còn lại tồn tại như target design (thiết kế mục tiêu), không phải lý do để code song song hết ngay.

## Status semantics (Ý nghĩa trạng thái)

- `implemented`: đã có code/runtime artifact (sản phẩm thực thi) thật
- `required before launch`: launch blocker (vật cản ngăn chặn ra mắt)
- `planned`: hướng đã chốt, chưa bật
- `forbidden for now`: bị cấm ở hiện tại
- `explicit exclusion`: bị loại khỏi hướng hiện tại; chỉ reconsider khi trigger trong decision doc được đáp ứng

## Anti-junior traps (Chặn các "cái bẫy" của người mới)

- Không thêm service (lớp nghiệp vụ) chỉ vì sơ đồ trông enterprise (doanh nghiệp) hơn.
- Không để docs dài tạo ảo giác runtime (môi trường thực thi) đã tồn tại.
- Không dùng `design/` để suy ra implementation (triển khai) nếu chưa qua [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md).
- Không coi validation (kiểm tra đầu vào) là thay thế security architecture (kiến trúc bảo mật).
- Không coi backup (sao lưu) có cron (tự động theo giờ) là đủ nếu chưa restore pass (phục hồi thành công).

## Learning guide (Hướng dẫn học tập)

Roadmap (lộ trình) học VPS/production cho người mới đã được tách khỏi `design/` và đặt ở:

- [docs/learning/STUDENT_VPS_PRODUCTION_ROADMAP.md](C:/Users/ADMIN/DEV2/PMTL_VN/docs/learning/STUDENT_VPS_PRODUCTION_ROADMAP.md)
