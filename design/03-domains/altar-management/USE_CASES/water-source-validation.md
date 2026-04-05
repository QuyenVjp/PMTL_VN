# Cảm Biến Nguồn Nước Đầu Vào — Water Source Validation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 901, 902)
> **Trạng thái:** Verified source — hard block enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nước dùng để cúng Bồ Tát bắt buộc phải là nước đã đun sôi (nóng hoặc lạnh đều được), nước khoáng, nước tinh khiết hoặc bất kỳ loại nước uống được nào không màu, không mùi. Tuyệt đối cấm dùng nước máy (tap water) hoặc nước chưa qua xử lý để cúng trực tiếp.

---

## Owner module

`altar-management` — AltarService / WaterSourceValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người chuẩn bị dâng nước
- `system` — validator kiểm tra loại nước

---

## Trigger

Khi user khai báo dâng nước (POST `/api/altar-management/water/register-offering`)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Water type = BOILED, MINERAL, PURIFIED, FILTERED | ✅ ALLOWED |
| Water type = TAP_WATER hoặc UNTREATED | ❌ HARD BLOCK 400 |
| User không chọn water type | ❌ HARD BLOCK 400 |

---

## Input Contract

```typescript
interface RegisterWaterOfferingDto {
  waterType: 'BOILED' | 'MINERAL' | 'PURIFIED' | 'FILTERED' | 'TAP_WATER' | 'UNTREATED'
  quantity: number  // ml
  timestamp: string // ISO date
}

interface WaterValidationResult {
  valid: boolean
  waterType: string
  error?: string
}
```

---

## Write Path

```
POST /api/altar-management/water/register-offering

1. Validate waterType against whitelist:
   const ALLOWED_WATER_TYPES = ['BOILED', 'MINERAL', 'PURIFIED', 'FILTERED']

2. If waterType NOT in whitelist:
   → throw 400 {
       error: 'water_source_forbidden',
       message: 'Lỗi nguồn nước: Cấm dâng nước máy chưa đun sôi. Vui lòng sử dụng nước tinh khiết hoặc nước đun sôi để nguội!'
     }

3. If valid:
   a. Create WaterOffering: { userId, waterType, quantity, offeredAt }
   b. Audit: altar.water.source_validated
   c. Return { success: true, waterType, quantity }
```

---

## FE Behavior

### Màn hình Chọn Loại Nước

```
┌────────────────────────────────────────────────────────┐
│ 💧 Chuẩn Bị Dâng Nước Đại Bi                           │
│────────────────────────────────────────────────────────│
│ Loại nước cúng Bồ Tát:                                 │
│                                                        │
│ ⭕ Nước đun sôi (nóng hoặc lạnh)                       │
│ ⭕ Nước khoáng                                          │
│ ⭕ Nước tinh khiết / lọc                                │
│ ⭕ Nước uống được khác                                  │
│                                                        │
│ ❌ CẤMI: Nước máy (tap water)                           │
│ ❌ CẤM: Nước chưa xử lý                                 │
│                                                        │
│            [Tiếp Tục]                                 │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model WaterOffering {
  id         String   @id @default(cuid())
  userId     String
  waterType  String   // BOILED | MINERAL | PURIFIED | FILTERED
  quantity   Int      // ml
  offeredAt  DateTime @default(now())

  @@index([userId, offeredAt])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.water.source_validated` | Nước được chấp nhận |
| `altar.water.source_rejected` | Nước bị từ chối (TAP_WATER) |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Water type = TAP_WATER | `water_source_forbidden` | 400 |
| Water type = UNTREATED | `water_source_forbidden` | 400 |
| Missing waterType | `water_type_required` | 400 |

---

## Notes for AI/codegen

- Whitelist là strict: chỉ 4 loại cho phép
- TAP_WATER luôn bị block — đây là hard gate, không advisory
- Lỗi phải hiển thị rõ lý do ("Cấm dâng nước máy") để user hiểu

---

## Related

- [sacred-cup-hardware-constraints.md](./sacred-cup-hardware-constraints.md) — Quy tắc ly cúng
- [no-direct-contact-protocol.md](./no-direct-contact-protocol.md) — Cấm chạm môi
