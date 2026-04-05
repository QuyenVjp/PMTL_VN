# Thuật Toán Định Vị Không Gian Bán Cầu — Hemispheric Altar Orientation Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 915, 916)
> **Trạng thái:** Verified source — geolocation + compass guidance
> **Cập nhật:** 2026-04-04

---

## Purpose

Bàn thờ Phật được đặt ở đâu và hướng nào cũng rất quan trọng, phụ thuộc vào việc bạn đang ở Bán cầu Bắc hay Bán cầu Nam của Trái Đất.

- **Nếu ở Bán cầu Nam (Úc, New Zealand...):** Bàn thờ tốt nhất nên **Tọa Nam Hướng Bắc** (Sitting south and facing north).
- **Nếu ở Bán cầu Bắc (Việt Nam, Mỹ, Trung Quốc...):** Bàn thờ tốt nhất nên **Tọa Bắc Hướng Nam** (Sitting north and facing south).

---

## Owner module

`altar-management` — AltarService / HemisphericOrientationEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người thiết lập bàn thờ lần đầu
- `system` — geolocation detector + compass AR guide

---

## Trigger

Lần đầu user setup bàn thờ (Onboarding phase)

---

## Business Rules

| Latitude | Hemisphere | Recommendation | Flexibility |
|---|---|---|---|
| > 0° | NORTH | Tọa Bắc Hướng Nam | Medium (other directions acceptable) |
| < 0° | SOUTH | Tọa Nam Hướng Bắc | Medium (other directions acceptable) |
| = 0° (Equator) | EQUATOR | Either direction | High |

---

## Input Contract

```typescript
interface GeolocationDataDto {
  latitude: number
  longitude: number
  country?: string
  city?: string
}

interface AltarOrientationRecommendationDto {
  hemisphere: 'NORTH' | 'SOUTH' | 'EQUATOR'
  recommendedDirection: string    // "Sitting North, Facing South"
  alternativeDirections: string[] // Other acceptable orientations
  flexibilityLevel: 'STRICT' | 'MEDIUM' | 'HIGH'
}
```

---

## Write Path

```
--- Onboarding: Setup Altar Orientation ---
POST /api/altar-management/altar/setup-orientation

1. Request geolocation from user:
   const { latitude, longitude } = await getUserGeolocation()

2. Determine hemisphere:
   if (latitude > 0) {
     hemisphere = 'NORTH'
     recommended = 'Sitting North, Facing South'
     alternatives = ['Facing East', 'Facing West']
     flexibility = 'MEDIUM'
   } else if (latitude < 0) {
     hemisphere = 'SOUTH'
     recommended = 'Sitting South, Facing North'
     alternatives = ['Facing East', 'Facing West']
     flexibility = 'MEDIUM'
   } else {
     hemisphere = 'EQUATOR'
     recommended = 'Either direction'
     alternatives = ['Facing North', 'Facing South']
     flexibility = 'HIGH'
   }

3. Return recommendation + activate Compass AR:
   a. Display compass overlay
   b. Guide user to orient altar to recommended direction
   c. Log final orientation angle
   d. Audit: altar.orientation.configured

4. Store:
   model AltarOrientation {
     userId, hemisphere, recommendedDir, actualDirDegrees, compassAccuracyEstimate
   }

```

---

## FE Behavior

### Geolocation Request & Hemisphere Detection

```
┌────────────────────────────────────────────────────────┐
│ 🌍 Xác Định Vị Trí Bàn Thờ                             │
│────────────────────────────────────────────────────────│
│ Để đặt bàn thờ đúng hướng, chúng tôi cần biết bạn    │
│ ở đâu trên Trái Đất.                                  │
│                                                        │
│ Bạn đang ở:                                            │
│ 📍 Bán cầu Bắc (Việt Nam, Mỹ, Trung Quốc...)         │
│    → Nên Tọa Bắc Hướng Nam                            │
│                                                        │
│ 📍 Bán cầu Nam (Úc, New Zealand, Nam Phi...)          │
│    → Nên Tọa Nam Hướng Bắc                            │
│                                                        │
│      [Yêu Cầu Quyền Địa Chỉ]                         │
└────────────────────────────────────────────────────────┘
```

### Compass AR Guidance

```
┌────────────────────────────────────────────────────────┐
│ 🧭 Hướng Dẫn Đặt Bàn Thờ Bằng La Bàn                  │
│────────────────────────────────────────────────────────│
│                                                        │
│         ⬆️ BẮCN (N — 0°/360°)                         │
│                                                        │
│ TÂY (W — 270°)          ĐÔNG (E — 90°)               │
│         ⬇️ NAM (S — 180°)                             │
│                                                        │
│ Khuyến nghị: TỌA BẮC HƯỚNG NAM                        │
│ (Đặt bàn thờ ở phía bắc, nhìn về phía nam)           │
│                                                        │
│ Góc hiện tại: 175° (Đặt lệch chút đi!)              │
│                                                        │
│            [Xong — Lưu Hướng]                        │
└────────────────────────────────────────────────────────┘
```

### Confirmation After Setup

```
┌────────────────────────────────────────────────────────┐
│ ✅ Bàn Thờ Đã Được Định Vị                            │
│────────────────────────────────────────────────────────│
│ Vị trí bàn thờ: Tọa Bắc Hướng Nam (178°)             │
│                                                        │
│ Tuyệt vời! Bàn thờ của bạn đã được đặt đúng         │
│ hướng theo quy tắc Phật Pháp cho khu vực của bạn.   │
│                                                        │
│ Lưu ý: Nếu không gian nhà không cho phép, các        │
│ hướng khác (Đông, Tây) cũng có thể chấp nhận được.   │
│                                                        │
│              [Tiếp Tục]                               │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model AltarOrientation {
  id                    String   @id @default(cuid())
  userId                String   @unique
  latitude              Float
  longitude             Float
  hemisphere            String   // NORTH | SOUTH | EQUATOR
  recommendedDirection  String
  configuredAt          DateTime @default(now())

  // AR Compass data
  actualHeadingDegrees  Int?     // 0-360
  compassAccuracy       Int?     // in meters
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.orientation.geolocation_detected` | Geolocation acquired |
| `altar.orientation.hemisphere_determined` | North/South/Equator identified |
| `altar.orientation.configured` | User confirmed orientation |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Geolocation denied | `geolocation_permission_denied` | 403 |
| Unable to determine hemisphere | `location_ambiguous` | 400 |

---

## Notes for AI/codegen

- Geolocation.getCurrentPosition() with timeout 10s
- Compass (DeviceOrientationEvent) for AR guidance
- Flexibility levels:
  - NORTH hemisphere: strict about south-facing primary, but east/west acceptable
  - SOUTH hemisphere: strict about north-facing primary, but east/west acceptable
  - EQUATOR: high flexibility
- Store heading degrees (0-360) for audit trail
- Accuracy estimate helps validate compass reliability

---

## Related

- [water-source-validation.md](./water-source-validation.md) — Kiểm tra loại nước
- [sacred-cup-hardware-constraints.md](./sacred-cup-hardware-constraints.md) — Quy tắc ly cúng
