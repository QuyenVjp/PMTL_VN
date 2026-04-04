# Hàng Đợi Ưu Tiên 49 Ngày Thất Thất — Bardo 49-Day Priority Queue

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 54, 337, 338, 824)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi thân nhân mới vãng sanh (trong vòng 49 ngày), hệ thống tự động tạo hàng đợi ưu tiên để nhắc nhở gia đình và cộng đồng cùng hỗ trợ hoàn thành 49 tờ NNN trong đúng 49 ngày thất thất (7 tờ/tuần). Banner đếm ngược màu đỏ hiển thị trên màn hình chính của tất cả thành viên có quyền truy cập.

---

## Owner module

`engagement` — LittleHouseService / DeceasedProfileService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — tạo `DeceasedProfile`, thực hiện NNN cho người mất
- `family_member` — thành viên được chia sẻ quyền truy cập hồ sơ người mất
- `system` — tự động tạo `BardoPriorityQueue`, hiển thị banner đếm ngược, cron job kiểm tra hết hạn

---

## Trigger

Khi `DeceasedProfile` được tạo với `dateOfDeath` trong vòng 49 ngày trước ngày hiện tại.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `dateOfDeath` ≤ 49 ngày trước | ✅ Tự động tạo `BardoPriorityQueue` |
| `dateOfDeath` > 49 ngày trước | ℹ️ Không tạo hàng đợi (ngoài thời gian thất thất) |
| `now() ≤ endDate` | ✅ Banner đỏ hiển thị trên home screen |
| `now() > endDate` (hết 49 ngày) | ✅ `isActive = false`, banner tự ẩn |
| Mỗi tuần hoàn thành ≥ 7 tờ NNN | ✅ Tiến độ tuần = 7/7 (màu xanh) |
| Tiến độ tuần < 7 tờ | ⚠️ Advisory — nhắc nhở (soft warning, không block) |
| Cron job chạy hàng ngày | ✅ Kiểm tra và cập nhật `isActive` |

---

## Input Contract

```typescript
interface CreateDeceasedProfileDto {
  name: string
  dateOfDeath: string   // ISO 8601 date
  dharmaName?: string
  sharedWithUserIds?: string[]
}

interface BardoPriorityQueueResponse {
  id: string
  deceasedProfileId: string
  deceasedName: string
  startDate: string
  endDate: string
  dayNumber: number          // ngày thứ mấy trong 49 ngày (1–49)
  weekNumber: number         // tuần thứ mấy (1–7)
  weeklyTarget: number       // 7
  weeklyProgress: number     // số tờ NNN đã làm trong tuần hiện tại
  totalTarget: number        // 49
  totalProgress: number      // tổng số tờ đã làm
  daysRemaining: number      // số ngày còn lại
  isActive: boolean
}
```

---

## Write Path

```
POST /api/engagement/deceased-profile
1. Validate dateOfDeath ≤ today
2. Create DeceasedProfile
3. If (today - dateOfDeath) <= 49 days:
   → Create BardoPriorityQueue {
       startDate = dateOfDeath,
       endDate   = dateOfDeath + 49 days,
       weeklyTarget = 7,
       totalTarget  = 49,
       isActive     = true
     }
   → Audit: engagement.bardo-queue.created
4. If sharedWithUserIds provided:
   → Create DeceasedProfileAccess records for each userId

CRON /api/engagement/bardo-queue/expire-check (daily at 00:01)
1. Query all BardoPriorityQueue WHERE isActive = true AND endDate < now()
2. For each: set isActive = false
3. Audit: engagement.bardo-queue.expired (per record)
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏠 TRANG CHỦ — BỘ NHỚ THẤT THẤT (49 NGÀY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────┐
│ 🔴  THẤT THẤT — KHẨN CẤP               │
│                                         │
│  Ngày thứ 12/49 của NGUYỄN VĂN A       │
│  (Từ: 23/03/2026 — Đến: 11/05/2026)    │
│                                         │
│  Chỉ tiêu tuần này: 7 tờ NNN           │
│  Tiến độ tuần: ██░░░░░░  2/7           │
│                                         │
│  Tổng tiến độ: ████░░░░░  12/49 tờ     │
│  Còn lại: 37 ngày                      │
│                                         │
│  [➕ Làm NNN cho Nguyễn Văn A]         │
│  [👥 Xem tiến độ gia đình]             │
└─────────────────────────────────────────┘

Màu banner:
- 🔴 Đỏ (bg-red-600): còn < 3 ngày trong tuần mà chưa đủ 7 tờ
- 🟡 Vàng (bg-yellow-500): tiến độ tuần < 7 tờ (bình thường)
- 🟢 Xanh (bg-green-600): đã đủ 7 tờ trong tuần
- ⚫ Ẩn: sau ngày 49

Deep-link [Làm NNN cho Nguyễn Văn A] → prefill deceased.name trong NNN flow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model BardoPriorityQueue {
  id                String          @id @default(cuid())
  deceasedProfileId String          @unique
  deceasedProfile   DeceasedProfile @relation(fields: [deceasedProfileId], references: [id])
  startDate         DateTime        // = dateOfDeath
  endDate           DateTime        // = dateOfDeath + 49 ngày
  weeklyTarget      Int             @default(7)
  totalTarget       Int             @default(49)
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model DeceasedProfileAccess {
  id                String          @id @default(cuid())
  deceasedProfileId String
  userId            String
  createdAt         DateTime        @default(now())
  @@unique([deceasedProfileId, userId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `engagement.bardo-queue.created` | Hàng đợi 49 ngày được tạo tự động |
| `engagement.bardo-queue.completed` | Đủ 49 tờ NNN trước ngày 49 |
| `engagement.bardo-queue.expired` | Hết 49 ngày (cron job xử lý) |

---

## Errors

| Điều kiện | Mã lỗi | HTTP | Phục hồi |
|---|---|---|---|
| `dateOfDeath` > ngày hiện tại | `date_of_death_in_future` | 400 | Nhập ngày hợp lệ |
| Thiếu trường `name` | `validation_error` | 400 | Bổ sung tên người mất |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- Banner chỉ hiển thị khi `isActive = true` — không cần client-side date check bổ sung.
- `dayNumber` = `(today - startDate).days + 1`, tính khi render response.
- `weekNumber` = `Math.ceil(dayNumber / 7)`, `weeklyProgress` = tổng NNN sheets trong tuần hiện tại cho `deceasedProfileId`.
- Cron job cần chạy sau nửa đêm giờ địa phương (múi giờ UTC+7) để tránh nhầm ngày.
- Không block user nếu tiến độ tuần < 7 — đây là advisory reminder, không hard block.

---

## Related

- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — NNN burn flow
- [little-house-ash-disposal.md](./little-house-ash-disposal.md) — ash handling
- [bardo-49day-priority-queue.md](./bardo-49day-priority-queue.md) — this file
