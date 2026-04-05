# Giao Thức "Tự Khai Quang" Tượng Tự Thỉnh — Self-Blessing Activation Sequence

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — layperson statue empowerment ritual
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu tự mua tượng về (chưa được Đài Trưởng hay cao tăng khai quang), người bình thường có thể tự thỉnh Bồ Tát nhập tượng vào **các ngày mùng 1, 15 Âm lịch lúc 6h, 8h, 10h sáng (hoặc 4h chiều)**. Bày biện đầy đủ, thắp 3 nén nhang, dâng nhang qua đầu lạy 3 lần, cắm vào lư hương. Khấn với tên tuổi của mình. Bắt buộc niệm **Chú Đại Bi 7 biến** và **Tâm Kinh 7 biến** rồi lạy 3 lần.

---

## Owner module

`altar-management` — AltarService / SelfBlessingActivation
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — layperson with newly purchased statue
- `system` — enforce timing, ritual sequence, mantra counting

---

## Trigger

User click [Tự Khai Quang Tượng] or [Thỉnh Bồ Tát Nhập Tượng]

---

## Business Rules

| Điều Kiện | Hành Động |
|---|---|
| Lunar calendar = Mùng 1 hoặc Rằm | ✅ Allow ritual |
| Time = 6h, 8h, 10h sáng hoặc 4h chiều | ✅ Allow ritual |
| Other date/time | ⚠️ Warn: recommend next auspicious time |
| Offerings prepared | ✅ Show checklist |
| 3 incense sticks ready | ✅ Proceed |
| Mantra Đại Bi < 7 biến | ❌ BLOCK |
| Mantra Tâm Kinh < 7 biến | ❌ BLOCK |
| All complete + 3 prostrations | ✅ Activation confirmed |

---

## Input Contract

```typescript
interface SelfBlessingRequestDto {
  statueId: string
  userName: string          // User's name for invocation
  auspiciousTimeConfirmed: boolean
  offeringsReady: {
    incenseSticks: number   // Must be 3
    flowers: boolean
    water: boolean
    fruits: boolean
  }
  mantrasChanted: {
    dauBi: number          // Must be 7
    tamKinh: number        // Must be 7
  }
  prostrationsCount: number // Must be 3
}

interface BlessingActivationResult {
  activated: boolean
  message?: string
}
```

---

## Write Path

```
POST /api/altar-management/statue/self-blessing

1. Check lunar calendar & time:
   const { lunarDay, hour } = getCurrentTime()
   const AUSPICIOUS_TIMES = [6, 8, 10, 16]  // 4pm = 16:00
   const AUSPICIOUS_DAYS = [1, 15]          // Mùng 1, Rằm

   if (lunarDay not in AUSPICIOUS_DAYS || hour not in AUSPICIOUS_TIMES):
     → return 400 {
         error: 'non_auspicious_time',
         message: 'Tự khai quang phải vào ngày Mùng 1, Rằm lúc 6h, 8h, 10h sáng hoặc 4h chiều',
         nextAuspiciousTime: calculateNext()
       }

2. Validate offerings:
   if (incenseSticks !== 3):
     → 400 { error: 'incense_count_wrong' }

3. Validate mantras:
   if (dauBi < 7 || tamKinh < 7):
     → 400 { error: 'mantras_incomplete' }

4. Validate prostrations:
   if (prostrationsCount < 3):
     → 400 { error: 'prostrations_incomplete' }

5. If all valid:
   a. Create StatueBlessingRecord
   b. Mark statue as "BLESSED"
   c. Audit: altar.statue.self_blessing_activated
   d. Return success with blessing confirmation

```

---

## FE Behavior

### Auspicious Time Check

```
┌────────────────────────────────────────────────────────┐
│ 🙏 Tự Khai Quang Tượng Bồ Tát                         │
│────────────────────────────────────────────────────────│
│                                                        │
│ Kiểm tra thời gian hôm nay...                         │
│ Hôm nay: 2026-04-04 (Mùng 10 Âm lịch, 14:30)         │
│                                                        │
│ ❌ Hôm nay KHÔNG phải ngày Mùng 1 hay Rằm            │
│ ❌ Thời gian 14:30 không trong khung (6h, 8h, 10h, 4h)│
│                                                        │
│ Ngày thích hợp tiếp theo: 2026-04-08 (Rằm)          │
│ Giờ thích hợp: 6:00, 8:00, 10:00, 16:00              │
│                                                        │
│        [Chờ Đến Ngày Thích Hợp]                       │
└────────────────────────────────────────────────────────┘
```

### Blessing Ritual Checklist

```
┌────────────────────────────────────────────────────────┐
│ 🙏 Nghi Thức Tự Khai Quang                            │
│────────────────────────────────────────────────────────│
│                                                        │
│ Tên người cầu: [___________________]                  │
│                                                        │
│ BƯỚC 1: Bày Biện Đầy Đủ                              │
│ [ ] Hoa (Flowers)                                     │
│ [ ] Nước (Water)                                      │
│ [ ] Trái cây (Fruits)                                 │
│                                                        │
│ BƯỚC 2: Thắp 3 Nén Nhang & Dâng                       │
│ [ ] Thắp 3 nén nhang, dâng qua đầu, lạy 3 lần       │
│ [ ] Cắm vào lư hương                                  │
│                                                        │
│ BƯỚC 3: Khấn & Niệm                                   │
│ "Xin Nam Mô Đại Từ Đại Bi cứu khổ cứu nạn quảng    │
│ đại linh cảm Quán Thế Âm Bồ Tát hiển linh, tiến nhập │
│ vào trong bảo tượng mà con tên [NAME] thờ phụng"     │
│                                                        │
│ Niệm Chú Đại Bi: 0/7 biến  [nhập số]               │
│ Niệm Tâm Kinh: 0/7 biến    [nhập số]               │
│                                                        │
│ BƯỚC 4: Lạy                                           │
│ [ ] Lạy 3 lần                                         │
│                                                        │
│       [Hủy]   [Xác Nhận Khai Quang]                   │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model StatueBlessingSession {
  id                  String   @id @default(cuid())
  userId              String
  statueId            String
  userName            String
  blessedAt           DateTime
  lunarDay            Int      // 1 or 15
  blessingHour        Int      // 6, 8, 10, 16
  dauBiChanted        Int      // 7
  tamKinhChanted      Int      // 7
  prostrationsCount   Int      // 3
  status              String   @default("ACTIVATED")  // ACTIVATED | RECHARGED
  createdAt           DateTime @default(now())

  @@index([userId, statueId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.statue.blessing_initiated` | Ritual starts |
| `altar.statue.blessing_blocked_timing` | Wrong date/time |
| `altar.statue.blessing_activated` | Blessing successful |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Non-auspicious time | `non_auspicious_time` | 400 |
| Wrong incense count | `incense_count_wrong` | 400 |
| Incomplete mantras | `mantras_incomplete` | 400 |
| Incomplete prostrations | `prostrations_incomplete` | 400 |

---

## Notes for AI/codegen

- Auspicious times: strict (6h, 8h, 10h AM, or 4h PM)
- Lunar calendar integration required
- 7 biến is mandatory for both Đại Bi and Tâm Kinh
- Self-blessing is valid alternative to temple empowerment
- Tracks user name for personalized invocation
- Phase 2: support for "recharging" blessing on subsequent Mùng 1/Rằm

---

## Related

- [statue-hygiene-mantra-protocol.md](./statue-hygiene-mantra-protocol.md) — Regular maintenance after blessing
- [internal-relocation-lock.md](./internal-relocation-lock.md) — Moving blessed statue
