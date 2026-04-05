# Lệnh Phân Tách Dòng Nước Của Các Chư Phật — Buddha Water Segregation Law

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 911, 912)
> **Trạng thái:** Verified source — state isolation + mantra gate
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu trên bàn thờ có nhiều vị Bồ Tát, nước cúng của Thích Ca Mâu Ni Phật và Quán Thế Âm Bồ Tát có thể uống trực tiếp (rót ra ly khác). Nhưng nước cúng của các vị Phật, Bồ Tát khác thì bình thường nên đổ đi; nếu muốn uống thì bắt buộc phải niệm 1 biến Chú Đại Bi rồi mới được uống. Cấm kỵ: tuyệt đối không được đổ trộn lẫn nước cúng của các vị Bồ Tát khác nhau vào chung một ly để uống.

---

## Owner module

`altar-management` — AltarService / BuddhaWaterIsolationEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người có nhiều Bồ Tát trên bàn thờ
- `system` — water segregation validator, mantra gate

---

## Trigger

1. User thêm Bồ Tát thứ 2 lên bàn thờ
2. User cố gom chung nước từ 2 ly Bồ Tát khác nhau
3. User click uống nước của Bồ Tát không phải Thích Ca hoặc Quán Âm

---

## Business Rules

### Part A: Nước Thích Ca & Quán Âm

| Điều kiện | Hành động |
|---|---|
| Uống nước của Thích Ca Mâu Ni | ✅ Direct drink (no mantra required) |
| Uống nước của Quán Thế Âm | ✅ Direct drink (no mantra required) |

### Part B: Nước Các Bồ Tát Khác

| Điều kiện | Hành động |
|---|---|
| Uống nước của Bồ Tát khác | ⚠️ Must chant 1 mantra first |
| User chưa chant | ❌ Unlock button disabled |
| User confirm chanted | ✅ Allow drinking |

### Part C: Cấm Gom Lẫn

| Điều kiện | Hành động |
|---|---|
| User cố merge 2 water sources | ❌ HARD BLOCK 400 |
| Each Buddha water = separate consumption | ✅ Enforce isolation |

---

## Input Contract

```typescript
interface BuddhaWaterConsumptionDto {
  waterId: string
  buddhaMasterId: string  // e.g., "THICH_CA", "QUAN_AM", "KHONG_QUE"
  mantrasChantedCount?: number  // 0 or 1
}

interface BuddhaWaterValidationResult {
  allowed: boolean
  mantrasRequired: number
  error?: string
}

interface MergeWatersDto {
  waterIds: string[]  // Multiple waters
}
```

---

## Write Path

```
--- Get Water Segregation Rules ---
GET /api/altar-management/water/segregation-rules

Return:
{
  allowDirectDrink: ['THICH_CA', 'QUAN_AM'],
  requiresMantras: {
    'KHONG_QUE': 1,        // Công Đức Phật
    'QUA_HUONG': 1,        // 其他诸佛
    // ... other Buddhas
  }
}

--- Attempt to Drink Water from Non-Primary Buddha ---
POST /api/altar-management/water/:waterId/drink

1. Load water.buddhaMasterId
2. If buddhaMasterId in allowDirectDrink:
   → Allow directly
3. Else:
   a. Check if User chanted:
      const { mantrasChantedCount } = request.body
   b. If mantrasChantedCount === 0:
      → Return 400 {
          error: 'mantra_required',
          message: 'Muốn uống nước của vị Bồ Tát này, bắt buộc phải niệm 1 biến Chú Đại Bi trước!'
        }
   c. If mantrasChantedCount >= 1:
      → Allow consumption
      → Audit: altar.water.mantra_gated_consumption

--- Attempt to Merge Waters ---
POST /api/altar-management/water/merge

1. Check if any 2 waterIds have different buddhaMasterIds:
   if (waterIds.map(w => w.buddhaMasterId).some(distinct)) {
      → throw 400 {
          error: 'water_segregation_violation',
          message: 'Quy tắc Từ trường: Tuyệt đối không được trộn lẫn nước cúng của các vị Bồ Tát khác nhau. Phải rót ra các ly khác nhau để uống!'
        }
   }

```

---

## FE Behavior

### Drinking Water from Non-Primary Buddha

```
┌────────────────────────────────────────────────────────┐
│ 🙏 Uống Nước Của [Buddha_Name]                         │
│────────────────────────────────────────────────────────│
│ Nước cúng của vị Bồ Tát này cần thêm bước xác nhận.   │
│                                                        │
│ Để uống nước của [Buddha_Name], bắt buộc phải:        │
│ ✅ Niệm 1 biến Chú Đại Bi                             │
│                                                        │
│ [ ] Tôi đã niệm 1 biến Chú Đại Bi                     │
│                                                        │
│            [Uống Ngay]                                │
│           (disabled)                                   │
└────────────────────────────────────────────────────────┘
```

### Merge Waters Blocked

```
┌────────────────────────────────────────────────────────┐
│ ❌ Không Thể Gom Nước Lẫn Lộn                          │
│────────────────────────────────────────────────────────│
│ Quy tắc Từ trường: Tuyệt đối không được trộn lẫn      │
│ nước cúng của các vị Bồ Tát khác nhau.                │
│                                                        │
│ Phải rót ra các ly khác nhau để uống!                │
│                                                        │
│ Nước của Thích Ca: [Uống]                             │
│ Nước của Quán Âm: [Uống]                              │
│ Nước của Công Đức: [Uống]                             │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model WaterOffering {
  id              String   @id @default(cuid())
  userId          String
  buddhaMasterId  String   // "THICH_CA", "QUAN_AM", "KHONG_QUE", etc.
  waterType       String
  quantity        Int      // ml
  offeredAt       DateTime @default(now())

  @@index([userId, buddhaMasterId])
  @@unique([userId, buddhaMasterId, offeredAt])  // Prevent duplicate offerings same day
}

model WaterConsumptionLog {
  id              String   @id @default(cuid())
  userId          String
  waterId         String   @relation(fields: [waterId], references: [id])
  buddhaMasterId  String
  mantrasChanted  Int      @default(0)
  consumedAt      DateTime @default(now())
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.water.direct_drink_allowed` | Thích Ca / Quán Âm water consumed |
| `altar.water.mantra_gated_consumption` | Other Buddha water + mantra chanted |
| `altar.water.segregation_violation_blocked` | Merge waters attempt blocked |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Non-primary Buddha, no mantra | `mantra_required` | 400 |
| Merge waters attempt | `water_segregation_violation` | 400 |

---

## Notes for AI/codegen

- Thích Ca & Quán Âm = 2 primary, direct drink
- All others = require 1 mantra chant
- Merge is HARD BLOCK, no exceptions
- buddhaMasterId must be unique per offering session
- Track mantrasChanted in consumption log for audit

---

## Related

- [water-source-validation.md](./water-source-validation.md) — Kiểm tra loại nước
- [anti-botanical-watering-ban.md](./anti-botanical-watering-ban.md) — Cấm tưới cây
