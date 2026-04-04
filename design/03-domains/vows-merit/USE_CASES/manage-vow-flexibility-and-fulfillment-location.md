# Linh Hoạt Lời Nguyện & Trả Nguyện Theo Địa Điểm — Vow Flexibility & Fulfillment Location

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc phát nguyện và trả nguyện
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mở rộng `create-vow.md` và `fulfill-vow-milestone.md` với 2 nghiệp vụ chưa được xử lý:

1. **Flexible Vegetarian Scheduling:** Thay vì chỉ hỗ trợ "Mùng 1 & Rằm", cho phép user tự chọn 2 ngày bất kỳ/tháng — và có luồng báo cáo đổi ngày khi lỡ quên.
2. **Vow Location Tracking:** Ghi nhận địa điểm phát nguyện và nhắc nhở user quay lại đúng địa điểm đó khi trả nguyện.

**Không trùng với:** `create-vow.md` (tạo vow cơ bản), `fulfill-vow-milestone.md` (milestone tracking).

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — phát nguyện và trả nguyện
- `system` — reminder, missed vow detection
- `admin` — assisted entry

---

## Part 1: Flexible Vegetarian Vow Scheduling

### Existing behavior

`create-vow.md` hỗ trợ `vowType = "VEGETARIAN_1_AND_15"` (Mùng 1 + Rằm).

### New behavior

Thêm `vowType = "VEGETARIAN_FLEXIBLE_2_DAYS"` — user chọn 2 ngày tự do mỗi tháng.

### Input contract bổ sung

```typescript
// Khi vowType = "VEGETARIAN_FLEXIBLE_2_DAYS":
{
  vowType:          "VEGETARIAN_FLEXIBLE_2_DAYS",
  flexibleDayRule: {
    preferredDays:  number[]   // VD: [1, 15] hoặc [3, 18] — 2 ngày dương lịch mỗi tháng
    fallbackPolicy: "NEXT_DAY" | "SAME_WEEK" | "REPORT_TO_BODHISATTVA"
  }
}
```

### Validation

- `preferredDays.length == 2` (bắt buộc đúng 2 ngày).
- Mỗi giá trị trong khoảng `[1, 28]` (tránh vấn đề tháng 30/31).
- Không trùng nhau.

### Missed Vow Flow — Báo Cáo Đổi Ngày

Nếu đến cuối ngày `preferredDay[0]` hoặc `preferredDay[1]` mà user chưa log `VegetarianDayEntry`:

1. Cron (end of day 23:00) detect missed day.
2. Hôm sau render **Missed Vow Card** trong dashboard:

```
Title: "Bạn đã bỏ lỡ ngày ăn chay hôm qua ([ngày])"
Body:  "Bạn có thể báo cáo với Bồ Tát và đổi sang ngày khác trong tuần này."
Actions:
  [Báo cáo Bồ Tát xin đổi ngày] → mở MakeupVow form
  [Tôi đã ăn chay rồi, ghi nhận muộn] → log VegetarianDayEntry với timestamp muộn
```

### Lời Khấn Bắt Buộc Trước Khi Đổi Ngày (Phase 20 Logic 3)

Trước khi user được phép đổi ngày ăn chay, **PHẢI đọc lời khấn** xin phép Bồ Tát:

```
"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
Con là [Tên], hôm nay vì hoàn cảnh [Lý do cụ thể],
Con xin phép dời ngày ăn chay sang ngày [Ngày mới].
Xin Bồ Tát từ bi tha thứ cho con."
```

Modal trước makeup form:
```
Modal: Khấn Xin Dời Ngày

Hãy đọc to lời khấn này trước khi đổi:

"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát..."
(hiển thị đầy đủ text)

[ ] Tôi đã đọc lời khấn này
[Xác Nhận]  ← disabled until checkbox
```

Server-side validate `prayerRecited = true` trước khi cho phép makeup.

### MakeupVow form

```typescript
POST /api/vows/:vowId/makeup-day
{
  missedDate:   date,    // ngày đã bỏ
  makeupDate:   date,    // ngày bù (trong vòng 7 ngày)
  reportNote?:  string   // lý do lỡ (optional)
  prayerRecited: boolean // Phải = true
}
```

Write path:
1. Validate `makeupDate` trong khoảng `[missedDate + 1, missedDate + 7]`.
2. Tạo `VegetarianMakeupEntry` gắn với `missedDate` và `makeupDate`.
3. Không tính là phạm giới trong `vowProgressEntry` — ghi nhận là "makeup" thay vì "missed".
4. Audit `vows-merit.vegetarian.makeup-reported`.

### VegetarianDayEntry tracking

```
VegetarianDayEntry {
  id          String   @id
  vowId       String
  userId      String
  date        Date
  entryType   String   // "OBSERVED" | "MAKEUP" | "MISSED_REPORTED"
  reportedAt  DateTime
  makeupDate? Date     // chỉ khi entryType = MAKEUP
  note?       String
}
```

---

## Part 2: Vow Location Tracking

### Existing behavior

`create-vow.md` không có field location — vow chỉ có text description.

### New behavior

Khi tạo vow, user có thể (optional) ghi nhận **địa điểm phát nguyện**. Khi vow được fulfilled, hệ thống nhắc nhở quay lại đúng địa điểm đó để làm lễ trả nguyện.

### Input contract bổ sung

```typescript
// Optional field thêm vào create-vow.md:
{
  vowLocation?: {
    locationName: string      // VD: "Bàn thờ nhà tôi", "Quan Âm Đường Sydney", "Chùa Bà Thiên Hậu"
    locationType: "HOME_ALTAR" | "TEMPLE" | "DHARMA_CENTER" | "OTHER"
    locationNote?: string     // địa chỉ hoặc mô tả thêm
  }
}
```

### Write path (create-vow extension)

1. Nếu `vowLocation` được cung cấp, upsert `VowLocation` record gắn với `vow.id`.
2. Không bắt buộc — user có thể skip.
3. Audit `vows-merit.vow.location-recorded`.

### Fulfillment Location Reminder

Khi user mark vow milestone → `status = FULFILLED` (hoặc bấm [Điều ước đã thành hiện thực]):

1. Hệ thống check: `vow.vowLocation IS NOT NULL`.
2. Nếu có location → render **Fulfillment Location Reminder** trước khi confirm fulfilled:

```
Title: "Trước khi đánh dấu Đã Trả Nguyện"
Body:  "Bạn đã phát nguyện tại: [locationName]

        Theo truyền thống, bạn nên quay lại đúng địa điểm [locationName]
        để thắp hương, đảnh lễ và làm công đức trả nguyện trước khi
        xem nguyện này là đã hoàn thành.

        Bạn đã quay lại địa điểm này chưa?"

Actions:
  [Đã quay lại và làm lễ trả nguyện] → confirm fulfilled
  [Chưa, nhắc tôi sau]               → snooze reminder 3 ngày
  [Không thể quay lại (lý do...)]    → optional reason, vẫn cho fulfill với note
```

3. Nếu user chọn [Chưa, nhắc tôi sau]:
   - Tạo `VowFulfillmentReminder` với `scheduledAt = now() + 3 days`.
   - Không thay đổi vow status.
4. Nếu user chọn [Đã quay lại]:
   - Ghi `fulfillmentLocationConfirmed = true`.
   - Proceed với `status = FULFILLED`.
5. Audit `vows-merit.vow.fulfillment-location-confirmed`.

### VowLocation entity

```
VowLocation {
  id            String   @id
  vowId         String   @unique
  locationName  String
  locationType  String   // "HOME_ALTAR" | "TEMPLE" | "DHARMA_CENTER" | "OTHER"
  locationNote? String
  createdAt     DateTime
}

VowFulfillmentReminder {
  id           String   @id
  vowId        String
  userId       String
  scheduledAt  DateTime
  status       String   // "PENDING" | "SENT" | "DISMISSED"
  createdAt    DateTime
}
```

---

## Part 3: Cửa Sổ Khẩn Cấp Khi Không Thể Giữ Giới — Emergency Vow Escape

> **Nguồn bổ sung:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 30)

Khi đến ngày mùng 1/15 hoặc ngày ăn chay đã cam kết mà user chưa check-in và không thể giữ giới (đi công tác, nhập viện, không có đồ chay), hệ thống cung cấp 2 lối thoát hợp lệ để tránh thất nguyện hoàn toàn.

### Trigger

Khi đến `preferredDay[n]` mà hệ thống chưa nhận `VegetarianDayEntry` cho ngày đó VÀ `currentTime > 18:00` (buổi tối — gần hết ngày).

### Business Rules

| Điều kiện | Hành động |
|---|---|
| Đến 18:00 ngày ăn chay, chưa check-in | ⚠️ Bật pop-up khẩn cấp `VEGAN_EMERGENCY_ESCAPE` |
| User chọn "Dời sang ngày mai" | ✅ Tạo MakeupVow, yêu cầu đọc lời khấn xin lỗi |
| User chọn "Đổi thành 2 ngày linh hoạt" | ✅ Update vow type → `VEGETARIAN_FLEXIBLE_2_DAYS` |
| User dismiss pop-up không làm gì | ⚠️ Log `vow.missed_with_no_action` — cảnh báo nhẹ |

### FE Behavior — Pop-up Khẩn Cấp

```
┌─────────────────────────────────────────────────────────┐
│ 🚨 CẤP CỨU LỜI NGUYỆN                                   │
│─────────────────────────────────────────────────────────│
│ Hôm nay là ngày ăn chay của bạn nhưng bạn chưa         │
│ ghi nhận.                                               │
│                                                         │
│ Nếu không thể ăn chay hôm nay — đừng lo, bạn có        │
│ 2 lựa chọn để bảo vệ lời nguyện:                       │
│                                                         │
│  1️⃣  [Xin Bồ Tát Dời Sang Ngày Mai]                    │
│     → Đọc lời khấn xin lỗi + bù ngày mai               │
│                                                         │
│  2️⃣  [Đổi Nguyện Thành 2 Ngày Linh Hoạt/Tháng]        │
│     → Hệ thống cập nhật loại nguyện linh hoạt hơn      │
│                                                         │
│  3️⃣  [Tôi Đã Ăn Chay — Ghi Nhận Ngay]                 │
│                                                         │
│                    [Nhắc Tôi Sau 1 Giờ]                │
└─────────────────────────────────────────────────────────┘
```

### Write Path

```
POST /api/vows-merit/vows/:vowId/emergency-escape

Body: {
  escapeType: 'DEFER_TO_TOMORROW' | 'CONVERT_TO_FLEXIBLE' | 'LOG_LATE'
  prayerRecited?: boolean   // required khi DEFER_TO_TOMORROW
  lateLogDate?:   string    // required khi LOG_LATE
}

1. If escapeType == 'DEFER_TO_TOMORROW':
   a. Validate prayerRecited == true → 400 if false
   b. Create VegetarianMakeupEntry for tomorrow
   c. Log audit: vow.emergency_deferred

2. If escapeType == 'CONVERT_TO_FLEXIBLE':
   a. Update vow.vowType = 'VEGETARIAN_FLEXIBLE_2_DAYS'
   b. Set preferredDays = [originalDay1, originalDay2] with fallbackPolicy = 'NEXT_DAY'
   c. Log audit: vow.converted_to_flexible

3. If escapeType == 'LOG_LATE':
   a. Create VegetarianDayEntry with entryType = 'OBSERVED' and timestamp = now()
   b. Log audit: vow.logged_late
```

### Lời Khấn Khi Chọn Dời Ngày

```
┌─────────────────────────────────────────────────────────┐
│ Hãy đọc lời khấn này trước khi dời ngày:               │
│                                                         │
│ "Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát,             │
│  Con là [Tên], hôm nay con không thể giữ giới          │
│  ăn chay vì [lý do]. Con thành tâm sám hối và          │
│  xin Bồ Tát cho phép con bù ngày mai."                 │
│                                                         │
│ [ ] Tôi đã đọc lời khấn xin lỗi này                   │
│                                                         │
│              [Xác Nhận Dời Ngày]                        │
└─────────────────────────────────────────────────────────┘
```

### Audit bổ sung

| Action | Trigger |
|---|---|
| `vow.emergency_escape_shown` | Pop-up khẩn cấp hiển thị |
| `vow.emergency_deferred` | User dời sang ngày mai |
| `vow.converted_to_flexible` | User đổi sang 2 ngày linh hoạt |
| `vow.logged_late` | User ghi nhận muộn |
| `vow.missed_with_no_action` | User dismiss không làm gì |

### Errors bổ sung

| Condition | Code | HTTP |
|---|---|---|
| `DEFER_TO_TOMORROW` mà `prayerRecited = false` | `prayer_recitation_required` | 400 |

---

## Async side-effects

- Missed vow detection: cron `0 23 * * *` — cuối ngày scan `preferredDays` chưa có `VegetarianDayEntry`.
- Fulfillment reminder: cron `0 9 * * *` — scan `VowFulfillmentReminder` với `scheduledAt <= now()` và `status = PENDING`.

---

## Success results

- User ăn chay linh hoạt mà không bị tính phạm giới khi có lý do chính đáng.
- Lịch sử makeup entries rõ ràng — user tự kiểm soát, không phán xét.
- User được nhắc nhở quay lại đúng địa điểm phát nguyện — giữ được nghi lễ trả nguyện đúng chuẩn.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `preferredDays.length != 2` | `invalid_body` | 400 | Chọn đúng 2 ngày |
| `makeupDate` ngoài khoảng 7 ngày | `invalid_body` | 400 | Chọn ngày trong tuần này |
| Vow không thuộc actor | `forbidden` | 403 | — |
| Vow không tồn tại | `not_found` | 404 | — |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `vows-merit.vegetarian.day-observed` | actorUserId | Log ngày ăn chay thành công |
| `vows-merit.vegetarian.day-missed` | system | Cron detect missed day |
| `vows-merit.vegetarian.makeup-reported` | actorUserId | Báo cáo đổi ngày |
| `vows-merit.vow.location-recorded` | actorUserId | Ghi địa điểm phát nguyện |
| `vows-merit.vow.fulfillment-location-confirmed` | actorUserId | Xác nhận đã quay lại địa điểm |
| `vows-merit.vow.fulfillment-location-snoozed` | actorUserId | Chọn nhắc sau 3 ngày |

---

## Notes for AI/codegen

- `VEGETARIAN_FLEXIBLE_2_DAYS` là `vowType` enum value mới — cần thêm vào `VowType` enum trong Prisma schema.
- `VegetarianDayEntry` là entity mới, không tái dùng `VowProgressEntry` — lifecycle và purpose khác nhau.
- Missed vow cron phải check `preferredDays` của từng user — không chạy global rule cứng.
- `VowFulfillmentReminder` snooze 3 ngày: sau 3 lần snooze liên tiếp, escalate thành persistent dashboard banner thay vì tiếp tục snooze.
- Wording policy: không dùng từ "phạm giới" với user — dùng "bỏ lỡ ngày ăn chay" thay vào đó. Giữ giọng trung tính.
- `fulfillmentLocationConfirmed` field thêm vào `Vow` model (không tạo entity mới) — `Boolean @default(false)`.
- Nếu user chọn [Không thể quay lại], ghi `fulfillmentLocationNote` với lý do và vẫn cho fulfill — không block hoàn toàn.
