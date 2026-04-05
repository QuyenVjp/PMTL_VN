# Giao Thức Vệ Sinh Bảo Tượng Định Kỳ — Statue Hygiene & Mantra Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — ritual cleanliness
> **Cập nhật:** 2026-04-04

---

## Purpose

Sau khi đã cúng Bồ Tát, tuyệt đối không được tùy tiện sờ chạm vào tượng. Thông thường không cần cọ rửa tượng thường xuyên. Nếu thực sự có nhiều bụi bặm, phải làm vào **ban ngày**, dùng **khăn ẩm mới** hoàn toàn để lau nhẹ, và **bắt buộc** trong lúc lau phải niệm **1 biến Tâm Kinh**.

---

## Owner module

`altar-management` — AltarService / StatueHygieneGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — muốn lau chùi tượng Bồ Tát
- `system` — enforce daytime-only, new cloth requirement, mantra gate

---

## Trigger

User click [Vệ Sinh Tượng] hoặc nhận thông báo dust accumulation warning

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User request statue cleaning | ⚠️ Check time of day |
| Current time is nighttime (18:00-06:00) | ❌ BLOCK — daytime only |
| Daytime + new cloth confirmed | ✅ Show mantra requirement |
| Mantra completion confirmed | ✅ Log cleaning session |
| Dust detected via camera > threshold | ⚠️ Recommend daytime cleaning |

---

## Input Contract

```typescript
interface StatueCleaningRequestDto {
  timetableConfirmed: boolean    // Must be daytime (06:00-18:00)
  newClothUsed: boolean          // Brand new cloth
  mantrasChanted: number         // Must be >= 1 (Tâm Kinh)
}

interface CleaningValidationResult {
  allowed: boolean
  errors: string[]
}
```

---

## Write Path

```
POST /api/altar-management/statue/clean

1. Check current time:
   const hour = new Date().getHours()
   if (hour < 6 || hour >= 18):
     → return 403 {
         error: 'nighttime_prohibition',
         message: 'Vệ sinh tượng phải vào ban ngày (6:00-18:00). Hiện tại là ban đêm.'
       }

2. Validate cloth requirement:
   if (!newClothUsed):
     → return 400 {
         error: 'used_cloth_prohibited',
         message: 'Bắt buộc dùng khăn ẩm MỚI hoàn toàn. Không được dùng khăn cũ.'
       }

3. Validate mantra completion:
   if (mantrasChanted < 1):
     → return 400 {
         error: 'mantra_required',
         message: 'Bắt buộc niệm 1 biến Tâm Kinh trong lúc lau chùi tượng.'
       }

4. If all valid:
   a. Create StatueCleaningLog
   b. Audit: altar.statue.cleaning_completed
   c. Return success

```

---

## FE Behavior

### Nighttime Block

```
┌────────────────────────────────────────────────────────┐
│ ❌ Cấm Vệ Sinh Ban Đêm                                │
│────────────────────────────────────────────────────────│
│ Vệ sinh tượng Bồ Tát bắt buộc phải vào ban ngày       │
│ (từ 6:00 sáng đến 6:00 chiều).                        │
│                                                        │
│ Hiện tại là 22:30 (ban đêm).                          │
│ Vui lòng quay lại vào ban ngày.                       │
│                                                        │
│            [Đóng]                                      │
└────────────────────────────────────────────────────────┘
```

### Daytime Cleaning Checklist

```
┌────────────────────────────────────────────────────────┐
│ 🧹 Vệ Sinh Tượng Bồ Tát                               │
│────────────────────────────────────────────────────────│
│ Thời gian: 09:45 (Ban ngày) ✅                        │
│                                                        │
│ Yêu cầu:                                               │
│ [ ] Dùng khăn ẩm MỚI (chưa dùng lần nào)             │
│ [ ] Lau nhẹ tượng                                      │
│ [ ] Niệm 1 biến Tâm Kinh trong lúc lau               │
│                                                        │
│ Để tỏ lòng tôn kính, vui lòng không sờ chạm         │
│ tượng ngoài lúc vệ sinh định kỳ.                      │
│                                                        │
│ [ ] Tôi đã hoàn thành vệ sinh và niệm Tâm Kinh      │
│                                                        │
│          [Hủy]   [Xác Nhận]                           │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model StatueCleaningLog {
  id                String   @id @default(cuid())
  userId            String
  altarId           String
  cleanedAt         DateTime
  newClothUsed      Boolean
  mantrasChanted    Int      // >= 1
  dustLevel         String?  // 'NONE', 'LIGHT', 'HEAVY'
  createdAt         DateTime @default(now())

  @@index([userId, cleanedAt])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.statue.cleaning_requested` | User initiates |
| `altar.statue.cleaning_blocked_nighttime` | Blocked by time |
| `altar.statue.cleaning_completed` | Cleaning finished |
| `altar.statue.dust_accumulation_warning` | Camera detects dust |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Nighttime | `nighttime_prohibition` | 403 |
| Used cloth | `used_cloth_prohibited` | 400 |
| No mantra | `mantra_required` | 400 |

---

## Notes for AI/codegen

- Daytime window: 06:00-18:00 strict
- New cloth check: can be soft (trust user) or hard (prompt for photo) in Phase 2
- Mantra: 1 biến Tâm Kinh minimum
- Dust camera detection optional Phase 2 enhancement
- Log frequency helps with maintenance schedules

---

## Related

- [internal-relocation-lock.md](./internal-relocation-lock.md) — Moving statue ritual
- [confined-cabinet-setup.md](./confined-cabinet-setup.md) — Cabinet storage rules
