# Bộ lọc Không gian Dưới Bàn Thờ — Under-Altar Storage Filter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Không gian bên dưới bàn thờ Phật không được để trống rỗng nhưng cũng tuyệt đối không được nhét đồ đạc tạp nham. Chỉ được phép lưu trữ Kinh sách Phật giáo và các Pháp khí.

---

## Owner module

`vows-merit` — AltarProfileService / UnderAltarValidator

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Create AltarProfile | ✅ Show validation node |
| Checkbox: "Không gian dưới bàn thờ sạch" | ✅ Require check |
| User doesn't check | ❌ Block altar creation |
| Profile created with validation | ✅ ALLOWED |

---

## Validation Checklist

```
[ ] Không gian bên dưới bàn thờ của tôi
    KHÔNG chứa các vật dụng sinh hoạt.
    Chỉ dùng để cất giữ Kinh sách và
    Pháp cụ (nến, hương, lễ bàn...).

[Quay lại]  [Tạo Bàn Thờ] (disabled)
```

---

## Schema Notes

```prisma
model AltarProfile {
  id            String @id @default(cuid())
  userId        String @unique

  underAltarPure Boolean @default(false)  // Validation flag
  validatedAt    DateTime?

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Validation not acknowledged | under_altar_validation_failed | 400 |

---

## Notes

Validation gate prevents altar setup with improper storage below shrine.