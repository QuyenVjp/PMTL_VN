# Gương Chiếu Và Độ Cao Tượng — Anti-Mirror & Eye-Level Guard
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Dual enforcement (hard + AR)
> **Cập nhật:** 2026-04-06

## Purpose
Bàn thờ Phật có 2 tử huyệt không gian hay bị vi phạm:
1. Xung quanh bàn thờ **TUYỆT ĐỐI KHÔNG ĐƯỢC có bất kỳ tấm gương nào** phản chiếu
2. Tượng Bồ Tát không được đặt quá thấp — phải nằm ở góc độ mà khi người đứng sẽ phải hơi ngước mắt lên nhìn

## Owner module
`altar-management` — space feng-shui validation

## Actors
- User (altar setup)
- Mobile camera (AR height measurement)
- System (validation)

## Trigger
User hoàn thành Altar Onboarding hoặc upload ảnh bàn thờ thực tế

## Business Rules

| Rule | Detail |
|------|--------|
| No Mirrors | HARD: Không gương chiếu vào bàn thờ |
| Eye Level | Tượng phải ở trên tầm mắt khi đứng (hơi phải ngước lên) |
| Minimum Height | Tượng base phải ≥ 1m từ mặt đất (trung bình người cao) |
| If Too Low | Phải kê bằng hộp trang trọng |

## Input Contract

```typescript
interface AltarSpaceValidationDto {
  hasMirrorNearby?: boolean;
  statuHeightFromGround_cm: number;
  estimatedUserHeight_cm?: number;
}

interface MirrorDetectionResponseDto {
  mirrorDetected: boolean;
  errorMessage?: string;
}

interface HeightValidationResponseDto {
  isEyeLevelCorrect: boolean;
  suggestedHeight_cm?: number;
  recommendation?: string;
}

interface ARCameraHeightMeasureDto {
  cameraCalibration: {
    deviceHeight_cm: number;  // phone height when aiming at statue
    targetObjectHeight_cm: number;
  };
  calculatedStatueHeight: number;
}
```

## Write Path

```
POST /altar-management/validate-altar-space
  Input: AltarSpaceValidationDto

  1. Mirror check:
     If hasMirrorNearby == true:
       → throw 400 "Xung quanh bàn thờ KHÔNG CÓ GƯƠNG chiếu vào!"

  2. Height validation:
     If statuHeightFromGround < 100cm:
       → return warning: "Tượng quá thấp! Hãy chuẩn bị một chiếc hộp tinh tế, trang trọng để kê tượng cao lên trên tầm mắt!"
       → suggestion: "Khuyến cáo độ cao: ~120-150cm"

  3. If all valid: return 200 { isValid: true }

POST /altar-management/ar-measure-statue-height
  Input: ARCameraHeightMeasureDto
  → Use device accelerometer + camera angle to calculate height
  → Compare with 100cm threshold
  → Return validation result
```

## FE Behavior

```
[Onboarding Bàn Thờ - Checklist Không Gian]

☑ Tôi xác nhận KHÔNG CÓ GƯƠNG chiếu vào bàn thờ
   ↓
☐ Xác minh độ cao tượng Bồ Tát
   [Sử dụng Camera] [Nhập độ cao thủ công]

   ↓ Click [Sử dụng Camera] ↓

[AR Measurement Mode]
┌──────────────────────────────┐
│ 📱 Hướng camera lên tượng    │
│ Bồ Tát                       │
│                              │
│ [Tượng nằm trong khung]      │
│                              │
│ Độ cao ước tính: 95cm        │
│                              │
│ ⚠️ CẢNH BÁO: Tượng quá thấp! │
│                              │
│ Hãy chuẩn bị một chiếc hộp   │
│ tinh tế, trang trọng để kê   │
│ tượng cao lên trên tầm mắt!  │
│                              │
│ [Điều chỉnh & Đo Lại]       │
│ [Tôi đã hiểu]               │
└──────────────────────────────┘
```

## Schema Notes

```prisma
model AltarSpaceValidation {
  id                      String   @id @default(cuid())
  altarId                 String
  hasMirrorNearby         Boolean? @default(false)
  statuHeightFromGround   Int      // cm
  arMeasuredHeight        Int?     // cm (from camera)
  isValid                 Boolean
  validationDate          DateTime @default(now())
}
```

## Audit
Log mỗi lần space validation

## Error Codes

| Code | Message |
|------|---------|
| MIRROR_DETECTED | Xung quanh bàn thờ KHÔNG CÓ GƯƠNG chiếu vào! |
| STATUE_TOO_LOW | Tượng quá thấp! Cần kê lên trên tầm mắt. |

## Related
- `altar-management/hemispheric-altar-orientation-engine.md` — altar orientation
- `altar-management/confined-cabinet-setup.md` — cabinet space rules
