# Ngoi Nha Nho schema (lược đồ dữ liệu) Outline

File này mô tả schema (lược đồ dữ liệu) logic đề xuất cho `Ngôi Nhà Nhỏ`.
Đây chưa phải migration hay DBML cuối cùng, mà là design để AI/codegen bám đúng boundary (ranh giới trách nhiệm).

## owner module (module sở hữu)
- `03-engagement`

## Collection candidate 1: `ngoiNhaNhoSheets`

### Purpose
- mỗi record là một tờ `Ngôi Nhà Nhỏ` self-owned của user

### Core fields
- `id`
- `publicId`
- `user`
- `sheetType`
- `titleSnapshot`
- `status`
  - `draft`
  - `in_progress`
  - `completed`
  - `self_stored`
  - `offered`
- `startedAt`
- `completedAt`
- `offeredAt`
- `notes`

### Relation/snapshot fields
- `templateRef`
- `dedicationTargetSnapshot`
- `practiceDate`

## Counting model

### Option A. Embedded counters trên chính sheet
- `greatCompassionMantraCount`
- `heartSutraCount`
- `rebirthMantraCount`
- `sevenBuddhasCount`

Ưu điểm:
- đơn giản cho lần đầu build
- query inventory nhanh

Nhược điểm:
- khó giữ event history chi tiết từng lần chấm

### Option B. Event entries tách riêng

Collection candidate 2: `ngoiNhaNhoSheetEntries`

Fields:
- `sheet`
- `entryType`
  - `great_compassion`
  - `heart_sutra`
  - `rebirth_mantra`
  - `seven_buddhas`
- `delta`
- `clientEventId`
- `createdAt`

Ưu điểm:
- chống double-submit tốt hơn
- lưu trace tốt hơn

Nhược điểm:
- cần aggregate summary

## Khuyến nghị hiện tại

- bắt đầu với `Option A` + `clientEventId` chống double-submit trên sheet
- nếu sau này cần trace dày, thêm event table sau

## Rule fields nên có

- `requiredGreatCompassionCount`
- `requiredHeartSutraCount`
- `requiredRebirthMantraCount`
- `requiredSevenBuddhasCount`
- `isComplete`

## Unique / integrity rules

- mỗi `clientEventId` chỉ được áp một lần trên một sheet
- `status = offered` thì không được tăng counter nữa
- `status = completed` khi và chỉ khi đủ 4 counters theo rule template

## service (lớp xử lý nghiệp vụ) boundary (ranh giới trách nhiệm)

- `ngoi-nha-nho.service (lớp xử lý nghiệp vụ).ts` nên xử lý:
  - create sheet
  - mark counter
  - complete sheet
  - move to self-stored
  - move to offered

## Notes for AI/codegen

- Đây là self-owned practice inventory.
- Không đặt ở content vì không phải public canonical reference.

