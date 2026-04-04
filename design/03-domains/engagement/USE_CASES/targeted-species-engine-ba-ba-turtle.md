# Gắn Thẻ Mục Tiêu cho Sinh Vật Đặc Thù — Targeted Species Engine (Ba ba / Turtle)

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Phóng sinh các loài vật khác nhau mang ý nghĩa tập trung khác nhau. Ba ba (Softshell turtles) hoặc Rùa có năng lượng chuyên biệt dùng để **kéo dài tuổi thọ** hoặc **vượt qua đại kiếp nạn** (như Quan 369, Phạm Thái Tuế, Bệnh Nan Y).

---

## Owner module

`engagement` — LifeLiberationService / SpeciesTargetingEngine

---

## Trigger

User creates Life Liberation event and selects species = `SOFTSHELL_TURTLE` or `TURTLE`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Species = SOFTSHELL_TURTLE | ✅ Auto-tag with "Cầu Thọ / Giải Hạn" |
| Intention = "Cầu Thọ" | ✅ Recommend Infinite Life Buddha mantra |
| Intention = "Giải Hạn" | ✅ Recommend Disaster Removal mantra |
| Auto-suggest add to Daily Recitation | ✅ Offer immediate sync |

---

## FE Behavior

```
Life Liberation Form

[Species selection]
Choose: ... | SOFTSHELL_TURTLE | ...

After selecting SOFTSHELL_TURTLE:

💡 Recommendation appears:

Ba ba (Rùa mềm) có năng lượng chuyên biệt.
Bạn muốn:
  ◉ Cầu Thọ (kéo dài tuổi thọ)
  ○ Giải Hạn (vượt qua kiếp nạn)

---

If "Cầu Thọ" selected:

✨ Gợi ý niệm kinh:
  "Vui lòng thêm bài Vô Lượng Thọ
   Quyết Định Quang Minh Vương Đà La Ni
   vào Thời khóa hàng ngày để cộng hưởng"

  [Thêm ngay] | [Thêm sau]

---

If "Giải Hạn" selected:

✨ Gợi ý niệm kinh:
  "Vui lòng thêm Tiêu Tai Cát Tường
   Thần Chú vào Thời khóa hàng ngày
   để tăng cường giải hạn"

  [Thêm ngay] | [Thêm sau]
```

---

## Input Contract

```typescript
interface TargetedSpeciesInput {
  userId: string;
  species: "SOFTSHELL_TURTLE" | "TURTLE" | ...;
  intention: "CẦU_THỌ" | "GIẢI_HẠN" | ...;
  addDailyRecitation?: boolean;
}
```

---

## Auto-Recommendations

| Species | Intention | Recommended Mantra |
|---|---|---|
| Ba ba / Turtle | Cầu Thọ | Infinite Life Buddha Dharani |
| Ba ba / Turtle | Giải Hạn | Disaster Removal Mantra |

---

## Audit

| Action | Trigger |
|---|---|
| `liberation.species_turtle_detected` | Selected turtle species |
| `liberation.intention_tagged` | Tagged with Cầu Thọ or Giải Hạn |
| `liberation.mantra_recommended` | Auto-recommend matching mantra |
| `liberation.mantra_added_to_daily` | User accepted daily recitation sync |

---

## Notes

Intelligent species targeting ensures prayer intention and recitation practice are aligned for maximum spiritual efficacy.