# Lịch Sư Phục Vụ Tượng Thần — Statue Blessing Scheduler

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — time-gate enforcement required
> **Cập nhật:** 2026-04-04

---

## Purpose

Tượng Phật/Thần chỉ được phục vụ (blessing) tại 4 khung giờ thiêng liêng mỗi ngày: 6 sáng, 8 sáng, 10 sáng, 4 chiều. Mỗi buổi phục vụ bắt buộc phải chanting **Đại Bi 7 lần TRƯỚC khi chạm tượng**, sau đó **7 lần NỮA SAU khi chạm xong**. Hệ thống block request nếu ngoài khung giờ hoặc chưa đủ 7+7 sequence.

---

## Owner module

`altar-management` — StatueBlessingService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thực hiện ritual phục vụ tượng
- `system` — validate thời gian + sequence, enforce 7+7 rule

---

## Trigger

User gọi POST /api/altar-management/blessings/perform để bắt đầu buổi phục vụ tượng.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Request ở khung giờ cấp phép | ✅ Accept blessing session |
| Request ngoài 6/8/10/16 | ❌ Block 400 invalid_blessing_time |
| Session active, user chant <7 | ⏳ Show counter, block early touch |
| User hoàn 7 trước + 7 sau | ✅ Mark session complete, audit |
| User skip recitations | ❌ Block mantra_sequence_violation |
| Blessing complete | ✅ Issue user declaration prompt |

---

## Allowed Blessing Windows

```typescript
const BLESSING_WINDOWS = [
  { hour: 6, minute: 0, label: '6:00 AM — Sáng sớm' },
  { hour: 8, minute: 0, label: '8:00 AM — Sáng khuya' },
  { hour: 10, minute: 0, label: '10:00 AM — Trưa sáng' },
  { hour: 16, minute: 0, label: '4:00 PM — Chiều' }
]
```

---

## Input Contract

```typescript
interface BlessingSessionDto {
  attemptTime: DateTime  // User submission time
  mantrasRecitedBefore: number  // Count before touching statue
  mantrasRecitedAfter: number   // Count after touching statue
}
```

---

## Write Path

```
POST /api/altar-management/blessings/perform
1. Extract attemptTime.hour from request
2. Check if hour ∈ [6, 8, 10, 16]
3. If NOT in window:
   → Return 400 { code: 'invalid_blessing_time', next_window: ... }
4. Validate mantrasRecitedBefore == 7 AND mantrasRecitedAfter == 7
5. If NOT (7+7):
   → Return 400 { code: 'mantra_sequence_violation',
                   required_before: 7, got_before: ...,
                   required_after: 7, got_after: ... }
6. If all valid:
   → Create BlessingSession record with isComplete = true
   → Emit audit events
7. Return 200 { session_id, performed_at, is_complete: true }
```

---

## FE Behavior

### Before Blessing Window

```
⏰ BỨC PHỤC VỤ TƯỢNG THẦN

Khung giờ cấp phép:
────────────────────────────────────
🕕 6:00 AM — Sáng sớm
🕖 8:00 AM — Sáng khuya
🕙 10:00 AM — Trưa sáng
🕐 4:00 PM — Chiều
════════════════════════════════════

Khung giờ tiếp theo: 6:00 AM (5h 23m)

[Chờ Khung Giờ]
```

---

### During Blessing Session

```
✨ PHỤC VỤ TƯỢNG THẦN

Bước 1: Chanting TRƯỚC khi chạm

📿 Chants: 0 / 7
   ⚪ Chant 1
   ⚪ Chant 2
   ...
   ⚪ Chant 7

   [Tiếp Tục Chanting]

🚫 Không thể chạm tượng cho đến khi
   đủ 7 lần Đại Bi
════════════════════════════════════
```

---

### After 7 Recitations (Before)

```
✨ PHỤC VỤ TƯỢNG THẦN

Bước 1: ✅ Hoàn thành 7 lần trước

Bước 2: Chạm tượng + Chanting SAU

🕯️ Bạn đã chạm tượng?

[Có, Tiếp Tục]  [Quay Lại]

────────────────────────────────────

Nếu có, chanting 7 lần nữa:

📿 Chants: 0 / 7
   ⚪ Chant 1
   ⚪ Chant 2
   ...
   ⚪ Chant 7

   [Tiếp Tục Chanting]
════════════════════════════════════
```

---

### After Complete (7+7)

```
✅ PHỤC VỤ TƯỢNG HOÀN THÀNH

Buổi phục vụ của bạn đã được ghi nhận:

🕰️ Thời gian: 6:00 AM — Hôm nay
📿 Trước: 7/7 ✅
📿 Sau: 7/7 ✅
🙏 Tượng được phục vụ

Bạn xác nhận đã chạm tượng theo đúng
quy lệ 7+7 không?

[Xác Nhận]  [Hủy Bỏ]
```

---

## Schema Notes

```prisma
model BlessingSession {
  id                  String   @id @default(cuid())
  userId              String
  performedAt         DateTime // actual UTC timestamp of completion
  mantrasCountBefore  Int      // must be 7
  mantrasCountAfter   Int      // must be 7
  isComplete          Boolean  @default(false)
  declaredTouchTime   DateTime? // when user confirmed touching statue
  createdAt           DateTime @default(now())

  // Indexes for daily blessing limit checks
  @@index([userId, performedAt])

  // Migration: CREATE TABLE "BlessingSession" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.blessing.performed-at-allowed-time` | Blessing session created within allowed window |
| `altar.blessing.7plus7-sequence-completed` | Both mantrasCountBefore == 7 AND mantrasCountAfter == 7 validated |
| `altar.blessing.time-violation-attempted` | Block attempt outside allowed windows |
| `altar.blessing.sequence-violation-attempted` | Block attempt with incomplete 7+7 |

---

## Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| Request outside 6/8/10/16 | `invalid_blessing_time` | 400 | Blessing only permitted at 6:00 AM, 8:00 AM, 10:00 AM, or 4:00 PM |
| mantrasRecitedBefore ≠ 7 OR mantrasRecitedAfter ≠ 7 | `mantra_sequence_violation` | 400 | 7 recitations required before and after touching statue |

---

## Notes for Implementation

- **Time Window Validation:** Convert user's `attemptTime` to local timezone before checking hour. Consider DST edge cases.
- **No Touch Verification:** System cannot verify actual statue touching. Relies on user declaration after completing 7+7 sequence. This is a trust boundary — log all completions for audit trail.
- **User Declaration:** After 7+7 completion, prompt user to confirm they touched the statue. This declaration is non-binding but logged for accountability.
- **Next Window Calculation:** When blocking outside-window requests, calculate and return the next allowed blessing window time.
- **Session Atomicity:** Ensure mantras count cannot be incremented if session already marked complete.

---

## Related

- [synchronized-incense-insertion.md](./synchronized-incense-insertion.md) — complementary ritual timing rules
- [hierarchical-prostration-sequence.md](./hierarchical-prostration-sequence.md) — prostration ordering constraints
