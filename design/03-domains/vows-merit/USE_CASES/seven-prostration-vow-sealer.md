# Đóng Dấu 7 Lạy Khi Phát Nguyện — 7-Prostration Vow Sealer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 47, 48)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Theo trình tự phát nguyện chuẩn xác, sau khi khấn xưng danh các vị Bồ Tát, trình bày nguyện lực, và nói ra lời cầu xin, người tu **BẮT BUỘC phải kết thúc bằng 7 lạy** để đóng dấu và tạ ơn. Thiếu 7 lạy, nguyện lực chưa được phong ấn chính thức.

---

## Owner module

`vows-merit` — VowService / ProstrationSealGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — tạo Đại Nguyện mới trên App
- `system` — hiển thị prompt 7 lạy trước bước Confirm cuối cùng

---

## Trigger

Bước cuối cùng khi user nhấn `[Xác Nhận Phát Nguyện]` để tạo một `Vow` mới.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User tạo Vow mới và đến bước Confirm | ✅ Hiển thị prompt 7 lạy bắt buộc |
| User chưa tick checkbox xác nhận 7 lạy | ❌ Nút `[Hoàn Tất Phát Nguyện]` disabled |
| User tick checkbox | ✅ Enable nút [Hoàn Tất Phát Nguyện] |
| User confirm | ✅ Vow được tạo, audit log ghi nhận |

**Quan trọng:** Hệ thống **không thể verify** user đã thực sự lạy — đây là **advisory với forced acknowledgment**, không phải hard block. Niềm tin thuộc về người tu.

---

## Input Contract

```typescript
interface ConfirmVowWithSealDto {
  vowId:                   string
  sevenProstrationsSealed: boolean  // BẮT BUỘC = true để Confirm
}
```

---

## Write Path

```
POST /api/vows-merit/vows/:vowId/confirm-with-seal
─────────────────────────────────────────────────
Body: { sevenProstrationsSealed: boolean }

1. Validate sevenProstrationsSealed === true
   → If false: return 400 { error: 'seven_prostrations_required',
                            message: 'Vui lòng thực hiện 7 lạy trước bàn thờ/Tâm Hương trước khi hoàn tất phát nguyện.' }
2. Update Vow: status = 'ACTIVE', sealedAt = now(), sealType = 'SEVEN_PROSTRATIONS'
3. Audit: vow.sealed.seven-prostrations
4. Return { vowId, status: 'ACTIVE', sealedAt }
```

---

## FE Behavior

### Màn hình Bước Cuối — Phong Ấn Đại Nguyện

```
┌──────────────────────────────────────────────────────────┐
│ 🙏  Phong Ấn Đại Nguyện — Bước Cuối                     │
│──────────────────────────────────────────────────────────│
│ Trước khi hệ thống chính thức ghi nhận Đại Nguyện này,  │
│ bạn cần thực hiện một bước vật lý quan trọng:           │
│                                                          │
│ ════════════════════════════════════════════════════════ │
│                                                          │
│   Đặt điện thoại xuống.                                 │
│                                                          │
│   Đứng trước bàn thờ (hoặc mở Tâm Hương).              │
│                                                          │
│   Thực hiện đúng 7 LẠY (đập đầu xuống đất).            │
│                                                          │
│   Đây là hành động đóng dấu và tạ ơn chư Bồ Tát        │
│   đã chứng kiến lời nguyện của bạn.                    │
│                                                          │
│ ════════════════════════════════════════════════════════ │
│                                                          │
│ [ ] Tôi đã thực hiện 7 lạy trước bàn thờ / Tâm Hương  │
│                                                          │
│          [Hoàn Tất Phát Nguyện]                         │
│        ← disabled cho đến khi tick checkbox              │
└──────────────────────────────────────────────────────────┘
```

**Tone:** Trang trọng, không vội vàng. Button `[Hoàn Tất Phát Nguyện]` chỉ enable sau khi user tick — không có cách bypass trên UI.

---

## Schema Notes

```prisma
model Vow {
  // ... existing fields ...
  sealedAt   DateTime?
  sealType   String?    // "SEVEN_PROSTRATIONS" | null (legacy unseal)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `vow.seal-prompt.shown` | Màn hình 7 lạy hiển thị |
| `vow.sealed.seven-prostrations` | User xác nhận + Vow được tạo |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `sevenProstrationsSealed = false` | `seven_prostrations_required` | 400 |
| `vowId` không tồn tại / không thuộc userId | `vow_not_found` | 404 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Không thể verify hành động vật lý — đây là **self-declaration gate**, không phải biometric check.
- `sealType = 'SEVEN_PROSTRATIONS'` được ghi nhận để phân biệt Vow được phong ấn đúng cách với legacy Vow tạo trước tính năng này.
- Áp dụng cho **mọi loại Vow**: ăn chay, phóng sinh cam kết, vow NNN — không phân biệt loại.
- Bước 7 lạy xảy ra ở FE step cuối cùng TRƯỚC khi POST API — không phải sau.

---

## Related

- [manage-vow-flexibility-and-fulfillment-location.md](./manage-vow-flexibility-and-fulfillment-location.md) — Vow flexibility & emergency escape
- [vow-escalation-engine.md](./vow-escalation-engine.md) — Vow escalation logic
- [vow-six-bodhisattva-sequence.md](./vow-six-bodhisattva-sequence.md) — Bodhisattva invocation trước recitation
