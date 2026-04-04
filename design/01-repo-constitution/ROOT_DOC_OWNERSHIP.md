# ROOT_DOC_OWNERSHIP (Quyền sở hữu file gốc trong design)

Trước khi dùng file này, đọc governance docs ở:

- [design/00-governance/GOVERNANCE_SYSTEM.md](../00-governance/GOVERNANCE_SYSTEM.md)
- [design/00-governance/STATUS_AND_PHASE.md](../00-governance/STATUS_AND_PHASE.md)
- [design/00-governance/FOLDER_CANON.md](../00-governance/FOLDER_CANON.md)
- [design/00-governance/MIGRATION_MAP.md](../00-governance/MIGRATION_MAP.md)

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
- canonical path cho bản đồ luồng dữ liệu là `design/01-repo-constitution/SYSTEM_DATA_FLOW_MAP.md`; không tạo thêm root-level alias song song.
- `NN-domain/DECISIONS.md` là canonical decision owner trong boundary của domain đó. Nếu mâu thuẫn với `DECISIONS.md`, `DECISIONS.md` thắng và file domain phải được sửa lại.
- `NN-domain/MODULE_MAP.md` là owner cho module boundaries, responsibilities, và inbound/outbound interactions của domain đó.
- `NN-domain/CONTRACTS.md` là owner cho contract mức domain: route groups, DTO shapes mức design, error mapping, invariants.
- `NN-domain/SCHEMA_PLAN.dbml` là owner cho shape dữ liệu mức domain ở phase design; merge thực tế sang runtime schema đi qua `design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md`.
- `NN-domain/STATES/FLOWS.mmd` và `NN-domain/*state.mmd` là owner cho state transition diagrams; không tự phát minh policy mới ngoài owner docs của domain.
- `NN-domain/USE_CASES/*.md` là owner cho write-path behavior của từng flow; route string vẫn phải khớp `design/04-execution-overlay/web/PAGE_INVENTORY.md` và `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` khi có bề mặt web/API liên quan.

## Root file ownership map

| File | Vai trò duy nhất | Được phép chứa | Không được làm |
|---|---|---|---|
| `ROOT_DOC_OWNERSHIP.md` | ownership registry owner | precedence rules, root-file roles, anti-duplication guardrails | không tự phát minh policy domain thay owner docs |
| `README.md` | mục lục + cách đọc | read order, launch scope, pointer | không lặp lại full policy |
| `DECISIONS.md` | canonical decision baseline | current direction, phase baseline, source-of-truth rules, anti-goals | không thay security/nest/detail owner files |
| `design/02-platform-baseline/dependency-version/VERSION_MATRIX.md` | version/runtime entrypoint owner | exact installed truth vs design pin vs activation-time pin, official docs entrypoints, version-specific behavior locks | không tự thay adoption status, pipeline rules, hay migration policy |
| `design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md` | version/upgrade discipline owner | upgrade cadence, exception policy, sync rules, advisory intake, stable-line governance | không override exact pins trong `VERSION_MATRIX.md` một mình |
| `design/01-repo-constitution/REPO_STRUCTURE.md` | folder/file placement owner | repo shape, module anatomy, placement rules | không lặp full security/infra policy |
| `design/02-platform-baseline/api-runtime/PLATFORM_MODULES.md` | platform/control-plane owner | sessions, audit, flags, rate-limit, storage, health, metrics | không ôm domain module contracts |
| `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md` | NestJS app pipeline owner | request pipeline, Zod, Pino, guards, error envelope | không lặp full infra policy |
| `design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md` | API error envelope owner | JSON error shape, requestId/meta rules, validation-detail projection, registry linkage | không thay route inventory hay code registry một mình |
| `design/02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md` | Zod runtime owner | Zod 4 source-of-truth chain, schema placement, error policy, metadata/JSON Schema/codecs stance | không thay route owner hay FE form UX owner một mình |
| `design/02-platform-baseline/api-runtime/NEST_FEATURE_ADOPTION_MATRIX.md` | Nest feature adoption owner | status `adopted/restricted/deferred/excluded/reference-only` cho toàn bộ surface Nest trong repo | không thay exact version pin hay request pipeline detail một mình |
| `design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md` | NestJS 11 scaffold nuance owner | exact scaffold line, Express v5 route stance, logger policy, selected Nest 11-specific behaviors and caveats | không thay request pipeline, global adoption matrix, hay repo phase rules một mình |
| `design/02-platform-baseline/api-runtime/SERIALIZATION_POLICY.md` | API response serialization owner | mapper/projection rules, null/undefined/date stance, anti-leak guardrails | không thay DTO contract owner một mình |
| `design/02-platform-baseline/api-runtime/API_VERSIONING_POLICY.md` | API versioning stance owner | no-version baseline, trigger to open versioning, anti-drift rules | không tự tạo route canon |
| `design/02-platform-baseline/api-runtime/TASK_SCHEDULING_POLICY.md` | scheduler stance owner | in-process cron boundaries, idempotency/locking expectations, phase gating | không thay queue/outbox owner docs |
| `design/02-platform-baseline/api-runtime/TRANSPORT_RUNTIME_POLICY.md` | transport runtime owner | compression, keep-alive, HTTPS/multi-server backend stance | không thay edge infra owner docs một mình |
| `design/02-platform-baseline/api-runtime/COMMON_ERRORS_RUNBOOK.md` | backend common-errors runbook owner | symptom families, read-order for diagnosis, anti-shortcut rules | không thay error code canon hay pipeline policy |
| `design/02-platform-baseline/api-runtime/CANONICAL_DECORATORS.md` | custom decorator owner | allowed decorator list, review rule, anti-magic constraints | không thay auth policy hoặc request pipeline một mình |
| `design/02-platform-baseline/api-runtime/NEST_INTERNALS_POLICY.md` | Nest internals owner | lifecycle events, injection scopes, module reference, circular dependency stance | không thay module ownership map một mình |
| `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` | security policy owner | auth, CSRF, CORS, cookies, upload security, webhook, secrets | không lặp infra topology |
| `design/02-platform-baseline/security-runtime/AUTH_SESSION_FLOW.md` | auth/session sequence owner | register/verify/login/refresh/logout/reset sequence, token rotation, invalidate-all semantics | không thay security posture hay route canon một mình |
| `design/02-platform-baseline/security-runtime/CRYPTO_POLICY.md` | crypto stance owner | password hashing, signature verification, approved crypto usage boundaries | không thay auth/session contract một mình |
| `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md` | infra phase owner | phase baseline, optional components, trigger rules | không biến thành deep ops tutorial |
| `design/02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md` | AI-assisted debugging owner | evidence-first rules for LLM debugging, context hygiene, scope reduction, and verification expectations | không override runtime verification rule một mình |
| `design/02-platform-baseline/deploy-ops/ASYNC_LOCAL_STORAGE_POLICY.md` | ALS stance owner | request-context/trace-context trigger conditions, anti-magic rules | không thay logging authority một mình |
| `design/02-platform-baseline/dependency-version/MANAGED_PLATFORM_PATTERNS.md` | managed-service learning owner | imported patterns from Supabase-like platforms, what PMTL may learn now/later, and what must stay out | không thay authority rules trong `DECISIONS.md` một mình |
| `design/02-platform-baseline/data-runtime/PRISMA_7_POLICY.md` | Prisma 7 adoption owner | generator/runtime stance, migrate/deploy policy, transaction/query guardrails, schema ownership chain | không thay schema plan hay migration evidence một mình |
| `design/02-platform-baseline/data-runtime/PRISMA_QUERY_PATTERN_RULES.md` | Prisma query pattern owner | select/include/omit discipline, relation query rules, null/undefined stance, raw SQL/TypedSQL boundaries, pooling notes | không thay schema merge order hay API DTO owner một mình |
| `design/02-platform-baseline/edge-delivery/HIGH_TRAFFIC_RESILIENCE.md` | growth-safe launch owner | launch profiles, traffic/crawl/abuse pressure stance, supporting tech order, anti-collapse rules | không thay failure-mode detail hay search contract một mình |
| `design/05-references/framework-docs/EXTERNAL_WEB_CHECK_READINESS.md` | external web-check readiness owner | mapping giữa scan families, owner docs, design-vs-runtime evidence split, host-readiness interpretation | không thay security/infra/seo policy gốc một mình |
| `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md` | startup/init owner | bootstrap order, per-module init dependency, baseline fail behavior | không lặp health response payload chi tiết |
| `design/04-execution-overlay/api/AUDIT_POLICY.md` | audit event taxonomy owner | what to log, actor/action/resource baseline | không lặp auth policy |
| `design/02-platform-baseline/deploy-ops/SLA_SLO.md` | service objectives owner | latency, availability, measurement notes | không lặp implementation status |
| `design/02-platform-baseline/security-runtime/FAILURE_MODES.md` | failure behavior owner | degrade/fail-closed/fail-open matrix | không lặp full infra tutorial |
| `design/02-platform-baseline/deploy-ops/BACKUP_RESTORE.md` | restore procedure owner | backup/restore commands, acceptance criteria | không phát minh policy security mới |
| `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md` | health endpoint contract owner | `/health/live`, `/health/ready`, `/health/startup` exact checks | không lặp metrics/logging strategy |
| `design/04-execution-overlay/repo/DEPLOY_RECORD_TEMPLATE.md` | deploy evidence template owner | post-deploy artifact chain, smoke evidence, rollback-proof record shape | không thay deploy procedure hay CI gate một mình |
| `design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md` | drill evidence log | dated drill records | không chứa rule mới |
| `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | implementation truth owner | status `implemented/required before launch/planned/forbidden for now/explicit exclusion` | không lặp rationale dài |
| `design/04-execution-overlay/repo/VALKEY_MODULE_OPPORTUNITY_MATRIX.md` | module-by-module Valkey activation owner | per-domain opportunities, trigger-worthy use, anti-goals, activation priority | không thay phase baseline hay key topology một mình |
| `design/04-execution-overlay/repo/VALKEY_CACHE_CANDIDATE_INVENTORY.md` | Valkey cache candidate owner | cache families, TTL class, invalidation owner, do-not-cache list | không thay cache-topology owner hay invalidation chain một mình |
| `design/04-execution-overlay/repo/BULLMQ_ACTIVATION_SHORTLIST.md` | async promotion shortlist owner | first BullMQ workloads, promotion triggers, exclusions, readiness checklist | không thay queue contract hay outbox discipline một mình |
| `design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md` | cross-module interaction owner | ownership boundaries, direct vs async interaction | không lặp repo structure |
| `design/04-execution-overlay/cross-module/EVENT_MODEL_POLICY.md` | event model owner | direct-vs-event promotion rule, outbox-ready event discipline, anti-magic guidance | không thay queue worker topology một mình |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` | API route inventory owner | route groups, auth scope, owner module | không thay use-case detail |
| `design/04-execution-overlay/api/API_CLIENT_POLICY.md` | API client generation owner | `packages/api-client` stance, generation-vs-hand-curated rule, client boundary constraints | không thay API route/DTO authority một mình |
| `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | admin page-to-data mapping owner | admin page route -> API group -> query keys -> invalidation rules | không thay visual layout hay API canon |
| `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md` | admin scaffold backlog owner | feature rollout order, queries.ts/mutations.ts plan, blockers before admin coding | không thay API canon hay page route canon |
| `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md` | admin query/mutation factory owner | feature folder -> query keys -> query exports -> mutation exports -> invalidation graph | không thay API canon hay visual IA |
| `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md` | scaffold DTO picks owner | field-level response/request profile picks cho route families dễ drift | không thay domain contract detail một mình |
| `design/04-execution-overlay/api/APPS_API_IMPLEMENTATION_CANON.md` | `apps/api` implementation canon owner | file placement, must-exist artifacts, bootstrap seams, anti-patterns cho scaffold `apps/api` | không thay pipeline policy hay route canon một mình |
| `design/04-execution-overlay/web/WEB_CACHE_REVALIDATION_CONTRACT.md` | Next.js server-cache/revalidation owner | `use cache`, `cacheTag`, `cacheLife`, `revalidateTag`, server invalidation semantics | không thay client query invalidation owner một mình |
| `design/04-execution-overlay/web/WEB_QUERY_INVALIDATION_PLAN.md` | TanStack Query invalidation owner | query keys, `queryOptions`, mutation invalidation, client cache discipline | không thay server revalidation owner một mình |
| `design/04-execution-overlay/web/APPS_WEB_IMPLEMENTATION_CANON.md` | `apps/web` implementation canon owner | file placement, helper ownership, action/cache/query/form seams, anti-patterns cho scaffold `apps/web` | không thay App Router/cache policy owner một mình |
| `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md` | multi-layer cache topology owner | CDN/ISR/browser/Valkey layer map, invalidation chain, propagation failure policy | không thay web-only invalidation owner docs một mình |
| `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md` | page-level loader owner | page data requirements, aggregate-vs-aux loader split, grouped-page fetch discipline | không thay route canon hay UI journey |
| `design/04-execution-overlay/repo/DESIGN_DOC_RESIDUAL_BACKLOG.md` | residual doc-debt backlog owner | non-blocking cleanup items, generic contract gaps, wording refresh queue sau authority audit | không là policy owner hay implementation truth owner |
| `design/04-execution-overlay/repo/SCAFFOLD_GAP_REPORT.md` | scaffold drift checkpoint owner | cross-check gaps còn lại giữa page inventory, route canon, use-case family, và scaffold risk notes | không là route canon owner hay readiness truth owner |
| `design/04-execution-overlay/repo/ENV_INVENTORY.md` | env inventory owner | env names, scope, required/optional, owner app | không lặp full deploy steps |
| `design/04-execution-overlay/repo/BULLMQ_IMPLEMENTATION_CANON.md` | BullMQ implementation canon owner | producer/worker placement, queue naming, must-exist artifacts, activation-time anti-patterns | không thay queue architecture hay activation shortlist một mình |
| `design/04-execution-overlay/repo/OTEL_IMPLEMENTATION_CANON.md` | OpenTelemetry implementation canon owner | api/worker/collector placement, bootstrap seams, propagation/sampling/resource canon, activation-time anti-patterns | không thay observability phase policy hay env owner một mình |
| `design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md` | error code owner | canonical error codes and meanings | không lặp route contracts |
| `design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md` | DB/schema evolution owner | naming, rollout, rollback, seed rules | không lặp infra topology |
| `design/02-platform-baseline/deploy-ops/TESTING_STRATEGY.md` | verification owner | test pyramid, coverage targets, seed/test data rules | không lặp domain ownership |
| `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` | web/admin frontend owner | RSC/client split, data fetching, UI package usage | không lặp backend auth policy |
| `design/02-platform-baseline/web-runtime/REACT_RUNTIME_POLICY.md` | React runtime owner | compiler stance, purity rules, state/effect/ref/custom-hook discipline, transition semantics | không thay route/data ownership một mình |
| `design/02-platform-baseline/web-runtime/TAILWIND_CSS_4_POLICY.md` | Tailwind CSS 4 owner | CSS-first config, token mapping, utility discipline, monorepo/shadcn integration guardrails | không thay visual design canon một mình |
| `design/02-platform-baseline/web-runtime/SHADCN_UI_INVENTORY.md` | shadcn/ui inventory owner | seed component set, install/customize rules, ownership split giữa `packages/ui` và apps | không thay design system owner hay runtime cache rules một mình |
| `design/02-platform-baseline/web-runtime/ZUSTAND_POLICY.md` | Zustand owner | store boundaries, SSR/hydration rules, allowed persisted slices, anti-authority rules | không thay data-fetching owner docs một mình |
| `design/02-platform-baseline/deploy-ops/DEPLOY_RUNBOOK.md` | deploy/rollback procedure owner | deploy, rollback, migration-fail handling | không thay backup runbook |
| `design/02-platform-baseline/deploy-ops/VALKEY_RUNTIME_DRILL.md` | Valkey runtime drill owner | activation checklist, fallback drill, Redis Insight inspection rules, rollback evidence | không thay health/metrics/phase trigger authority một mình |
| `design/01-repo-constitution/TERMINOLOGY.md` | terminology owner | PMTL terms + `English (Việt)` notation | không lặp qua nhiều root files |
| `design/05-references/external-research/SOURCE_ANALYSIS.md` | source-derived feature surface owner | official source notes + feature implications | không lặp source summaries |
| `design/01-repo-constitution/ARCHITECTURE_PRINCIPLES.md` | architecture summary owner | stack truth summary, module grouping orientation, high-level do/don’t map | không là canonical owner cho module boundaries, implementation truth, hay phase rules |
| `design/01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md` | 1-minute architecture orientation owner | entrypoint tóm tắt đúng current direction | không chốt rule mới thay owner docs |
| `design/01-repo-constitution/DOMAIN_MAP.md` | domain index owner | domain grouping, quick pointers | không override module ownership |
| `design/01-repo-constitution/EXECUTION_MAP.md` | execution-path orientation owner | read order, implementation orientation, cross-link map | không thay implementation truth |
| `design/01-repo-constitution/SYSTEM_DATA_FLOW_MAP.md` | cross-module data-flow walkthrough owner | request -> read -> write -> side-effect walkthrough bằng ngôn ngữ đời thường cho 11 modules | không override module contracts, route canon, hay ownership rules |
| `design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md` | phase activation summary owner | phase summary, activation checklist tóm tắt | không thay decision trigger gốc |
| `design/01-repo-constitution/ROADMAP.md` | roadmap summary owner | planning narrative, sequencing note | không đổi launch blocker semantics |
| `design/02-platform-baseline/web-runtime/seo-geo/STRATEGY.md` | SEO/GEO strategy owner | URL strategy, robots.txt canonical disallow list, sitemap structure, canonical/hreflang posture, CWV targets | không thay route canon nếu `design/04-execution-overlay/web/PAGE_INVENTORY.md` đã chốt |
| `design/02-platform-baseline/web-runtime/seo-geo/STRUCTURED_DATA.md` | structured-data owner | Schema.org mapping per page family, JSON-LD obligations, schema selection rules | không tự đổi route canon hay content ownership |
| `design/02-platform-baseline/web-runtime/seo-geo/GEO_CITATION_STRATEGY.md` | GEO citation owner | AI-citation posture, entity-definition rules, quotability guidance, citation-focused content formatting | không tự override doctrinal/source ownership |
| `design/02-platform-baseline/web-runtime/seo-geo/CONTENT_CLUSTER_MAP.md` | SEO content-cluster owner | cluster hierarchy, pillar/cluster relationships, target keyword grouping | không tự tạo page routes ngoài `design/04-execution-overlay/web/PAGE_INVENTORY.md` |
| `design/03-domains/content/REFERENCES/LITTLE_HOUSE_SEO.md` | feature-specific SEO owner for Little House | Little House keyword map, internal linking plan, metadata focus, structured-data specialization | không thay Little House content canon một mình |
| `design/00-governance/WRITING_STANDARDS.md` | docs writing owner | contract/use-case standards | không lặp template ở nhiều file |
| `CORE_PRACTICE_CONSTITUTION.md` | product intent + core loop owner | 8-step core practice loop, anti-gamification laws, module ownership map, launch screen table, acceptance criteria per step | không overwrite module contract detail; tóm tắt thì link về module doc |
| `deep-research-report.md` | research appendix owner | research notes, source synthesis, rationale backlog | không là canonical policy owner nếu chưa được promote sang owner file |
| `design/BRD_PHASE_XX_*.md` (root-level) | legacy BRD input snapshot | requirements analysis input, source BRD cho USE_CASE distribution | không là canonical owner; không override `design/03-domains/*/USE_CASES/` đã được distribute; không tạo BRD mới ở root — dùng `design/05-references/brd-research/` |
| `design/05-references/brd-research/INDEX.md` | BRD research index owner | pointer đến tất cả BRD files, status distribution, mapping sang domain USE_CASES | không là policy owner; không lặp lại logic từ USE_CASE files |
| `glossary.json` | glossary data asset owner | canonical key/value glossary dataset dùng cho tooling hoặc export | không là policy owner hay nơi viết luật bằng prose |
| `SVG_PRECISION_WORKFLOW.md` | deterministic SVG workflow owner | SVG asset generation rules, output discipline | không là launch gate hay route owner |
| `design/02-platform-baseline/web-runtime/LANDING_PAGE_DESIGN.md` | landing page visual spec owner | 7 sections layout, typography, interaction, animation, SEO, performance targets | không là route owner; route authority vẫn là PAGE_INVENTORY.md |
| `design/02-platform-baseline/web-runtime/HOMEPAGE_CONSTITUTION.md` | homepage intent/spec owner | homepage content hierarchy, narrative, section obligations | không override route canon hay landing visual rules |
| `design/05-references/examples/SPIRITUAL_APP_SCREENS.md` | app screen design spec owner | screen-by-screen layout, component behavior, elderly UX rules, states | không là route owner; không override module contracts |
| `design/04-execution-overlay/web/PAGE_INVENTORY.md` | route canon owner | URL string, auth level, module owner, mobile notes, page-level purpose | không redefine IA hierarchy hay nav interaction rules |
| `design/02-platform-baseline/web-runtime/NAVIGATION_ARCHITECTURE.md` | IA + navigation structure owner | IA hierarchy, nav patterns, gating rules, deep linking, a11y | route strings phải khớp PAGE_INVENTORY.md; khi conflict về URL string thì PAGE_INVENTORY.md thắng |
| `design/04-execution-overlay/web/USER_FLOWS.md` | journey owner | step-by-step user flows, branching states, success/failure path | không tự phát minh route canon |
| `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md` | component behavior owner | component anatomy, states, props-level behavior, accessibility expectations | không override visual system owner docs |
| `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md` | visual system owner | tokens, typography, spacing, surfaces, motion baseline, phase-scoped visual rules | không tự đổi route hoặc data ownership |
| `design/02-platform-baseline/web-runtime/ELDERLY_UX.md` | elderly accommodation owner | readability, touch, motion, cognition accommodations | không override phase scope nếu DESIGN_PRINCIPLES đã chốt khác |
| `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md` | admin SPA structure owner | SPA shells, layout, workspace patterns, query/state conventions | không override backend authority |
| `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` | admin workspace owner | filters, bulk actions, table states, invalidation rules | không đổi route canon một mình |
| `design/03-domains/calendar/REFERENCES/LUC-TRAI-DAYS-CANON.MD` | `六齋日` canon owner | day-role matrix, fallback semantics, warning families, advisory obligations cho ngày mùng 8/14/15/23/29/30 | không thay source-backed doctrine owner của Wisdom-QA |
| `design/03-domains/wisdom-qa/REFERENCES/BTPP-LIBRARY-CANON.MD` | BTPP library owner | public route slug, hub IA, glossary, source taxonomy, FAQ, warning policy cho BTPP/Little House cross-surface | không thay data schema chi tiết một mình |
| `design/03-domains/wisdom-qa/REFERENCES/SOURCE_PROVENANCE_MATRIX.MD` | source provenance owner | source tiers, source-family taxonomy, provenance rules cho source-backed wisdom content | không tự override publish policy hay route canon |
| `design/03-domains/wisdom-qa/REFERENCES/INGESTION_PLAN.MD` | source-backed ingestion owner | ingestion steps, required source metadata, duplicate guard, draft-only automation rules | không tự override source taxonomy hay manual editor workflow |
| `design/03-domains/wisdom-qa/REFERENCES/MANUAL-TRANSLATION-EDITOR-WORKFLOW.MD` | wisdom manual editor flow owner | current manual-first translation flow, required editor fields, duplicate-check/slug-preview/draft gate, anti-auto-publish stance | không thay phase-later automation architecture một mình |
| `design/02-platform-baseline/optional-scale/TRANSLATION_AUTOMATION_ARCHITECTURE.md` | wisdom automation owner | orchestrator stance, MCP/API role split, duplicate guard, slug preview, import-job lifecycle cho lane auto-ingest/auto-translate | không thay source taxonomy hoặc publish policy một mình |
| `design/04-execution-overlay/api/WISDOM_QA_FAMILY_AUDIT.md` | Wisdom-QA audit owner | family inventory, taxonomy drift, unresolved gaps, next audit order cho `10-wisdom-qa` | không tự override canon route nếu `btpp-library-canon.md` đã chốt |
| `design/05-references/external-research/XLCH_OFFICIAL_ALIGNMENT.md` | official XLCH alignment owner | official family map signals, what PMTL must preserve from `xlch.org`, alignment backlog | không tự override canon route nếu owner docs đã chốt |

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
