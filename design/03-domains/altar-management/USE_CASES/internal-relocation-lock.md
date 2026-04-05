# Cửa Ải Dịch Chuyển Tượng Trong Nhà — Internal Relocation Lock

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — ritual protocol for moving statues
> **Cập nhật:** 2026-04-04

---

## Purpose

Nếu bắt buộc phải thay đổi vị trí của tượng Bồ Tát trên bàn thờ, không được tự ý cầm dời đi. Bắt buộc phải thắp hương, nói với Bồ Tát về việc thay đổi vị trí, niệm **Chú Đại Bi 7 biến**, **Tâm Kinh 7 biến**, và **Lễ Phật Đại Sám Hối Văn 7 biến**. Chỉ khi nhang đã cháy hết hoàn toàn mới được dịch chuyển tượng (và phải làm vào **ban ngày**).

---

## Owner module

`altar-management` — AltarService / StatueRelocationGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — muốn dịch chuyển tượng Bồ Tát
- `system` — enforce ritual sequence, timing gates, mantra counters

---

## Trigger

User click [Dịch Chuyển Tượng] hoặc attempt physical moving of statue

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User initiates relocation | ⚠️ Show ritual checklist |
| Incense NOT lit | ❌ BLOCK — must light first |
| Mantra count < 7 (Đại Bi) | ❌ BLOCK |
| Mantra count < 7 (Tâm Kinh) | ❌ BLOCK |
| Mantra count < 7 (Sám Hối) | ❌ BLOCK |
| Incense still burning | ❌ BLOCK — wait until burnt out |
| Time is nighttime | ❌ BLOCK — daytime only (06:00-18:00) |
| All steps complete + daytime + incense burnt | ✅ ALLOW |

---

## Input Contract

```typescript
interface StatueRelocationRequestDto {
  fromPosition: string
  toPosition: string
  daytimeConfirmed: boolean
  incenseBurnt: boolean
  mantrasCounted: {
    dauBi: number         // Must be 7
    tamKinh: number       // Must be 7
    samHoi: number        // Must be 7
  }
}

interface RelocationValidationResult {
  allowed: boolean
  missingSteps: string[]
}
```

---

## Write Path

```
POST /api/altar-management/statue/relocate

1. Create RelocationSession with ritual checklist
2. Validate each step in sequence:
   a. Check incense status:
      if (!incenseLit):
        → 400 { error: 'incense_required', message: 'Phải thắp hương trước' }
   b. Check mantra counts:
      if (dauBi < 7 || tamKinh < 7 || samHoi < 7):
        → 400 { error: 'mantras_incomplete', message: 'Phải niệm đủ 7 biến mỗi chú' }
   c. Check incense burnt:
      if (incenseStillBurning):
        → 400 { error: 'wait_for_incense', message: 'Phải chờ đến khi nhang cháy hết' }
   d. Check daytime:
      if (hour < 6 || hour >= 18):
        → 400 { error: 'nighttime_prohibition', message: 'Chỉ được dịch chuyển ban ngày' }
3. If all valid:
   a. Update statue position
   b. Log RelocationLog with full ritual details
   c. Audit: altar.statue.relocation_completed

```

---

## FE Behavior

### Relocation Ritual Checklist Modal

```
┌────────────────────────────────────────────────────────┐
│ 🙏 Nghi Thức Dịch Chuyển Tượng Bồ Tát                 │
│────────────────────────────────────────────────────────│
│                                                        │
│ BƯỚC 1: Thắp Hương                                    │
│ [ ] Đã thắp hương, nói chuyện với Bồ Tát về thay     │
│     đổi vị trí                                        │
│                                                        │
│ BƯỚC 2: Niệm Chú Đại Bi                               │
│ Đã niệm: 0/7 biến                                    │
│ [Nhập số biến]  [xác nhận]                           │
│                                                        │
│ BƯỚC 3: Niệm Tâm Kinh                                 │
│ Đã niệm: 0/7 biến                                    │
│ [Nhập số biến]  [xác nhận]                           │
│                                                        │
│ BƯỚC 4: Niệm Lễ Phật Đại Sám Hối Văn                 │
│ Đã niệm: 0/7 biến                                    │
│ [Nhập số biến]  [xác nhận]                           │
│                                                        │
│ BƯỚC 5: Chờ Nhang Cháy Hết                            │
│ [ ] Nhang đã cháy hết hoàn toàn                      │
│                                                        │
│ BƯỚC 6: Xác Nhận Ban Ngày & Dịch Chuyển              │
│ [ ] Hiện tại là ban ngày (06:00-18:00)              │
│ [ ] Tôi sẵn sàng dịch chuyển tượng                   │
│                                                        │
│          [Hủy]   [Xác Nhận Dịch Chuyển]              │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model StatueRelocationLog {
  id                  String   @id @default(cuid())
  userId              String
  altarId             String
  fromPosition        String
  toPosition          String
  incenceLitAt        DateTime
  incenceBurntAt      DateTime
  dauBiChanted        Int      // 7
  tamKinhChanted      Int      // 7
  samHoiChanted       Int      // 7
  relocatedAt         DateTime
  createdAt           DateTime @default(now())

  @@index([userId, relocatedAt])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.statue.relocation_initiated` | Ritual started |
| `altar.statue.relocation_step_completed` | Mantra milestone |
| `altar.statue.relocation_blocked` | Failed validation |
| `altar.statue.relocation_completed` | Statue moved |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| No incense | `incense_required` | 400 |
| Mantras incomplete | `mantras_incomplete` | 400 |
| Incense still burning | `wait_for_incense` | 400 |
| Nighttime | `nighttime_prohibition` | 400 |

---

## Notes for AI/codegen

- 7 biến is strict count for each of 3 mantras (21 total)
- Daytime window: 06:00-18:00 only
- Incense must be completely burnt (not just low)
- Step-by-step checklist prevents shortcuts
- Full audit trail for recovery if needed

---

## Related

- [statue-hygiene-mantra-protocol.md](./statue-hygiene-mantra-protocol.md) — Regular cleaning
- [confined-cabinet-setup.md](./confined-cabinet-setup.md) — Cabinet storage
