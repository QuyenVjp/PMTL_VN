# Update Contact Info

## Purpose

- cập nhật singleton `contactInfo` cho public page `/lien-he` mà không biến module này thành CMS nặng

## Owner module

- `contact`

## Actors

- `super-admin`
- `admin` nếu policy phase sau cho phép, nhưng current baseline vẫn ưu tiên `super-admin`

## Trigger

- actor lưu thay đổi ở admin contact workspace

## Preconditions

- actor đã authenticated
- payload hợp lệ:
  - email / hotline / fanpage / zalo OA theo rule định dạng
- singleton row tồn tại hoặc hệ thống cho phép upsert

## Input contract

- public contact channels
- visibility flags nếu có
- sort/display notes nếu có

## Read set

- `contact_info`

## Write path

1. load singleton `contact_info`
2. validate payload
3. upsert row
4. append audit:
   - `contact.info.update`
5. trigger cache invalidation nếu public page đang cache

## Success result

- `/lien-he` hiển thị thông tin mới ở các contact cards

## Errors

- `400`: email/URL/số điện thoại không hợp lệ
- `401`: chưa đăng nhập
- `403`: role không đủ
- `500`: upsert hoặc audit fail

## Notes for AI/codegen

- không tạo nhiều row `contactInfo`; đây là singleton canonical record
- không lưu form submissions hay message inbox ở module này
