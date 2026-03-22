# ROOT_DOC_OWNERSHIP (Quyền sở hữu file gốc trong design)

File này tồn tại để xử lý đúng vấn đề audit đã chỉ ra:

- root docs bị trùng ý
- sửa một policy phải nhớ nhiều file
- AI dễ đọc nhầm file giải thích thành file chốt luật

Mục tiêu của file này là chốt:

- file nào là `canonical owner (file chủ sở hữu chuẩn)`
- file nào chỉ được `tóm tắt / dẫn link / giải thích`
- file nào là `ops/log/template`, không phải nơi phát minh rule mới

## Precedence rule (Quy tắc ưu tiên)

Nếu 2 file mâu thuẫn nhau, dùng thứ tự ưu tiên này:

1. `DECISIONS.md`
2. file owner chuyên biệt bên dưới
3. `README.md` và các file overview/tóm tắt

## Ownership rules by pattern

- `overview/*.md` là tài liệu orientation (định hướng đọc) và summary (tóm tắt), không phải nơi chốt policy mới.
- `NN-domain/decisions.md` là canonical decision owner trong boundary của domain đó. Nếu mâu thuẫn với `DECISIONS.md`, `DECISIONS.md` thắng và file domain phải được sửa lại.
- `NN-domain/module-map.md` là owner cho module boundaries, responsibilities, và inbound/outbound interactions của domain đó.
- `NN-domain/contracts.md` là owner cho contract mức domain: route groups, DTO shapes mức design, error mapping, invariants.
- `NN-domain/schema.dbml` là owner cho shape dữ liệu mức domain ở phase design; merge thực tế sang runtime schema đi qua `tracking/prisma-schema-plan.md`.
- `NN-domain/flows.mmd` và `NN-domain/*state.mmd` là owner cho state transition diagrams; không tự phát minh policy mới ngoài owner docs của domain.
- `NN-domain/use-cases/*.md` là owner cho write-path behavior của từng flow; route string vẫn phải khớp `ui/PAGE_INVENTORY.md` và `tracking/api-route-inventory.md` khi có bề mặt web/API liên quan.

## Root file ownership map

| File | Vai trò duy nhất | Được phép chứa | Không được làm |
|---|---|---|---|
| `README.md` | mục lục + cách đọc | read order, launch scope, pointer | không lặp lại full policy |
| `DECISIONS.md` | canonical decision baseline | current direction, phase baseline, source-of-truth rules, anti-goals | không thay security/nest/detail owner files |
| `baseline/repo-structure.md` | folder/file placement owner | repo shape, module anatomy, placement rules | không lặp full security/infra policy |
| `baseline/platform-modules.md` | platform/control-plane owner | sessions, audit, flags, rate-limit, storage, health, metrics | không ôm domain module contracts |
| `baseline/nest-baseline.md` | NestJS app pipeline owner | request pipeline, Zod, Pino, guards, error envelope | không lặp full infra policy |
| `baseline/security.md` | security policy owner | auth, CSRF, CORS, cookies, upload security, webhook, secrets | không lặp infra topology |
| `baseline/infra.md` | infra phase owner | phase baseline, optional components, trigger rules | không biến thành deep ops tutorial |
| `baseline/high-traffic-resilience-plan.md` | growth-safe launch owner | launch profiles, traffic/crawl/abuse pressure stance, supporting tech order, anti-collapse rules | không thay failure-mode detail hay search contract một mình |
| `baseline/startup-dependency-order.md` | startup/init owner | bootstrap order, per-module init dependency, baseline fail behavior | không lặp health response payload chi tiết |
| `tracking/audit-policy.md` | audit event taxonomy owner | what to log, actor/action/resource baseline | không lặp auth policy |
| `baseline/sla-slo.md` | service objectives owner | latency, availability, measurement notes | không lặp implementation status |
| `baseline/failure-modes.md` | failure behavior owner | degrade/fail-closed/fail-open matrix | không lặp full infra tutorial |
| `ops/backup-restore.md` | restore procedure owner | backup/restore commands, acceptance criteria | không phát minh policy security mới |
| `ops/health-contract.md` | health endpoint contract owner | `/health/live`, `/health/ready`, `/health/startup` exact checks | không lặp metrics/logging strategy |
| `ops/restore-drill-log.md` | drill evidence log | dated drill records | không chứa rule mới |
| `tracking/implementation-mapping.md` | implementation truth owner | status `implemented/required before launch/planned/forbidden for now/explicit exclusion` | không lặp rationale dài |
| `tracking/module-interactions.md` | cross-module interaction owner | ownership boundaries, direct vs async interaction | không lặp repo structure |
| `tracking/api-route-inventory.md` | API route inventory owner | route groups, auth scope, owner module | không thay use-case detail |
| `tracking/admin-page-api-mapping.md` | admin page-to-data mapping owner | admin page route -> API group -> query keys -> invalidation rules | không thay visual layout hay API canon |
| `tracking/apps-admin-scaffold-backlog.md` | admin scaffold backlog owner | feature rollout order, queries.ts/mutations.ts plan, blockers before admin coding | không thay API canon hay page route canon |
| `tracking/admin-feature-query-plan.md` | admin query/mutation factory owner | feature folder -> query keys -> query exports -> mutation exports -> invalidation graph | không thay API canon hay visual IA |
| `tracking/env-inventory.md` | env inventory owner | env names, scope, required/optional, owner app | không lặp full deploy steps |
| `tracking/error-code-registry.md` | error code owner | canonical error codes and meanings | không lặp route contracts |
| `baseline/migration-strategy.md` | DB/schema evolution owner | naming, rollout, rollback, seed rules | không lặp infra topology |
| `baseline/testing-strategy.md` | verification owner | test pyramid, coverage targets, seed/test data rules | không lặp domain ownership |
| `baseline/frontend-architecture.md` | web/admin frontend owner | RSC/client split, data fetching, UI package usage | không lặp backend auth policy |
| `ops/deploy-runbook.md` | deploy/rollback procedure owner | deploy, rollback, migration-fail handling | không thay backup runbook |
| `overview/terminology.md` | terminology owner | PMTL terms + `English (Việt)` notation | không lặp qua nhiều root files |
| `overview/source-analysis.md` | source-derived feature surface owner | official source notes + feature implications | không lặp source summaries |
| `overview/architecture-at-a-glance.md` | 1-minute architecture orientation owner | entrypoint tóm tắt đúng current direction | không chốt rule mới thay owner docs |
| `overview/domain-map.md` | domain index owner | domain grouping, quick pointers | không override module ownership |
| `overview/execution-map.md` | execution-path orientation owner | read order, implementation orientation, cross-link map | không thay implementation truth |
| `overview/phase-activation-matrix.md` | phase activation summary owner | phase summary, activation checklist tóm tắt | không thay decision trigger gốc |
| `overview/roadmap.md` | roadmap summary owner | planning narrative, sequencing note | không đổi launch blocker semantics |
| `baseline/writing-standards.md` | docs writing owner | contract/use-case standards | không lặp template ở nhiều file |
| `CORE_PRACTICE_CONSTITUTION.md` | product intent + core loop owner | 8-step core practice loop, anti-gamification laws, module ownership map, launch screen table, acceptance criteria per step | không overwrite module contract detail; tóm tắt thì link về module doc |
| `deep-research-report.md` | research appendix owner | research notes, source synthesis, rationale backlog | không là canonical policy owner nếu chưa được promote sang owner file |
| `SVG_PRECISION_WORKFLOW.md` | deterministic SVG workflow owner | SVG asset generation rules, output discipline | không là launch gate hay route owner |
| `ui/LANDING_PAGE_DESIGN.md` | landing page visual spec owner | 7 sections layout, typography, interaction, animation, SEO, performance targets | không là route owner; route authority vẫn là PAGE_INVENTORY.md |
| `ui/HOMEPAGE_CONSTITUTION.md` | homepage intent/spec owner | homepage content hierarchy, narrative, section obligations | không override route canon hay landing visual rules |
| `ui/SPIRITUAL_APP_SCREENS.md` | app screen design spec owner | screen-by-screen layout, component behavior, elderly UX rules, states | không là route owner; không override module contracts |
| `ui/PAGE_INVENTORY.md` | route canon owner | URL string, auth level, module owner, mobile notes, page-level purpose | không redefine IA hierarchy hay nav interaction rules |
| `ui/NAVIGATION_ARCHITECTURE.md` | IA + navigation structure owner | IA hierarchy, nav patterns, gating rules, deep linking, a11y | route strings phải khớp PAGE_INVENTORY.md; khi conflict về URL string thì PAGE_INVENTORY.md thắng |
| `ui/USER_FLOWS.md` | journey owner | step-by-step user flows, branching states, success/failure path | không tự phát minh route canon |
| `ui/COMPONENT_SPECS.md` | component behavior owner | component anatomy, states, props-level behavior, accessibility expectations | không override visual system owner docs |
| `ui/DESIGN_PRINCIPLES.md` | visual system owner | tokens, typography, spacing, surfaces, motion baseline, phase-scoped visual rules | không tự đổi route hoặc data ownership |
| `ui/ELDERLY_UX.md` | elderly accommodation owner | readability, touch, motion, cognition accommodations | không override phase scope nếu DESIGN_PRINCIPLES đã chốt khác |
| `ui/ADMIN_ARCHITECTURE.md` | admin SPA structure owner | SPA shells, layout, workspace patterns, query/state conventions | không override backend authority |
| `ui/ADMIN_MODULE_SPECS.md` | admin workspace owner | filters, bulk actions, table states, invalidation rules | không đổi route canon một mình |
| `07-calendar/luc-trai-days-canon.md` | `六齋日` canon owner | day-role matrix, fallback semantics, warning families, advisory obligations cho ngày mùng 8/14/15/23/29/30 | không thay source-backed doctrine owner của Wisdom-QA |
| `10-wisdom-qa/btpp-library-canon.md` | BTPP library owner | public route slug, hub IA, glossary, source taxonomy, FAQ, warning policy cho BTPP/Little House cross-surface | không thay data schema chi tiết một mình |
| `10-wisdom-qa/manual-translation-editor-workflow.md` | wisdom manual editor flow owner | current manual-first translation flow, required editor fields, duplicate-check/slug-preview/draft gate, anti-auto-publish stance | không thay phase-later automation architecture một mình |
| `10-wisdom-qa/translation-automation-architecture.md` | wisdom automation owner | orchestrator stance, MCP/API role split, duplicate guard, slug preview, import-job lifecycle cho lane auto-ingest/auto-translate | không thay source taxonomy hoặc publish policy một mình |
| `tracking/wisdom-qa-family-audit.md` | Wisdom-QA audit owner | family inventory, taxonomy drift, unresolved gaps, next audit order cho `10-wisdom-qa` | không tự override canon route nếu `btpp-library-canon.md` đã chốt |
| `tracking/xlch-official-alignment.md` | official XLCH alignment owner | official family map signals, what PMTL must preserve from `xlch.org`, alignment backlog | không tự override canon route nếu owner docs đã chốt |

## Duplication rule (Quy tắc chống trùng)

Khi một file không phải owner cần nhắc lại policy:

- chỉ tóm tắt 1-3 bullet
- dẫn link tới file owner
- không copy toàn bộ nội dung

Ví dụ đúng:

- "`Valkey` chỉ bật khi có measured pain; xem `DECISIONS.md`."

Ví dụ sai:

- copy lại đầy đủ bảng phase baseline, trigger thresholds, accepted/deferred tool status

## Student note (Ghi chú cho sinh viên)

Audit đúng ở điểm này:

- docs nhiều không đồng nghĩa docs mạnh
- thiếu ownership cho từng file thì docs sẽ tự cắn nhau

File này là cái khóa để từ nay nếu anh sửa 1 policy, anh biết sửa đúng `owner file` trước.
