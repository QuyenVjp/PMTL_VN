# Create Assisted Life Release Entry

## Purpose

- cho phép admin tạo `life release journal` entry thay member trong trường hợp hỗ trợ hợp lệ, nhưng vẫn giữ member là owner cuối cùng và audit đầy đủ

## Owner module

- `vows-merit`

## Actors

- `admin`
- `super-admin` chỉ khi policy support đặc biệt yêu cầu

## Trigger

- admin submit form ở `/admin/ho-tro/phat-nguyen/nhap-ho`

## Preconditions

- feature flag `vow.assisted_entry.enabled` đang bật nếu feature đã đi qua flags
- `ownerUserId` tồn tại
- `assistReason` hợp lệ
- request đi theo schema assisted-entry riêng, không dùng schema member self-create

## Input contract

- `ownerUserId`
- `date`
- `creatureType`
- `quantity`
- `locationNote?`
- `ritualNoteRef?`
- `isAssistedEntry = true`
- `assistReason`

## Read set

- `users`
- `life_release_journal`
- optional wisdom/content refs cho `ritualNoteRef`

## Write path

1. validate actor role và owner existence
2. validate payload qua assisted-entry schema
3. create `life_release_journal` record với fields:
   - `ownerUserId`
   - `actorUserId`
   - `isAssistedEntry`
   - `assistReason`
   - `assistedAt`
4. append audit trong cùng transaction:
   - `vow.life_release.assisted_create`
5. emit reminder/progress downstream signal nếu policy đang bật

## Async side-effects

- recompute summary nếu read model đang được dùng
- optional reminder scheduling

## Success result

- owner member thấy entry trong journal của mình với indicator "Được nhập bởi Phụng sự viên"

## Errors

- `400`: payload sai, `assistReason` thiếu/quá ngắn
- `401`: chưa đăng nhập
- `403`: role không đủ hoặc cố dùng flow này cho self-write không hợp lệ
- `404`: owner hoặc ritual ref không tồn tại
- `409`: duplicate entry theo business rule
- `500`: persist/audit/outbox fail

## Audit

- audit append là bắt buộc và ở cùng transaction
- metadata tối thiểu:
  - actor
  - owner
  - entity id
  - assistReason

## Notes for AI/codegen

- admin không được sửa đè record assisted entry cũ qua endpoint này.
- correction là entry mới hoặc member tự sửa theo policy.
- `isAssistedEntry` là immutable metadata.
