# Bảo Vệ Kinh Sách Khỏi Bất Kính — Sutra Anti-Pocket/Underarm Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

Prevent disrespectful storage and carrying of digital sutras (e-reader with open sutra content). System detects when the device is placed in pants pockets or under armpits—physically inappropriate positions that violate dharma respect. When violation is detected, trigger immediate audio alert with spiritual reminder.

## Owner Module

`content`

## Actors

- **Practitioner**: User carrying e-reader with active sutra content
- **Device Sensor System**: Monitors orientation, light levels, acceleration to detect pocketing/underarm placement
- **Alert Engine**: Plays audio reminder in Vietnamese
- **Audit Logger**: Records disrespectful placement attempts

## Trigger

While sutra content is active (open/displayed) on e-reader:
1. System continuously monitors device sensors (orientation, light, motion)
2. Detects sudden darkness + upward-downward motion pattern (signs of pocketing or tucking under arm)
3. Triggers immediate audio alert + visual notification

## Business Rules

| Rule ID | Vietnamese | English | Type |
|---------|-----------|---------|------|
| POCKET_001 | Kinh sách không được đặt trong túi quần | Sutra cannot be in pants pocket | MUST |
| POCKET_002 | Kinh sách không được kẹp nách | Sutra cannot be tucked under armpit | MUST |
| POCKET_003 | Kinh sách phải ở tay hoặc trước mặt | Sutra must be in hand or in front of face | MUST |
| POCKET_004 | Phát hiện bất kính → Cảnh báo âm thanh ngay | Detect disrespect → Immediate audio alert | AUTO |
| POCKET_005 | Không dừng cảnh báo cho đến khi di chuyển ra vị trí đúng | Alert does not stop until moved to proper position | MUST |

## Input Contract (TypeScript DTOs)

```typescript
interface DeviceSensorData {
  timestamp: number; // Unix timestamp
  orientation: {
    alpha: number; // Z rotation (0-360°)
    beta: number;  // X rotation (-180 to 180°)
    gamma: number; // Y rotation (-90 to 90°)
  };
  lightLevel: number; // 0-100 (0 = total darkness, 100 = bright sunlight)
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  motionMagnitude: number; // sqrt(aX² + aY² + aZ²)
  isSutraActive: boolean;
}

interface PlacementViolationDetected {
  timestamp: number;
  violationType: 'pocket' | 'underarm' | 'waistband' | 'lap';
  confidence: number; // 0.0-1.0
  sensorEvidence: {
    darknessDuration: number; // ms
    motionPattern: string; // upward, downward, side-to-side
    orientationShift: number; // degrees
  };
  alertTriggered: boolean;
  alertType: 'audio' | 'haptic' | 'visual';
}

interface AlertResponse {
  alertId: string;
  violationDetected: PlacementViolationDetected;
  audioAlertPath: string; // /assets/alerts/dharma-alert-vi.mp3
  userAcknowledged: boolean;
  timeToCompliance: number; // ms until device moved to proper position
}
```

## Write Path (Pseudocode API)

```
CONTINUOUS SENSOR MONITORING (runs while sutra is open)

1. IF isSutraActive = false
   → SKIP monitoring, exit

2. Collect sensor data every 500ms:
   - DeviceSensorData = { lightLevel, orientation, acceleration, motion }

3. DETECT POCKET PLACEMENT:
   a. IF lightLevel < 10 AND motionMagnitude > 5 for >2 seconds
      → Pattern: Device moved into darkness with quick motion
      → violationType = 'pocket'
      → confidence = 0.85

4. DETECT UNDERARM PLACEMENT:
   a. IF lightLevel < 5 AND beta (X rotation) > 45° AND accelerationY consistent for >3 seconds
      → Pattern: Device tilted horizontally under arm with stable motion
      → violationType = 'underarm'
      → confidence = 0.9

5. DETECT WAISTBAND/LAP PLACEMENT:
   a. IF lightLevel < 20 AND orientation suggests face-down/sideways
      → violationType = 'waistband'
      → confidence = 0.75

6. IF confidence > 0.7 (violation likely)
   a. Create PlacementViolationDetected event
   b. Play audio alert immediately:
      - Vietnamese: "Pháp bảo đang bị kẹp nách hoặc đặt thấp hơn eo. Tội bất kính!"
      - Loop continuously until device moved to correct position

7. MONITOR FOR COMPLIANCE:
   a. After alert triggered, monitor lightLevel and orientation
   b. IF lightLevel > 30 AND device is face-up or hand-held for >3 seconds
      → Violation resolved, stop alert
      → Log: "sutra_placement_corrected"
   c. IF alert active for >60 seconds AND no compliance
      → Log: "sutra_disrespect_sustained"
      → Send gentle reminder: "Xin bạn cất giữ kinh sách một cách tôn trọng"

8. LOG AUDIT EVENT:
   INSERT INTO placement_audit (
     user_id,
     violation_type,
     confidence,
     alert_triggered,
     time_to_compliance,
     created_at
   )
   VALUES (...)
```

## FE Behavior (ASCII Wireframe)

```
NORMAL STATE (Sutra Open, Device Held Properly):

┌──────────────────────────────┐
│ ✅ Kinh Sách Được Tôn Trọng   │
├──────────────────────────────┤
│                              │
│  [Sutra Content Display]     │
│                              │
│  Bạn đang xem kinh sách      │
│  một cách tôn trọng.         │
│                              │
│  Cảm xúc: Tâm Bình           │
│                              │
└──────────────────────────────┘


VIOLATION DETECTED (Device in Pocket):

┌──────────────────────────────┐
│ ⚠️  ❌ TỘI BẤT KÍNH!           │
├──────────────────────────────┤
│                              │
│  🔊 CẢNH BÁO ÂM THANH        │
│                              │
│  "Pháp bảo đang bị kẹp nách  │
│   hoặc đặt thấp hơn eo.      │
│   Tội bất kính!"             │
│                              │
│  ❌ Kinh sách hiện đang ở    │
│     VÙNG CẤXIN (túi quần     │
│     hoặc dưới cánh tay)      │
│                              │
│  Hãy lấy kinh sách ra ngay   │
│  và cầm trên tay hoặc đặt    │
│  trước mặt một cách tôn      │
│  trọng.                      │
│                              │
│  ⏱️  Cảnh báo tiếp tục cho    │
│     đến khi bạn sửa lại...   │
│                              │
└──────────────────────────────┘


COMPLIANCE ACHIEVED (Device Moved to Proper Position):

┌──────────────────────────────┐
│ ✅ Bạn Đã Sửa Chữa            │
├──────────────────────────────┤
│                              │
│  Cảnh báo đã dừng.           │
│                              │
│  Cảm ơn bạn vì đã tôn trọng  │
│  Pháp bảo. Đọc kinh sách     │
│  một cách tâm niệm.          │
│                              │
│  [Tiếp Tục Đọc]              │
│                              │
└──────────────────────────────┘


SUSTAINED VIOLATION (>60 seconds):

┌──────────────────────────────┐
│ 🚨 CẢNH BÁO KÉO DÀI          │
├──────────────────────────────┤
│                              │
│  Kinh sách vẫn ở vị trí      │
│  bất kính sau >1 phút.       │
│                              │
│  "Xin bạn cất giữ kinh sách  │
│   một cách tôn trọng."       │
│                              │
│  Nếu bạn không thể di động   │
│  hoặc đang bận, xin tắt      │
│  sutra và lưu trữ đúng cách. │
│                              │
│  [Tắt Kinh Sách] [Tiếp Tục]  │
│                              │
└──────────────────────────────┘
```

## Schema Notes (Prisma Snippet)

```prisma
model SutraDeviceSession {
  id            String    @id @default(cuid())
  userId        String
  deviceId      String
  sutraTextId   String?

  // Session tracking
  sessionStarted DateTime
  sessionEnded   DateTime?
  isActive       Boolean   @default(true)

  // Placement violations during session
  violations    PlacementViolation[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId, isActive])
  @@index([deviceId])
}

model PlacementViolation {
  id            String    @id @default(cuid())
  sessionId     String
  session       SutraDeviceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  violationType String    // pocket, underarm, waistband, lap
  detectionConfidence Float // 0.0-1.0

  // Sensor evidence
  darknessDuration Int?  // milliseconds
  motionPattern   String?
  orientationShift Float?

  alertTriggered  Boolean
  alertType       String?  // audio, haptic, visual

  timeToCompliance Int?  // milliseconds until corrected (null if not corrected)
  isResolved      Boolean @default(false)
  resolvedAt      DateTime?

  createdAt     DateTime  @default(now())

  @@index([sessionId])
  @@index([violationType])
  @@index([isResolved])
}

model AlertAudit {
  id            String    @id @default(cuid())
  userId        String
  violationId   String
  alertId       String    @unique

  audioAlertPath String? // /assets/alerts/dharma-alert-vi.mp3
  audioPlayCount Int @default(0)
  userAcknowledged Boolean @default(false)
  acknowledgedAt DateTime?

  sustainedSeconds Int? // How long alert lasted if user didn't move device

  createdAt     DateTime  @default(now())

  @@index([userId])
  @@index([violationId])
}
```

## Audit

All placement violations and alerts are logged immutably:
- 🔊 **sutra_pocket_violation_detected**: Device detected in pants pocket
- 🔊 **sutra_underarm_violation_detected**: Device detected under armpit
- ✅ **sutra_placement_corrected**: Device moved to proper position
- ⚠️  **sutra_disrespect_sustained**: Violation lasted >60 seconds
- 📝 **alert_played_vietnamese**: Audio alert triggered
- 👤 **user_acknowledged_violation**: User confirmed receipt of alert

```sql
INSERT INTO alert_audit (user_id, violation_id, alert_id, audio_alert_path, created_at)
VALUES ($1, $2, $3, $4, NOW());

INSERT INTO placement_violation (session_id, violation_type, detection_confidence, alert_triggered, created_at)
VALUES ($1, $2, $3, $4, NOW());
```

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `POCKET_VIOLATION` | 400 | Kinh sách không được đặt trong túi quần | Sutra cannot be in pants pocket |
| `UNDERARM_VIOLATION` | 400 | Kinh sách không được kẹp nách | Sutra cannot be tucked under armpit |
| `DISRESPECT_DETECTED` | 400 | Phát hiện bất kính đối với Pháp bảo | Disrespect detected toward dharma |
| `SENSOR_DATA_INVALID` | 500 | Cảm biến không phản ứng đúng | Sensor data invalid or unavailable |
| `ALERT_PLAYBACK_FAILED` | 500 | Không thể phát cảnh báo âm thanh | Cannot play audio alert |

## Notes for AI/Codegen

1. **Sensor Calibration**: Test on multiple device models to calibrate light/acceleration thresholds. Light Level < 10 may need adjustment for e-ink readers vs. LCD screens. Accelerometer sensitivity varies by device.

2. **Audio Alert MP3**: Create or source a respectful, non-alarming Vietnamese audio file:
   - "Pháp bảo đang bị kẹp nách hoặc đặt thấp hơn eo. Tội bất kính!"
   - Gentle, calm tone (not harsh/frightening)
   - Play continuously until compliance (max 60s recommendation before escalation)
   - Must be loopable without pause

3. **Battery Consideration**: Continuous sensor polling drains battery. Implement:
   - Aggressive sensor collection only when sutra is OPEN
   - Disable monitoring when app backgrounded or sutra closed
   - Optional low-power mode: poll every 2 seconds instead of every 500ms

4. **User Privacy**: Sensor data (light, orientation, acceleration) is non-invasive but should not be transmitted to servers. Process locally on device only. Audit logs store only violation TYPE and CONFIDENCE, not raw sensor streams.

5. **Testing Edge Cases**:
   - Device in backpack (darkness but no motion pattern match)
   - Device on desk facing down (darkness but no underarm orientation)
   - Low light reading environment (library, subway) — threshold must not false-positive
   - Device charging face-down — should not trigger if sutra is closed

6. **Haptic Alternative**: If audio is inappropriate (library, meditation hall), consider haptic (vibration) alert as fallback or user preference.

7. **Graceful Degradation**: If device lacks light sensor, fall back to orientation + acceleration only. If no accelerometer, use manual compliance dialog ("Is sutra in proper position?").

## Related

- `content/USE_CASES/sutra-single-bed-storage-alignment.md` (storage at rest)
- `design/04-schemas/SutraDeviceSession.prisma` (session tracking)
- `engagement/USE_CASES/[TBD-sutra-respect-onboarding]` (teach respect practices to new practitioners)
- External: Android DeviceOrientationEvent API, Web Sensor API (Light Level, Accelerometer)
