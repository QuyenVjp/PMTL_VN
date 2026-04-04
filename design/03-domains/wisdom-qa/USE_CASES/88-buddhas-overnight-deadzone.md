# Đóng băng "Lễ Phật Đại Sám Hối Văn" Xuyên Đêm — 88 Buddhas Overnight Deadzone

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Lễ Phật Đại Sám Hối Văn là kinh văn kích hoạt nghiệp chướng rất mạnh. Nếu niệm xuyên đêm, sức mạnh của nó sẽ kích hoạt các nghiệp chướng không thể kiểm soát. **CẤM TUYỆT ĐỐI niệm từ 22:00 (10 PM) đến 05:00 (5 AM)** để tránh việc này.

---

## Owner module

`wisdom-qa` — DailyRecitationService / OvernightDeadzoneGatekeeper

---

## Trigger

User attempts to log/start **Ceremony of Great Repentance (Lễ Phật Đại Sám Hối Văn)** during deadzone hours.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Current time in [22:00, 05:00) | ❌ DISABLE Lễ Phật button |
| Current time outside deadzone | ✅ ENABLE button |
| User attempts API log during deadzone | ❌ Server rejects with 400 |

---

## FE Behavior

```
Daily Recitation E-Reader

Recitation list:
- Mahaprajna Sutra (大悲咒) — [Start] ✅
- Heart Sutra (心经) — [Start] ✅
- Ceremony of Great Repentance (礼佛大忏悔) — [Start] 🔒 DISABLED

Tooltip (on locked button):
"⏰ 22:00 ~ 05:00 禁止念诵
 (Deadzone: Cannot recite during this time)"

At 05:01 AM: Button re-enables automatically
```

---

## Write Path Validation

```
POST /api/wisdom-qa/recitations/log

1. Load payload (recitationType, timestamp)
2. If recitationType === "CEREMONY_GREAT_REPENTANCE":
   a. Get user's local timezone
   b. Convert timestamp to local time
   c. Extract hour from local time
   d. If hour in [22, 05):
      → return 400 {
          error: "overnight_deadzone_blocked",
          message: "Lễ Phật cấm niệm từ 22:00-05:00"
        }
   e. Else: Proceed with logging
```

---

## Audit

| Action | Trigger |
|---|---|
| `88_buddhas.attempt_during_deadzone` | User tries during 22:00-05:00 |
| `88_buddhas.logged_outside_deadzone` | Successfully logged |

---

## Notes

Global time guard protecting against uncontrolled karma activation during vulnerable nighttime hours.