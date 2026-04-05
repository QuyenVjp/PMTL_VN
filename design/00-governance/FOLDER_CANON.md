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
    vps-runtime/          ← VPS self-host deploy canon (2026-03-27)
  03-domains/
  04-execution-overlay/
  05-references/
  06-prompts/
  visuals/               ← C4 diagrams, domain maps, VPS cylinder (2026-03-27)
```

## Folder Roles (Tóm Tắt)

- `00-governance`: canonical layout pointer chỉ
- `01-repo-constitution`: repo direction, ownership baseline
- `02-platform-baseline`: runtime defaults
- `03-domains`: domain decisions, use-cases
- `04-execution-overlay`: implementation truth
- `05-references`: examples, research
- `06-prompts`: AI prompts
- `visuals/`: diagrams

**Full roles table + precedence rules → [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md)**

## Authority Chain

1. [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md) — chốt quyền sở hữu từng file + conflict rule
2. File này — chỉ layout canonical
3. [MIGRATION_MAP.md](../05-references/audit-trail/MIGRATION_MAP.md) — audit trail (không phải owner)

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
- file moved/completed có thể còn sống ở `design/05-references/audit-trail/MIGRATION_MAP.md` như audit trail, nhưng không phải live owner
- overview folder không được sống song song như authority layer mới

## BRD Research Files

Các file `BRD_PHASE_XX_*.md` hiện đang nằm ở `design/` root là **legacy inputs** từ quá trình phân tích requirements. Chúng KHÔNG thuộc bất kỳ layer canonical nào.

- **Target path cho BRD mới:** `design/05-references/brd-research/`
- **Files hiện tại tại root:** Giữ nguyên vị trí như source snapshot; xem index tại `design/05-references/brd-research/INDEX.md`
- **Không promote BRD files lên canonical owner status** — logic từ BRDs phải được phân phối vào `design/03-domains/<domain>/USE_CASES/` trước khi có giá trị implementation
- **Ownership:** `design/05-references/brd-research/INDEX.md` — xem `ROOT_DOC_OWNERSHIP.md`
