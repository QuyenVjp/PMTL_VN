# Thuật toán Hình Học Chấm Đỏ 80% — Red Dot Geometry Verifier

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi chấm lên NNN, không được gạch chéo, không được đánh dấu tick, không được chấm lem ra ngoài viền. **Chỉ được chấm một chấm chiếm khoảng 80% vòng tròn.**

---

## Owner module

`engagement` — LittleHouseService / RedDotGeometryValidator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User views NNN dotting guide | ✅ Show 2 comparison images |
| Image 1: Correct (80% dot) | ✅ Green checkmark |
| Image 2: Wrong (100% filled / crossed) | ✅ Red X mark |
| Before logging first dot | ✅ Require acknowledgement checkbox |

---

## Acknowledgement

```
[ ] Tôi cam kết dùng bút lông đỏ chấm
    vừa phải (80%), tuyệt đối không tô
    kín mít vòng tròn và không gạch chéo.
```

---

## Visual Guide

```
CORRECT (80% fill):     WRONG (100% fill):
   ┌─────────────┐        ┌─────────────┐
   │ ●●●●●●●●●● │        │ ●●●●●●●●●● │
   │ ●●●    ●●● │        │ ●●●●●●●●●● │
   │ ●● (80%) ●●│        │ ●●●●●●●●●● │
   └─────────────┘        └─────────────┘
   ✅ CORRECT           ❌ WRONG
```

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Geometry not acknowledged | red_dot_geometry_not_acknowledged | 400 |

---

## Notes

Aesthetic and energetic integrity of NNN depends on precise 80% filling geometry.