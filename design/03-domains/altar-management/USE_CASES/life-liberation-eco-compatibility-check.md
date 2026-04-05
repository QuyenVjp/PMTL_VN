# Kiểm Tra Tương Thích Sinh Cảnh Phóng Sinh — Life Liberation Eco-Compatibility Check

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

Validate that animals being released (phóng sinh / life liberation) are placed in habitats compatible with their species needs. Prevents ecological harm and honors the spiritual intent of liberation by ensuring released creatures survive and thrive.

## Owner Module

`altar-management`

## Actors

- **Practitioner**: Initiates phóng sinh ceremony, specifies creature type and target location
- **Eco Validator Service**: Checks species-habitat compatibility and pollution/fishing zone status
- **Audit Logger**: Records validation result and any warnings

## Trigger

User submits phóng sinh order with:
- `creatureType` (e.g., `freshwater_fish`, `saltwater_fish`, `bird`, `insect`)
- `releaseLocation` (geographic coordinates or named location)
- `quantity`

## Business Rules

| Rule ID | Vietnamese | English | Severity |
|---------|-----------|---------|----------|
| ECO_001 | Cá nước ngọt → Địa điểm nước ngọt | Freshwater fish → Freshwater location | BLOCK |
| ECO_002 | Cá mặn → Địa điểm mặn | Saltwater fish → Saltwater location | BLOCK |
| ECO_003 | Không được phóng sinh ở sông/hồ bị ô nhiễm hóa chất | Cannot release in chemically polluted waterway | BLOCK |
| ECO_004 | Không được phóng sinh ở khu vực đánh cá thương mại | Cannot release in active commercial fishing zone | BLOCK |
| ECO_005 | Kiểm tra danh sách xanh địa phương | Check local green-zone registry | INFO |

## Input Contract (TypeScript DTOs)

```typescript
interface PhongSinhEcoRequest {
  creatureType: 'freshwater_fish' | 'saltwater_fish' | 'bird' | 'insect';
  releaseLocation: {
    lat: number;
    lng: number;
    label?: string; // e.g., "Tây Hồ, Hà Nội"
  };
  quantity: number;
  practitionerNotes?: string;
}

interface EcoValidationResult {
  isValid: boolean;
  blocks: ValidationError[];
  warnings: ValidationWarning[];
  approvedAt?: Date;
  ecoZoneInfo?: {
    waterType: 'freshwater' | 'saltwater' | 'mixed' | 'unknown';
    pollutionLevel: 'low' | 'medium' | 'high';
    commercialFishingActive: boolean;
    localGreenZone?: boolean;
  };
}

interface ValidationError {
  code: string;
  message_vi: string;
  message_en: string;
  field: string;
}

interface ValidationWarning {
  code: string;
  message_vi: string;
  message_en: string;
  severity: 'low' | 'medium';
}
```

## Write Path (Pseudocode API)

```
POST /altar-management/phong-sinh/validate-location

1. Extract creatureType, releaseLocation from request
2. Geocode releaseLocation → waterType, pollutionData, fishingZoneStatus
3. Initialize blocks = [], warnings = []

4. IF creatureType = 'freshwater_fish' AND waterType ≠ 'freshwater'
   → blocks.push(ECO_001: "CẤM KỴ: Loài cá nước ngọt không sống được ở nước mặn")

5. IF creatureType = 'saltwater_fish' AND waterType ≠ 'saltwater'
   → blocks.push(ECO_002: "CẤM KỴ: Loài cá mặn không sống được ở nước ngọt")

6. IF pollutionLevel = 'high'
   → blocks.push(ECO_003: "CẤM KỴ: Địa điểm này bị ô nhiễm hóa chất, cá sẽ chết")

7. IF commercialFishingActive = true
   → blocks.push(ECO_004: "CẤM KỴ: Khu vực này đang đánh cá thương mại, vong linh sẽ bị bắt lại")

8. IF localGreenZone = true
   → warnings.push(ECO_005: "Địa điểm này được công nhân rộng. Sẽ có sự chứng minh từ cộng đồng")

9. RETURN EcoValidationResult {
     isValid: (blocks.length = 0),
     blocks,
     warnings,
     ecoZoneInfo: { waterType, pollutionLevel, commercialFishingActive, localGreenZone }
   }

10. IF isValid = true
    → Log audit: "phong_sinh_location_approved"
    → Return 200 with approvedAt timestamp

11. IF isValid = false
    → Return 400 with error detail
    → Show UI: ❌ + "CẤM KỴ: Sinh cảnh không phù hợp, cá sẽ chết."
    → Offer button: [Xin Sám Hối Sinh Thái] (request forgiveness prayer)
```

## FE Behavior (ASCII Wireframe)

```
┌─────────────────────────────────────────────┐
│ PHÓNG SINH - Chọn Địa Điểm Phát Hành        │
├─────────────────────────────────────────────┤
│                                             │
│  Loài: [Dropdown: Cá nước ngọt ▼]          │
│  Địa điểm: [Map selector / Address input]  │
│  Số lượng: [Input: 100]                    │
│                                             │
│  [Kiểm tra tương thích] (validate)         │
│                                             │
├─────────────────────────────────────────────┤
│ VALIDATION RESULT:                          │
│                                             │
│ ❌ CẤM KỴ: Sinh cảnh không phù hợp          │
│                                             │
│ · Cá nước ngọt không sống ở nước mặn        │
│ · Khu vực đánh cá thương mại hoạt động      │
│                                             │
│ ⚠️  Địa điểm được công nhân rộng            │
│                                             │
│ [Chọn Địa Điểm Khác] [Xin Sám Hối ...]    │
│                                             │
└─────────────────────────────────────────────┘

AFTER VALIDATION SUCCESS:

┌─────────────────────────────────────────────┐
│ ✅ Địa điểm phù hợp!                        │
│                                             │
│ Nước ngọt, Tây Hộ, Hà Nội                   │
│ Không ô nhiễm, không khu đánh cá            │
│                                             │
│ Bạn sẵn sàng phóng sinh 100 cá ngựa?        │
│                                             │
│  [Quay Lại] [Tiếp tục]                     │
└─────────────────────────────────────────────┘

AFTER VALIDATION FAILURE:

┌─────────────────────────────────────────────┐
│ [Xin Sám Hối Sinh Thái]                     │
│                                             │
│ Tôi thành tâm xin lỗi cho các sinh linh đã  │
│ chọn địa điểm không phù hợp. Xin Phật Bồ    │
│ Tát không tính tội cho tôi...                │
│                                             │
│  [Ghi Lời Cầu Nguyện] [Gửi Tạ Ơn]          │
│                                             │
└─────────────────────────────────────────────┘
```

## Schema Notes (Prisma Snippet)

```prisma
model PhongSinhOrder {
  id            String    @id @default(cuid())
  practitionerId String
  creatureType  String    // freshwater_fish, saltwater_fish, bird, insect

  releaseLocation ReleaseLocation?

  quantity      Int

  // Validation
  ecoValidationPassed Boolean @default(false)
  ecoValidationResult Json? // EcoValidationResult envelope
  validatedAt   DateTime?

  // Audit trail
  isEcoCompliant Boolean @default(false)
  ecoAuditNote  String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([practitionerId])
  @@index([ecoValidationPassed])
}

model ReleaseLocation {
  id            String    @id @default(cuid())
  lat           Float
  lng           Float
  label         String?

  // Cached eco data
  waterType     String?   // freshwater, saltwater, mixed, unknown
  pollutionLevel String?  // low, medium, high
  commercialFishingActive Boolean @default(false)
  localGreenZone Boolean @default(false)

  lastGeocodedAt DateTime?

  phongSinhOrders PhongSinhOrder[]

  @@unique([lat, lng])
  @@index([waterType])
}

model EcoAudit {
  id            String    @id @default(cuid())
  phongSinhOrderId String
  action        String    // phong_sinh_location_approved, phong_sinh_location_rejected
  validationResult Json
  createdAt     DateTime  @default(now())
}
```

## Audit

All validation attempts must be logged:
- ✅ **phong_sinh_location_approved**: Valid location, eco-compatible
- ❌ **phong_sinh_location_rejected**: Invalid location, blocked
- ⚠️  **phong_sinh_location_warning**: Valid but with caution flags

```sql
INSERT INTO eco_audit (phong_sinh_order_id, action, validation_result, created_at)
VALUES ($1, $2, $3, NOW())
```

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `ECO_MISMATCH_WATER` | 400 | Cá nước ngọt không sống ở nước mặn | Freshwater fish cannot survive in saltwater |
| `ECO_POLLUTION_HIGH` | 400 | Địa điểm ô nhiễm, sinh linh sẽ chết | Location is polluted, creatures will die |
| `ECO_FISHING_ZONE` | 400 | Khu vực đánh cá thương mại, vong linh sẽ bị bắt | Commercial fishing zone, creatures will be recaught |
| `ECO_LOCATION_UNKNOWN` | 400 | Không xác định được loại nước ở địa điểm | Cannot determine water type at location |
| `ECO_PERMISSION_DENIED` | 403 | Bạn không có quyền phóng sinh ở địa điểm này | Permission denied to release at this location |

## Notes for AI/Codegen

1. **Geocoding Service**: Integrate with Google Maps API or local water-quality database (e.g., Vietnam Ministry of Environment) to determine water type, pollution level.
2. **Commercial Fishing Zone Registry**: Maintain up-to-date list of active fishing zones (update quarterly from authorities).
3. **Prayer Recovery Path**: If eco validation fails, offer `[Xin Sám Hối Sinh Thái]` button to guide practitioner through forgiveness prayer flow — this does NOT bypass validation, only provides spiritual support.
4. **Audit Immutability**: All eco validation results must be immutable; corrections require new audit entry, never mutation.
5. **Species Expansion**: Design extensible for new creature types (amphibians, reptiles, etc.) — add to enum, not hardcoded.

## Related

- `altar-management/USE_CASES/multi-deity-oil-lamp-allocation.md` (spiritual intent validation)
- `engagement/USE_CASES/[TBD-ceremony-flow]` (full phóng sinh ceremony workflow)
- `design/04-schemas/PhongSinhOrder.prisma` (data model)
- Eco data source: Vietnam Ministry of Natural Resources & Environment API
