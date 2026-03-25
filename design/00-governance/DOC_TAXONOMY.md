# Doc Taxonomy

Mọi file trong `design/` phải được hiểu qua 5 trục metadata sau, dù metadata đó được giữ bằng frontmatter hay registry riêng.

## Required Metadata

- `doc_type`
- `authority`
- `scope`
- `phase`
- `status`

## doc_type

### `governance`

Dùng cho:

- source priority
- taxonomy
- conflict rules
- naming rules
- status semantics
- import boundaries
- canonical layout

### `constitution`

Dùng cho:

- repo direction
- ownership baseline
- anti-goals
- package boundaries
- product laws

### `baseline`

Dùng cho:

- framework/version/runtime policy
- platform defaults
- security/data/edge/deploy rules

### `feature`

Dùng cho:

- domain decisions
- contracts
- module maps
- use-cases
- state diagrams

### `overlay`

Dùng cho:

- implementation truth
- readiness
- route inventory
- DTO/schema plan
- scaffold order
- gap/backlog tied to build execution

### `reference`

Dùng cho:

- examples
- starter notes
- research
- external alignment notes

### `prompt`

Dùng cho:

- builder prompts
- reviewer prompts
- reading protocol prompts

## authority

- `required`
- `advisory`
- `informational`

## scope

Ví dụ hợp lệ:

- `repo`
- `web`
- `api`
- `admin`
- `infra`
- `data-runtime`
- `security-runtime`
- `edge-delivery`
- `deploy-ops`
- `feature:identity`
- `feature:content`
- `feature:search`

## phase

- `phase_1`
- `phase_2`
- `phase_3`
- `all`

## status

- `active`
- `draft`
- `deprecated`
- `reference-only`

## Default Mapping Rules

- `overview/*` mặc định là `reference` hoặc `constitution-summary`, không phải owner runtime policy
- `baseline/*` mặc định là `baseline`
- `tracking/*` mặc định là `overlay`
- `NN-domain/*` mặc định là `feature`
- `examples/*` mặc định là `reference`

## Registry Requirement

Không bắt buộc phải nhét frontmatter vào toàn bộ file hiện có ngay lập tức.

Nhưng từ nay `design/` phải có khả năng được map machine-readably theo taxonomy này qua:

- frontmatter
- hoặc registry file riêng

## Status vocabulary rule

- overlay/governance docs không được tự phát minh status synonym kiểu:
  - `done`
  - `almost-ready`
  - `in-progress but safe`
- status machine-readable phải bám [IMPLEMENTATION_STATUS_SCHEMA.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPLEMENTATION_STATUS_SCHEMA.md)
- prose được giải thích thêm, nhưng không thay canonical status vocabulary
