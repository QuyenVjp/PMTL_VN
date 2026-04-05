# Sắp Xếp Kinh Sách Trên Giường Đơn — Sutra Single-Bed Storage Alignment

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

Enforce proper placement of digital sutras (e-reader content) for single practitioners without a formal shrine. Only the HEAD of the bed is energetically aligned for sutra storage; the FOOT of the bed violates spiritual alignment and invites disrespect to the dharma.

## Owner Module

`content`

## Actors

- **Single Practitioner**: User with no household shrine, stores e-reader on bed
- **Storage Validator**: Confirms bed placement and cloth wrapping
- **Location Logger**: Records approved storage positions

## Trigger

User initiates first-time sutra digital storage setup, or moves sutra e-reader location. System prompts:
1. "Bạn sắp lưu trữ kinh sách kỹ thuật số. Nơi cất giữ phải ở ĐẦU giường, bọc bằng vải đỏ sạch."
2. Displays interactive bed diagram
3. Requires explicit checkbox acceptance

## Business Rules

| Rule ID | Vietnamese | English | Type |
|---------|-----------|---------|------|
| BED_001 | Kinh sách chỉ được đặt ở ĐẦU giường | Sutras only on HEAD of bed | MUST |
| BED_002 | Tuyệt đối không đặt ở chân giường/đuôi giường | Never at FOOT of bed | MUST |
| BED_003 | Kinh sách phải bọc bằng vải đỏ sạch | Must be wrapped in clean red cloth | MUST |
| BED_004 | Không được nằm lên trên kinh sách | Must not lie on top of sutra (no sleeping on it) | MUST |
| BED_005 | Nếu có thay đổi vị trí, phải xác nhận lại | If location changes, must re-confirm | INFO |

## Input Contract (TypeScript DTOs)

```typescript
interface SutraBedStorageRequest {
  practitionerId: string;
  e_readerId: string; // Device containing sutra content
  bedPosition: 'head' | 'foot' | 'side' | 'unknown';
  clothColor: string; // red, white, etc.
  clothIsClean: boolean;
  practitionerConfirms: boolean; // Checkbox: "Tôi cam kết..."
  confirmationText?: string; // Full checkbox text user must acknowledge
}

interface BedStorageValidation {
  isValid: boolean;
  position: 'head' | 'foot' | 'invalid';
  clothOk: boolean;
  practitionerAccepted: boolean;
  violations: StorageViolation[];
  approvedAt?: Date;
}

interface StorageViolation {
  code: string;
  message_vi: string;
  message_en: string;
  severity: 'error' | 'warning';
}
```

## Write Path (Pseudocode API)

```
POST /content/sutra-storage/validate-placement

1. Extract bedPosition, clothColor, clothIsClean, practitionerConfirms from request
2. Initialize violations = []

3. IF bedPosition = 'foot'
   → violations.push(BED_002: "Tuyệt đối không được đặt ở chân giường")
   → isValid = false

4. IF bedPosition = 'side' OR bedPosition = 'unknown'
   → violations.push(BED_001: "Kinh sách phải ở ĐẦU giường, rõ ràng")
   → isValid = false

5. IF clothColor ≠ 'red' OR clothIsClean = false
   → violations.push(BED_003: "Vải phải là đỏ sạch, không bụi, không rách")
   → isValid = false

6. IF practitionerConfirms = false
   → violations.push(CHECKBOX_MISSING: "Bạn chưa xác nhận cam kết")
   → isValid = false

7. IF bedPosition = 'head' AND clothColor = 'red' AND clothIsClean = true AND practitionerConfirms = true
   → isValid = true
   → approvedAt = NOW()

8. RETURN BedStorageValidation {
     isValid,
     position: bedPosition,
     clothOk: (clothColor = 'red' AND clothIsClean = true),
     practitionerAccepted: practitionerConfirms,
     violations,
     approvedAt
   }

9. IF isValid = true
   → Log: "bed_storage_approved_head_position"
   → Store approved location in UserProfile
   → Return 200

10. IF isValid = false
    → Return 400 with violations list
    → Show UI: ❌ violations with remediation steps
```

## FE Behavior (ASCII Wireframe)

```
INITIAL SETUP:

┌────────────────────────────────────────────────────┐
│ LƯỚI TRỮ KINH SÁCH TRÊN GIƯỜNG                      │
├────────────────────────────────────────────────────┤
│                                                    │
│  Bạn lưu trữ kinh sách kỹ thuật số mà không có    │
│  bàn thờ chính thức. Vị trí cất giữ rất quan       │
│  trọng với tâm thần và năng lượng.                 │
│                                                    │
│  ┌──────────────────────────────────┐             │
│  │        GIƯỜNG (Hình Minh Họa)     │             │
│  │                                  │             │
│  │ ┌────────────────┐                │             │
│  │ │  ĐẦU GIƯỜNG    │  ✅ VỊ TRÍ OK   │             │
│  │ │   (HEAD)       │                │             │
│  │ ├────────────────┤                │             │
│  │ │                │                │             │
│  │ │  THÂN GIƯỜNG   │  ⚠️  KHÔNG OK   │             │
│  │ │   (SIDE)       │                │             │
│  │ │                │                │             │
│  │ ├────────────────┤                │             │
│  │ │  CHÂN GIƯỜNG   │  ❌ TUYỆT ĐỐI    │             │
│  │ │   (FOOT)       │     KHÔNG!    │             │
│  │ └────────────────┘                │             │
│  └──────────────────────────────────┘             │
│                                                    │
│  Bạn sẽ đặt kinh sách ở:                           │
│  ⦿ Đầu giường (dùng vải đỏ sạch)                   │
│  ○ Chỗ khác                                        │
│                                                    │
│  Màu vải bọc:                                      │
│  ⦿ Đỏ (lựa chọn tiêu chuẩn)                        │
│  ○ Khác                                            │
│                                                    │
│  [x] Tôi đã bọc kinh sách bằng vải đỏ sạch.        │
│      Tôi cam kết vị trí cất giữ nằm ở khu vực     │
│      ĐẦU GIƯỜNG, tuyệt đối không đặt ở khu vực    │
│      đuôi giường/chân giường!                      │
│                                                    │
│  [Quay Lại] [Tiếp Tục]                            │
│                                                    │
└────────────────────────────────────────────────────┘


ERROR STATE:

┌────────────────────────────────────────────────────┐
│ ❌ VỊ TRÍ KHÔNG HỢP LỆ                              │
├────────────────────────────────────────────────────┤
│                                                    │
│ · Bạn chưa chọn vị trí đầu giường                   │
│ · Vải bọc không phải màu đỏ sạch                   │
│ · Bạn chưa xác nhận cam kết                        │
│                                                    │
│ Để cất giữ kinh sách đúng cách:                     │
│ 1. Bọc vải đỏ sạch (không dơ, không rách)         │
│ 2. Đặt ở ĐẦU giường                                │
│ 3. Đồng ý cam kết bằng cách tích hộp               │
│ 4. Không bao giờ nằm lên trên nó                   │
│                                                    │
│ [Sửa Lại Cài Đặt]                                  │
│                                                    │
└────────────────────────────────────────────────────┘


SUCCESS STATE:

┌────────────────────────────────────────────────────┐
│ ✅ CẬU ĐẶNG HỢP LỆ                                  │
├────────────────────────────────────────────────────┤
│                                                    │
│ Kinh sách của bạn được lưu trữ đúng cách:          │
│                                                    │
│ • Vị trí: Đầu giường                               │
│ • Bọc vải: Đỏ sạch                                 │
│ • Cam kết: Đã xác nhận                             │
│                                                    │
│ Hãy tôn trọng nơi cát giữ này và không bao giờ     │
│ nằm lên trên kinh sách hoặc di chuyển nó.          │
│                                                    │
│ [Đóng]                                             │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Schema Notes (Prisma Snippet)

```prisma
model UserProfile {
  id            String    @id @default(cuid())
  userId        String    @unique
  hasPersonalShrine Boolean @default(false)

  // Single-bed storage tracking
  sutraBedStorageApproved Boolean @default(false)
  sutraBedPosition        String?   // head, foot, side
  sutraClothColor         String?   // red, white, etc.
  sutraClothIsClean       Boolean?
  sutraStorageConfirmedAt DateTime?
  sutraDeviceId           String?   // e-reader ID

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([sutraBedStorageApproved])
}

model BedStorageAudit {
  id            String    @id @default(cuid())
  userId        String
  action        String    // bed_storage_approved_head_position, bed_storage_updated, bed_storage_violation_attempted
  bedPosition   String?
  clothColor    String?
  clothIsClean  Boolean?
  practitionerConsent Boolean
  validationResult Json?
  createdAt     DateTime  @default(now())

  @@index([userId, createdAt])
}
```

## Audit

All placement attempts and approvals are logged immutably:
- ✅ **bed_storage_approved_head_position**: Valid head-of-bed placement with clean red cloth
- ❌ **bed_storage_violation_attempted_foot**: User attempted to store at foot of bed
- ⚠️  **bed_storage_consent_missing**: User did not confirm checkbox
- 🔄 **bed_storage_updated**: Location or cloth changed, re-confirmation required

```sql
INSERT INTO bed_storage_audit (user_id, action, bed_position, cloth_color, cloth_is_clean, practitioner_consent, created_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW())
```

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `BED_FOOT_VIOLATION` | 400 | Tuyệt đối không được đặt ở chân giường | Cannot store at foot of bed |
| `BED_POSITION_UNKNOWN` | 400 | Phải xác định rõ vị trí là ĐẦU giường | Must explicitly choose HEAD of bed |
| `BED_CLOTH_INVALID` | 400 | Vải bọc phải là màu đỏ sạch | Cloth must be clean red cloth |
| `BED_CONSENT_MISSING` | 400 | Bạn chưa xác nhận cam kết | Must confirm the commitment checkbox |
| `BED_STORAGE_NOT_APPROVED` | 403 | Kinh sách không được phép lưu trữ ở vị trí này | Storage not approved at this location |

## Notes for AI/Codegen

1. **Checkbox is Mandatory**: The checkbox acceptance is not a simple UI gesture—it is a spiritual contract. Users must explicitly read and confirm the full Vietnamese text: "Tôi đã bọc kinh sách bằng vải đỏ sạch. Tôi cam kết vị trí cất giữ nằm ở khu vực ĐẦU GIƯỜNG, tuyệt đối không đặt ở khu vực đuôi giường/chân giường!"
2. **No Compromise on Position**: There is no "flexible" placement. Only HEAD of bed is acceptable. FOOT, SIDE, or other positions must be rejected with clear error messaging.
3. **Visual Bed Diagram**: Provide ASCII or interactive bed diagram showing HEAD (green ✅) and FOOT (red ❌) zones.
4. **Cloth Validation**: Accept only 'red' color explicitly. Other colors (white, gold, etc.) must be rejected even if user thinks they are "close enough."
5. **Re-confirmation Flow**: If user moves e-reader to different bed or room, re-run validation before approving new location.
6. **No Silent Overrides**: Never bypass this validation even if user says "just let me store it anyway." Show error and remediation steps.

## Related

- `content/USE_CASES/sutra-anti-pocket-underarm-guard.md` (prevents disrespectful carrying/pocketing)
- `design/04-schemas/UserProfile.prisma` (user profile storage)
- `engagement/USE_CASES/[TBD-first-time-practitioner-onboarding]` (single-practitioner setup flow)
