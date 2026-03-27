# Folder Canon

File này chốt layout canonical cho `design/` và nói rõ quan hệ giữa canonical layout với migration ledger.

## Canonical Layout

```text
design/
  00-governance/
  01-repo-constitution/
  02-platform-baseline/
    api-runtime/
    web-runtime/
    admin-runtime/
    data-runtime/
    security-runtime/
    edge-delivery/
    deploy-ops/
    optional-scale/
    dependency-version/
  03-domains/
  04-execution-overlay/
  05-references/
  06-prompts/
```

## Folder Roles

- `00-governance`: precedence, taxonomy, status/phase, layout, import/format rules
- `01-repo-constitution`: repo direction, ownership baseline, anti-goals, product laws
- `02-platform-baseline`: runtime defaults, version/runtime/security/data/edge/deploy rules
- `03-domains`: domain decisions, contracts, module maps, use-cases, state diagrams
- `04-execution-overlay`: implementation truth, scaffold order, route/schema/query mappings, readiness
- `05-references`: examples, research, starter notes, external alignment
- `06-prompts`: AI reading/builder/reviewer prompts

## Live Layout Rule

- file này chốt target layout
- [MIGRATION_MAP.md](../00-governance/MIGRATION_MAP.md) chỉ là audit ledger cho move/rename history
- [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md) vẫn là owner registry chi tiết

## Domain Standard

Mỗi domain nên tiến tới:

```text
03-domains/<domain>/
  DECISIONS.md
  MODULE_MAP.md
  CONTRACTS.md
  SCHEMA_PLAN.dbml
  STATES/
  USE_CASES/
  REFERENCES/
```

## Practical Rule

- không tạo root-level alias mới nếu đã có canonical path rõ
- file moved/completed có thể còn sống ở `MIGRATION_MAP.md` như audit trail, nhưng không phải live owner
- overview folder không được sống song song như authority layer mới
