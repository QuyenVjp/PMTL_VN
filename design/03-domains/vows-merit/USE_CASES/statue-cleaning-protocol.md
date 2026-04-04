# Giao thức Vệ sinh Tôn tượng — Statue Cleaning Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Tượng Bồ Tát đã an vị không được tùy tiện chạm vào. Vệ sinh tượng phải có quy định vật lý (ban ngày) và Kinh văn (niệm Tâm Kinh liên tục trong quá trình lau).

---

## Owner module

`vows-merit` — AltarManagementService / StatueCleaningGatekeeper

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User click [Vệ sinh Bàn thờ/Tôn tượng] vào ban đêm | ❌ BLOCKED - "Chỉ được vệ sinh vào ban ngày" |
| User click vào ban ngày (6 AM - 6 PM) | ✅ Allow proceed |
| During cleaning session | ✅ Auto-display Heart Sutra text |
| Require: Niệm ≥ 1 lần Tâm Kinh | ✅ Cannot complete without |
| Cleaning checklist | ✅ Khăn ẩm MƯỜI, Khăn mới (không dùng cũ) |

---

## FE Behavior

```
[Lau dọn Bàn thờ/Tôn tượng] button

If time in [18:00, 06:00]:
  ❌ DISABLED
  Tooltip: "Chỉ được phép vệ sinh vào ban ngày"

If time in [06:00, 18:00]:
  ✅ ENABLED
  Click → Open cleaning modal:

  [ ] Đã chuẩn bị khăn ẩm (không dùng cũ)
  [ ] Đã chuẩn bị khăn mới

  [Bắt đầu vệ sinh] → Display Tâm Kinh

  During cleaning:
  "Vui lòng niệm Tâm Kinh 1 lần trong lúc lau"

  [Hoàn thành] (disabled until 1x Tâm Kinh logged)
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.cleaning_started_daytime` | Vệ sinh ban ngày |
| `altar.cleaning_blocked_nighttime` | Attempt vệ sinh ban đêm |
| `altar.cleaning_completed` | Hoàn thành + Tâm Kinh logged |

---

## Notes

Daytime-only. Forces Tâm Kinh recitation during cleaning to maintain spiritual focus.