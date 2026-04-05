# Định Hướng Đốt Cháy Theo Mức Độ Khẩn Cấp — Little House Combustion Direction Urgency Router

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

When a practitioner is ready to burn a Little House (NNN), the system determines the correct ignition direction based on the urgency priority of the request. Emergency cases require lighting from the upper-right corner (where "Kính Tặng"/Offer To is written); normal cases light from bottom up. The system guides the user and requires acknowledgment of the correct direction before proceeding.

## Owner module

`engagement` — Little House (NNN) combustion workflow and ceremonial direction routing

## Actors

- **Practitioner (user):** Initiates Little House burning ceremony
- **Engagement API:** Determines correct direction based on priority level
- **Frontend:** Displays direction guidance and captures acknowledgment
- **Audit log:** Records direction selection and confirmation timestamp

## Trigger

1. User navigates to "Prepare to Burn" screen for a validated Little House
2. User confirms priority level (EMERGENCY or NORMAL)
3. System calculates required ignition direction
4. Frontend displays detailed ASCII/visual guidance with confirmation prompt
5. User acknowledges understanding before burning

## Business Rules

| Rule | Condition | Direction | Status |
|------|-----------|-----------|--------|
| **Emergency Priority** | Priority = EMERGENCY | Light from upper-right corner (Kính Tặng area) | ✅ |
| **Normal Priority** | Priority = NORMAL | Light from bottom up | ✅ |
| **Missing Priority** | Priority field null or undefined | Default to NORMAL + warning banner | ⚠️ |
| **Acknowledgment Required** | User ready to burn | Must confirm direction before proceeding | ✅ |
| **Direction Validation** | Practitioner selects direction | System validates against priority-determined direction | ✅ |
| **Mismatch Handling** | User selects wrong direction | Show warning, ask for re-confirmation | ⚠️ |

## Input Contract (TypeScript DTOs)

```typescript
// Frontend → API (Get Direction)
interface LittleHouseBurnDirectionRequest {
  littleHouseId: string;
  priority: 'EMERGENCY' | 'NORMAL';
  practitionerId: string;
}

// API Response (Direction Guidance)
interface BurnDirectionResponse {
  littleHouseId: string;
  priority: 'EMERGENCY' | 'NORMAL';
  direction: {
    location: 'UPPER_RIGHT' | 'BOTTOM_UP';
    description_vi: string; // Vietnamese guidance
    description_en: string; // English fallback
    visualAscii: string; // ASCII art showing flame/arrow
  };
  warningMessage?: string; // If priority was inferred/defaulted
}

// Frontend → API (Acknowledge Direction)
interface BurnDirectionAcknowledgmentRequest {
  littleHouseId: string;
  acknowledgedDirection: 'UPPER_RIGHT' | 'BOTTOM_UP';
  practitionerId: string;
  acknowledgedAt: ISO8601Timestamp;
}

// API Response (Acknowledgment Confirmation)
interface BurnDirectionAcknowledgmentResponse {
  littleHouseId: string;
  acknowledgmentId: string;
  status: 'ACKNOWLEDGED' | 'MISMATCH_WARNING';
  message: string;
  canProceedToBurn: boolean;
  nextStep: 'PROCEED_TO_BURN' | 'REQUEST_RECONFIRMATION';
}
```

## Write Path (pseudocode API)

```pseudocode
GET /engagement/little-house/:littleHouseId/burn-direction

1. Fetch Little House record:
   - Validate littleHouseId exists and belongs to practitionerId
   - Retrieve priority level from request or stored metadata

2. Infer direction from priority:
   if (priority == 'EMERGENCY') {
     direction = 'UPPER_RIGHT'
     description_vi = 'Khẩn cấp: Đốt cháy từ góc trên bên phải (nơi viết "Kính Tặng")!'
   } else {
     direction = 'BOTTOM_UP'
     description_vi = 'Bình thường: Đốt cháy từ dưới lên trên.'
   }

3. Generate visual ASCII guidance:
   - Create flame emoji or arrow showing correct direction
   - Include coordinate hints if needed

4. Check for priority mismatch or inference:
   if (priority was inferred or defaulted) {
     warningMessage = 'Mức độ khẩn cấp không rõ. Hệ thống sử dụng: NORMAL. Xác nhận trước khi đốt.'
   }

5. Return BurnDirectionResponse with full guidance

---

POST /engagement/little-house/:littleHouseId/burn-direction/acknowledge

1. Validate acknowledgment:
   - littleHouseId must exist and belong to practitionerId
   - acknowledgedDirection must be 'UPPER_RIGHT' or 'BOTTOM_UP'

2. Fetch expected direction:
   - Re-calculate direction based on priority (idempotency)

3. Compare acknowledgment with expected:
   if (acknowledgedDirection != expectedDirection) {
     status = 'MISMATCH_WARNING'
     message = 'Hướng bạn chọn không khớp với mức độ khẩn cấp. Xin vui lòng xác nhận lại.'
     canProceedToBurn = false
     nextStep = 'REQUEST_RECONFIRMATION'
   } else {
     status = 'ACKNOWLEDGED'
     message = 'Hướng đốt cháy được xác nhận. Bạn có thể tiến hành.'
     canProceedToBurn = true
     nextStep = 'PROCEED_TO_BURN'
   }

4. Persist acknowledgment:
   - Create BurnDirectionAcknowledgment record
   - Log event: BURN_DIRECTION_ACKNOWLEDGED
   - Store acknowledgedDirection, acknowledgedAt, practitionerId

5. Return response with canProceedToBurn flag

6. (Optional) If canProceedToBurn = true, unlock "Begin Burning" button on frontend
```

## FE Behavior (ASCII wireframe)

```
┌──────────────────────────────────────────────┐
│ Get Direction for Burning                    │
├──────────────────────────────────────────────┤
│                                              │
│ Little House ID: lh_62a9e1b4c2              │
│ Priority: EMERGENCY                          │
│                                              │
│ ⚠️  HƯỚNG ĐỐT CHÁY:                          │
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │                                      │    │
│ │  Góc Trên Bên Phải (Kính Tặng)      │    │
│ │         ↗️  [FLAME]                  │    │
│ │                                      │    │
│ │ Đốt cháy từ góc trên bên phải!       │    │
│ │ (nơi viết "Kính Tặng")               │    │
│ │                                      │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ✓ Tôi đã hiểu hướng đốt cháy                │
│   [checkbox]                                 │
│                                              │
│ [Huỷ]  [Xác Nhận Hướng Đốt]                │
│                                              │
└──────────────────────────────────────────────┘

[After mismatch]

┌──────────────────────────────────────────────┐
│ ⚠️  Cảnh Báo: Hướng Không Khớp                │
├──────────────────────────────────────────────┤
│                                              │
│ Bạn chọn: Từ Dưới Lên Trên (BOTTOM_UP)      │
│ Yêu Cầu: Từ Góc Trên Bên Phải (UPPER_RIGHT)│
│                                              │
│ Mức độ khẩn cấp là EMERGENCY.                │
│ Vui lòng xác nhận lại hướng đốt cháy.       │
│                                              │
│ [Chọn Lại]  [Xác Nhận Lại]                  │
│                                              │
└──────────────────────────────────────────────┘

[Success]

┌──────────────────────────────────────────────┐
│ ✓ Hướng Đốt Cháy Đã Xác Nhận                │
├──────────────────────────────────────────────┤
│                                              │
│ Hướng: Từ Góc Trên Bên Phải (Kính Tặng)    │
│ Thời gian xác nhận: 2026-04-05 14:32:15     │
│                                              │
│ Bạn đã sẵn sàng đốt cháy Little House.       │
│                                              │
│ [Bắt Đầu Đốt Cháy]                          │
│                                              │
└──────────────────────────────────────────────┘
```

## Schema Notes (Prisma snippet)

```prisma
model BurnDirectionAcknowledgment {
  id                     String   @id @default(cuid())
  littleHouseRecordId    String
  littleHouseRecord      LittleHouseRecord @relation(fields: [littleHouseRecordId], references: [id], onDelete: Cascade)

  practitionerId         String
  practitioner           User     @relation(fields: [practitionerId], references: [id], onDelete: Cascade)

  priority               String   @db.Enum('EMERGENCY', 'NORMAL')
  expectedDirection      String   @db.Enum('UPPER_RIGHT', 'BOTTOM_UP')
  acknowledgedDirection  String   @db.Enum('UPPER_RIGHT', 'BOTTOM_UP')

  status                 String   @db.Enum('ACKNOWLEDGED', 'MISMATCH_WARNING', 'PENDING')
  directionMatches       Boolean  @default(false)

  acknowledgedAt         DateTime
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  @@unique([littleHouseRecordId])
  @@index([practitionerId])
  @@index([createdAt])
}

model LittleHouseRecord {
  // ... existing fields ...
  burnDirectionAcknowledgment BurnDirectionAcknowledgment?
  // ... other relations ...
}

model User {
  // ... existing fields ...
  burnDirectionAcknowledgments BurnDirectionAcknowledgment[]
  // ... other relations ...
}
```

## Audit

| Event | Logged Data | Sensitivity |
|-------|-------------|-------------|
| `BURN_DIRECTION_REQUESTED` | littleHouseId, priority, inferred, practitionerId | Internal |
| `BURN_DIRECTION_ACKNOWLEDGED` | littleHouseId, acknowledgedDirection, directionMatches, practitionerId, acknowledgedAt | Internal |
| `BURN_DIRECTION_MISMATCH` | littleHouseId, expectedDirection, acknowledgedDirection, practitionerId | Internal |
| `BURN_CEREMONY_STARTED` | littleHouseId, acknowledgedDirection, practitionerId | Internal |

## Errors

```typescript
// 400 Bad Request
{
  code: 'INVALID_PRIORITY',
  message: 'Priority must be EMERGENCY or NORMAL'
}

// 404 Not Found
{
  code: 'LITTLE_HOUSE_NOT_FOUND',
  message: 'Little House record not found or does not belong to practitioner'
}

// 409 Conflict
{
  code: 'DIRECTION_MISMATCH',
  message: 'Acknowledged direction does not match expected direction for this priority level',
  expectedDirection: 'UPPER_RIGHT',
  acknowledgedDirection: 'BOTTOM_UP'
}

// 422 Unprocessable Entity
{
  code: 'ACKNOWLEDGMENT_REQUIRED',
  message: 'Practitioner must acknowledge correct burn direction before proceeding',
  nextStep: 'REQUEST_RECONFIRMATION'
}

// 500 Internal Server Error
{
  code: 'DIRECTION_CALCULATION_ERROR',
  message: 'Unable to determine burn direction at this time'
}
```

## Notes for AI/codegen

- **Stateful flow:** Direction acknowledgment must be stored before allowing burn to proceed. This creates an audit trail and prevents accidental mis-burning.
- **Visual clarity:** ASCII art should clearly show flame direction (↗️ for upper-right, ⬆️ for bottom-up). Consider animated GIF or video for premium UX.
- **Localization:** Direction terms and guidance must be fully Vietnamese with diacritics. Provide fallback English.
- **Mismatch recovery:** If user selects wrong direction twice, consider offering "Call Support" option or allowing override with explicit written acknowledgment.
- **Real-time sync:** If burning happens in physical space, consider QR code or camera-based verification of actual flame direction (future enhancement).
- **Emergency flag:** Emergency priority should trigger visual/audio alerts on frontend and server-side audit heightening.

## Related

- `lh-physical-ink-color-segregation.md` — Validates Little House photo before reaching combustion stage
- `little-house-recitation-tracking.md` — Tracks post-burn recitation obligations
- `engagement-ceremony-workflow.md` — Broader ceremony orchestration
