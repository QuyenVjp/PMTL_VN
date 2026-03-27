# Design Governance

Thư mục này là lớp điều phối cho toàn bộ `design/`.
Read chain canonical giờ được gộp xuống vài file thật sự phải đọc, thay vì nhảy qua nhiều protocol nhỏ.

## Read Order

1. [GOVERNANCE_SYSTEM.md](../00-governance/GOVERNANCE_SYSTEM.md)
2. [STATUS_AND_PHASE.md](../00-governance/STATUS_AND_PHASE.md)
3. [FOLDER_CANON.md](../00-governance/FOLDER_CANON.md)
4. [IMPORT_AND_FORMAT.md](../00-governance/IMPORT_AND_FORMAT.md)
5. [WRITING_STANDARDS.md](../00-governance/WRITING_STANDARDS.md)
6. [MIGRATION_MAP.md](../00-governance/MIGRATION_MAP.md) khi cần audit trail di chuyển file

## Purpose

`design/` phải được đọc như:

- `policy system`
- `execution planning system`
- `full-stack ownership map`

Không file nào được tự mặc định là owner nếu governance không nói rõ điều đó.

## Legacy note

Các file cũ như `SOURCE_PRIORITY.md`, `CONFLICT_RESOLUTION.md`, `PHASE_SEMANTICS.md`, `IMPLEMENTATION_STATUS_SCHEMA.md`, `IMPORT_BOUNDARIES.md`, `CANONICAL_LAYOUT.md`, `DOC_TAXONOMY.md`, `RULE_FORMAT.md` vẫn còn path để tránh gãy link cũ, nhưng giờ chỉ là shim trỏ về canonical files ở trên.
