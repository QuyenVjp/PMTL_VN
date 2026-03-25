# Rule Format

AI đọc tốt hơn khi luật được trình bày ổn định.

Từ nay mọi file thiên về rule nên ưu tiên format dưới đây.

## Preferred Sections

1. `Purpose`
2. `Scope`
3. `Authority`
4. `Phase`
5. `Why`
6. `Must`
7. `Must not`
8. `Allowed patterns`
9. `Forbidden patterns`
10. `Dependencies`
11. `References`

## Minimal Example

```md
# Rule: Validation boundary

## Purpose
- Enforce runtime-safe request validation at API boundaries.

## Scope
- api
- feature:identity

## Authority
- required

## Phase
- phase_1

## Why
- Keep request validation consistent and machine-checkable.

## Must
- Validate input at the boundary.

## Must not
- Validate ad hoc in services.
```

## Format Rules

- `Must` chỉ chứa bắt buộc thật sự
- `Must not` chỉ chứa cấm đoán thật sự
- tránh prose lan man trước khi tới rules
- ví dụ cụ thể nên để cuối file hoặc trong `References`
