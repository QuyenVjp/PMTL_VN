# SERVERCN_DESIGN_REFERENCE

File này chốt cách dùng `Servercn` trong PMTL_VN ở giai đoạn `design-first`.
Nó là tài liệu tham chiếu để đồng bộ ngôn ngữ scaffold backend và inventory component, không phải lệnh bật runtime hoặc artifact code thật.

## Kết luận ngắn

- `Servercn` hữu ích như một `backend component registry` để tham khảo các mảnh ghép backend phổ biến.
- Ở thời điểm tài liệu này được viết, `Servercn` đang `Express-first`, không phải `NestJS-first`.
- PMTL_VN hiện chốt `NestJS` làm backend authority, nên `Servercn` **không** được coi là source of truth cho cấu trúc runtime.
- `Servercn` chỉ được dùng như:
  - design vocabulary (từ vựng thiết kế backend)
  - component inventory reference (tham chiếu danh mục thành phần)
  - scaffold comparison baseline (mốc so sánh khi lên plan code)

## Điều gì đã được xác minh

Từ tài liệu public của `Servercn`:

- project positioning: backend component registry cho `Node.js + TypeScript`
- installation flow: `npx servercn-cli init`
- current framework choice trong config: `Express`
- foundations hiện thấy:
  - `Basic Express Starter`
  - `Drizzle MySQL Starter`
  - `Drizzle PostgreSQL Starter`
  - `Mongoose Starter`
  - `Prisma MongoDB Starter`
- component inventory hiện có các nhóm hữu ích cho PMTL:
  - error handling
  - response formatting
  - auth helpers
  - oauth
  - logger
  - health check
  - rate limiter
  - Zod request validation
  - Swagger docs

## Quy tắc dùng trong PMTL

### Allowed in design-first

- dùng để tham khảo naming cho backend building blocks
- dùng để rà đủ các capability phase 1 như:
  - logger
  - error envelope
  - auth verification
  - health checks
  - rate limiting
  - request validation
  - Swagger / OpenAPI
- dùng làm checklist khi viết tài liệu baseline hoặc implementation plan
- dùng để đối chiếu xem PMTL còn thiếu artifact design nào

### Forbidden in current repo phase

- không chạy `servercn-cli init` vào repo đang giữ `NestJS` authority
- không sinh runtime scaffold `Express` vào `apps/api`
- không thêm `servercn.config.json` ở repo root như thể đó là config runtime chính thức
- không map component name của `Servercn` thành trạng thái `implemented` trong `design/tracking/implementation-mapping.md` nếu chưa có artifact NestJS thật

## Cách map tư duy Servercn sang PMTL

| Servercn concept | Giá trị tham khảo | Mapping đúng trong PMTL |
|---|---|---|
| Foundation | bootstrap backend skeleton | chỉ dùng làm benchmark; runtime thật vẫn phải map về `design/baseline/nest-baseline.md` |
| `error-handler` | chuẩn hóa lỗi | map vào global exception filter + error envelope của NestJS |
| `response-formatter` | envelope chuẩn | chỉ tham khảo nếu không tạo source of truth thứ hai ngoài contract hiện tại |
| `logger` | structured logging | map vào `Pino` + `nestjs-pino` |
| `health-check` | liveness/readiness/startup surface | map vào health module của `apps/api` |
| `rate-limiter` | request throttling | map vào guard + Postgres-backed rate limit path phase 1 |
| `jwt-utils` / `oauth` | auth helper vocabulary | map vào identity module và platform sessions, không scaffold nguyên xi |
| `request validator (Zod)` | validation boundary | phù hợp với baseline hiện tại, nhưng source of truth vẫn là PMTL Zod contract |

## Design-only config snapshot

Đây là `reference snapshot`, không phải file cần thả vào repo root:

```json
{
  "$schema": "https://servercn.vercel.app/schema/servercn.config.json",
  "version": "1.1.4",
  "project": {
    "root": ".",
    "type": "backend",
    "packageManager": "pnpm"
  },
  "stack": {
    "runtime": "node",
    "language": "typescript",
    "framework": "express",
    "architecture": "feature"
  },
  "database": {
    "engine": "postgresql",
    "adapter": "drizzle"
  },
  "meta": {
    "status": "reference-only-for-design"
  }
}
```

## PMTL decision

- PMTL **không cài runtime Servercn** trong giai đoạn này.
- PMTL **chấp nhận dùng Servercn như external design reference** cho inventory backend component.
- Nếu sau này muốn dùng `Servercn` thật, phải qua một design review mới và trả lời rõ:
  - dùng nó để scaffold trong repo tách riêng hay không
  - có chấp nhận drift từ `NestJS` sang `Express` hay không
  - phần nào là copied inspiration, phần nào là actual runtime source

## Khi nào nên mở lại quyết định này

- khi team muốn so sánh tốc độ scaffold giữa `NestJS-first` và `Express-first`
- khi cần benchmark inventory backend boilerplates ngoài repo
- khi chuẩn bị viết skill hoặc script riêng để scaffold `NestJS` theo style PMTL dựa trên inventory tương tự `Servercn`

## Related docs

- [DECISIONS.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/DECISIONS.md)
- [nest-baseline.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/baseline/nest-baseline.md)
- [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)
- [coding-readiness.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/coding-readiness.md)
