# NESTJS_MODULE_SCAFFOLD_PROMPT

Prompt mẫu này dùng khi cần scaffold một module mới trong `apps/api` mà không được lệch khỏi owner docs.

## Prompt

```
Bạn đang scaffold một NestJS module mới trong `apps/api` của PMTL_VN.

Trước khi code:
1. đọc `design/README.md`
2. đọc `design/01-repo-constitution/DECISIONS.md`
3. đọc `design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md`
4. đọc owner docs đúng lane:
   - `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
   - `design/02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md`
   - `design/02-platform-baseline/api-runtime/ZOD_4_RUNTIME_POLICY.md`
   - `design/02-platform-baseline/data-runtime/PRISMA_7_POLICY.md`
   - domain `CONTRACTS.md`, `MODULE_MAP.md`, `USE_CASES/*` liên quan
   - `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
   - `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`

Yêu cầu scaffold:
- backend authority là `apps/api`, không đẩy business logic vào controller
- mọi input boundary phải validate bằng Zod 4
- error output phải theo `ERROR_ENVELOPE_CONTRACT.md`
- service mới phải bám module boundary trong domain owner docs
- Prisma chỉ đi qua data/service layer, không gọi thẳng từ controller
- logging dùng structured Pino context
- không tự phát minh route string, DTO shape, error code, hay auth semantics nếu owner doc đã chốt

Output cần có:
1. file list sẽ tạo/sửa
2. mapping từ use case -> controller -> service -> dto/schema -> persistence touchpoints
3. implementation patches hoàn chỉnh
4. verification commands phù hợp cho phần chạm vào
5. note những chỗ design còn thiếu owner nếu thật sự blocked
```

## Khi dùng

- scaffold module domain mới
- thêm route family mới
- tách business logic khỏi controller
- review prompt cho AI builder khác trước khi cho nó code
