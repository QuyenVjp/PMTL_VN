# Thuật Toán Phân Bổ Đèn Dầu Đa Thần — Multi-Deity Oil Lamp Allocation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — canonical lamp count rules
> **Cập nhật:** 2026-04-04

---

## Purpose

Đối với bàn thờ cúng đầy đủ 6 vị Bồ Tát của Pháp Môn (Thích Ca, Quán Âm, Nam Kinh, Thái Tuế, Quan Đế, Châu Xương), số lượng đèn dầu được quy định chặt chẽ. Tốt nhất: 5 ngọn (mỗi vị Thích Ca/Quán Âm/Nam Kinh/Thái Tuế 1 ngọn riêng, 3 vị Quan Đế/Châu Xương/Quan Bình dùng chung 1 ngọn). Nếu đầy đủ nhất: 7 ngọn (mỗi vị 1 ngọn). Tối thiểu: 1-2 ngọn cho toàn bộ bàn thờ.

---

## Owner module

`altar-management` — AltarService / OilLampAllocationEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — setup bàn thờ với nhiều vị Bồ Tát
- `system` — recommend optimal lamp count based on deities present

---

## Trigger

User add Bồ Tát vào bàn thờ, hoặc query [What's the optimal lamp count?]

---

## Business Rules

| Số Vị Bồ Tát | Tối Thiểu | Khuyến Nghị | Tối Đa |
|---|---|---|---|
| 1 (Thích Ca/Quán Âm) | 1 | 2 | 3 |
| 3 (Thích Ca + Quán Âm + Nam Kinh) | 1 | 3 | 4 |
| 4 (+ Thái Tuế) | 1 | 4 | 5 |
| 5 (+ Quan Đế group) | 2 | 5 | 6 |
| 6 (+ Châu Xương/Quan Bình) | 2 | **5** (shared) or **7** (separate) | 7 |

---

## Input Contract

```typescript
interface DeityConfigurationDto {
  deities: string[]  // ['THICH_CA', 'QUAN_AM', 'NAM_KINH', ...]
  totalLamps?: number
}

interface OilLampAllocationRecommendationDto {
  minLamps: number
  recommendedLamps: number
  maxLamps: number
  grouping: {
    individual: string[]      // Each has own lamp
    shared: string[]         // Share one lamp
  }
}
```

---

## Write Path

```
GET /api/altar-management/oil-lamp/recommendation?deities=THICH_CA,QUAN_AM,NAM_KINH,THAI_TUE,QUAN_DE,CHAU_XUONG

1. Parse deities array
2. Determine grouping:
   - Primary 4: Thích Ca, Quán Âm, Nam Kinh, Thái Tuế → each 1 lamp (4 lamps)
   - Secondary group (Quan Đế, Châu Xương, Quan Bình) → share 1 lamp
   → Recommendation: 5 lamps total

3. Return allocation schema:
   {
     "minLamps": 2,
     "recommendedLamps": 5,
     "maxLamps": 7,
     "grouping": {
       "individual": ["THICH_CA", "QUAN_AM", "NAM_KINH", "THAI_TUE"],
       "shared": ["QUAN_DE", "CHAU_XUONG", "QUAN_BINH"]
     }
   }

4. Audit: altar.oil-lamp.allocation_calculated

--- If User Confirms Setup ---
POST /api/altar-management/oil-lamp/setup

1. Validate lampCount against recommendation:
   - If lampCount < min OR > max → warn but allow
2. Create OilLampAllocationRecord
3. Map deities to lamp slots
4. Audit: altar.oil-lamp.setup_confirmed

```

---

## FE Behavior

### Recommendation Modal

```
┌────────────────────────────────────────────────────────┐
│ 🪔 Khuyến Nghị Số Đèn Dầu                             │
│────────────────────────────────────────────────────────│
│ Bàn thờ của bạn có 6 vị Bồ Tát:                       │
│ • Thích Ca Mâu Ni Phật                                │
│ • Quán Thế Âm Bồ Tát                                 │
│ • Nam Kinh Bồ Tát                                    │
│ • Thái Tuế Bồ Tát                                    │
│ • Quan Đế Bồ Tát                                     │
│ • Châu Xương Bồ Tát                                  │
│                                                        │
│ Khuyến Nghị: 5 ngọn đèn dầu                          │
│ ├─ Thích Ca: 1 ngọn                                  │
│ ├─ Quán Âm: 1 ngọn                                   │
│ ├─ Nam Kinh: 1 ngọn                                  │
│ ├─ Thái Tuế: 1 ngọn                                  │
│ └─ Quan Đế group: 1 ngọn (chung)                     │
│                                                        │
│ Tối thiểu: 2 ngọn | Tối đa: 7 ngọn                  │
│                                                        │
│         [Xác Nhận 5 Ngọn]                             │
└────────────────────────────────────────────────────────┘
```

### Custom Setup

```
┌────────────────────────────────────────────────────────┐
│ 🪔 Tùy Chỉnh Số Đèn Dầu                               │
│────────────────────────────────────────────────────────│
│ Bạn muốn dùng bao nhiêu ngọn?                         │
│                                                        │
│ Tối thiểu: 1  |  Khuyến nghị: 5  |  Tối đa: 7      │
│                                                        │
│ Số ngọn: [5______]                                    │
│                                                        │
│ Phân bổ:                                              │
│ [ ] Thích Ca                                          │
│ [ ] Quán Âm                                           │
│ [ ] Nam Kinh                                          │
│ [ ] Thái Tuế                                          │
│ [ ] Quan Đế (chung với Châu Xương)                   │
│                                                        │
│         [Lưu]  [Hủy]                                  │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model OilLampAllocation {
  id                String   @id @default(cuid())
  userId            String
  altarId           String
  totalLamps        Int      // 1-7
  recommendedLamps  Int
  deities           Json     // Array of deity names
  grouping          Json     // { individual: [], shared: [] }
  createdAt         DateTime @default(now())

  @@index([userId, altarId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.oil-lamp.allocation_calculated` | Recommendation generated |
| `altar.oil-lamp.setup_confirmed` | User confirms lamp count |
| `altar.oil-lamp.suboptimal_count_warning` | User chooses < recommended |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| No deities configured | `no_deities_found` | 400 |

---

## Notes for AI/codegen

- Recommendation engine is advisory, not blocking
- Primary 4 (Thích Ca, Quán Âm, Nam Kinh, Thái Tuế) should ideally have individual lamps
- Secondary group (Quan Đế, Châu Xương, Quan Bình) can share 1 lamp safely
- If space limited, 1-2 lamps acceptable but trigger soft warning
- Allocation persists with audit trail for future reference

---

## Related

- [electric-lotus-lamp-sequence.md](./electric-lotus-lamp-sequence.md) — Lamp on/off sequence
- [candle-restraint-guard.md](./candle-restraint-guard.md) — Candle rules
