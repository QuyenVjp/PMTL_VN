# WRITING_STANDARDS (Chuẩn viết contract và use-case)

File này hợp nhất các ghi chú cũ về contract guidelines và use-case template.

Mục tiêu:

- giữ docs design ngắn mà vẫn đúng boundary
- giúp AI/dev mới viết use-case và contract không lệch

## Contract rules (Quy tắc contract)

- input user phải map được về `Zod schema`
- queue payload, webhook payload, outbox payload, search document, env config cũng phải có schema runtime rõ
- DTO public không expose field hệ thống nhạy cảm
- `publicId` là identity ưu tiên cho public routes
- nếu route là write-path, phải nói rõ:
  - canonical record tạo ở đâu
  - summary field nào được sync
  - side effect nào async
  - side effect nào phải đi qua `outbox_events`

## Minimal error contract (Hợp đồng lỗi tối thiểu)

- `400` dữ liệu không hợp lệ
- `401` thiếu auth/session
- `403` không đủ quyền
- `404` entity không tồn tại
- `409` duplicate hoặc conflict
- `500` lỗi hệ thống/downstream

## Use-case rules (Quy tắc use-case)

- mỗi file chỉ mô tả 1 hành vi nghiệp vụ rõ ràng
- tên file theo `verb-object`
- nếu flow có nhiều nhánh lớn, tách use-case và state diagram riêng

## Recommended use-case structure

```md
# <Tên use-case>

## Purpose
## owner module
## Actors
## trigger
## preconditions
## Input contract
## Read set
## write path
## async side-effects
## success result
## Errors
## Audit
## Idempotency / anti-spam
## Performance target
## Notes for AI/codegen
```

## Write-path rules (Quy tắc viết write-path)

- bước 1 luôn nói rõ canonical record nằm ở module nào
- summary field phải được ghi rõ là `summary`, không phải source of truth
- nếu có queue/job:
  - request path chỉ append `outbox_events`
  - dispatcher phát execution job
  - worker thực thi side effect

## Notes for AI/codegen

- đừng lấy raw persistence document làm public contract
- đừng expose moderation/audit internals cho route public
- đừng gọi search document là source of truth
- đừng coi TypeScript type là đủ cho boundary runtime
