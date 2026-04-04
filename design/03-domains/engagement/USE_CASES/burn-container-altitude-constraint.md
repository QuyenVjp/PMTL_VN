# Ràng buộc Cao độ của Đĩa Đốt NNN — Burn Container Altitude Constraint

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Đĩa sứ dùng để đốt NNN là vật trung chuyển năng lượng và tiền tệ cho cõi âm. Bắt buộc phải đặt trên một chiếc ghế nhỏ hoặc tấm gỗ cách ly mặt đất. **TUYỆT ĐỐI KHÔNG** đặt trên Bàn Thờ Phật hoặc trực tiếp xuống sàn nhà.

---

## Owner module

`engagement` / `altar-management` — BurnContainerService / AltitudeValidator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Start burn session | ✅ Show altitude checklist |
| Checklist: Container on elevated surface | ✅ Require acknowledgement |
| Not on altar, not on ground | ✅ Correct positioning |
| User confirms | ✅ Allow proceed to ignition |
| Missing acknowledgement | ❌ Block ignition button |

---

## FE Behavior

```
Before ignition:

[ ] Tôi cam kết đã đặt đĩa sứ trên
    một chiếc ghế nhỏ/tấm gỗ cách ly
    mặt đất.
    TUYỆT ĐỐI KHÔNG đặt đĩa lên bàn
    thờ Phật và KHÔNG đặt trực tiếp
    dưới sàn nhà.

[Quay lại]  [Châm lửa] (disabled)
```

---

## Audit

| Action | Trigger |
|---|---|
| `nnn.altitude_validation_shown` | Burn session initiated |
| `nnn.altitude_confirmed` | User checked acknowledgement |
| `nnn.burn_ignited` | Ignition allowed |

---

## Notes

Altitude constraint maintains energetic separation between Dharma realm (altar) and mundane realm (ground).