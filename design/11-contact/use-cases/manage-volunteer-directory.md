# Manage Volunteer Directory

## Purpose

- quản lý CRUD + sort order cho danh sách `Phụng Sự Viên` dùng ở public `/lien-he` và admin workspace

## Owner module

- `contact`

## Actors

- `admin`
- `super-admin`

## Trigger

- actor tạo, sửa, ẩn, sắp xếp lại volunteer trong admin

## Preconditions

- actor đã authenticated
- avatar/media ref hợp lệ nếu có
- Zalo URL phải khớp policy regex của module

## Input contract

- `displayName`
- `roleLabel`
- `zaloUrl`
- `avatarMediaId?`
- `isActive`
- `sortOrder`

## Read set

- `volunteers`
- optional `media_assets` ref cho avatar

## Write path

### Create / update
1. validate payload
2. create hoặc update volunteer row
3. append audit:
   - `contact.volunteer.create`
   - `contact.volunteer.update`

### Sort / activate / deactivate
1. load affected rows
2. validate target order không đụng conflict
3. update `sortOrder` hoặc `isActive`
4. append audit:
   - `contact.volunteer.sort`
   - `contact.volunteer.activate`
   - `contact.volunteer.deactivate`

## Success result

- public `/lien-he` trả volunteer cards theo `sortOrder` và chỉ lấy `isActive = true`

## Errors

- `400`: Zalo URL sai format hoặc payload thiếu field bắt buộc
- `401`: chưa đăng nhập
- `403`: role không đủ
- `404`: volunteer không tồn tại
- `409`: sort conflict hoặc duplicate logical row theo policy
- `500`: persist/audit fail

## Notes for AI/codegen

- public page không được fetch volunteer inactive trừ khi admin preview mode.
- sort order update nên là transactional batch, không loop update rời.
