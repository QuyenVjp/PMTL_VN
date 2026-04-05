# Cấm Chậu Cây Có Đất Trên Bàn Thờ & Quy Tắc Trúc Phú Quý — Soil Ban & Bamboo Stem Rules
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Hard constraint + soft warning
> **Cập nhật:** 2026-04-06

## Purpose
Cúng hoa và trúc phú quý rất tốt, nhưng **CẤM TUYỆT ĐỐI** việc đặt các chậu cây cảnh có chứa đất (soil) lên bàn thờ. Đối với trúc phú quý, mỗi bình chỉ nên cắm 1, 2 hoặc 3 cành, không được cắm quá nhiều.

## Owner module
`altar-management` — flower & plant offering validation

## Actors
- User (setup altar)
- System (item validation)
- Zod schema enforcer

## Trigger
User thêm item vào Bàn Thờ Ảo hoặc bắt đầu Onboarding Bàn Thờ

## Business Rules

| Rule | Detail |
|------|--------|
| Soil Ban | HARD BLOCK: Chậu cây có đất = error 400 |
| Bamboo Stems | Soft warning: trúc > 3 cành = cảnh báo |
| Valid Offerings | Hoa cắt (không chậu), nước hoa, hương dứa OK |
| Vase Water | Nước trong bình hoa được thay mỗi ngày |

## Input Contract

```typescript
enum FlowerType {
  CUT_FLOWER = "CUT_FLOWER",     // hoa cắt
  POTTED_PLANT = "POTTED_PLANT", // chậu cây
  LUCKY_BAMBOO = "LUCKY_BAMBOO", // trúc phú quý
  LOTUS = "LOTUS",               // sen
}

interface AltarOfferingItemDto {
  itemType: "FLOWER" | "PLANT" | "WATER" | "INCENSE" | "LIGHT";
  flowerType?: FlowerType;
  hasSoil?: boolean;  // only for POTTED_PLANT
  quantity?: number;  // for LUCKY_BAMBOO
}

interface PlantValidationResponseDto {
  isValid: boolean;
  errorMessage?: string;  // nếu hard-block
  warningMessage?: string;  // nếu soft-warning
}
```

## Write Path

```
POST /altar-management/validate-offering
  Input: AltarOfferingItemDto

  1. If itemType == FLOWER && flowerType == POTTED_PLANT && hasSoil == true:
     → throw 400 "Cấm đặt chậu cây có đất lên bàn thờ Phật!"

  2. If itemType == FLOWER && flowerType == LUCKY_BAMBOO && quantity > 3:
     → return 200 with warning: "Mỗi bình chỉ nên cắm 1, 2 hoặc tối đa 3 cành Trúc Phú Quý, không cắm quá nhiều!"

  3. If valid: return 200 { isValid: true }

POST /altar-management/altar-item/add
  → Validate first using above
  → If hard-block: reject
  → If warning: accept but display warning modal
```

## FE Behavior

```
[Thêm Hoa Vào Bàn Thờ]
  ↓
[Dropdown]: Loại hoa?
  - Hoa cắt ✓
  - Chậu cây ← user chọn
  - Trúc Phú Quý

  ↓ Chọn "Chậu cây" ↓

[Chậu cây có chứa đất không?]
  - Có (user chọn)
  ↓
[❌ LỖI]
┌────────────────────────────────┐
│ CẤM ĐẶT CHẬU CÂY CÓ ĐẤT LÊN   │
│ BÀN THỜ PHẬT!                  │
│                                │
│ Lựa chọn thay thế:             │
│ - Cắt hoa & cắm vào bình nước  │
│ - Chỉ dùng hoa tươi không chậu │
│                                │
│ [Hủy] [Hiểu rồi]              │
└────────────────────────────────┘

---

[Thêm Trúc Phú Quý]
  ↓
[Cắm bao nhiêu cành?]
  Input: 5 (user nhập)
  ↓
[⚠️ CẢNH BÁO]
┌────────────────────────────────┐
│ Mỗi bình chỉ nên cắm 1, 2 hoặc │
│ tối đa 3 cành Trúc Phú Quý,    │
│ không cắm quá nhiều!           │
│                                │
│ Bạn nhập: 5 cành              │
│                                │
│ [Đồng ý & Tiếp Tục] [Sửa lại] │
└────────────────────────────────┘
```

## Schema Notes

```prisma
model AltarOfferingItem {
  id          String   @id @default(cuid())
  altarId     String
  itemType    String   // FLOWER, PLANT, WATER, INCENSE, LIGHT
  flowerType  String?  // CUT_FLOWER, POTTED_PLANT, LUCKY_BAMBOO
  hasSoil     Boolean? @default(false)
  quantity    Int?
  validatedAt DateTime @default(now())
}
```

## Audit
Log mỗi lần item được add hoặc reject

## Error Codes

| Code | Message |
|------|---------|
| SOIL_PLANT_BANNED | Cấm đặt chậu cây có đất lên bàn thờ Phật! |
| BAMBOO_STEM_WARNING | Mỗi bình chỉ nên cắm 1, 2 hoặc 3 cành. |

## Related
- `altar-management/fruit-plate-mathematical-integrity.md` — fruit offering rules
- `altar-management/water-source-validation.md` — water validation
