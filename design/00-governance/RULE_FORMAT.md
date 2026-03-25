# Rule Format

AI đọc tốt hơn khi luật được trình bày ổn định.

Từ nay mọi file thiên về rule nên ưu tiên format dưới đây.

## Preferred Sections

1. `Purpose`
2. `Scope`
3. `Authority`
4. `Phase`
5. `Version basis` when the rule depends on installed/runtime/version state
6. `Why`
7. `Must`
8. `Must not`
9. `Allowed patterns`
10. `Forbidden patterns`
11. `Dependencies`
12. `References`

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

## Version basis
- design pin: NestJS 11 baseline, not installed runtime truth yet

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
- nếu file nhạy với version/runtime, phải nói rõ `installed truth` hay `design pin`; không để người đọc tự đoán
- tránh prose lan man trước khi tới rules
- ví dụ cụ thể nên để cuối file hoặc trong `References`
