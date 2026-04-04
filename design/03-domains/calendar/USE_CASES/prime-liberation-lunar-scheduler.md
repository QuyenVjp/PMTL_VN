# Lịch Phóng Sinh Ngày Vàng — Prime Liberation Lunar Scheduler

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 30)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phóng sinh bất kỳ ngày nào đều có công đức, nhưng các ngày "Vàng" mang lại công đức nhân lên gấp nhiều lần: sinh nhật người thực hiện, mùng 1 & rằm (15) âm lịch, ngày Vía các Chư Phật/Bồ Tát, và đêm Giao Thừa. Khi user chọn ngày phóng sinh bình thường trong vòng 7 ngày tới có ngày Vàng, hệ thống gợi ý chuyển sang ngày Vàng đó — không ép buộc, chỉ khuyến nghị.

---

## Owner module

`calendar` — LunarCalendarService / PrimeLiberationScheduler
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — lập kế hoạch phóng sinh
- `system` — scan ngày Vàng trong 7 ngày tới, hiển thị recommendation màu vàng

---

## Trigger

Khi user chọn ngày `T` để tạo `LifeReleaseEvent` trong form lập kế hoạch.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Ngày `T` được chọn bình thường | ✅ ALLOWED — tiếp tục |
| Trong `[T, T+7]` có ngày Vàng | ⚠️ Hiển thị recommendation màu vàng (không block) |
| User chấp nhận gợi ý | ✅ Đổi date sang ngày Vàng |
| User từ chối gợi ý | ✅ Giữ nguyên ngày `T` |
| Ngày `T` CHÍNH LÀ ngày Vàng | ✅ ALLOWED — hiển thị badge "Ngày Vàng!" không cần recommendation |

---

## Input Contract

```typescript
interface CreateLifeReleaseEventDto {
  plannedDate: string   // ISO date
  userId:      string
  // ... other fields
}

enum GoldenDayType {
  BIRTHDAY               // Sinh nhật user
  LUNAR_1ST              // Mùng 1 âm lịch
  LUNAR_15TH             // Rằm (15 âm lịch)
  GUAN_YIN_VIA           // Ngày Vía Quán Thế Âm
  BUDDHA_VIA             // Ngày Vía Thích Ca Mâu Ni
  AMITABHA_VIA           // Ngày Vía A Di Đà
  LUNAR_NEW_YEAR_EVE     // Đêm Giao Thừa
  OTHER_VIA              // Ngày Vía các Chư Phật khác
}

interface GoldenDaySuggestion {
  date:        string
  dayType:     GoldenDayType
  description: string
  daysAway:    number
}
```

---

## Write Path

```
POST /api/vows-merit/life-release/create (pre-check step)
OR
GET /api/calendar/prime-liberation-check?date=YYYY-MM-DD&userId=...

1. Check if plannedDate itself is a golden day:
   → If yes: return { isGoldenDay: true, dayType, badge }
   → If no: proceed to scan

2. Scan range [plannedDate, plannedDate + 7 days]:
   For each day in range:
     a. Convert to lunar date → check if day 1 or 15
     b. Check ViaCalendar for Guan Yin / Buddha / Amitabha via dates
     c. Check user.birthday (lunar or solar match)
     d. Check if Lunar New Year Eve

3. If goldenDays found in range:
   → Return { suggestions: GoldenDaySuggestion[], recommendedDate: <nearest golden day> }

4. If no golden days in range:
   → Return { suggestions: [] }
   → Continue with original date, no recommendation needed
```

---

## FE Behavior

### Recommendation notification (ngày bình thường, có ngày Vàng gần):

```
┌────────────────────────────────────────────────────────────┐
│ 💛 Gợi Ý Tâm Linh                                          │
│────────────────────────────────────────────────────────────│
│ Ngày 3 ngày nữa (15/05) là Ngày Vía Quán Thế Âm Bồ Tát!  │
│                                                            │
│ Phóng sinh vào ngày Vía Bồ Tát công đức sẽ được           │
│ nhân lên gấp bội so với ngày thường.                       │
│                                                            │
│    [✅ Dời sang 15/05]    [Giữ Nguyên Ngày Đã Chọn]        │
└────────────────────────────────────────────────────────────┘
```

### Badge khi ngày được chọn ĐÃ LÀ ngày Vàng:

```
📅  15/05/2026   💛 NGÀY VÍA QUAN ÂM
                 Công đức phóng sinh hôm nay đặc biệt!
```

### Khi có nhiều ngày Vàng trong 7 ngày:

```
💛 Có 2 ngày Vàng trong tuần tới:
• 15/05 — Ngày Vía Quán Thế Âm Bồ Tát (3 ngày nữa)
• 18/05 — Sinh nhật của bạn (6 ngày nữa)

[Chọn 15/05]  [Chọn 18/05]  [Giữ Nguyên]
```

---

## Schema Notes

```prisma
model LifeReleaseEvent {
  // ... existing fields ...
  isGoldenDay      Boolean   @default(false)
  goldenDayType    String?   // GoldenDayType enum value
  // Migration: ALTER TABLE "LifeReleaseEvent" ADD COLUMN "isGoldenDay" BOOLEAN DEFAULT FALSE
  //            ADD COLUMN "goldenDayType" TEXT
}

model ViaCalendar {
  id          String   @id @default(cuid())
  lunarMonth  Int
  lunarDay    Int
  entityName  String   // "Quán Thế Âm Bồ Tát", "Thích Ca Mâu Ni", etc.
  viaType     String   // GoldenDayType value
  description String?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `calendar.liberation.golden_day_suggested` | Gợi ý ngày Vàng được hiển thị |
| `calendar.liberation.golden_day_accepted` | User đổi sang ngày Vàng |
| `calendar.liberation.golden_day_declined` | User giữ ngày ban đầu |
| `calendar.liberation.golden_day_selected` | User chọn ngày đã là ngày Vàng |

---

## Errors

Không có error codes — đây là recommendation-only feature, không block.

---

## Notes for AI/codegen

- `ViaCalendar` là static data table — seed từ lịch Vía Chư Phật cố định hàng năm
- Lunar date conversion cần `LunarCalendarService` — đã có sẵn trong domain `calendar`
- Birthday check: so sánh cả lunar birthday VÀ solar birthday của user
- Scan window `+7 ngày` là config constant `PRIME_LIBERATION_SCAN_DAYS`
- Feature này là PURE RECOMMENDATION — không có business rule cứng, không block

---

## Related

- [birthday-longevity-life-release-trigger.md](../../vows-merit/USE_CASES/birthday-longevity-life-release-trigger.md) — sinh nhật trigger phóng sinh
- [apply-lunar-override.md](./apply-lunar-override.md) — lunar date service
- [log-life-release.md](../../vows-merit/USE_CASES/log-life-release.md) — ghi nhận phóng sinh
