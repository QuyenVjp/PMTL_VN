# Cấm kỵ Nước Khoáng Đóng Chai Nhựa — Bottled Mineral Water Ban

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Mặc dù có thể dùng nước suối, nước khoáng tinh khiết để cúng Bồ Tát, nhưng **TUYỆT ĐỐI CẤM** việc đặt nguyên một chai nước khoáng bằng nhựa lên bàn thờ thay cho cốc cúng. Đây là hành động bất kính.

---

## Owner module

`vows-merit` — AltarOfferingService / BottledWaterValidator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User adds Nước Cúng to altar | ✅ Show water type selector |
| Select Chai nhựa (Bottled) | ❌ BLOCKED - option greyed out |
| Select Cốc sứ / Thủy tinh | ✅ ALLOWED |
| User tries via API | ❌ Server rejects 400 |
| Show checkbox confirmation | ✅ Require explicit acknowledgement |

---

## FE Behavior

```
Altar Offering Type: Nước Cúng

Select container type:
  ○ Cốc sứ trắng
  ○ Cốc thủy tinh
  ○ Chai nhựa 🔒 DISABLED
    (Tooltip: "TUYỆT ĐỐI CẤM. Bất kính Bồ Tát")

After selecting valid container:

[ ] Tôi đã rót nước tinh khiết ra chiếc
    cốc sứ/thủy tinh dành riêng cho Bồ Tát.
    TUYỆT ĐỐI KHÔNG đặt nguyên chai nhựa
    lên bàn thờ.
```

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Bottled water selected | bottled_water_forbidden | 400 |
| Checkbox not acknowledged | water_offering_not_acknowledged | 400 |

---

## Notes

Hard blocker on API level. Prevents disrespectful altar setup.