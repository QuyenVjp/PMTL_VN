# An Vị Bàn Thờ Trước Khi Dọn Đồ — Relocation Altar Prerequisite

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 380, 381, 829, 830)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi chuyển nhà, đến nhà mới, **bàn thờ Phật phải được lập đầu tiên** trước khi mang bất kỳ đồ đạc sinh hoạt nào vào nhà. Tượng Bồ Tát đã khai quang từ trước mang sang nhà mới **không cần khai quang lại** — chỉ cần thắp nhang và đọc 7 Đại Bi + 7 Tâm Kinh là Bồ Tát tự ngự giá. Hệ thống phải khóa cứng thứ tự: an vị bàn thờ trước, các việc khác sau.

---

## Owner module

`calendar` — RelocationEventService / AltarPrerequisiteGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — tạo sự kiện chuyển nhà trong lịch
- `system` — sinh checklist khóa cứng, block các task khác cho đến khi Task 1 hoàn thành

---

## Trigger

Khi user tạo sự kiện lịch loại `RELOCATION` (Chuyển Nhà) trong module `calendar`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Sự kiện `RELOCATION` vừa được tạo | ✅ Tự động sinh Hard-lock Checklist |
| Task 1 (An vị bàn thờ) chưa tick | ❌ Khóa toàn bộ các task còn lại |
| Task 1 đã tick `COMPLETED` | ✅ Mở khóa tất cả các task còn lại |
| Tượng Bồ Tát đã khai quang từ trước | ✅ KHÔNG cần khai quang lại |

---

## Input Contract

```typescript
interface CreateRelocationEventDto {
  eventDate:           string     // ISO date
  fromAddress?:        string
  toAddress?:          string
  hasExistingStatues:  boolean    // tượng đã khai quang từ trước hay chưa
}

interface RelocationChecklistItem {
  taskId:   string
  order:    number
  label:    string
  locked:   boolean    // true = không thể tick cho đến khi prerequisite hoàn thành
  completed: boolean
}
```

---

## Write Path

```
POST /api/calendar/events (type: RELOCATION)

1. Insert CalendarEvent with type = RELOCATION
2. Auto-generate RelocationChecklist:
   Task 1 (order=1, locked=false):
     "Đã an vị Bàn Thờ Phật và dâng nhang tại nhà mới
      [Thắp 3 nén nhang + niệm 7 Đại Bi, 7 Tâm Kinh]"
   Task 2 (order=2, locked=true):
     "Mang đồ đạc và nội thất vào nhà"
   Task 3 (order=3, locked=true):
     "Khai trương, mời người thân vào thăm"
   Task 4 (order=4, locked=true):
     "Các việc khác"
3. If hasExistingStatues == true:
   → Attach advisory note to Task 1:
     "Tượng của bạn KHÔNG CẦN khai quang lại."

PATCH /api/calendar/relocation-checklist/:taskId/complete

1. If taskId == Task 1:
   → Mark Task 1 as COMPLETED
   → Unlock all remaining tasks (locked = false)
2. Else if Task 1 is NOT completed:
   → Return 403 { error: 'altar_prerequisite_incomplete' }
3. Mark target task as COMPLETED
```

---

## FE Behavior

```
┌──────────────────────────────────────────────────────────┐
│ 📦 Checklist Chuyển Nhà — [Ngày chuyển]                   │
│──────────────────────────────────────────────────────────│
│                                                          │
│ 1. [ ] 🏛️  An vị Bàn Thờ Phật                           │
│         Thắp 3 nén nhang + niệm 7 Đại Bi, 7 Tâm Kinh    │
│         ──────────────────────────────────────────────── │
│         ℹ️  Tượng đã khai quang KHÔNG cần khai quang lại  │
│         Chỉ cần thắp nhang — Bồ Tát sẽ tự ngự giá!      │
│                                                          │
│ 2. 🔒 [ ] Mang đồ đạc và nội thất vào nhà               │
│          (Mở khóa sau khi hoàn thành Bước 1)             │
│                                                          │
│ 3. 🔒 [ ] Khai trương, mời người thân vào thăm           │
│          (Mở khóa sau khi hoàn thành Bước 1)             │
│                                                          │
│ 4. 🔒 [ ] Các việc khác                                  │
│          (Mở khóa sau khi hoàn thành Bước 1)             │
└──────────────────────────────────────────────────────────┘
```

- Task 2, 3, 4 hiển thị biểu tượng 🔒 và disabled checkbox cho đến khi Task 1 tick
- Khi Task 1 tick → animation mở khóa, tất cả 🔒 chuyển sang active

---

## Schema Notes

```prisma
model RelocationChecklist {
  id           String   @id @default(cuid())
  eventId      String   // FK → CalendarEvent
  taskOrder    Int
  label        String
  isLocked     Boolean  @default(false)
  isCompleted  Boolean  @default(false)
  completedAt  DateTime?
  // Migration: CREATE TABLE "RelocationChecklist" ...
}

model CalendarEvent {
  // ... existing fields ...
  hasExistingStatues  Boolean?
  // Migration: ALTER TABLE "CalendarEvent" ADD COLUMN "hasExistingStatues" BOOLEAN
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `calendar.relocation.checklist_generated` | Tạo sự kiện Chuyển Nhà |
| `calendar.relocation.altar_prerequisite_completed` | Task 1 tick hoàn thành |
| `calendar.relocation.tasks_unlocked` | Task 2-4 được mở khóa |
| `calendar.relocation.altar_prerequisite_blocked` | Cố tick Task 2-4 trước Task 1 |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Cố complete Task 2+ khi Task 1 chưa done | `altar_prerequisite_incomplete` | 403 |

---

## Notes for AI/codegen

- Task 1 label phải bao gồm lời nhắc niệm "7 Đại Bi + 7 Tâm Kinh"
- `hasExistingStatues` advisory note chỉ là UI helper — không phải gate condition
- Checklist được generate **tự động** khi tạo sự kiện — không cần user tạo thủ công
- Tương lai: có thể tích hợp với `altar-management` để check AltarProfile tại địa chỉ mới

---

## Related

- [apply-lunar-override.md](./apply-lunar-override.md) — chọn ngày lành chuyển nhà
- [altar-profile-spatial-validation.md](../../vows-merit/USE_CASES/altar-profile-spatial-validation.md) — khai báo bàn thờ mới sau khi an vị
