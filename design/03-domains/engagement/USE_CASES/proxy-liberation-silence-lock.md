# Proxy Đắc Giải Tuyệt Âm & Che Danh — Proxy Liberation Silence Lock (Identity Cloak Mode)

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy luật âm mưu từ bi khi trao tiền thay người
> **Trạng thái:** Verified source — human review required before automating geofence enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi người dùng mua cá (hay sinh vật khác) để thả sống thay cho người thân bằng **tiền của riêng họ** (không phải tiền người nhận), cần **che giấu danh tính của người công đức** để toàn bộ phước lành chỉ thuộc về người nhân (beneficiary).

Hệ thống bắt buộc:
1. User phải khấn xin Bồ Tát chuyển tiền của user thành tiền của người nhân tại nhà
2. Khi GPS xác nhận user đến nơi thả sống (vùng nước), app tự động bật **Identity Cloak Mode**
3. Tên user bị ẩn/redact khắp giao diện; chỉ hiển thị tên người nhân
4. Banner đỏ nhấp nháy cảnh báo **TUYỆT ĐỐI CẤM nhắc đến tên user** tại location
5. Tất cả UI personalization (avatar, greeting) bị xóa
6. Notifications bị block nếu chứa tên user

---

## Owner module

`engagement` (primary) với integration `identity` — ProxyLiberationSilenceLock

---

## Actors

- `member` — người dùng bỏ tiền riêng để thả sống thay người
- `beneficiary` — người thân được nhận công đức (mặc dù không biết về việc này)

---

## Trigger

User khởi tạo Proxy Life Liberation session:
```
POST /api/engagement/life-liberation/initiate-proxy
```

---

## Step 1: Dedication Prayer Confirmation (At Home)

### Business Rule

Trước khi user rời khỏi nhà, **bắt buộc** user phải khấn xin Bồ Tát chứng minh rằng user sẽ trao tiền của user cho người nhân.

### Input contract

```
POST /api/engagement/life-liberation/initiate-proxy
{
  beneficiaryId:          string          // ID người thân
  beneficiaryName:        string          // Tên người thân (ví dụ "Mẹ Tôi")
  moneyAmount:            number          // Số tiền bỏ ra (VND)
  dedicationPrayerRecited: boolean         // User phải tick checkbox
}
```

### Write path

1. Validate: `dedicationPrayerRecited = true` bắt buộc. Nếu `false`, trả về error `dedication_prayer_required` (400).
2. Render **Dedication Prayer Modal** (không skip được):
   ```
   Title: "Lời Khấn Trao Tiền — Thay Cho [Tên Người Nhân]"
   Body:  "Xin Bồ Tát từ bi chứng minh:
           Con xin dùng tiền của con là {moneyAmount} VNĐ
           để mua sinh vật và thả sống, để trao toàn bộ phước lành này
           cho [Tên Người Nhân] mà không cần họ biết.
           Xin Bồ Tát từ bi chứng minh và chuyển hóa."
   ```
3. User phải bấm `[Tôi đã khấn xin Bồ Tát chuyển số tiền này thành tiền của [Tên Người Nhân]]` (checkbox required).
4. Khi user confirm:
   - Tạo `LifeLiberationSession` record với `status = "AWAITING_GPS_CONFIRMATION"`.
   - Ghi `beneficiaryName`, `moneyAmount`, `dedicationPrayerRecitedAt = now()`.
   - Bật GPS tracking trên background.
   - Audit `lh.proxy.dedication-prayer-confirmed`.

### UX rules

- Modal **không có nút Dismiss/Skip** — đây là step bắt buộc.
- Nếu user tắt app hoặc quay lại, modal phải hiện lại cho đến khi confirm.

---

## Step 2: GPS Geofence Detection & Identity Cloak Activation

### Business Rule

Khi GPS xác nhận user đến vùng nước (lake, river, ocean — geofence được định nghĩa trong config), hệ thống tự động:
1. Kích hoạt **Identity Cloak Mode**
2. Ẩn đi tên thật của user
3. Hiển thị banner cảnh báo đỏ nhấp nháy
4. Loại bỏ tất cả personalization

### Geofence Configuration

```
// Config trong EnvironmentConfig (không hardcode)
LIFE_LIBERATION_WATER_ZONES = [
  {
    name: "Sông Sài Gòn",
    lat: 10.7769,
    lng: 106.7009,
    radiusMeters: 500,
    zoneType: "RIVER"
  },
  {
    name: "Hạ Long Bay",
    lat: 20.8449,
    lng: 107.1890,
    radiusMeters: 1000,
    zoneType: "BAY"
  },
  // ... add more as needed
]
```

### GPS Detection Flow

1. **Background GPS tracking** starts after `dedicationPrayerRecited = true`.
2. Every 30 seconds, check user's current location against all geofences.
3. When user enters geofence:
   - Update `LifeLiberationSession.status = "CLOAKED"`.
   - Ghi `cloakActivatedAt = now()`, `locationZoneDetected = "Sông Sài Gòn"` (example).
   - Trigger UI refresh với Identity Cloak Mode enabled.
   - Audit `lh.proxy.identity-cloak-activated`.

### Write path (Server-side state change)

```
// Pseudocode — triggered by GPS event on FE, confirmed on BE
PUT /api/engagement/life-liberation/:sessionId/cloak
{
  triggeredByGPS: true,
  detectedLocationZone: "Sông Sài Gòn",
  confirmedAt: "2026-04-04T14:35:00Z"
}

Response:
{
  status: "success",
  sessionId: string,
  cloakActivated: true,
  cloakActivatedAt: DateTime,
  locationZoneDetected: string,
  beneficiaryNameForDisplay: string,
  userNameCloaked: true
}
```

---

## Step 3: Identity Cloak Mode UI Behavior

### Red Pulsing Warning Banner (Required)

Display at **TOP of screen**, **always visible**, red background, pulsing animation:

```
🔴 CẤM KỴ: TUYỆT ĐỐI KHÔNG NHẮC ĐẾN TÊN BẠN TẠI ĐÂY.
   Chỉ được đọc tên [Tên Người Nhân] để công đức thuộc trọn về họ!
```

**CSS:** Red (#e63946), font-weight bold, animation pulse every 1 second (opacity 0.5 → 1 → 0.5).

### User Name Redaction

| UI Element | Behavior |
|---|---|
| Header greeting | ❌ Hide "Xin chào [YourName]" → Show empty or "Xin chào" |
| User avatar/profile pic | ❌ Hide or show placeholder (generic icon) |
| Session label | ❌ If text says "Session của [YourName]", redact to "Session của Người Công Đức" |
| Any personalization | ❌ Remove all "Welcome [YourName]", "Your progress", etc. |

### Beneficiary Name Display (Prominent)

**Large centered text, bold, possibly in a blessed gold/yellow frame:**

```
Công Đức Thả Sống Cho
[BENEFICIARY_NAME]
```

Example: "Công Đức Thả Sống Cho Mẹ Tôi"

### Notifications Blocked

While `userNameCloaked = true`:
- **Block all push notifications** that mention user's real name.
- Allow notifications that only mention beneficiary name or generic messages.
- Example BLOCKED: "Chúc mừng, [YourName], bạn vừa hoàn thành..."
- Example ALLOWED: "Công đức đã ghi nhận cho [BeneficiaryName]"

---

## Lifesycle & Cloak Duration

### When Cloak Stays Active

Cloak remains active **for the entire session**, until:
1. User completes the life liberation (clicks "Đã thả sống xong").
2. User exits the geofence AND 5+ minutes have passed (grace period).
3. User manually ends session (rare).

### Cloak Deactivation

When session ends:
1. Update `LifeLiberationSession.status = "COMPLETED"`.
2. Set `userNameCloaked = false`.
3. Reset UI to normal (show user avatar, greeting, etc. again).
4. Remove red banner.
5. Audit `lh.proxy.silence-maintained-throughout` (if user never said their name in location).

---

## Schema Changes

```prisma
model LifeLiberationSession {
  id                      String      @id @default(cuid())
  userId                  String      // Person donating money
  beneficiaryId           String      // Person receiving merit
  beneficiaryName         String      // E.g., "Mẹ Tôi", "Bố Tôi"
  moneyAmount             Int         // Amount in VND

  // Step 1: Dedication Prayer
  dedicationPrayerRecitedAt  DateTime?

  // Step 2: GPS Cloak
  userNameCloaked         Boolean     @default(false)
  cloakActivatedAt        DateTime?
  locationZoneDetected    String?     // E.g., "Sông Sài Gòn"

  status                  String      // "AWAITING_GPS_CONFIRMATION" | "CLOAKED" | "COMPLETED"
  completedAt             DateTime?

  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt

  @@index([userId])
  @@index([beneficiaryId])
  @@index([status])
}
```

---

## DTO Contracts

### InitiateProxyLifeLiberationDto

```typescript
export class InitiateProxyLifeLiberationDto {
  beneficiaryId: string;           // @IsUUID()
  beneficiaryName: string;         // @IsString() @MinLength(1) @MaxLength(100) — no special chars, only Vietnamese
  moneyAmount: number;             // @IsNumber() @IsPositive() — VND amount
  dedicationPrayerRecited: boolean; // @IsBoolean() — must be true to proceed
}
```

### ActivateCloakDto

```typescript
export class ActivateCloakDto {
  triggeredByGPS: boolean;           // true = GPS geofence triggered
  detectedLocationZone: string;      // E.g., "Sông Sài Gòn"
  confirmedAt: string;               // ISO 8601 datetime
}
```

---

## Errors

| Condition | Error code | HTTP | Message | Recovery |
|---|---|---|---|---|
| `dedicationPrayerRecited = false` | `dedication_prayer_required` | 400 | Xin vui lòng khấn xin Bồ Tát trước khi rời nhà. | User must check the checkbox and confirm prayer |
| User GPS location NOT in water zone | `location_not_at_water_zone` | 403 | Bạn chưa đến nơi thả sống. Vui lòng tới gần nơi có nước (sông, hồ, biển). | User must move to actual water location |
| Session ID not found | `session_not_found` | 404 | — | Restart session |
| Beneficiary ID invalid | `invalid_beneficiary` | 400 | Người thân không tồn tại. | Use valid beneficiary ID |
| User not authenticated | `unauthorized` | 401 | — | Login |
| User not owner of session | `forbidden` | 403 | — | — |

---

## Audit Events

| Action | Trigger | Payload |
|---|---|---|
| `lh.proxy.dedication-prayer-confirmed` | User confirms dedication prayer at home | { sessionId, beneficiaryId, beneficiaryName, moneyAmount, timestamp } |
| `lh.proxy.identity-cloak-activated` | GPS detects user in water zone | { sessionId, locationZoneDetected, cloakActivatedAt, userNameCloaked=true } |
| `lh.proxy.silence-maintained-throughout` | Session completed without user revealing their name | { sessionId, sessionDurationSeconds, beneficiaryName, zoneType, timestamp } |

---

## Notes for Implementation

- **GPS permission:** Require `ACCESS_FINE_LOCATION` (Android) or `CLLocationAccuracyBest` (iOS) on app startup if user has initiated a proxy life liberation session.
- **Background GPS:** On Android, use foreground service with notification (required by Android 12+). Keep GPS running even if app is backgrounded or screen is off, until session ends or cloak is deactivated.
- **Geofence zones:** Load from config, not hardcoded. Use a Prisma seed or env var.
- **Cloak mode persistence:** If app crashes while `userNameCloaked = true`, re-launch app and check session status. If GPS still in zone, resume cloaked mode automatically.
- **User privacy:** Ensure user's real name is NEVER logged in audit for this session (redact it in logs if needed).
- **Beneficiary consent:** This is a surprise gift. Beneficiary never knows. Do NOT send beneficiary any notification about this proxy session.
- **UI testing:** Test that red banner displays correctly on different screen sizes (mobile priority). Test that user name is redacted everywhere (search codebase for hardcoded username display).
- **Monks/Teachers:** If user is a Buddhist monk/teacher (admin flag), special rules may apply — consult with domain authority before automating.

