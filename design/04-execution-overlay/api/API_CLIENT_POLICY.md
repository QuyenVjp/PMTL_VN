# API_CLIENT_POLICY

File này chốt stance cho `packages/api-client`.
Nó tồn tại để AI không tự động generate client authority mới từ OpenAPI hoặc hand-write client mỗi nơi một kiểu.

Authority chain:

- [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md)
- [API_DTO_SHAPE_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md)
- [ERROR_ENVELOPE_CONTRACT.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md)
- [IMPLEMENTATION_MAPPING.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md)

## Baseline

- `packages/api-client` không phải source of truth
- API authority vẫn thuộc `apps/api`
- initial posture là `hand-curated or lightly generated`, không auto-generate mù từ spec chưa ổn định

## Generation rule

- chỉ mở generation flow khi route inventory + DTO shape plan + error envelope đã ổn định đủ
- generated output phải bám canonical error envelope và sanitized DTOs
- client package không được phát minh field, retry policy, hay auth semantics riêng

## Forbidden drift

- generate client trực tiếp từ runtime thử nghiệm rồi đem làm contract authority
- để web/admin tự có fetch helper authority khác `packages/api-client`
- nhét business rules, auth authority, hay persistence assumptions vào client package
