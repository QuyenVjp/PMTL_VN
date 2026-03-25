# Canonical Layout

`design/` nên tiến tới layout canonical sau.

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
    identity/
    content/
    community/
    engagement/
    moderation/
    search/
    calendar/
    notification/
    vows-merit/
    wisdom-qa/
    contact/
  04-execution-overlay/
    repo/
    api/
    web/
    admin/
    data/
    cross-module/
  05-references/
    external-research/
    framework-docs/
    starter-patterns/
    examples/
  06-prompts/
```

## Why This Layout

- `governance` tách khỏi runtime rule
- `constitution` tách khỏi baseline kỹ thuật
- `baseline` tách theo runtime role, không theo tool
- `domains` chứa logic lõi dự án
- `overlay` chứa implementation truth, không trộn vào design policy
- `references` bị hạ quyền rõ ràng
- `prompts` đứng riêng để phục vụ AI sau này

## Folder Rules

### `00-governance`

Chứa source priority, taxonomy, conflict rules, phase/status semantics, import boundaries, canonical layout.

### `01-repo-constitution`

Chứa repo direction, ownership baseline, product constitution, top-level canonical owner docs.

### `02-platform-baseline`

Chứa full-stack runtime defaults, version governance, security/data/edge/deploy rules.

### `03-domains`

Mỗi domain nên hướng tới cấu trúc:

```text
<domain>/
  DECISIONS.md
  MODULE_MAP.md
  CONTRACTS.md
  SCHEMA_PLAN.md
  STATES/
  USE_CASES/
  REFERENCES/
```

### `04-execution-overlay`

Chứa implementation truth, scaffold order, route/DTO/schema mappings, readiness/gap reports.

### `05-references`

Chứa docs snapshots, starter references, examples, research appendices. Mặc định `reference-only`.

### `06-prompts`

Chứa prompt đọc docs, prompt builder, prompt reviewer.
