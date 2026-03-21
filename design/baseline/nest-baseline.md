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

## Prisma safety defaults

- Prisma client nên bật **global `omit`** cho các field nhạy cảm như `passwordHash`, `refreshTokenHash`, `resetTokenHash` nếu model có các field này
- Query local có thể dùng `omit` thay vì `select` khi mục tiêu là loại một vài field nhạy cảm khỏi payload
- Bật `strictUndefinedChecks` để chặn query nguy hiểm với `undefined`
- TypeScript config phải bật `exactOptionalPropertyTypes` để hỗ trợ rule trên ở compile time
- Khi `strictUndefinedChecks` bật, code phải dùng `Prisma.skip` thay vì truyền `undefined` vào query data/where object
- Không để mapper/controller tự tin rằng field nhạy cảm đã bị loại nếu Prisma query chưa `omit` hoặc `select` rõ

## Module anatomy

Mỗi module backend tối thiểu nên có:

- `controller`
- `service`
- `schemas` hoặc `dto` theo hướng Zod contract
- `policy/guard helper` nếu module có authz phức tạp
- `repository` hoặc Prisma-facing data layer khi query đủ lớn để tách

## Cross-module communication (Bug 1 fix: chống circular dependency)

### Nguyên tắc bất biến

- **Không import toàn bộ module khác** để dùng 1 service.
- Module A cần data từ Module B → B phải **export rõ ràng** 1 query service interface, A inject qua DI.
- **Không có module nào import lẫn nhau** (circular). Nếu 2 modules cần nhau → tách shared interface ra `packages/shared` hoặc dùng event.

### Pattern cho phép

```
✅ Calendar inject WisdomQueryService (Wisdom-QA export)
✅ Moderation inject ContentQueryService (Content export)
✅ Search nhận SearchDocumentDto từ source module qua direct call
✅ Notification inject từ bất kỳ module nào qua exported interface
```

### Pattern CẤM

```
❌ Calendar import WisdomQaModule vào imports[] → circular risk
❌ Module A gọi Module B qua internal repository (bypass service layer)
❌ Module tự query DB table thuộc module khác
❌ Shared package import từ apps/* (ngược chiều)
```

### Khi cần bidirectional communication

- Dùng **event pattern** (phase 1: inline sync, phase 2+: outbox)
- Hoặc tách interface vào `packages/shared/src/contracts/`
- Ref: `tracking/outbox-event-taxonomy.md` cho event nào đi outbox

---

## Audit transaction enforcement (Bug 2 fix: audit phải block write-path)

### Nguyên tắc bất biến

- **Audit PHẢI nằm trong cùng database transaction** với canonical write.
- Nếu audit fail → toàn bộ transaction rollback → write không xảy ra.
- Không có trường hợp nào write thành công mà audit bị mất.

### Pattern bắt buộc

```typescript
// ĐÚG — audit trong cùng transaction
await prisma.$transaction(async (tx) => {
  const entity = await tx.post.create({ data: payload });
  await tx.auditLog.create({
    data: {
      eventType: 'content.post.created',
      actorUserId,
      targetId: entity.id,
      // ...
    },
  });
  return entity;
});
```

### Pattern CẤM

```typescript
// SAI — audit ngoài transaction, có thể fail mà write vẫn xảy ra
const entity = await prisma.post.create({ data: payload });
await auditService.append({ ... }); // ← fire-and-forget, swallowed exception
```

### Khi nào được fire-and-forget audit

- **Không bao giờ** cho write-path (create, update, delete, role change, auth event).
- Chỉ được fire-and-forget cho **read-heavy analytics** không ảnh hưởng tới business integrity (ví dụ: view count).

### AuditService contract

```typescript
interface AuditService {
  // Dùng trong transaction — nhận Prisma transaction client
  appendInTransaction(tx: PrismaTransactionClient, event: AuditEvent): Promise<void>;

  // Dùng ngoài transaction — chỉ cho read analytics
  appendAsync(event: AuditEvent): void; // fire-and-forget, có structured log
}
```

- Mọi use-case có ghi `audit event` trong danh sách mandatory events (`tracking/audit-policy.md`) PHẢI dùng `appendInTransaction`.
- Ref: `baseline/security.md` phần "Audit events bắt buộc"

---

## Non-negotiables

- controller mỏng
- service giữ business logic
- persistence không leak thẳng ra public DTO
- không tạo source of truth thứ hai giữa Zod schema và DTO decorator model
- mọi launch-blocker flow phải map vào [implementation-mapping.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/implementation-mapping.md)
- cross-module communication phải qua exported service interface, không import toàn bộ module
- audit mandatory events phải trong cùng DB transaction với write
