# Cấm Đốt NNN Sau Trời Tối & Thời Tiết Âm U — Sunset Combustion Ban

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc an toàn và tôn trọng các linh tính
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Enforce the spiritual rule that Ngôi Nhà Nhỏ (Little House / NNN) **can ONLY be burned between sunrise and sunset**. After sunset or during dark/rainy weather, the burn button is disabled and attempting to burn triggers a 400 error with an explicit warning message.

Exception: Emergency medical override for critical illness allows burning outside standard hours if explicitly flagged.

---

## Owner module

`engagement` — SunsetCombustionGate / LittleHouseService

---

## Actors

- `member` — user attempting to burn Ngôi Nhà Nhỏ
- `system` — query sunrise/sunset times, validate weather, check user timezone, enforce block

---

## Trigger

User attempts to POST `/api/engagement/little-house/burn` after sunset OR during dark/rainy weather without emergency override.

---

## Business Rules

| Condition | Allowed | Note |
|---|---|---|
| Sunrise ≤ current time ≤ sunset | ✅ Yes | Normal burn window |
| Current time < sunrise | ❌ No | Too early |
| Current time > sunset | ❌ No | After dark |
| Dark/rainy weather | ❌ No | Unsafe conditions |
| emergencyMedicalOverride = true + critical illness | ✅ Yes | Medical exception only |
| emergencyMedicalOverride = true + no justification | ❌ No | Requires verification |

---

## Input Contract

```typescript
interface BurnLittleHouseDto {
  littleHouseId: string
  emergencyMedicalOverride?: boolean
}

interface SunsetCheckResult {
  locationLat: number
  locationLng: number
  timezone: string
  sunriseAt: DateTime      // local timezone
  sunsetAt: DateTime       // local timezone
  currentTime: DateTime    // local timezone
  weatherStatus: string    // "CLEAR" | "RAINY" | "CLOUDY" | "DARK"
  isWithinBurnWindow: boolean
  minutesUntilSunset: number
}
```

---

## Write Path

```
POST /api/engagement/little-house/burn
1. Extract littleHouseId from body
2. Load LittleHouse record
3. Get user's timezone + location (lat/lng)
4. Query Weather/Sunrise-Sunset API:
   → Fetch sunrise/sunset times for today
   → Fetch current weather status
5. Calculate isWithinBurnWindow:
   → Now >= sunriseAt AND now <= sunsetAt AND weatherStatus != "DARK"/"RAINY"
6. If NOT within window:
   → Check emergencyMedicalOverride flag
   → If true:
     → Load UserProfile, check emergencyMedicalStatus field
     → If emergencyMedicalStatus is set and recent (< 7 days):
       → Allow burn + Audit: lh.burn.emergency-override-used
     → Else:
       → Return 422 emergency_override_required
   → If false OR no medical status:
     → Return 400 combustion_after_sunset_forbidden
     → Update LittleHouse.attemptedAfterSunsetAt = now()
     → Audit: lh.burn.attempted-after-sunset-blocked
7. If within window:
   → Proceed with normal burn flow
   → Update LittleHouse.burnedAt = now()
```

---

## API Behavior

### Success Path (Within Window)
```
Status: 200 OK
{
  "success": true,
  "littleHouseId": "uuid",
  "burnedAt": "2026-04-04T15:30:00+07:00",
  "nextAllowedBurnTime": null
}
```

### Error: After Sunset
```
Status: 400 Bad Request
{
  "error": "combustion_after_sunset_forbidden",
  "message": "Sau khi trời tối hoặc thời tiết âm u, CẤM ĐỐT NNN trừ trường hợp cấp cứu bệnh nặng!",
  "details": {
    "sunsetTime": "2026-04-04T17:45:00+07:00",
    "currentTime": "2026-04-04T19:30:00+07:00",
    "minutesAfterSunset": 105,
    "nextSunriseTime": "2026-04-05T05:45:00+07:00"
  }
}
```

### Error: Medical Override Required
```
Status: 422 Unprocessable Entity
{
  "error": "emergency_override_required",
  "message": "Để đốt ngoài giờ này, vui lòng xác nhận trạng thái cấp cứu y tế trong hồ sơ.",
  "details": {
    "sunsetTime": "2026-04-04T17:45:00+07:00",
    "currentTime": "2026-04-04T19:30:00+07:00"
  }
}
```

---

## FE Behavior

### Before Sunset (Enabled)
```
🔥 ĐỐT NNN

[Xác nhận đã Đốt NNN]  ← button enabled, click to burn
```

### After Sunset (Disabled)
```
🔥 ĐỐT NNN
⏱️ Trời đã tối

[Xác nhận đã Đốt NNN]  ← button DISABLED

ℹ️ Sau khi trời tối hoặc thời tiết âm u,
   CẤM ĐỐT NNN trừ trường hợp cấp cứu bệnh nặng!

   ☀️ Sunrise: 05:45 AM
   🌅 Sunset: 05:45 PM

   [ ] Đây là trường hợp cấp cứu bệnh nặng

   [Xác nhận] ← enable only if checkbox checked
```

### Medical Override Modal
```
⚠️ XÁC NHẬN CẤP CẬU Y TẾ

Bạn đang cố gắng đốt NNN ngoài giờ
an toàn. Điều này chỉ được phép trong
trường hợp bệnh nặng cấp cứu.

Tình trạng hiện tại của bạn:
[Dropdown: Select or enter illness/condition]

Ngày bắt đầu: [Date picker]

[Huỷ] [Xác Nhận Đốt]
```

---

## Schema Notes

```prisma
// Thêm vào LittleHouse
model LittleHouse {
  // ... existing fields ...

  // Sunset combustion ban tracking
  burnedAt                  DateTime?       // when actually burned
  attemptedAfterSunsetAt    DateTime?       // when last failed after sunset
  weatherStatus             String?         // "CLEAR" | "RAINY" | "CLOUDY" | "DARK"
  burnEmergencyOverrideUsed Boolean @default(false)

  // Denormalized sunset info for audit
  sunriseTimeOnBurnDate     DateTime?
  sunsetTimeOnBurnDate      DateTime?
}

// Thêm vào UserProfile
model UserProfile {
  // ... existing fields ...

  // Emergency medical override
  emergencyMedicalStatus    String?         // "NONE" | "ILLNESS_CRITICAL"
  emergencyMedicalStartDate DateTime?
  emergencyMedicalNote      String?
}
```

---

## Weather API Integration

### Sunrise/Sunset API
```typescript
// Using Open-Meteo or similar (no API key required for public use)
// Endpoint: https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=sunrise,sunset&timezone={tz}

interface SunriseSunsetResponse {
  latitude: number
  longitude: number
  timezone: string
  daily: {
    sunrise: string[]      // ISO strings, one per day
    sunset: string[]       // ISO strings, one per day
    weather_code: number[] // WMO code
  }
}

function querySunriseSunset(lat: number, lng: number, tz: string): Promise<SunsetCheckResult> {
  // Query API
  // Parse response
  // Compare current time in user's timezone
  // Return SunsetCheckResult
}
```

### Weather Status Mapping
```typescript
enum WeatherStatus {
  CLEAR = "CLEAR",      // 0, 1 (sunny/mostly clear)
  CLOUDY = "CLOUDY",    // 2, 3 (partly cloudy)
  RAINY = "RAINY",      // 45, 48, 51-67, 80-82 (fog, rain, drizzle, showers)
  DARK = "DARK"         // current time < sunrise or > sunset
}

function getWeatherStatus(currentTime: DateTime, sunrise: DateTime, sunset: DateTime, wmoCode: number): WeatherStatus {
  if (currentTime < sunrise || currentTime > sunset) return WeatherStatus.DARK
  if ([45, 48, 51, 53, 55, 61, 63, 65, 80, 81, 82].includes(wmoCode)) return WeatherStatus.RAINY
  if ([2, 3].includes(wmoCode)) return WeatherStatus.CLOUDY
  return WeatherStatus.CLEAR
}
```

---

## Audit

| Action | Trigger | Context |
|---|---|---|
| `lh.burn.attempted-after-sunset-blocked` | POST /burn after sunset, no override | littleHouseId, sunsetTime, currentTime |
| `lh.burn.emergency-override-used` | POST /burn after sunset WITH valid override | littleHouseId, medicalReason, overrideAt |
| `lh.burn.sunset-check-passed` | Burn successful within window | littleHouseId, sunriseTime, sunsetTime |
| `lh.burn.weather-blocked` | Burn attempt during rainy/dark weather | littleHouseId, weatherStatus |

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Attempted burn after sunset | `combustion_after_sunset_forbidden` | 400 | Wait until sunrise or medical override |
| Emergency override flag set but no medical status | `emergency_override_required` | 422 | Set emergency medical status in profile |
| Location data missing | `location_required` | 400 | User must enable location sharing |
| Sunrise/Sunset API unavailable | `weather_service_unavailable` | 503 | Retry or allow manual time override |
| Unauthorized | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- **Timezone handling:** Always convert sunrise/sunset times to user's configured timezone before comparison with `now()`.
- **Location source:** Use user's profile location OR ask for location permission on first burn after sunset.
- **API caching:** Cache sunrise/sunset for each (lat, lng, date) combination for 24 hours to reduce API calls.
- **Medical override:** Requires both `emergencyMedicalOverride = true` in DTO AND valid `emergencyMedicalStatus` in UserProfile (not expired, set within 7 days).
- **Weather fallback:** If weather API fails, default to **allowing burn** (fail-open) with audit note.
- **Button state:** FE should query sunrise/sunset on component mount and update button state every minute during critical window (sunset ± 30 min).
- **Sunset message:** Always show "Sunrise: HH:MM AM / Sunset: HH:MM PM" in disabled state for user clarity.
- **Emergency medical status:** Should be set via separate `/api/user/emergency-medical-status` endpoint with explicit timestamp.
- **Audit level:** All sunset blocks + overrides must be audited for compliance monitoring.

---

## Related

- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — post-burn checklist
- [metal-container-ban.md](./metal-container-ban.md) — container requirements
- [little-house-ash-disposal.md](./little-house-ash-disposal.md) — ash handling
