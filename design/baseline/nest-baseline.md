# NEST_APPLICATION_BASELINE

File này chốt `application architecture` của `apps/api` trước khi viết code.
Nếu chưa thống nhất các điểm ở đây, không nên bắt đầu scaffold hàng loạt.

## Stack decision

- framework: `NestJS`
- ORM: `Prisma`
- runtime validation: `Zod`
- logger: `Pino` qua `nestjs-pino`
- API contract surface: `Swagger / OpenAPI`

## Không dùng làm mặc định

- `class-validator` + class DTO decorators làm validation baseline
- exception shape tùy hứng theo từng controller
- logger rời rạc bằng `console.*`
- business logic trong controller

## Request pipeline mặc định

1. request-id / correlation middleware
2. proxy / client-ip resolution middleware
3. auth guard nếu route cần auth
4. role/permission guard nếu route cần authz
5. rate-limit guard nếu route thuộc protected surface
6. `ZodValidationPipe` cho params/query/body
7. controller mỏng gọi service
8. service xử lý business logic + persistence
9. global exception filter chuẩn hóa error envelope
10. response logging / metrics capture

## Validation decision

- boundary validation mặc định dùng `Zod`
- mọi request DTO, query, params, env contract, webhook payload đều phải có schema `Zod`
- nếu cần OpenAPI sync:
  - route contract phải được map rõ từ schema sang docs
  - không dùng decorator DTO riêng chỉ để tạo ra source of truth thứ hai

## Guard decision

- authn:
  - JWT access token + refresh rotation
  - browser flow ưu tiên cookie transport an toàn
- authz:
  - role guard sau auth guard
  - policy-level check chi tiết nằm trong service hoặc policy helper, không nhét hết vào controller
- rate limit:
  - guard riêng cho auth/search/write/upload surfaces

## Error contract

### Error envelope mặc định

```json
{
  "error": {
    "code": "auth.invalid_credentials",
    "message": "Thông điệp an toàn cho client",
    "status": 401,
    "requestId": "req_123",
    "details": {}
  }
}
```

### Rules

- mọi error response phải có:
  - `code`
  - `message`
  - `status`
  - `requestId`
- không lộ stack trace cho client production
- validation errors phải trả field-level details an toàn
- auth errors phải tránh enumeration

## Logging decision

- dùng `Pino` cho toàn bộ app
- mọi log phải có structured context tối thiểu:
  - `requestId`
  - `route`
  - `actorUserId` nếu có
  - `module`
  - `action`
- không log password, raw token, secret, raw refresh token

## Module anatomy

Mỗi module backend tối thiểu nên có:

- `controller`
- `service`
- `schemas` hoặc `dto` theo hướng Zod contract
- `policy/guard helper` nếu module có authz phức tạp
- `repository` hoặc Prisma-facing data layer khi query đủ lớn để tách

## Non-negotiables

- controller mỏng
- service giữ business logic
- persistence không leak thẳng ra public DTO
- không tạo source of truth thứ hai giữa Zod schema và DTO decorator model
- mọi launch-blocker flow phải map vào [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)
