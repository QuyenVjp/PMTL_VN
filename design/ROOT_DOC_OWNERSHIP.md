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
- canonical path cho bản đồ luồng dữ liệu là `overview/system-data-flow-map.md`; không tạo thêm root-level alias song song.
- `NN-domain/decisions.md` là canonical decision owner trong boundary của domain đó. Nếu mâu thuẫn với `DECISIONS.md`, `DECISIONS.md` thắng và file domain phải được sửa lại.
- `NN-domain/module-map.md` là owner cho module boundaries, responsibilities, và inbound/outbound interactions của domain đó.
- `NN-domain/contracts.md` là owner cho contract mức domain: route groups, DTO shapes mức design, error mapping, invariants.
- `NN-domain/schema.dbml` là owner cho shape dữ liệu mức domain ở phase design; merge thực tế sang runtime schema đi qua `tracking/prisma-schema-plan.md`.
- `NN-domain/flows.mmd` và `NN-domain/*state.mmd` là owner cho state transition diagrams; không tự phát minh policy mới ngoài owner docs của domain.
- `NN-domain/use-cases/*.md` là owner cho write-path behavior của từng flow; route string vẫn phải khớp `ui/PAGE_INVENTORY.md` và `tracking/api-route-inventory.md` khi có bề mặt web/API liên quan.

## Root file ownership map

| File | Vai trò duy nhất | Được phép chứa | Không được làm |
|---|---|---|---|
| `ROOT_DOC_OWNERSHIP.md` | ownership registry owner | precedence rules, root-file roles, anti-duplication guardrails | không tự phát minh policy domain thay owner docs |
| `README.md` | mục lục + cách đọc | read order, launch scope, pointer | không lặp lại full policy |
| `DECISIONS.md` | canonical decision baseline | current direction, phase baseline, source-of-truth rules, anti-goals | không thay security/nest/detail owner files |
| `baseline/repo-structure.md` | folder/file placement owner | repo shape, module anatomy, placement rules | không lặp full security/infra policy |
| `baseline/platform-modules.md` | platform/control-plane owner | sessions, audit, flags, rate-limit, storage, health, metrics | không ôm domain module contracts |
| `baseline/nest-baseline.md` | NestJS app pipeline owner | request pipeline, Zod, Pino, guards, error envelope | không lặp full infra policy |
| `baseline/nestjs-11-adoption.md` | NestJS 11 feature adoption owner | exact scaffold line, Express v5 route stance, logger policy, selective use/defer list for Nest 11 capabilities | không thay request pipeline hay repo phase rules một mình |
| `baseline/security.md` | security policy owner | auth, CSRF, CORS, cookies, upload security, webhook, secrets | không lặp infra topology |
| `baseline/infra.md` | infra phase owner | phase baseline, optional components, trigger rules | không biến thành deep ops tutorial |
| `baseline/ai-debugging-discipline.md` | AI-assisted debugging owner | evidence-first rules for LLM debugging, context hygiene, scope reduction, and verification expectations | không override runtime verification rule một mình |
| `baseline/managed-platform-patterns.md` | managed-service learning owner | imported patterns from Supabase-like platforms, what PMTL may learn now/later, and what must stay out | không thay authority rules trong `DECISIONS.md` một mình |
| `baseline/high-traffic-resilience-plan.md` | growth-safe launch owner | launch profiles, traffic/crawl/abuse pressure stance, supporting tech order, anti-collapse rules | không thay failure-mode detail hay search contract một mình |
| `baseline/external-web-check-readiness.md` | external web-check readiness owner | mapping giữa scan families, owner docs, design-vs-runtime evidence split, host-readiness interpretation | không thay security/infra/seo policy gốc một mình |
| `baseline/startup-dependency-order.md` | startup/init owner | bootstrap order, per-module init dependency, baseline fail behavior | không lặp health response payload chi tiết |
| `tracking/audit-policy.md` | audit event taxonomy owner | what to log, actor/action/resource baseline | không lặp auth policy |
| `baseline/sla-slo.md` | service objectives owner | latency, availability, measurement notes | không lặp implementation status |
| `baseline/failure-modes.md` | failure behavior owner | degrade/fail-closed/fail-open matrix | không lặp full infra tutorial |
| `ops/backup-restore.md` | restore procedure owner | backup/restore commands, acceptance criteria | không phát minh policy security mới |
| `ops/health-contract.md` | health endpoint contract owner | `/health/live`, `/health/ready`, `/health/startup` exact checks | không lặp metrics/logging strategy |
| `ops/deploy-record-template.md` | deploy evidence template owner | post-deploy artifact chain, smoke evidence, rollback-proof record shape | không thay deploy procedure hay CI gate một mình |
| `ops/restore-drill-log.md` | drill evidence log | dated drill records | không chứa rule mới |
| `tracking/implementation-mapping.md` | implementation truth owner | status `implemented/required before launch/planned/forbidden for now/explicit exclusion` | không lặp rationale dài |
| `tracking/module-interactions.md` | cross-module interaction owner | ownership boundaries, direct vs async interaction | không lặp repo structure |
| `tracking/api-route-inventory.md` | API route inventory owner | route groups, auth scope, owner module | không thay use-case detail |
| `tracking/admin-page-api-mapping.md` | admin page-to-data mapping owner | admin page route -> API group -> query keys -> invalidation rules | không thay visual layout hay API canon |
| `tracking/apps-admin-scaffold-backlog.md` | admin scaffold backlog owner | feature rollout order, queries.ts/mutations.ts plan, blockers before admin coding | không thay API canon hay page route canon |
| `tracking/admin-feature-query-plan.md` | admin query/mutation factory owner | feature folder -> query keys -> query exports -> mutation exports -> invalidation graph | không thay API canon hay visual IA |
| `tracking/api-dto-shape-plan.md` | scaffold DTO picks owner | field-level response/request profile picks cho route families dễ drift | không thay domain contract detail một mình |
| `tracking/page-loader-contracts.md` | page-level loader owner | page data requirements, aggregate-vs-aux loader split, grouped-page fetch discipline | không thay route canon hay UI journey |
| `tracking/design-doc-residual-backlog.md` | residual doc-debt backlog owner | non-blocking cleanup items, generic contract gaps, wording refresh queue sau authority audit | không là policy owner hay implementation truth owner |
| `tracking/scaffold-gap-report.md` | scaffold drift checkpoint owner | cross-check gaps còn lại giữa page inventory, route canon, use-case family, và scaffold risk notes | không là route canon owner hay readiness truth owner |
| `tracking/env-inventory.md` | env inventory owner | env names, scope, required/optional, owner app | không lặp full deploy steps |
| `tracking/error-code-registry.md` | error code owner | canonical error codes and meanings | không lặp route contracts |
| `baseline/migration-strategy.md` | DB/schema evolution owner | naming, rollout, rollback, seed rules | không lặp infra topology |
| `baseline/testing-strategy.md` | verification owner | test pyramid, coverage targets, seed/test data rules | không lặp domain ownership |
| `baseline/frontend-architecture.md` | web/admin frontend owner | RSC/client split, data fetching, UI package usage | không lặp backend auth policy |
| `ops/deploy-runbook.md` | deploy/rollback procedure owner | deploy, rollback, migration-fail handling | không thay backup runbook |
| `overview/terminology.md` | terminology owner | PMTL terms + `English (Việt)` notation | không lặp qua nhiều root files |
| `overview/source-analysis.md` | source-derived feature surface owner | official source notes + feature implications | không lặp source summaries |
| `overview/architecture-principles.md` | architecture summary owner | stack truth summary, module grouping orientation, high-level do/don’t map | không là canonical owner cho module boundaries, implementation truth, hay phase rules |
| `overview/architecture-at-a-glance.md` | 1-minute architecture orientation owner | entrypoint tóm tắt đúng current direction | không chốt rule mới thay owner docs |
| `overview/domain-map.md` | domain index owner | domain grouping, quick pointers | không override module ownership |
| `overview/execution-map.md` | execution-path orientation owner | read order, implementation orientation, cross-link map | không thay implementation truth |
| `overview/system-data-flow-map.md` | cross-module data-flow walkthrough owner | request -> read -> write -> side-effect walkthrough bằng ngôn ngữ đời thường cho 11 modules | không override module contracts, route canon, hay ownership rules |
| `overview/phase-activation-matrix.md` | phase activation summary owner | phase summary, activation checklist tóm tắt | không thay decision trigger gốc |
| `overview/roadmap.md` | roadmap summary owner | planning narrative, sequencing note | không đổi launch blocker semantics |
| `seo-geo/strategy.md` | SEO/GEO strategy owner | URL strategy, robots.txt canonical disallow list, sitemap structure, canonical/hreflang posture, CWV targets | không thay route canon nếu `ui/PAGE_INVENTORY.md` đã chốt |
| `seo-geo/structured-data.md` | structured-data owner | Schema.org mapping per page family, JSON-LD obligations, schema selection rules | không tự đổi route canon hay content ownership |
| `seo-geo/geo-citation-strategy.md` | GEO citation owner | AI-citation posture, entity-definition rules, quotability guidance, citation-focused content formatting | không tự override doctrinal/source ownership |
| `seo-geo/content-cluster-map.md` | SEO content-cluster owner | cluster hierarchy, pillar/cluster relationships, target keyword grouping | không tự tạo page routes ngoài `ui/PAGE_INVENTORY.md` |
| `seo-geo/little-house-seo.md` | feature-specific SEO owner for Little House | Little House keyword map, internal linking plan, metadata focus, structured-data specialization | không thay Little House content canon một mình |
| `baseline/writing-standards.md` | docs writing owner | contract/use-case standards | không lặp template ở nhiều file |
| `CORE_PRACTICE_CONSTITUTION.md` | product intent + core loop owner | 8-step core practice loop, anti-gamification laws, module ownership map, launch screen table, acceptance criteria per step | không overwrite module contract detail; tóm tắt thì link về module doc |
| `deep-research-report.md` | research appendix owner | research notes, source synthesis, rationale backlog | không là canonical policy owner nếu chưa được promote sang owner file |
| `glossary.json` | glossary data asset owner | canonical key/value glossary dataset dùng cho tooling hoặc export | không là policy owner hay nơi viết luật bằng prose |
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
| `10-wisdom-qa/SOURCE_PROVENANCE_MATRIX.md` | source provenance owner | source tiers, source-family taxonomy, provenance rules cho source-backed wisdom content | không tự override publish policy hay route canon |
| `10-wisdom-qa/INGESTION_PLAN.md` | source-backed ingestion owner | ingestion steps, required source metadata, duplicate guard, draft-only automation rules | không tự override source taxonomy hay manual editor workflow |
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
