# Publish Little House Guide

## Purpose

- xuất bản guide `Ngôi Nhà Nhỏ` hoặc cập nhật guide đã publish mà vẫn giữ đúng grouped IA, source refs, warning blocks và version notes

## Owner module

- `content`

## Actors

- `admin`
- `super-admin`

## Trigger

- biên tập viên bấm publish trong workspace `/admin/noi-dung/ngoi-nha-nho`

## Preconditions

- guide draft tồn tại
- guide đã gắn `group`, `slug`, `readingTimeEstimate`
- các block nhạy cảm đã đủ validation:
  - `warning_list`
  - `step_sequence`
  - `script_block`
  - `source_reference`
- nếu thay wording quan trọng, phải có `versionNote`

## Input contract

- guide metadata
- typed blocks
- case-variant refs nếu có
- download refs / image refs nếu có
- actor id

## Read set

- `hubPages`
- `beginnerGuides`
- `downloads`
- media refs
- existing public slug / publicId nếu là update

## Write path

1. load draft guide và block tree
2. validate grouped IA metadata và required blocks
3. validate `source_reference` cho các đoạn script/warning nhạy cảm
4. persist guide status:
   - `draft -> published`
   - hoặc cập nhật published doc kèm `publishedAt`/`updatedAt`
5. append audit event:
   - `content.little_house.publish`
6. enqueue downstream invalidation/search signal nếu phase tương ứng đã bật

## Async side-effects

- revalidation
- search document refresh
- optional cache invalidation

## Success result

- guide xuất hiện ở:
  - `guide-map`
  - group landing tương ứng
  - guide detail route theo `slug`

## Errors

- `400`: thiếu `group`, thiếu required block, thiếu source ref, block schema invalid
- `401`: chưa đăng nhập
- `403`: role không đủ
- `404`: draft guide hoặc asset ref không tồn tại
- `409`: slug conflict hoặc publish state conflict
- `500`: persist/audit/revalidation fail

## Audit

- bắt buộc log:
  - actor
  - guide id
  - group
  - slug
  - previous status
  - version note summary nếu có

## Notes for AI/codegen

- `Ngôi Nhà Nhỏ` không publish như post blog thường.
- FE public không parse raw editor payload; backend phải map sang DTO block-safe.
- Nếu publish fail sau khi audit append chưa cùng transaction, rollback toàn bộ.
