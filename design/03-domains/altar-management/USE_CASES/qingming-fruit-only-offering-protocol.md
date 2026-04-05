# Cúng Tế Tết Thanh Minh Dùng Trái Cây, Không Nấu Món Mặn — Qingming Fruit-Only Offering Protocol
> **Nguồn:** Huyền Nghệ Vấn Đáp 03022012 — Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Hard constraint enforcement
> **Cập nhật:** 2026-04-06

## Purpose
Tết Thanh Minh (Qingming Festival) là ngày cúng tế tổ tiên. Nấu món ăn mặn để cúng **là không có tác dụng gì**. Cách tốt nhất là **dâng trái cây tươi**. Những thứ đã dâng cho vong linh rồi, **TUYỆT ĐỐI KHÔNG ĐƯỢC ăn** — sẽ gặp xui xẻo.

## Owner module
`altar-management` — ancestral offering validation

## Actors
- User (người cúng tế tổ tiên)
- Family (thành viên gia đình chuẩn bị cúng)
- System (food type validator)

## Trigger
User/family chuẩn bị cho lễ Thanh Minh (Qingming Festival)

## Business Rules

| Rule | Detail |
|------|--------|
| Food Offering Ban | Nấu món ăn mặn để cúng = **không hiệu quả tâm linh** |
| Fruit Only | **Tốt nhất dâng trái cây tươi** (không nấu) |
| Sacred Goods Non-Consumption | Những thứ đã dâng cho vong linh, gia chủ **KHÔNG ĐƯỢC ăn** |
| Energy Penalty | Ăn những thứ đã cúng → gặp xui xẻo, rắc rối |
| Post-Offering Disposal | Sau khi cúng xong, thực phẩm cần được xử lý tôn kính (không ăn) |

## Input Contract

```typescript
enum OfferingFoodType {
  FRUIT_FRESH = "FRUIT_FRESH",        // trái cây tươi (recommended)
  FRUIT_DRIED = "FRUIT_DRIED",        // trái cây khô (acceptable)
  COOKED_FOOD = "COOKED_FOOD",        // món ăn nấu chín (NOT recommended)
  VEGETARIAN_DISH = "VEGETARIAN_DISH", // món chay (acceptable)
  MEAT_DISH = "MEAT_DISH",            // món mặn/mặn có thịt (BANNED)
}

interface QingmingOfferingDto {
  ancestorName: string;
  offeringFoodType: OfferingFoodType;
  intendToConsumeAfter: boolean;  // planning to eat after offering?
}

interface OfferingValidationResponseDto {
  isRecommended: boolean;
  isAllowed: boolean;
  warningMessage?: string;
  recommendation: string;
}
```

## Write Path

```
POST /altar-management/qingming/validate-offering
  Input: QingmingOfferingDto

  1. If offeringFoodType == COOKED_FOOD || MEAT_DISH:
     → return { isRecommended: false, recommendation: "Nấu món ăn mặn không có tác dụng. Dâng trái cây tươi thay vì đó!" }

  2. If offeringFoodType in [FRUIT_FRESH, FRUIT_DRIED, VEGETARIAN_DISH]:
     → isRecommended = true

  3. If intendToConsumeAfter == true:
     → return warning: "⚠️ Những thứ đã dâng cho vong linh, không được ăn sau khi cúng! Sẽ gặp xui xẻo!"

  4. Return: OfferingValidationResponseDto

POST /altar-management/qingming/confirm-offering
  Input: { offeringId, wasConsumed: boolean }
  → If wasConsumed == true: log warning audit "Family consumed sacred offering"
```

## FE Behavior

```
[Chuẩn Bị Lễ Thanh Minh - Cúng Tế Tổ Tiên]

[Bạn định cúng những gì?]
  - Trái cây tươi ✓ (Recommended)
  - Trái cây khô (OK)
  - Món chay (OK)
  - Món mặn nấu chín ← user chọn
  - Thịt

  ↓ Chọn "Món mặn nấu chín" ↓

[⚠️ CẢNH BÁO]
┌─────────────────────────────────┐
│ Nấu món ăn mặn để cúng là KHÔNG │
│ CÓ TÁC DỤNG GÌ!                 │
│                                 │
│ 💡 Cách tốt nhất: dâng TRÁ CÂY  │
│ tươi thay vì đó!                │
│                                 │
│ [Chuyển sang Trái Cây] [Tiếp Tục] │
└─────────────────────────────────┘

---

(After cúng xong)

[Cúng Xong - Thao Tác Tiếp Theo]
┌─────────────────────────────────┐
│ ⚠️ CẢNH BÁO QUAN TRỌNG!         │
│                                 │
│ Những thứ đã dâng cho vong linh,│
│ gia chủ KHÔNG ĐƯỢC ĂN!          │
│                                 │
│ Nếu ăn → sẽ gặp xui xẻo, rắc  │
│ rối (như ăn quần áo người chết) │
│                                 │
│ Vui lòng xử lý những thứ này    │
│ tôn kính (không ăn).            │
│                                 │
│ [Tôi Hiểu] [Cần Sự Trợ Giúp]   │
└─────────────────────────────────┘
```

## Schema Notes

```prisma
model QingmingOffering {
  id                String   @id @default(cuid())
  userId            String
  ancestorName      String
  offeringFoodType  String   // FRUIT_FRESH, COOKED_FOOD, etc.
  isRecommended     Boolean
  consumedAfter     Boolean @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model OfferingAuditLog {
  id              String   @id @default(cuid())
  offeringId      String
  action          String   // "CREATED", "WARNED", "CONSUMED_ILLEGALLY"
  timestamp       DateTime @default(now())
}
```

## Audit
Mỗi lần:
- Offering created → log
- Warning displayed → log
- If consumed after → log as "CONSUMED_ILLEGALLY" + escalate

## Error Codes

| Code | Message |
|------|---------|
| COOKED_FOOD_INEFFECTIVE | Nấu món ăn mặn không có tác dụng. Dâng trái cây tươi thay vì đó! |
| SACRED_FOOD_CONSUMPTION | Những thứ đã dâng cho vong linh không được ăn. Sẽ gặp xui xẻo! |

## Notes
- Trái cây tươi là "viện dẫn tâm linh" — giúp vong linh tiếp nhận
- Không ăn đồ đã cúng là tôn trọng ranh giới giữa linh giới và nhân gian
- Energy leakage: khi ăn thứ đã dâng → năng lượng vong linh attach vào bạn

## Related
- `altar-management/fruit-plate-mathematical-integrity.md` — fruit arrangement (odd-layer, single-type)
- `altar-management/self-blessing-activation-sequence.md` — ritual preparation
- `vows-merit/prayer-request-specificity-anti-greed-validator.md` — offering intention purity
