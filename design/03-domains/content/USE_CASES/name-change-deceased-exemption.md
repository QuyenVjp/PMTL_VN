# Cấm Làm Đơn Đổi Tên Cho Người Quá Cố — Name Change Deceased Exemption

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đơn Thăng Văn Đổi Tên chỉ dành cho **người đang sống** muốn dùng tên mới để niệm kinh.
Người đã khuất **không cần và không được** làm đơn này — chỉ cần dùng tên mà họ được gọi nhiều nhất khi còn sống để ghi lên Tiểu Phương Tử.

API phải reject ngay nếu target của đơn là người đã quá cố.

---

## Owner module

`content` — SpiritualForms / NameChangeApplication
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — cố tạo đơn đổi tên cho người đã mất
- `system` — detect target type, reject với hướng dẫn rõ ràng

---

## Trigger

`POST /api/content/spiritual-forms/name-change` với `targetPersonType = "DECEASED"`.

---

## Business Rule

| Target | Được phép | Hành động |
|---|---|---|
| `LIVING` (người đang sống) | ✅ YES | Proceed bình thường |
| `DECEASED` (người đã khuất) | ❌ NO | Reject 400 + hướng dẫn thay thế |

**Hướng dẫn thay thế khi DECEASED:**
> *"Người quá cố không cần làm đơn đổi tên. Khi viết Tiểu Phương Tử cho người đã khuất, hãy dùng tên mà họ được gọi nhiều nhất lúc còn sống."*

---

## Input Contract

```
NameChangeApplicationDto {
  applicantName:      string    // Tên người đang sống làm đơn (người dùng hệ thống)
  targetPersonType:   "LIVING" | "DECEASED"
  targetOldName:      string    // Tên cũ muốn đổi
  targetNewName:      string    // Tên mới muốn dùng
  yearsUsedNewName:   number    // Số năm đã dùng tên mới (>= 1 năm mới hợp lệ)
}
```

---

## Write Path

```
POST /api/content/spiritual-forms/name-change
──────────────────────────────────────────────
1. Parse và validate Zod schema.
2. Kiểm tra targetPersonType:
   if (targetPersonType === "DECEASED") {
     throw BadRequestException({
       error:       "name_change_deceased_not_allowed",
       message:     "Người quá cố không cần làm đơn đổi tên.",
       guidance:    "Khi viết Tiểu Phương Tử cho người đã khuất, hãy dùng tên mà họ được gọi nhiều nhất lúc còn sống.",
       httpStatus:  400
     })
   }
3. Validate yearsUsedNewName >= 1:
   - Nếu < 1 → throw 400 {
       error: "new_name_not_used_long_enough",
       message: "Tên mới phải đã dùng ít nhất 1 năm mới được làm đơn đổi tên."
     }
4. Proceed tạo NameChangeApplication record.
5. Audit: spiritual-form.name-change.created.
```

---

## FE Behavior

### Dropdown `targetPersonType`

```
┌─────────────────────────────────────────────────┐
│  Đơn này dành cho:                             │
│                                                 │
│  ○ Bản thân tôi                                │
│  ○ Người thân đang sống                        │
│  ○ Người đã khuất  ← khi chọn mục này:         │
└─────────────────────────────────────────────────┘
```

Khi user chọn **"Người đã khuất"**:

```
┌─────────────────────────────────────────────────────┐
│  ℹ️  Không cần làm đơn cho người đã khuất          │
│                                                     │
│  Người quá cố không cần Đơn Đổi Tên.              │
│                                                     │
│  Khi viết Tiểu Phương Tử, hãy dùng tên mà         │
│  họ được gọi nhiều nhất lúc còn sống.             │
│                                                     │
│  Ví dụ: Nếu người mất tên thật là "Nguyễn Văn     │
│  An" nhưng hay được gọi là "Anh Hai", thì ghi     │
│  "Anh Hai" hoặc "Nguyễn Văn An" đều được.         │
│                                                     │
│  [Tìm hiểu cách viết Tiểu Phương Tử →]            │
└─────────────────────────────────────────────────────┘
```

- Tooltip/modal hiện **ngay khi chọn**, không cần submit.
- Form fields bị **disabled** khi `targetPersonType = DECEASED` — không cho nhập.
- Link [Tìm hiểu cách viết Tiểu Phương Tử] dẫn đến guide tương ứng.

### Validation `yearsUsedNewName`

- Input field kiểu number, min=0.
- Khi nhập < 1: hiện inline error ngay: *"Cần dùng tên mới ít nhất 1 năm trước khi làm đơn."*

---

## Schema Notes

```prisma
model NameChangeApplication {
  id                  String    @id @default(cuid())
  userId              String
  targetPersonType    PersonLifeStatus
  targetOldName       String
  targetNewName       String
  yearsUsedNewName    Int
  status              ApplicationStatus  @default(PENDING_BURN)
  burnedAt            DateTime?
  activationEndsAt    DateTime?          // burnedAt + 100 days

  createdAt           DateTime  @default(now())
  user                User      @relation(fields: [userId], references: [id])
}

enum PersonLifeStatus {
  LIVING
  DECEASED
}

enum ApplicationStatus {
  PENDING_BURN    // chưa đốt
  BURNED          // đã đốt, đang trong 100-day activation
  ACTIVATED       // 100 ngày hoàn thành
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `spiritual-form.name-change.deceased-rejected` | API reject do targetPersonType=DECEASED |
| `spiritual-form.name-change.created` | Đơn được tạo thành công |
| `spiritual-form.name-change.burned` | User xác nhận đã đốt đơn |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `targetPersonType = DECEASED` | `name_change_deceased_not_allowed` | 400 |
| `yearsUsedNewName < 1` | `new_name_not_used_long_enough` | 400 |
| `targetNewName` empty | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Related

- [spiritual-applications.md](./spiritual-applications.md) — Catalog đơn từ và burn rules (100-day activation)
- [convincing-family-form-incense-timer.md](./convincing-family-form-incense-timer.md) — Đơn Khuyến Đạo timer
- [joss-paper-clash-warning.md](../../wisdom-qa/USE_CASES/joss-paper-clash-warning.md) — Quy tắc người quá cố
