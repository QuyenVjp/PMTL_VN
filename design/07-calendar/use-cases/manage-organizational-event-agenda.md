# Manage Organizational Event Agenda

## Purpose

- quản lý `agenda items` có cấu trúc cho sự kiện tổ chức, để public FE render timeline rõ ràng và admin không phải nhét timeline vào rich text

## Owner module

- `calendar`

## Actors

- `admin`
- `super-admin`

## Trigger

- admin tạo/sửa/reorder agenda trong workspace `/admin/he-thong/lich/[eventId]`

## Preconditions

- event tồn tại
- actor có quyền admin
- event thuộc loại cần agenda có cấu trúc hoặc đang dùng organizational workspace

## Input contract

- `startTime`
- `endTime`
- `title`
- `description?`
- `facilitatorLabel?`
- `sortOrder`

## Read set

- `events`
- `event_agenda_items`

## Write path

1. validate event ownership và publish state
2. validate time range:
   - `startTime < endTime`
   - không trùng conflict theo policy
3. create/update/reorder `event_agenda_items`
4. nếu event đã publish, mark public payload cần refresh
5. append audit:
   - `calendar.event.agenda_item.create`
   - `calendar.event.agenda_item.update`
   - `calendar.event.agenda_item.reorder`

## Async side-effects

- refresh public event projection
- downstream notification resync nếu reminder consumer đang bật

## Success result

- `/su-kien/[slug]` render timeline theo cấu trúc agenda mới

## Errors

- `400`: invalid time range, missing title, reorder payload sai
- `401`: chưa đăng nhập
- `403`: role không đủ
- `404`: event hoặc agenda item không tồn tại
- `409`: time overlap hoặc sort conflict theo policy
- `500`: persist/audit/refresh fail

## Notes for AI/codegen

- agenda item là structured child record, không serialize ngược thành rich text để lưu lại như canonical.
- reorder nên đi theo batch action rõ, không patch lẻ từng row rồi mong FE tự sắp.
