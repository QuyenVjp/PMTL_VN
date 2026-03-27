# WRITING_STANDARDS (Chuẩn viết contract và use-case)

File này là canonical owner cho cách viết contract/use-case trong `design/`.
Nó thay path legacy cũ trong `design/02-platform-baseline/dependency-version/WRITING_STANDARDS.md`.

## Contract rules

- mọi user input phải map được về `Zod schema`
- queue payload, webhook payload, outbox payload, search document, env config cũng phải có schema runtime rõ
- DTO public không expose field hệ thống nhạy cảm
- `publicId` là identity ưu tiên cho public routes
- nếu route là write-path, phải nói rõ canonical record tạo ở đâu, summary field nào chỉ là projection, side effect nào async, và side effect nào phải đi qua `outbox_events`

## Minimal error contract

- `400` dữ liệu không hợp lệ
- `401` thiếu auth/session
- `403` không đủ quyền
- `404` entity không tồn tại
- `409` duplicate hoặc conflict
- `500` lỗi hệ thống/downstream

Nếu route family có nuance hơn, phải map về canonical `error.code` và [ERROR_ENVELOPE_CONTRACT.md](../02-platform-baseline/api-runtime/ERROR_ENVELOPE_CONTRACT.md).

## Use-case rules

- mỗi file chỉ mô tả 1 hành vi nghiệp vụ rõ ràng
- tên file theo `verb-object`
- nếu flow có nhiều nhánh lớn, tách use-case và state diagram riêng

## Recommended use-case structure

```md
# <Tên use-case>

## Purpose
## Owner module
## Actors
## Trigger
## Preconditions
## Input contract
## Read set
## Write path
## Async side-effects
## Success result
## Errors
## Audit
## Idempotency / anti-spam
## Performance target
## Notes for AI/codegen
```

## Notes for AI/codegen

- đừng lấy raw persistence document làm public contract
- đừng expose moderation/audit internals cho route public
- đừng gọi search document là source of truth
- đừng coi TypeScript type là đủ cho boundary runtime
