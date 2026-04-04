# Bộ Lọc AI Linh Thú & Ảnh Người — Auspicious Beast AI Filter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Bàn thờ phải tuyệt đối không có hình rồng, linh thú hung dữ, hay ảnh người phàm (kể cả ảnh cưới, ảnh gia đình). Những vật phẩm này thu hút linh tính/ngạ quỷ tìm nơi trú ngụ. Hệ thống scan từ khóa trong mô tả user khi tải ảnh bàn thờ.

---

## Owner module

`altar-management` — AltarService / BeautyFilterEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — upload ảnh bàn thờ
- `system` — scan từ khóa cấm, block nếu phát hiện

---

## Trigger

Khi user upload ảnh bàn thờ và điền thông tin/tag mô tả các vật phẩm.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User upload ảnh bàn thờ | ✅ Hiển thị tagging interface |
| User mô tả/tag vật phẩm | ✅ Scan forbidden keywords |
| Phát hiện: rồng/hổ/linh thú/ảnh người | ❌ Block photo approval |
| Cảnh báo hiển thị | ✅ Giải thích lý do + hướng dẫn |
| User loại bỏ vật cấm + tải lại | ✅ Re-scan, approve nếu sạch |

---

## Forbidden Keywords

```typescript
const FORBIDDEN_ALTAR_ITEMS = [
  // Linh thú hung dữ
  'rồng', 'hổ', 'tỳ hưu', 'cóc thiềm thừ',
  'dragon', 'tiger',
  // Ảnh người phàm
  'ảnh gia đình', 'ảnh cưới', 'ảnh người',
  'ảnh người lạ', 'ảnh thần tài',
  'family photo', 'wedding photo'
]
```

---

## Input Contract

```typescript
interface AltarPhotoSubmitDto {
  photoUrl: string
  itemDescriptions: string[]  // User mô tả từng vật phẩm
}
```

---

## Write Path

```
POST /api/altar-management/altar-photos/submit
1. Scan itemDescriptions[] for FORBIDDEN_ALTAR_ITEMS keywords
2. If match found:
   → Return 400 { code: 'forbidden_altar_item_detected', items: [...] }
3. If clean:
   → Create AltarPhoto record, status = PENDING_REVIEW
4. Optional Phase 2: AI image analysis (Google Vision / AWS Rekognition)
```

---

## FE Behavior

```
🚫 CẢNH BÁO: PHẬT CỤ CẤM KỴ

Bàn thờ của bạn chứa hình ảnh cấm:
❌ Hình rồng / Linh thú / Con người lạ

LUẬT PHÁP MÔN:
────────────────────────────────────
Tuyệt đối không đặt hình rồng, hổ,
linh thú, hoặc ảnh người phàm gần
bàn thờ.

Lý do: Những hình ảnh này thu hút
linh tính/ngạ quỷ tìm nơi trú ngụ,
gây rối loạn trường khí.
════════════════════════════════════

Hãy loại bỏ vật phẩm cấm và tải lại.

[Quay Lại Tải Ảnh]
```

---

## Schema Notes

```prisma
model AltarPhoto {
  id               String   @id @default(cuid())
  userId           String
  photoUrl         String
  itemDescriptions String[] // Array of user-provided tags
  status           String   @default("PENDING_REVIEW")
  // PENDING_REVIEW | APPROVED | REJECTED_FORBIDDEN_ITEM
  rejectionReason  String?
  submittedAt      DateTime @default(now())
  // Migration: CREATE TABLE "AltarPhoto" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.photo_submitted` | Upload initiated |
| `altar.forbidden_keyword_detected` | Scan hit |
| `altar.photo_rejected` | Block with warning |
| `altar.photo_approved` | Clean scan, approved |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Từ khóa cấm trong mô tả | `forbidden_altar_item_detected` | 400 |

---

## Notes for AI/codegen

- Phase 1: keyword-based scan (đủ nhanh, zero cost).
- Phase 2+: tích hợp AI vision API để detect trong ảnh thực — không cần text description.

---

## Related

- [altar-profile-spatial-validation.md](../../vows-merit/USE_CASES/altar-profile-spatial-validation.md) — spatial layout rules
- [hardware-uuid-prohibition.md](./hardware-uuid-prohibition.md) — phật cụ assignment rules
