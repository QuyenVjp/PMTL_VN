# Tách Biệt Tên Pháp Lý và Tên Tâm Linh — Dual Name Spiritual/Legal Separation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hướng dẫn Thăng Văn Đổi Tên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Sau khi làm Đơn Thăng Văn Đổi Tên thành công, tên mới được ghi nhận ở Thiên giới và Địa phủ. **TUYỆT ĐỐI KHÔNG CẦN** thay đổi tên trên giấy tờ tùy thân nhân gian (CCCD, Hộ chiếu, GPLX). Hệ thống tách 2 field riêng biệt để phản ánh điều này:

- `legalName` — tên pháp lý dùng cho vận chuyển/ecommerce
- `spiritualName` — tên tâm linh dùng cho Ngôi Nhà Nhỏ, Đơn từ, PDF

---

## Owner module

`identity` — User Profile
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — cập nhật tên trong hồ sơ tâm linh
- `system` — auto-fill tên đúng trường hợp sử dụng, hiển thị tooltip cảnh báo

---

## Business Rules

| Trường | Dùng ở đâu | Cấm dùng ở đâu |
|---|---|---|
| `legalName` | Ecommerce shipping address, hóa đơn | Ngôi Nhà Nhỏ PDF, Đơn từ |
| `spiritualName` | Ngôi Nhà Nhỏ, Đơn từ tâm linh, DailyPractice | Ecommerce shipping |

**Quan trọng:** Nếu user chưa có `spiritualName`, fallback về `legalName`. Không được để trống trên Ngôi Nhà Nhỏ.

---

## Input Contract

```
UpdateSpiritualNameDto {
  spiritualName: string    // min 1 ký tự, max 100
}

UpdateLegalNameDto {
  legalName: string        // min 1 ký tự, max 100
}
```

---

## Write Path

```
PATCH /api/identity/profile/spiritual-name
────────────────────────────────────────────
Body: { spiritualName: string }

1. Validate spiritualName non-empty, max 100 chars.
2. Update User.spiritualName.
3. Audit: identity.spiritual-name.updated
4. Return { spiritualName }

PATCH /api/identity/profile/legal-name
────────────────────────────────────────────
Body: { legalName: string }

1. Validate legalName non-empty, max 100 chars.
2. Update User.legalName.
3. Audit: identity.legal-name.updated
4. Return { legalName }
```

---

## FE Behavior

### Màn hình Profile Settings

```
Hồ Sơ Cá Nhân
─────────────────────────────────────────────
Tên Pháp Lý (dùng khi giao hàng)
[Nguyễn Văn An                              ]
ℹ️  Dùng cho đơn hàng sách/Pháp bảo gửi về nhà.

Tên Tâm Linh (dùng trên Ngôi Nhà Nhỏ & Đơn từ)
[Nguyễn Tâm An                              ]
ℹ️  Tên được dùng sau khi làm Thăng Văn Đổi Tên.
─────────────────────────────────────────────
```

### Tooltip bắt buộc khi user chỉnh `spiritualName`

```
┌──────────────────────────────────────────────────────────┐
│  ℹ️  Lưu ý quan trọng                                   │
│                                                          │
│  Thăng Văn Đổi Tên chỉ áp dụng trong thế giới         │
│  Tâm Linh — ghi nhận ở Thiên giới và Địa phủ.         │
│                                                          │
│  Bạn KHÔNG CẦN và KHÔNG NÊN đi đổi lại:               │
│    • Căn cước công dân / CCCD                          │
│    • Hộ chiếu / Passport                               │
│    • Giấy phép lái xe                                  │
│    • Bất kỳ giấy tờ nhân gian nào khác                │
└──────────────────────────────────────────────────────────┘
```

### Auto-fill logic trong LittleHouse PDF generator

```typescript
function resolveChantingName(user: User): string {
  return user.spiritualName ?? user.legalName
}
```

---

## Schema Notes

```prisma
model User {
  // ... existing fields ...
  legalName      String    // tên pháp lý — bắt buộc khi đăng ký
  spiritualName  String?   // tên tâm linh — nullable, điền sau khi đổi tên
}
```

Migration: `ALTER TABLE "User" ADD COLUMN "spiritualName" TEXT;`

Dữ liệu cũ: nếu chỉ có 1 trường `name` hiện tại, copy sang `legalName`.

---

## Audit

| Action | Trigger |
|---|---|
| `identity.spiritual-name.updated` | User cập nhật tên tâm linh |
| `identity.legal-name.updated` | User cập nhật tên pháp lý |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `spiritualName` rỗng hoặc > 100 ký tự | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- `spiritualName` nullable — không ép buộc khi đăng ký. Nhắc nhở user điền sau khi có.
- PDF generator phải dùng `resolveChantingName()` không phải trực tiếp `user.legalName`.
- Shipping/ecommerce module phải luôn dùng `legalName` — không được dùng `spiritualName`.

---

## Related

- [NAME-CHANGE-RETROACTIVE.md](../REFERENCES/NAME-CHANGE-RETROACTIVE.md) — Quy tắc tên đã đổi >1 năm
- [MULTIPLE-ALIAS-ARRAY.md](../REFERENCES/MULTIPLE-ALIAS-ARRAY.md) — Nhiều tên cũ trên đơn
- [FORM-30DAY-PREREQUISITE.md](../REFERENCES/FORM-30DAY-PREREQUISITE.md) — Điều kiện tiên quyết làm đơn
