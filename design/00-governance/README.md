# Design Governance

Thư mục này là lớp điều phối cho toàn bộ `design/`.

Nó tồn tại để chốt 5 thứ trước khi bàn tới implementation:

- docs nào có quyền cao hơn docs nào
- file nào là `owner`, file nào chỉ là `reference`
- phase/status/readiness được hiểu thống nhất thế nào
- boundary import và boundary layer của full-stack PMTL
- cây thư mục canonical mà toàn bộ `design/` nên tiến tới

## Read Order

1. [SOURCE_PRIORITY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/SOURCE_PRIORITY.md)
2. [DOC_TAXONOMY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/DOC_TAXONOMY.md)
3. [CONFLICT_RESOLUTION.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/CONFLICT_RESOLUTION.md)
4. [RULE_FORMAT.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/RULE_FORMAT.md)
5. [PHASE_SEMANTICS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/PHASE_SEMANTICS.md)
6. [IMPLEMENTATION_STATUS_SCHEMA.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPLEMENTATION_STATUS_SCHEMA.md)
7. [IMPORT_BOUNDARIES.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPORT_BOUNDARIES.md)
8. [CANONICAL_LAYOUT.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/CANONICAL_LAYOUT.md)
9. [MIGRATION_MAP.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/MIGRATION_MAP.md)

## Purpose

`design/` không còn được hiểu như một thư mục note lớn.

Từ sau lớp governance này, `design/` phải được đọc như:

- `policy system`
- `execution planning system`
- `full-stack ownership map`

Không file nào được tự mặc định là owner nếu governance không nói rõ điều đó.

## Audit Closure In This Pass

Governance audit của tháng `2026-03` chốt thêm 4 khoảng trống từng gây drift:

- governance đứng trên các layer khác khi tranh chấp về taxonomy, source priority, status semantics, và canonical layout
- status vocabulary phải bám [IMPLEMENTATION_STATUS_SCHEMA.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/00-governance/IMPLEMENTATION_STATUS_SCHEMA.md), không tự phát minh `ready-ish`, `done`, `almost-ready`
- doc có yếu tố version/runtime phải nói rõ đang dựa trên `installed truth`, `design pin`, hay `activation-time pin`
- không được suy ra “repo đã cài / runtime đã tồn tại” chỉ vì `design/` đã pin version hoặc scaffold order
