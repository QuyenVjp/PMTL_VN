# Migration Map

File này là bản đồ tái cấu trúc cụ thể cho `design/`.

Nó chốt:

- folder nào giữ lại tạm thời
- file nào nên đổi tên
- file nào nên chuyển layer nào
- file nào chỉ nên là reference
- file nào phải là canonical owner

## Action Legend

- `keep` = giữ nguyên path hiện tại trong ngắn hạn
- `rename` = nên đổi tên để khớp taxonomy mới
- `move` = nên chuyển sang layer/path mới
- `completed` = target move đã hạ cánh; row được giữ để làm audit trail
- `reference-only` = chỉ dùng làm ngữ cảnh, không làm source of truth

## ⚠️ AUDIT TRAIL ONLY — NOT OWNER

**Thực tế của layout → [FOLDER_CANON.md](../../00-governance/FOLDER_CANON.md)**
**Thực tế của quyền sở hữu → [ROOT_DOC_OWNERSHIP.md](../../01-repo-constitution/ROOT_DOC_OWNERSHIP.md)**

File này chỉ là `migration ledger` cho lịch sử di chuyển.
Không phải nơi chốt rule mới hay conflict resolution.
Các move lớn đã hoàn thành; canonical layout luôn ở 2 file trên.

## Top-Level Folder Direction

| Current | Action | Target | Notes |
|---|---|---|---|
| `design/01-identity` | move | `design/03-domains/identity` | domain pack canonical |
| `design/02-content` | move | `design/03-domains/content` | domain pack canonical |
| `design/03-community` | move | `design/03-domains/community` | domain pack canonical |
| `design/04-engagement` | move | `design/03-domains/engagement` | domain pack canonical |
| `design/05-moderation` | move | `design/03-domains/moderation` | domain pack canonical |
| `design/06-search` | move | `design/03-domains/search` | domain pack canonical |
| `design/07-calendar` | move | `design/03-domains/calendar` | domain pack canonical |
| `design/08-notification` | move | `design/03-domains/notification` | domain pack canonical |
| `design/09-vows-merit` | move | `design/03-domains/vows-merit` | domain pack canonical |
| `design/10-wisdom-qa` | move | `design/03-domains/wisdom-qa` | domain pack canonical |
| `design/11-contact` | move | `design/03-domains/contact` | domain pack canonical |
| `design/baseline` | move | `design/02-platform-baseline/*` | runtime-role split required |
| `design/ops` | move | `design/02-platform-baseline/*` and `design/04-execution-overlay/*` | policy vs evidence split |
| `design/overview` | move | `design/01-repo-constitution` or `design/05-references` | summaries and references |
| `design/seo-geo` | move | `design/02-platform-baseline/web-runtime/seo-geo` | cross-surface platform policy |
| `design/tracking` | move | `design/04-execution-overlay/*` | overlay canonical |
| `design/ui` | move | `design/02-platform-baseline/*` and `design/04-execution-overlay/web` | baseline vs overlay split |

## Root Files

| Current file | Action | Target path | Canonical role |
|---|---|---|---|
| `design/DECISIONS.md` | move | `design/01-repo-constitution/DECISIONS.md` | canonical owner |
| `design/ROOT_DOC_OWNERSHIP.md` | move | `design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md` | canonical owner |
| `design/CORE_PRACTICE_CONSTITUTION.md` | move | `design/01-repo-constitution/CORE_PRACTICE_CONSTITUTION.md` | canonical owner |
| `design/README.md` | keep | `design/README.md` | orientation entrypoint |
| `design/SVG_PRECISION_WORKFLOW.md` | move | `design/05-references/starter-patterns/SVG_PRECISION_WORKFLOW.md` | reference-only |
| `design/deep-research-report.md` | move | `design/05-references/external-research/deep-research-report.md` | reference-only |
| `design/05-references/external-research/glossary.json` | move | `design/05-references/external-research/glossary.json` | reference data asset |

## Baseline Folder Split

### Canonical Platform Owners

| Current file | Target path | Role |
|---|---|---|
| `design/02-platform-baseline/dependency-version/REPO_STRUCTURE.md` | `01-repo-constitution/REPO_STRUCTURE.md` | canonical owner |
| `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md` | `02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md` | canonical owner |
| `design/02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md` | `02-platform-baseline/api-runtime/NESTJS_11_ADOPTION.md` | canonical owner |
| `design/02-platform-baseline/api-runtime/PLATFORM_MODULES.md` | `02-platform-baseline/api-runtime/PLATFORM_MODULES.md` | canonical owner |
| `design/02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` | `02-platform-baseline/web-runtime/FRONTEND_ARCHITECTURE.md` | canonical owner |
| `design/02-platform-baseline/security-runtime/SECURITY_POLICY.md` | `02-platform-baseline/security-runtime/SECURITY_POLICY.md` | canonical owner |
| `design/02-platform-baseline/security-runtime/SECRET_MANAGEMENT.md` | `02-platform-baseline/security-runtime/SECRET_MANAGEMENT.md` | canonical owner |
| `design/02-platform-baseline/data-runtime/STORAGE_LIFECYCLE.md` | `02-platform-baseline/data-runtime/STORAGE_LIFECYCLE.md` | canonical owner |
| `design/02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md` | `02-platform-baseline/data-runtime/MIGRATION_STRATEGY.md` | canonical owner |
| `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md` | `02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md` | canonical owner |
| `design/02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md` | `02-platform-baseline/api-runtime/STARTUP_DEPENDENCY_ORDER.md` | canonical owner |
| `design/02-platform-baseline/edge-delivery/INFRA_BASELINE.md` | `02-platform-baseline/edge-delivery/INFRA_BASELINE.md` | canonical owner |
| `design/02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md` | `02-platform-baseline/deploy-ops/CICD_DEPLOY_GATES.md` | canonical owner |
| `design/02-platform-baseline/deploy-ops/TESTING_STRATEGY.md` | `02-platform-baseline/deploy-ops/TESTING_STRATEGY.md` | canonical owner |
| `design/02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md` | `02-platform-baseline/dependency-version/DEPENDENCY_GOVERNANCE.md` | canonical owner |
| `design/02-platform-baseline/edge-delivery/HIGH_TRAFFIC_RESILIENCE.md` | `02-platform-baseline/edge-delivery/HIGH_TRAFFIC_RESILIENCE.md` | canonical owner |
| `design/02-platform-baseline/security-runtime/FAILURE_MODES.md` | `02-platform-baseline/security-runtime/FAILURE_MODES.md` | canonical owner |
| `design/02-platform-baseline/deploy-ops/SLA_SLO.md` | `02-platform-baseline/deploy-ops/SLA_SLO.md` | canonical owner |
| `design/02-platform-baseline/security-runtime/EMAIL_PROVIDER_DECISION.md` | `02-platform-baseline/security-runtime/EMAIL_PROVIDER_DECISION.md` | canonical owner |
| `design/02-platform-baseline/edge-delivery/WAF_ANTIBOT_STRATEGY.md` | `02-platform-baseline/edge-delivery/WAF_ANTIBOT_STRATEGY.md` | canonical owner |
| `design/02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` | `02-platform-baseline/deploy-ops/OBSERVABILITY_ARCHITECTURE.md` | canonical owner |
| `design/02-platform-baseline/dependency-version/MANAGED_PLATFORM_PATTERNS.md` | `02-platform-baseline/dependency-version/MANAGED_PLATFORM_PATTERNS.md` | canonical owner |
| `design/02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md` | `02-platform-baseline/deploy-ops/AI_DEBUGGING_DISCIPLINE.md` | canonical owner |
| `design/02-platform-baseline/dependency-version/WRITING_STANDARDS.md` | `00-governance/WRITING_STANDARDS.md` | canonical owner |

### Optional Scale Or Reference

| Current file | Target path | Role |
|---|---|---|
| `design/02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md` | `02-platform-baseline/optional-scale/VALKEY_ARCHITECTURE.md` | canonical optional-scale owner |
| `design/02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` | `02-platform-baseline/optional-scale/BULLMQ_WORKER_ARCHITECTURE.md` | canonical optional-scale owner |
| `design/02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md` | `02-platform-baseline/optional-scale/OUTBOX_DISPATCHER_MODEL.md` | canonical optional-scale owner |
| `design/02-platform-baseline/optional-scale/PGBOUNCER_STRATEGY.md` | `02-platform-baseline/optional-scale/PGBOUNCER_STRATEGY.md` | canonical optional-scale owner |
| `design/02-platform-baseline/optional-scale/R2_MIGRATION_PLAN.md` | `02-platform-baseline/optional-scale/R2_MIGRATION_PLAN.md` | canonical optional-scale owner |
| `design/02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` | `02-platform-baseline/optional-scale/PGVECTOR_DECISION.md` | canonical exclusion owner |
| `baseline/servercn-design-reference.md` | `05-references/starter-patterns/SERVERCN_DESIGN_REFERENCE.md` | reference-only |
| `baseline/external-web-check-readiness.md` | `05-references/framework-docs/EXTERNAL_WEB_CHECK_READINESS.md` | advisory/reference |

## Ops Folder Split

| Current file | Target path | Role |
|---|---|---|
| `design/02-platform-baseline/deploy-ops/BACKUP_RESTORE.md` | `02-platform-baseline/deploy-ops/BACKUP_RESTORE.md` | canonical owner |
| `design/02-platform-baseline/api-runtime/HEALTH_CONTRACT.md` | `02-platform-baseline/api-runtime/HEALTH_CONTRACT.md` | canonical owner |
| `design/02-platform-baseline/deploy-ops/DEPLOY_RUNBOOK.md` | `02-platform-baseline/deploy-ops/DEPLOY_RUNBOOK.md` | canonical owner |
| `design/04-execution-overlay/repo/DEPLOY_RECORD_TEMPLATE.md` | `04-execution-overlay/repo/DEPLOY_RECORD_TEMPLATE.md` | overlay evidence template |
| `design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md` | `04-execution-overlay/repo/RESTORE_DRILL_LOG.md` | overlay evidence |

## Overview And Tracking Direction

| Current file | Target path | Role |
|---|---|---|
| `overview/architecture-at-a-glance.md` | `01-repo-constitution/ARCHITECTURE_AT_A_GLANCE.md` | constitution summary |
| `overview/architecture-principles.md` | `01-repo-constitution/ARCHITECTURE_PRINCIPLES.md` | advisory summary |
| `overview/domain-map.md` | `01-repo-constitution/DOMAIN_MAP.md` | constitution summary |
| `overview/execution-map.md` | `01-repo-constitution/EXECUTION_MAP.md` | constitution summary |
| `design/01-repo-constitution/PHASE_ACTIVATION_MATRIX.md` | `01-repo-constitution/PHASE_ACTIVATION_MATRIX.md` | summary |
| `design/01-repo-constitution/SYSTEM_DATA_FLOW_MAP.md` | `01-repo-constitution/SYSTEM_DATA_FLOW_MAP.md` | summary walkthrough |
| `design/01-repo-constitution/TERMINOLOGY.md` | `01-repo-constitution/TERMINOLOGY.md` | canonical owner |
| `design/05-references/external-research/SOURCE_ANALYSIS.md` | `05-references/external-research/SOURCE_ANALYSIS.md` | reference-only |
| `overview/roadmap.md` | `01-repo-constitution/ROADMAP.md` | summary owner |
| `design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | `04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md` | canonical owner |
| `design/04-execution-overlay/repo/CODING_READINESS.md` | `04-execution-overlay/repo/CODING_READINESS.md` | canonical owner |
| `design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md` | `04-execution-overlay/cross-module/MODULE_INTERACTIONS.md` | canonical owner |
| `design/04-execution-overlay/repo/ENV_INVENTORY.md` | `04-execution-overlay/repo/ENV_INVENTORY.md` | canonical owner |
| `design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md` | `04-execution-overlay/api/ERROR_CODE_REGISTRY.md` | canonical owner |
| `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` | `04-execution-overlay/api/API_ROUTE_INVENTORY.md` | canonical owner |
| `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md` | `04-execution-overlay/api/API_DTO_SHAPE_PLAN.md` | canonical owner |
| `design/04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md` | `04-execution-overlay/api/APPS_API_SCAFFOLD_ORDER.md` | canonical owner |
| `design/04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md` | `04-execution-overlay/data/PRISMA_SCHEMA_PLAN.md` | canonical owner |
| `design/04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md` | `04-execution-overlay/web/PAGE_LOADER_CONTRACTS.md` | canonical owner |
| `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | `04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` | canonical owner |
| `tracking/admin-feature-query-plan.md` | `04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md` | canonical owner |

## UI Direction

| Current file | Target path | Role |
|---|---|---|
| `design/02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md` | `02-platform-baseline/web-runtime/DESIGN_PRINCIPLES.md` | canonical owner |
| `design/02-platform-baseline/web-runtime/ELDERLY_UX.md` | `02-platform-baseline/web-runtime/ELDERLY_UX.md` | canonical owner |
| `ui/NAVIGATION_ARCHITECTURE.md` | `02-platform-baseline/web-runtime/NAVIGATION_ARCHITECTURE.md` | canonical owner |
| `design/02-platform-baseline/web-runtime/COMPONENT_SPECS.md` | `02-platform-baseline/web-runtime/COMPONENT_SPECS.md` | canonical owner |
| `ui/CONTENT_RENDERING_CONTRACT.md` | `02-platform-baseline/web-runtime/CONTENT_RENDERING_CONTRACT.md` | canonical owner |
| `ui/AUTH_UX_CONTRACT.md` | `02-platform-baseline/web-runtime/AUTH_UX_CONTRACT.md` | canonical owner |
| `ui/SEARCH_UX_CONTRACT.md` | `02-platform-baseline/web-runtime/SEARCH_UX_CONTRACT.md` | canonical owner |
| `ui/HOMEPAGE_CONSTITUTION.md` | `02-platform-baseline/web-runtime/HOMEPAGE_CONSTITUTION.md` | canonical owner |
| `ui/LANDING_PAGE_DESIGN.md` | `02-platform-baseline/web-runtime/LANDING_PAGE_DESIGN.md` | canonical owner |
| `ui/ADMIN_ARCHITECTURE.md` | `02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md` | canonical owner |
| `ui/ADMIN_MODULE_SPECS.md` | `02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md` | canonical owner |
| `design/04-execution-overlay/web/PAGE_INVENTORY.md` | `04-execution-overlay/web/PAGE_INVENTORY.md` | canonical owner |
| `ui/ROUTE_PAGE_CONTRACTS.md` | `04-execution-overlay/web/ROUTE_PAGE_CONTRACTS.md` | canonical owner |
| `design/04-execution-overlay/web/USER_FLOWS.md` | `04-execution-overlay/web/USER_FLOWS.md` | overlay owner |
| `ui/COMPONENT_TRIGGER_MAP.md` | `04-execution-overlay/web/COMPONENT_TRIGGER_MAP.md` | overlay owner |
| `ui/MOTION_ROUTE_INVENTORY.md` | `04-execution-overlay/web/MOTION_ROUTE_INVENTORY.md` | overlay owner |
| `ui/PRESERVED_UI_STATE_MATRIX.md` | `04-execution-overlay/web/PRESERVED_UI_STATE_MATRIX.md` | overlay owner |
| `ui/TOKEN_IMPLEMENTATION_SHEET.md` | `04-execution-overlay/web/TOKEN_IMPLEMENTATION_SHEET.md` | overlay owner |
| `ui/IMAGE_MEDIA_RATIO_MAP.md` | `04-execution-overlay/web/IMAGE_MEDIA_RATIO_MAP.md` | overlay owner |
| `design/05-references/examples/SPIRITUAL_APP_SCREENS.md` | `05-references/examples/SPIRITUAL_APP_SCREENS.md` | reference-heavy design pack |

## Domain Standardization

Mọi domain folder hiện tại nên tiến tới:

```text
03-domains/<domain>/
  DECISIONS.md
  MODULE_MAP.md
  CONTRACTS.md
  SCHEMA_PLAN.md
  STATES/
  USE_CASES/
  REFERENCES/
```

### Shared Domain File Rules

| Current pattern | Action | Target pattern | Role |
|---|---|---|---|
| `decisions.md` | rename | `DECISIONS.md` | canonical owner |
| `module-map.md` | rename | `MODULE_MAP.md` | canonical owner |
| `contracts.md` | rename | `CONTRACTS.md` | canonical owner |
| `schema.dbml` | rename | `SCHEMA_PLAN.dbml` | canonical schema artifact |
| `flows.mmd` | move | `STATES/FLOWS.mmd` | reference to owner docs |
| `*-state.mmd` | move | `STATES/<STATE_NAME>.mmd` | reference to owner docs |
| `use-cases/*.md` | move | `USE_CASES/*.md` | canonical write-path owners |
| `examples/*.md` | move | `REFERENCES/examples/*.md` | reference-only |

### Identity

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/identity/PERMISSION_MATRIX.md` | `03-domains/identity/REFERENCES/PERMISSION_MATRIX.md` | advisory reference |
| `design/03-domains/identity/schema.dbdiagram` | `03-domains/identity/REFERENCES/schema.dbdiagram` | reference artifact |

### Content

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/content/daily-practice-content-inventory.md` | `03-domains/content/REFERENCES/DAILY_PRACTICE_CONTENT_INVENTORY.md` | reference-only |
| `design/03-domains/content/daily-practice-experience-architecture.md` | `03-domains/content/REFERENCES/DAILY_PRACTICE_EXPERIENCE_ARCHITECTURE.md` | advisory/reference |
| `design/03-domains/content/life-release-content-inventory.md` | `03-domains/content/REFERENCES/LIFE_RELEASE_CONTENT_INVENTORY.md` | reference-only |
| `design/03-domains/content/life-release-experience-architecture.md` | `03-domains/content/REFERENCES/LIFE_RELEASE_EXPERIENCE_ARCHITECTURE.md` | advisory/reference |
| `design/03-domains/content/media-library-content-inventory.md` | `03-domains/content/REFERENCES/MEDIA_LIBRARY_CONTENT_INVENTORY.md` | reference-only |
| `design/03-domains/content/media-library-experience-architecture.md` | `03-domains/content/REFERENCES/MEDIA_LIBRARY_EXPERIENCE_ARCHITECTURE.md` | advisory/reference |
| `design/03-domains/content/little-house-content-inventory.md` | `03-domains/content/REFERENCES/LITTLE_HOUSE_CONTENT_INVENTORY.md` | reference-only |
| `design/03-domains/content/little-house-experience-architecture.md` | `03-domains/content/REFERENCES/LITTLE_HOUSE_EXPERIENCE_ARCHITECTURE.md` | advisory/reference |
| `design/03-domains/content/little-house-spec.md` | `03-domains/content/REFERENCES/LITTLE_HOUSE_SPEC.md` | advisory/reference |
| `design/03-domains/content/little-house-tech-features.md` | `03-domains/content/REFERENCES/LITTLE_HOUSE_TECH_FEATURES.md` | reference-only |
| `design/03-domains/content/practice-support-reference.md` | `03-domains/content/REFERENCES/PRACTICE_SUPPORT_REFERENCE.md` | reference-only |
| `design/03-domains/content/practice-ui-checklists.md` | `03-domains/content/REFERENCES/PRACTICE_UI_CHECKLISTS.md` | reference-only |
| `design/03-domains/content/chant-items-catalog.md` | `03-domains/content/REFERENCES/CHANT_ITEMS_CATALOG.md` | reference-only |
| `design/03-domains/content/chanting-environment-rules.md` | `03-domains/content/REFERENCES/CHANTING_ENVIRONMENT_RULES.md` | reference-only |
| `design/03-domains/content/chanting-support-surface.md` | `03-domains/content/REFERENCES/CHANTING_SUPPORT_SURFACE.md` | reference-only |
| `design/03-domains/content/practice-support-flows.mmd` | `03-domains/content/STATES/PRACTICE_SUPPORT_FLOWS.mmd` | reference diagram |
| `design/03-domains/content/publish-state.mmd` | `03-domains/content/STATES/PUBLISH_STATE.mmd` | reference diagram |

### Community

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/community/PRACTICE_COMMUNITY_BOUNDARY.md` | `03-domains/community/REFERENCES/PRACTICE_COMMUNITY_BOUNDARY.md` | advisory boundary reference |

### Engagement

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/engagement/ngoi-nha-nho-state.mmd` | `03-domains/engagement/STATES/NGOI_NHA_NHO_STATE.mmd` | reference diagram |

### Moderation

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/moderation/guestbook-approval-state.mmd` | `03-domains/moderation/STATES/GUESTBOOK_APPROVAL_STATE.mmd` | reference diagram |
| `design/03-domains/moderation/report-state.mmd` | `03-domains/moderation/STATES/REPORT_STATE.mmd` | reference diagram |

### Search

| Current file | Target path | Role |
|---|---|---|
| `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` | `02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md` | canonical optional-scale owner |
| `design/03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md` | `03-domains/search/REFERENCES/UNIFIED_INDEX_MAPPING.md` | domain reference with cross-domain ties |

### Calendar

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/calendar/REFERENCES/ADVISORY-OWNERSHIP.MD` | `03-domains/calendar/REFERENCES/ADVISORY-OWNERSHIP.MD` | canonical feature reference |
| `design/03-domains/calendar/luc-trai-days-canon.md` | `03-domains/calendar/REFERENCES/LUC-TRAI-DAYS-CANON.MD` | canonical content/source owner |
| `design/03-domains/calendar/organizational-events-architecture.md` | `03-domains/calendar/REFERENCES/ORGANIZATIONAL_EVENTS_ARCHITECTURE.md` | advisory/reference |
| `design/03-domains/calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md` | `03-domains/calendar/REFERENCES/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md` | reference-only |
| `design/03-domains/calendar/PRACTICE_ADVISORY_MODEL.md` | `03-domains/calendar/REFERENCES/PRACTICE_ADVISORY_MODEL.md` | reference-only |

### Notification

| Current file | Target path | Role |
|---|---|---|
| `design/02-platform-baseline/optional-scale/PUSH_NOTIFICATION_ARCHITECTURE.md` | `02-platform-baseline/optional-scale/PUSH_NOTIFICATION_ARCHITECTURE.md` | canonical optional-scale owner |
| `design/03-domains/notification/push-job-state.mmd` | `03-domains/notification/STATES/PUSH_JOB_STATE.mmd` | reference diagram |

### Vows Merit

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md` | `03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md` | canonical workflow reference |

### Wisdom QA

| Current file | Target path | Role |
|---|---|---|
| `design/03-domains/wisdom-qa/btpp-library-canon.md` | `03-domains/wisdom-qa/REFERENCES/BTPP-LIBRARY-CANON.MD` | canonical content/source owner |
| `design/03-domains/wisdom-qa/REFERENCES/SOURCE_PROVENANCE_MATRIX.MD` | `03-domains/wisdom-qa/REFERENCES/SOURCE_PROVENANCE_MATRIX.md` | canonical source owner |
| `design/03-domains/wisdom-qa/REFERENCES/INGESTION_PLAN.MD` | `03-domains/wisdom-qa/REFERENCES/INGESTION_PLAN.md` | advisory/reference |
| `design/03-domains/wisdom-qa/manual-translation-editor-workflow.md` | `03-domains/wisdom-qa/REFERENCES/MANUAL-TRANSLATION-EDITOR-WORKFLOW.MD` | canonical workflow reference |
| `design/02-platform-baseline/optional-scale/TRANSLATION_AUTOMATION_ARCHITECTURE.md` | `02-platform-baseline/optional-scale/TRANSLATION_AUTOMATION_ARCHITECTURE.md` | optional-scale owner |
| `design/03-domains/wisdom-qa/REFERENCES/OFFLINE-BUNDLE-DELTA-SYNC.MD` | `03-domains/wisdom-qa/REFERENCES/OFFLINE-BUNDLE-DELTA-SYNC.MD` | advisory reference |
| `design/03-domains/wisdom-qa/baihua-audiobook-ingestion-inventory.md` | `03-domains/wisdom-qa/REFERENCES/BAIHUA_AUDIOBOOK_INGESTION_INVENTORY.md` | reference-only |
| `design/03-domains/wisdom-qa/baihua-audiobook-text-first-architecture.md` | `03-domains/wisdom-qa/REFERENCES/BAIHUA_AUDIOBOOK_TEXT_FIRST_ARCHITECTURE.md` | advisory/reference |
| `design/03-domains/wisdom-qa/OFFLINE_BAIHUA_DIRECTION.md` | `03-domains/wisdom-qa/REFERENCES/OFFLINE_BAIHUA_DIRECTION.md` | reference-only |

### Contact

`11-contact` hiện không có file phụ đặc biệt ngoài bộ chuẩn `decisions/module-map/contracts/schema/use-cases`, nên chỉ cần rename và move theo shared domain file rules.

## First Physical Moves Recommended

1. Tạo `00-governance`
2. Chốt `01-repo-constitution`
3. Chốt `02-platform-baseline` theo runtime role
4. Chốt `04-execution-overlay`
5. Cuối cùng mới dời từng domain folder vào `03-domains`
