# Ngoại lệ Mở khóa Thời gian cho Kinh Âm — Midnight Override for Pre-filled LH

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Mặc định cấm niệm Heart Sutra và Rebirth Mantra sau 22:00. Ngoại lệ: Nếu tờ NNN đã có người nhận xác định (offeredTo != null), được phép kéo dài đến 00:00 (midnight).

---

## Owner module

`wisdom-qa` — TimeGuardService / MidnightOverrideEngine

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Default block time: 22:00 | ✅ Heartsutra/Rebirth disabled |
| Request includes LittleHouse_ID | ✅ Query DB |
| LH.offeredTo != null | ✅ Extend block time to 23:59 |
| LH.offeredTo = null | ❌ Keep block time 22:00 |
| Time >= 00:00 | ❌ Block all recitations |

---

## Write Path Validation

```
POST /api/wisdom-qa/recitations/log

1. Load recitationType, timestamp, LH_ID
2. Check current time
3. If time >= 22:00:
   a. If NO LH_ID or LH_ID.offeredTo = null:
      → Block (standard 22:00 gate)
   b. If LH_ID.offeredTo != null:
      → Allow until 23:59:59
   c. If time >= 00:00:
      → Block regardless
```

---

## Audit

| Action | Trigger |
|---|---|
| `timeblock.override_detected` | Pre-filled LH detected |
| `timeblock.extended_to_midnight` | Block time extended |
| `recitation.logged_within_override` | Recitation allowed via override |

---

## Override Logic

```typescript
function getAllowedRecitationTime(
  lhId: string | null,
  offeredTo: string | null,
  currentHour: number
): { allowed: boolean; cutoffDescription: string } {
  if (currentHour < 22) return { allowed: true, cutoffDescription: '22:00' }
  if (currentHour >= 22 && currentHour < 24) {
    if (lhId && offeredTo) {
      // Named LH: extend to midnight
      return { allowed: true, cutoffDescription: '23:59:59' }
    }
    return { allowed: false, cutoffDescription: '22:00 (tờ chưa có tên)' }
  }
  // 00:00+: absolute block
  return { allowed: false, cutoffDescription: 'Khóa tuyệt đối từ 00:00' }
}
```

---

## FE Behavior

```
22:30 PM — Tờ NNN ĐÃ có tên người nhận:

  Tờ NNN: [Nguyễn Văn A]  ✅ Đã ghi tên
  🟢 MỞ KHÓA ĐẾN 23:59:59

  Counter enabled. Curfew mở rộng vì tờ có tên.
  ⏰ Cutoff: 23:59:59

─────────────────────────────────────────────

22:30 PM — Tờ NNN CHƯA có tên:

  Tờ NNN: [TRỐNG]  ❌ Chưa ghi tên
  🔴 KHOÁ SAU 22:00

  Counter disabled.
  ⚠️ Tiêu chuẩn: 22:00
  Điền tên người nhận để mở khóa đến 23:59:59.
```

---

## Notes

Midnight override protects pre-committed energy alignment. LH dedication locks energy vector until midnight.
User must fill `offeredTo` field BEFORE 22:00 to benefit from the extension.