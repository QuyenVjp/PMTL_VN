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

## Notes

Midnight override protects pre-committed energy alignment. LH dedication locks energy vector until midnight.