# DESIGN_DOC_RESIDUAL_BACKLOG

File này giữ các gap còn lại sau authority audit diện rộng của `design/`.

Mục tiêu:

- không để các việc `nên làm thêm` bị thất lạc trong chat history
- tách rõ `non-blocking cleanup` khỏi `authority drift` và khỏi `implementation truth`
- cho team biết cái nào đáng làm sau, nhưng chưa phải lý do để tự đoán khi code

## Status rule

- Các mục ở file này là `non-blocking unless promoted`.
- Không mục nào ở đây tự động đổi owner doc hay đổi readiness status.
- Khi một mục được làm thật, phải promote nội dung sang owner file tương ứng rồi mới xóa backlog row.
- Nếu trong lúc audit phát hiện `authority conflict`, `route canon mismatch`, hoặc `page/API gap` khiến dev phải tự đoán, mục đó **không được** park vào backlog này; phải sửa ngay ở owner doc trong cùng task.

## Promoted items

Các mục dưới đây **không còn là backlog mở**.
Chúng đã được promote vào owner docs tương ứng để chặn implementation phải tự đoán:

| ID | Topic | Promoted to | Kết luận |
|---|---|---|---|
| `RB-01` | Acceptance criteria cho `implementation-mapping` | `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | đã có `Family-level acceptance criteria` + rule chống nửa chuỗi artifact |
| `RB-02` | DTO projection safety rules | `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md` | đã có `Projection safety baseline` và safe/unsafe projection rules |
| `RB-03` | Pagination contract | `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md` | đã có `Pagination / filter / facet baseline`, offset/cursor shape |
| `RB-04` | Filter/facet contract | `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`, `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md` | đã có facet vocabulary + aggregate ownership cho page/search hubs |
| `RB-05` | Admin role narrowing matrix | `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`, `design/04-execution-overlay/web/PAGE_INVENTORY.md` | page gate và action narrowing đã được tách rõ |
| `RB-06` | Cross-module invalidation edge cases | `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | đã có `Cross-module invalidation edge rules` ở owner doc |

## Active backlog items

| ID | Topic | Current gap | Recommended owner | Why backlog, not blocker |
|---|---|---|---|---|
| `RB-07` | Wording refresh khi Phase 1 chuyển sang runtime thật | Một số từ như `safe scaffold window` sẽ cũ khi repo đi vào code/runtime thật | `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md`, `design/04-execution-overlay/repo/CODING_READINESS.md` | Việc đổi wording chỉ hợp lý khi trạng thái repo thay đổi |

## Redundancy sweep verdict

- Không có `safe delete` hoặc `safe merge` nào đủ chắc ở `00-governance`, `01-repo-constitution`, `02-platform-baseline`, `04-execution-overlay` tại thời điểm này.
- Lý do:
  - `governance` giữ meta-rules, không trùng authority với constitution/baseline/overlay
  - `constitution` giữ product direction và ownership, không được gộp vào baseline
  - `baseline` giữ runtime policy theo role, không được gộp vào overlay
  - `execution overlay` giữ implementation/scaffold/runtime truth, không được gộp ngược vào baseline
- Các cluster nhìn gần nhau nhất nhưng vẫn phải tách:
  - `VERSION_MATRIX.md` vs `DEPENDENCY_GOVERNANCE.md`: một file khóa exact pin + official docs entrypoint, file kia khóa upgrade policy
  - `NEST_REQUEST_PIPELINE.md` vs `NEST_FEATURE_ADOPTION_MATRIX.md` vs `NESTJS_11_ADOPTION.md`: pipeline baseline, feature status, và Nest 11 nuance là ba lớp khác nhau
  - `IMPLEMENTATION_MAPPING.md` vs `CODING_READINESS.md` vs `SCAFFOLD_GAP_REPORT.md`: implementation truth, planning gate, và residual scaffold gaps không cùng vai
  - `ADMIN_PAGE_API_MAPPING.md` vs `ADMIN_FEATURE_QUERY_PLAN.md` vs `APPS_ADMIN_SCAFFOLD_BACKLOG.md`: page-data map, query/invalidation plan, và rollout order không nên dồn một file

## Final gap matrix by lane

### Status semantics

- `covered`: authority chain đã khóa đủ, không còn doc gap đáng kể cho lane đó
- `doc-only`: design canon đã có nhưng lane này chưa phải runtime target hiện tại hoặc còn intentionally deferred
- `runtime-pending`: docs đã đủ chặt để code không đoán mò, nhưng artifact/runtime proof vẫn chưa có hoặc chưa được verify

| Lane | Status | Why this status | Canonical anchors |
|---|---|---|---|
| `FE` | `runtime-pending` | web/admin docs đã chặt cho IA, loaders, cache, SEO, component behavior; nhưng `apps/web` và `apps/admin` runtime truth vẫn chưa được chứng minh ở overlay | `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md`, `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md`, `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`, `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` |
| `BE` | `runtime-pending` | Nest pipeline, route canon, DTO shape, scaffold order, platform modules đã khóa; nhưng `apps/api` artifact thật vẫn đang nằm ở safe scaffold window | `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`, `design/02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md`, `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`, `design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md` |
| `Infra` | `runtime-pending` | edge/delivery, deploy gates, backup/restore, WAF đều có owner docs; nhưng deploy evidence, restore drill, và live topology vẫn chưa đủ runtime proof | `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md`, `design/02-platform-baseline/deploy-ops/DEPLOY_RUNBOOK.md`, `design/02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md`, `design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md` |
| `Data` | `runtime-pending` | Prisma/schema/cache/storage policy đã rõ; nhưng schema artifact, migrations, và persistence proof vẫn chưa hiện diện ở code/runtime mới | `design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md`, `design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md`, `design/02-platform-baseline/data-runtime/STORAGE_LIFECYCLE.md`, `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` |
| `Security` | `runtime-pending` | session/auth/upload/crypto/secrets/rate-limit/docs exposure đều có owner docs; nhưng hardening chỉ mới ở design cho rebuild direction, chưa có runtime proof đủ | `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md`, `design/02-platform-baseline/security-runtime/CRYPTO_POLICY.md`, `design/02-platform-baseline/security-runtime/SECRET_MANAGEMENT.md`, `design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md` |
| `Observability` | `doc-only` | phase-1 health/metrics contract đã có, nhưng observability lane rộng hơn vẫn chủ yếu là design canon; Prometheus/Grafana/OTEL còn phase-gated | `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md`, `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md`, `design/02-platform-baseline/deploy-ops/SLA_SLO.md` |
| `Async` | `doc-only` | event/outbox/queue/push/scheduler đã có canon để tránh bịa architecture, nhưng phần lớn lane này đang deferred hoặc phase 2+ | `design/04-execution-overlay/cross-module/EVENT_MODEL_POLICY.md`, `design/04-execution-overlay/cross-module/OUTBOX_EVENT_TAXONOMY.md`, `design/02-platform-baseline/api-runtime/TASK_SCHEDULING_POLICY.md`, `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` |
| `Governance` | `covered` | source priority, taxonomy, conflict resolution, import boundaries, implementation status, version/runtime entrypoint đã thành chain đọc tương đối kín | `design/00-governance/GOVERNANCE_SYSTEM.md`, `design/00-governance/IMPORT_AND_FORMAT.md`, `design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md`, `design/02-platform-baseline/dependency-version/VERSION_MATRIX.md` |

## Interpretation rule for the matrix

- Matrix này không nói lane đã implemented.
- `covered` chỉ nói authority/docs layer đã đủ chặt.
- `runtime-pending` nghĩa là có thể code theo canon mà không phải tự đoán, nhưng chưa được phép gọi là done/launch-safe.
- `doc-only` nghĩa là lane đã có thiết kế để chặn drift, nhưng chưa phải runtime priority hiện tại hoặc còn phase-gated rõ ràng.

## Explicitly not included here

- authority conflicts giữa owner docs
- route canon mismatch
- page/API mapping gap buộc dev phải đoán
- implementation truth mismatch với runtime

Các lỗi loại đó không được đẩy sang backlog này; phải sửa ngay trong owner docs.
