# Giao thức Chấm "Xây Móng Nhà" — Bottom-Up Dotting Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Quá trình chấm đỏ lên NNN tượng trưng xây dựng ngôi nhà năng lượng ở cõi âm. Nguyên tắc tốt nhất là chấm từ dưới lên trên, tượng trưng xây nền móng vững chắc.

---

## Owner module

`engagement` — LittleHouseService / DottingSequenceAnimator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User logs recitations daily | ✅ Virtual dots fill bottom-up |
| Animation shows bottom rows first | ✅ Progressive filling upward |
| Tooltip explains philosophy | ✅ Display: "Xây nền móng từ dưới lên" |

---

## Animation Behavior

```
Virtual NNN Tracker:

Day 1-10 (1 dot/day):
[●] Bottom row starting to build

Day 11-20:
[●●] Bottom row + 2nd row begins

Day 30-50:
[●●●] Almost complete foundation

Day 80-100+:
[●●●●●] Full pyramid complete
         (Nền móng vững chắc)
```

---

## Tooltip Message

```
"Hệ thống ưu tiên chấm từ dưới lên trên
để xây dựng nền móng năng lượng vững
chắc cho Ngôi Nhà Nhỏ."
```

---

## Notes

Bottom-up animation reinforces foundational energy principle for little house construction.