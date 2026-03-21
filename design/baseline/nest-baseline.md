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
- schema nghiệp vụ nên đăng ký tập trung qua Zod registry/metadata để giảm việc viết lại cùng contract cho validation, docs, và internal tooling
- nếu cần sinh JSON Schema/OpenAPI, ưu tiên derive từ registry/schema chuẩn thay vì viết source of truth thứ hai
- nếu cần OpenAPI sync:
  - route contract phải được map rõ từ schema sang docs
  - không dùng decorator DTO riêng chỉ để tạo ra source of truth thứ hai
- nếu OpenAPI surface lớn, Nest Swagger CLI plugin chỉ được dùng để giảm decorator boilerplate ở transport/documentation layer; business schema vẫn phải bám Zod contract

### Contract generation discipline

- chuẩn tối thiểu cho mỗi use-case write/public route:
  - `request schema`
  - `response schema`
  - `error code mapping`
  - `OpenAPI operation id`
- không copy cùng field list vào 3 nơi khác nhau chỉ để phục vụ:
  - runtime validation
  - Swagger/OpenAPI
  - admin/client form rendering
- nếu một surface chỉ là admin/reference-data CRUD, có thể generate transport/form layer từ contract registry
- auth, sessions, moderation decisions, outbox, search sync, và canonical publish flows không được dựa vào generated CRUD để thay business policy

### Contract reuse rule

- ưu tiên một chuỗi contract duy nhất: `Prisma model / domain shape -> Zod schema -> Nest route contract -> OpenAPI surface`
- không được để `apps/api`, `apps/web`, và `apps/admin` mỗi nơi tự viết lại cùng một request/response schema bằng tay nếu có thể chia sẻ ở `packages/shared`
- các schema chia sẻ phải đại diện cho boundary contract; không được export thẳng Prisma persistence model ra public clients
- nếu route cần cả runtime validation lẫn docs, ưu tiên helper/pattern chung để map từ Zod sang Nest/OpenAPI thay vì lặp decorator thủ công ở từng controller
- registry/schema dùng chung nên sống ở `packages/shared` hoặc workspace boundary tương đương; controller/service không tự giữ bộ field list riêng nếu web/admin cũng dùng lại schema đó

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

## Prisma concurrency / transaction policy

- read-modify-write flows như refresh rotation, reset-password revoke-all, assisted-entry dedupe, và moderation decision có side effects phải dùng transaction pattern rõ
- nếu flow cần custom logic giữa các query, ưu tiên interactive transaction
- với transaction có khả năng conflict cao:
  - cân nhắc `Serializable`
  - retry hữu hạn khi Prisma trả conflict/deadlock tương đương `P2034`
- các aggregate dễ race nên có version/timestamp guard rõ để hỗ trợ optimistic concurrency control thay vì overwrite mù
- retry logic không copy-paste theo từng service; nên có helper chuẩn kiểu `runTransactionalWithRetry()` nhận:
  - isolation level
  - retry budget
  - retryable Prisma codes
  - structured log context
- không được viết logic auth/session theo kiểu read ngoài transaction rồi update rời rạc nếu invariants có thể bị race

### Prisma extension rule

- technical repetition trong data layer nên ưu tiên gom bằng Prisma Client `$extends` thay vì copy-paste helper ở mọi repository/service
- extension hợp lệ cho PMTL_VN:
  - common `omit/select` policy cho field nhạy cảm
  - result mapper nhẹ cho canonical DTO nội bộ
  - query/client helper thuần kỹ thuật như actor scoping hoặc audit metadata attach
- không nhét business policy vào Prisma extension; moderation decision, auth authority, publish policy vẫn phải nằm ở module service
- nếu một extension ảnh hưởng nhiều module, nó phải có tên rõ và sống tập trung ở `common/prisma/extensions/`

### Typed SQL rule

- với query SQL-first nhưng khó diễn đạt sạch bằng Prisma query builder, ưu tiên một lớp SQL typed tập trung thay vì rải `queryRaw` string khắp service
- use case điển hình:
  - search fallback query phức tạp
  - reporting/admin aggregation
  - migration-time verification query
- nếu dùng Prisma TypedSQL, chỉ cho phép đặt query ở thư mục tập trung như `apps/api/prisma/sql/` và import qua wrapper rõ ràng
- không dùng raw SQL string inline ở controller/service nếu query còn được tái dùng hoặc cần test lại nhiều lần
- TypedSQL chỉ nên bật khi Prisma version thực tế trong repo support nó; nếu chưa bật được thì vẫn phải giữ nguyên tắc tập trung raw SQL thay vì copy-paste

### Generated resource boundary

- chỉ dùng Nest resource/CRUD scaffolding cho:
  - reference data nội bộ
  - admin CRUD không có workflow phức tạp
  - lookup/read-only catalogs
- cấm dùng generated CRUD làm baseline cho:
  - auth/session
  - moderation decisions
  - storage lifecycle
  - outbox/admin redrive
  - search reindex/sync
  - publish/unpublish flows

### Transaction helper rule

- các flow có mẫu `load -> validate -> write -> audit -> optional downstream handoff` nên đi qua helper chung hoặc service utility, không copy-paste retry loop ở từng module
- helper transaction chỉ được che giấu phần kỹ thuật lặp lại:
  - retry budget
  - backoff
  - audit append in-transaction
  - mapping error code chuẩn
- helper transaction không được nuốt business decision; validation/policy vẫn thuộc module service

## Idempotency boundary rule

- mọi write route có nguy cơ double-submit hoặc network retry phải khai báo rõ có dùng:
  - natural key dedupe
  - `sourceRef`
  - hoặc `Idempotency-Key` / `idempotencyKey`
- nên có interceptor/service chung cho idempotency records thay vì mỗi module tự phát minh cách lưu riêng
- phase 1 có thể lưu idempotency record ở Postgres; phase 2+ mới cân nhắc chuyển sang Valkey khi contention đủ lớn
- không dùng idempotency như cách che giấu bug write-path; nó chỉ bảo vệ retry/double-submit, không thay thế transaction correctness

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
