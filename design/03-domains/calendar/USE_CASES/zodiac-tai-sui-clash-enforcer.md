# Cảnh báo Phạm Thái Tuế Tự động Theo Con Giáp — Zodiac Tai Sui Clash Enforcer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quản Âm Bồ Tát Tâm Tài
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Mỗi năm âm lịch đều có các con giáp phạm Thái Tuế (Trực Tuế, Xung Tuế, Hại Tuế). Những người nằm trong nhóm này phải thêm niệm kinh, đốt Tiểu Phương Tử và Lễ sám hối để vượt qua năm không gặp kiếp nạn. Hệ thống cần tự động phát hiện người dùng trong nhóm Phạm Thái Tuế vào dịp đầu năm (Tết Âm Lịch) và bắn cảnh báo kèm theo KPI bắt buộc (NNN burn quota).

---

## Owner module

`calendar` — ZodiacService / TaiSuiEnforcer
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người dùng có tuổi (con giáp) nằm trong Phạm Thái Tuế
- `system` — Scan database vào đầu năm âm lịch, phát notification và append KPI

---

## Trigger

Hàng năm vào dịp Tết Âm Lịch (1 tháng 1 Âm Lịch, tương đương khoảng tháng 1-2 dương lịch):
- Hệ thống chạy cron job `syncTaiSuiYearQuotas`
- Load tất cả users có `birthYear` đã lưu
- Tính con giáp từ `birthYear`
- Cross-check với `TaiSuiClashMap[lunarYear]` để tìm những người Phạm Thái Tuế

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User nằm trong nhóm Phạm Thái Tuế năm đó | ✅ Create TaiSuiWarning record |
| Push notification: "Năm nay bạn Phạm Thái Tuế!" | ✅ Send immediately |
| Auto-append 21 biến Tiêu Tai Cát Tường Thần Chú vào Daily Recitation | ✅ Update template |
| Set KPI: Tối thiểu 27 Tiểu Phương Tử/tháng cho đến hết năm | ✅ Create quota tracker |
| Mỗi tháng, nếu user < 27 NNN, hiện banner warning | ⚠️ RED banner |
| User hoàn thành đủ quota năm đó → Dismiss warning | ✅ Mark TaiSuiWarning as RESOLVED |

---

## Input Contract

```typescript
// Lunar Year + Zodiac Clash Mapping
interface TaiSuiClashMap {
  lunarYear: number;           // e.g., 2026 (năm con mèo)
  clashingZodiacs: {
    direct: string[];          // Trực Tuế (e.g., ["RAT", "MONKEY", "DRAGON"])
    opposition: string[];      // Xung Tuế (e.g., ["HORSE"])
    harm: string[];            // Hại Tuế (e.g., ["RABBIT"])
  };
}

// User Zodiac Resolution
interface UserZodiac {
  userId: string;
  birthYear: number;
  zodiacSign: string;           // "RAT", "OX", "TIGER", ...
  chineseAge: number;           // Tuổi Âm Lịch
}

// Tai Sui Warning (stored in DB)
interface TaiSuiWarning {
  id: string;
  userId: string;
  lunarYear: number;
  zodiacSign: string;
  clashType: "DIRECT" | "OPPOSITION" | "HARM";
  recommendedQuota: number;     // 27 NNN/tháng
  createdAt: DateTime;
  status: "ACTIVE" | "RESOLVED" | "DISMISSED";
}
```

---

## Write Path

```
CRON: syncTaiSuiYearQuotas (triggered on 1/1 lunar year)

1. Load TaiSuiClashMap for current lunar year
2. Fetch all users WHERE birthYear IS NOT NULL
3. For each user:
     a. Calculate zodiacSign from birthYear
     b. Check if zodiacSign in clashingZodiacs (direct/opposition/harm)
     c. If match:
         - Create TaiSuiWarning record { userId, lunarYear, clashType, status: "ACTIVE" }
         - Send Push: "🚨 Năm nay bạn Phạm Thái Tuế ({clashType})! Cần niệm kinh & đốt NNN"
         - Call dailyRecitationService.appendRecitation({
             userId,
             recitationType: "TIEU_TAI_CAT_TUONG",
             dailyCount: 21
           })
         - Create QuotaTracker { userId, lunarYear, monthlyTarget: 27, deadline: 12/31 }

4. For each month (1-12):
     On 1st of month:
     - Query QuotaTracker WHERE lunarYear = currentYear AND status = "ACTIVE"
     - For each tracker:
         - Count littleHouses burned in past month for that user
         - If count < 27:
             → Send ⚠️ Red Warning: "Tháng này bạn còn thiếu {27 - count} Tiểu Phương Tử!"
             → Post warning to user's notification feed

5. On 12/31:
     - Count total NNN burned in entire year
     - If total >= 27*12=324:
         → Mark TaiSuiWarning as RESOLVED
         → Send 🎉 Success message: "Năm nay bạn vượt qua Phạm Thái Tuế an toàn!"
     - Else:
         → Keep as ACTIVE for next year
```

---

## FE Behavior

```
📱 APP NOTIFICATION FEED (Tết Âm Lịch)

┌──────────────────────────────────────────┐
│  🔔 Thông báo quan trọng                 │
├──────────────────────────────────────────┤
│  🚨 Năm nay bạn Phạm Thái Tuế (Trực)!  │
│                                          │
│  Con Chuột của bạn xung đột trực tiếp   │
│  với Thái Tuế năm Mèo 2026. Cần niệm    │
│  thêm kinh và đốt NNN để vượt qua.      │
│                                          │
│  📋 Yêu cầu:                            │
│  • Niệm 21 biến Tiêu Tai Cát Tường     │
│    Thần Chú mỗi ngày (đã thêm)         │
│  • Đốt tối thiểu 27 Tiểu Phương Tử     │
│    mỗi tháng (11 tháng tiếp theo)      │
│  • Làm sạch mục tiêu trước 31/12       │
│                                          │
│  [Hiểu rồi] [Xem chi tiết]              │
└──────────────────────────────────────────┘

⬇️ After dismiss ⬇️

📊 DASHBOARD — Tai Sui Quota Tracker

┌──────────────────────────────────────────┐
│  Phạm Thái Tuế 2026                     │
├──────────────────────────────────────────┤
│  Con Chuột  |  Trực Tuế  |  27/tháng   │
│                                          │
│  📊 Tháng 1:  ✅ 31/27 hoàn thành      │
│  📊 Tháng 2:  ⚠️  15/27 còn thiếu 12  │
│  📊 Tháng 3:  ⚠️  0/27                │
│     → [Cần hoàn thành trước 30/3]      │
│  📊 Tháng 4-12: --/27                  │
│                                          │
│  📈 Tiến độ năm: 46/324 NNN (14%)      │
│  🎯 Deadline: 31/12/2026               │
│                                          │
│  [Xem lịch sử] [Đốt NNN ngay]          │
└──────────────────────────────────────────┘

⬇️ On 1st of each month if quota < target ⬇️

┌──────────────────────────────────────────┐
│  ⚠️ CẢNH BÁO THÁNG 2                    │
├──────────────────────────────────────────┤
│                                          │
│  Tháng này bạn còn thiếu 12 Tiểu Phương │
│  Tử! Hãy cố gắng hoàn thành trước 28/2 │
│  để tránh tích lũy nợ.                  │
│                                          │
│  [Đốt NNN ngay] [Huỷ]                  │
└──────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
// New model for Tai Sui tracking
model TaiSuiWarning {
  id            String @id @default(cuid())
  userId        String
  lunarYear     Int
  zodiacSign    String    // "RAT", "OX", etc.
  clashType     String    // "DIRECT" | "OPPOSITION" | "HARM"
  status        String    @default("ACTIVE")  // "ACTIVE" | "RESOLVED" | "DISMISSED"

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lunarYear])
}

model QuotaTracker {
  id            String @id @default(cuid())
  userId        String
  lunarYear     Int
  monthlyTarget Int     @default(27)   // 27 NNN/tháng
  yearTarget    Int     @default(324)  // 27*12
  deadline      DateTime

  burnedCount   Int     @default(0)    // Tracked monthly
  currentMonth  Int?                   // Cache current month

  status        String  @default("ACTIVE")  // "ACTIVE" | "COMPLETED" | "FAILED"

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, lunarYear])
}

// Extend User model
// taiSuiWarnings: TaiSuiWarning[]
// quotaTrackers: QuotaTracker[]
```

---

## Audit

| Action | Trigger |
|---|---|
| `tai_sui.warning.created` | Phát hiện user phạm Thái Tuế vào đầu năm |
| `tai_sui.monthly_quota_checked` | Kiểm tra quota vào 1st của mỗi tháng |
| `tai_sui.monthly_quota_shortfall` | User thiếu quota trong tháng |
| `tai_sui.warning.resolved` | User hoàn thành quota năm đó |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Invalid zodiac sign | `invalid_zodiac_sign` | 400 |
| Missing birth year | `birth_year_required` | 400 |
| Lunar year not configured | `tai_sui_map_not_found` | 500 |

---

## Notes for AI/codegen

- TaiSuiClashMap phải được cập nhật hàng năm (config table hoặc hardcoded enum).
- Zodiac calculation từ birthYear phải chính xác theo Âm Lịch (cần library như `@phamtailinh/lunar-zodiac` hoặc `lunarphp`).
- Monthly quota check là cron job chạy vào 1st của mỗi tháng.
- KPI enforcement là soft warning (không blocking), nhưng cần prominent UX để user biết.
- Tương lai: Có thể mở rộng để support other clash types (Xung Tuế, Hại Tuế) với warning level khác nhau.

---

## Related

- [daily-recitation-starter-mahaprajna-sutra-lock.md](../wisdom-qa/USE_CASES/daily-recitation-starter-mahaprajna-sutra-lock.md) — Daily recitation append
