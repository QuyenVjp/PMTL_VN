# Design Governance

Thư mục này là lớp điều phối cho toàn bộ `design/`.
Read chain canonical giờ được gộp xuống vài file thật sự phải đọc, thay vì nhảy qua nhiều protocol nhỏ.

## Ownership Authority

**📋 Full ownership matrix → [ROOT_DOC_OWNERSHIP.md](../01-repo-constitution/ROOT_DOC_OWNERSHIP.md)**

Tất cả quy tắc design-level governance được chốt trong file đó. README này chỉ là read pointer.

**⚖️ Conflict resolution → [DECISIONS.md](../01-repo-constitution/DECISIONS.md)** (THẮNG tất cả khi mâu thuẫn)

**🗂️ Legacy shim files → [SHIMS.md](./SHIMS.md)** (backward link compatibility only)

## Read Order (Nếu cần orientation)

1. [FOLDER_CANON.md](../00-governance/FOLDER_CANON.md) — canonical layout
2. [MIGRATION_MAP.md](../05-references/audit-trail/MIGRATION_MAP.md) — audit trail di chuyển file (nếu cần)

## Purpose

`design/` phải được đọc như:

- `policy system`
- `execution planning system`
- `full-stack ownership map`

Không file nào được tự mặc định là owner nếu governance không nói rõ điều đó.

## Legacy note

Các file cũ như `SOURCE_PRIORITY.md`, `CONFLICT_RESOLUTION.md`, `PHASE_SEMANTICS.md`, `IMPLEMENTATION_STATUS_SCHEMA.md`, `IMPORT_BOUNDARIES.md`, `CANONICAL_LAYOUT.md`, `DOC_TAXONOMY.md`, `RULE_FORMAT.md` vẫn còn path để tránh gãy link cũ, nhưng giờ chỉ là shim trỏ về canonical files ở trên.
