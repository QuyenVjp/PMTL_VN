# Governance System

File này là canonical entrypoint cho governance của `design/`.
Nó gộp source priority, doc taxonomy, và conflict resolution vào một chỗ để AI không phải nhảy qua nhiều file nhỏ.

## Purpose

- chốt layer nào thắng layer nào
- phân loại doc theo đúng vai trò
- xử lý conflict mà không đoán theo độ dài hay độ mới của file

## Source Priority

1. Governance
2. Repo Constitution
3. Platform Baseline
4. Domain Feature Pack
5. Execution Overlay
6. References and Examples

Rule:

- `00-governance` không thay owner policy/content của constitution hoặc baseline
- governance chỉ thắng khi câu hỏi là taxonomy, precedence, status semantics, naming/layout, hoặc conflict mechanics

## Taxonomy

### doc_type

- `governance`
- `constitution`
- `baseline`
- `feature`
- `overlay`
- `reference`
- `prompt`

### authority

- `required`
- `advisory`
- `informational`

### scope

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
- `feature:<domain>`

### status

Status canon cho implementation/readiness không chốt ở đây.
Đọc [STATUS_AND_PHASE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/STATUS_AND_PHASE.md).

## Hard Rules

- snippet không được đè rule
- example không được đè owner doc
- overlay thắng mọi giả định về implementation truth
- nếu design nói có nhưng overlay nói `planned`, phải xử lý như `planned`
- version-matched repo docs và repo matrix thắng model memory và “latest by vibe”
- official docs mới hơn repo docs thì phải cập nhật repo docs trước hoặc trong cùng task

## Conflict Resolution

1. higher source priority wins
2. governance wins cho taxonomy, status semantics, source priority, và conflict mechanics
3. `required` beats `advisory`
4. `active` beats `draft`
5. phase-matching doc beats generic `all` doc when both are valid
6. execution overlay wins cho implementation/runtime truth
7. canonical owner beats summary/reference file
8. references/examples never beat repo rules

## Canonical Questions

### Nếu `README` khác `DECISIONS`?

- `DECISIONS` thắng

### Nếu `overview/*` khác `tracking/*`?

- overlay/tracking thắng cho implementation truth
- owner doc domain thắng cho policy domain

### Nếu sample/example khác contracts?

- contracts thắng

### Nếu official docs mới hơn baseline repo?

- repo phải được cập nhật rồi mới cho phép implementation bám theo

## Mandatory Escalation Cases

Phải dừng và sửa docs trước khi scaffold nếu gặp:

- owner doc mâu thuẫn trực tiếp với `DECISIONS`
- overlay nói `planned` nhưng scaffold backlog đã coi như `implemented`
- route inventory không khớp page contracts hoặc admin mapping
- Prisma schema plan không khớp domain schema owners
- optional-scale doc bị dùng như phase_1 default

## Anti-Patterns

- đọc ví dụ trước khi đọc luật
- lấy `overview` thay cho owner doc
- lấy starter/template làm source of truth
- lấy file mới sửa gần đây nhất làm đúng hơn
- suy ra implementation từ architecture prose
- suy `installed truth` từ design pin khi runtime artifact chưa tồn tại

## Reading Order

1. file này
2. [STATUS_AND_PHASE.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/STATUS_AND_PHASE.md)
3. [FOLDER_CANON.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/FOLDER_CANON.md)
4. [IMPORT_AND_FORMAT.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPORT_AND_FORMAT.md)
5. [WRITING_STANDARDS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/WRITING_STANDARDS.md)
