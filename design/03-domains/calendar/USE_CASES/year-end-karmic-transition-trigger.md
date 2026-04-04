# Máy Quét Chuyển Giao Năm Cũ-Mới — Year-End Karmic Transition Trigger

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 348, 830)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Giai đoạn chuyển giao giữa năm cũ và năm mới (1 tháng trước Tết Nguyên Đán) là thời điểm sinh mệnh con người cực kỳ nhạy cảm — nghiệp chướng kích hoạt mạnh, dễ gặp tai nạn nguy hiểm đến tính mạng. Phóng sinh trong giai đoạn này có công đức kéo dài thọ mệnh gấp vạn lần bình thường. Hệ thống tự động gắn cờ `YEAR_END_TRANSITION`, đẩy khuyến nghị tăng cường tu tập, và gửi cảnh báo an toàn đến user.

---

## Owner module

`calendar` — CalendarService / YearEndTransitionScanner
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `system` — scanner tự động, cron hàng ngày
- `member` — nhận recommendations và warnings

---

## Trigger

Cron job hàng ngày kiểm tra: `now()` có nằm trong khoảng `[TetDate - 30 days, TetDate + 1 day]` không.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Ngày hiện tại ∈ [Tết - 30 ngày, Tết] | ✅ Set `YEAR_END_TRANSITION` flag |
| Flag active + user mở App | ✅ Hiển thị banner cảnh báo chuyển giao |
| Flag active + user vào phóng sinh | ✅ Show multiplier notice (công đức × vạn) |
| Flag active | ✅ Recommend Tiêu Tai Cát Tường Thần Chú 49/108 biến |
| Qua ngày mùng 1 Tết | ✅ Tự động remove flag, dừng banner |

---

## Input Contract

Không có user input — scanner tự động. Cấu hình:

```typescript
interface YearEndTransitionConfig {
  windowDaysBefore: number  // default: 30
  // TetDate được tính từ lunar calendar service (năm âm lịch hiện tại)
}
```

---

## Write Path

```
--- Cron: daily 00:01 UTC+7 ---
1. Compute tetDate = LunarCalendarService.getChineseNewYearDate(currentYear)
2. Compute windowStart = tetDate - 30 days
3. If today >= windowStart AND today < tetDate + 1 day:
   a. Upsert SystemFlag: key='YEAR_END_TRANSITION', active=true, expiresAt=tetDate+1day
   b. Emit push notification (1 lần/user/năm): cảnh báo chuyển giao
4. Else:
   a. Update SystemFlag: active=false (nếu tồn tại)

--- API: GET /api/calendar/year-end-status ---
Return:
{
  active:         boolean
  daysUntilTet:   number | null
  tetDate:        string | null
  recommendations: YearEndRecommendation[]
}
```

---

## FE Behavior

### Banner Chuyển Giao (hiển thị trong 30 ngày trước Tết)

```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  GIAI ĐOẠN CHUYỂN GIAO NĂM CŨ-MỚI                    │
│──────────────────────────────────────────────────────────│
│ Còn [X] ngày đến Tết Nguyên Đán.                        │
│                                                          │
│ Đây là giai đoạn nghiệp chướng kích hoạt mạnh nhất     │
│ trong năm — cần dốc sức tu tập để giữ bình an.         │
│                                                          │
│ Khuyến nghị:                                            │
│  🌟 Niệm Tiêu Tai Cát Tường Thần Chú: 49–108 biến/ngày │
│  🐟 Phóng sinh (công đức × vạn lần trong giai đoạn này) │
│  📿 Tăng số tờ NNN hồi hướng cho gia đình               │
│                                                          │
│ [Phóng Sinh Ngay]   [Niệm Tiêu Tai Cát Tường]           │
└──────────────────────────────────────────────────────────┘
```

### Multiplier Notice trong màn hình Phóng Sinh

```
┌──────────────────────────────────────────────────────────┐
│ 🌟  GIAI ĐOẠN VÀNG PHÓNG SINH                           │
│──────────────────────────────────────────────────────────│
│ Bạn đang trong giai đoạn chuyển giao năm cũ-mới.        │
│                                                          │
│ Theo Pháp Môn Tâm Linh, phóng sinh trong thời điểm     │
│ này mang công đức kéo dài thọ mệnh GẤP VẠN LẦN          │
│ so với ngày thường.                                     │
│                                                          │
│ Hãy tận dụng cơ hội quý giá này cho bản thân và        │
│ gia đình.                                               │
└──────────────────────────────────────────────────────────┘
```

### Push Notification (gửi 1 lần khi flag kích hoạt)

```
🔔 [PMTL — Cảnh Báo Cuối Năm]
Chỉ còn 30 ngày đến Tết. Đây là giai đoạn nghiệp chướng
kích hoạt mạnh và dễ gặp tai nạn nhất. Hãy dốc sức
Phóng sinh để giữ gìn bình an cho gia đình!
```

---

## Schema Notes

```prisma
model SystemFlag {
  id        String    @id @default(cuid())
  key       String    @unique   // e.g. "YEAR_END_TRANSITION"
  active    Boolean   @default(false)
  metadata  Json?     // { tetDate, daysRemaining, year }
  expiresAt DateTime?
  updatedAt DateTime  @updatedAt
}

model YearEndNotificationLog {
  id        String   @id @default(cuid())
  userId    String
  year      Int      // năm dương lịch (tránh gửi lại cùng năm)
  sentAt    DateTime @default(now())
  @@unique([userId, year])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `calendar.year-end-transition.activated` | Cron kích hoạt flag |
| `calendar.year-end-transition.deactivated` | Cron tắt flag sau Tết |
| `calendar.year-end-transition.notification-sent` | Push notification gửi đến user |
| `calendar.year-end-transition.life-release-boosted` | User phóng sinh trong giai đoạn |

---

## Errors

Không có hard block — scanner và recommendations là advisory-only.

---

## Notes for AI/codegen

- `tetDate` phải tính từ **Lunar Calendar Service** — không hardcode năm nào. Tết thay đổi mỗi năm (thường rơi vào tháng 1-2 dương lịch).
- Push notification gửi **tối đa 1 lần/user/năm** — dùng `YearEndNotificationLog` để prevent spam.
- `YEAR_END_TRANSITION` flag là toàn hệ thống (không per-user) — đọc từ `SystemFlag` table.
- Recommendations là advisory — không block bất kỳ action nào của user.

---

## Related

- [prime-liberation-lunar-scheduler.md](./prime-liberation-lunar-scheduler.md) — lịch phóng sinh hoàng đạo
- [detect-369-calamity-year.md](./detect-369-calamity-year.md) — phát hiện năm xung chiếu
- [zodiac-tai-sui-clash-enforcer.md](./zodiac-tai-sui-clash-enforcer.md) — Thái Tuế clash checker
