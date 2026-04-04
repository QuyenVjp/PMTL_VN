# Sydney DST Radio Router — Định Tuyến Đài Phát Thanh Sydney Theo Múi Giờ

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hệ thống đường dây nóng quốc tế
> **Trạng thái:** Verified source — technical implementation required
> **Cập nhật:** 2026-04-04

---

## Purpose

Đài phát thanh (Radio Broadcast) công bố lịch phát sóng theo **giờ Sydney** (AEDT/AEST). Khi người gọi từ các quốc gia khác nhận được cuộc gọi đến đường dây nóng xin Pháp Môn, hệ thống tự động:

1. **Chuyển đổi giờ phát sóng** từ Sydney → múi giờ địa phương của người gọi (sử dụng `date-fns-tz`)
2. **Định tuyến tới nhân viên thư ký phù hợp** dựa vào khung giờ đã chuyển đổi
   - Ví dụ: Phát sóng 2026-04-05 08:00 Sydney (AEDT) + người gọi từ Việt Nam (UTC+7)
   - Hệ thống tính: 2026-04-05 08:00 AEDT (UTC+11) = 2026-04-04 19:00 UTC+7 (Việt Nam)
   - Định tuyến: **Night Secretariat** thay vì Morning Secretariat

---

## Owner module

`contact` — RadioScheduleRouter
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Thông Tin Đài Phát Thanh

| Trường | Giá trị |
|---|---|
| Hệ thống | Đài phát thanh chính thức (external broadcast system) |
| Kênh kích hoạt | POST `/api/contact/radio-broadcast/incoming` |
| Múi giờ công bố | `Australia/Sydney` (AEDT/AEST tự động) |
| DST chu kỳ | Oct–Apr: AEDT (UTC+11) / Apr–Oct: AEST (UTC+10) |

---

## DST Rules (Australia/Sydney)

| Giai đoạn | Tên | UTC offset | Ví dụ lệch so với VN (UTC+7) |
|---|---|---|---|
| Tháng 10 — Tháng 4 (mùa Hè) | AEDT | UTC+11 | **+4 giờ** |
| Tháng 4 — Tháng 10 (mùa Đông) | AEST | UTC+10 | **+3 giờ** |

> Thư viện bắt buộc: **`date-fns-tz`** — dùng `toZonedTime()` và `fromZonedTime()` với timezone `"Australia/Sydney"`. **Không tự tính offset thủ công.**

---

## API Endpoint

```
POST /api/contact/radio-broadcast/incoming
─────────────────────────────────────────────
Request Body (IncomingRadioBroadcastDto):
{
  broadcastTimeSydney: ISO8601 DateTime,  // "2026-04-05T08:00:00+11:00"
  callerTimezone: string                   // "Asia/Ho_Chi_Minh" or similar
}

Response (201 Created):
{
  sessionId: UUID,
  broadcastTimeSydney: ISO8601 string,
  callerTimezone: string,
  convertedLocalTime: ISO8601 string,      // Converted to caller's TZ
  routedToSecretariat: string,             // e.g., "Night Secretariat", "Morning Secretariat"
  routingReason: string,                   // Explanation (for logs/audit)
  status: "routed_to_morning" | "routed_to_night" | "routed_to_special"
}

Error Responses:
- 400: Invalid timezone or malformed datetime
- 500: timezone_conversion_failed (rare, log with full context)
```

---

## Routing Logic

```
function routeRadioBroadcast(broadcastTimeSydney: DateTime, callerTimezone: string): RoutingResult {

  Steps:
  1. Parse input:
     - broadcastTimeSydney must be ISO8601 with timezone
     - callerTimezone must be valid IANA identifier

  2. Validate & convert:
     - const sydneyZoned = toZonedTime(broadcastTimeSydney, "Australia/Sydney")
     - const localZoned = toZonedTime(broadcastTimeSydney, callerTimezone)
     - Store both for audit trail

  3. Determine time period of localZoned:
     - Morning:   06:00 — 11:59
     - Afternoon: 12:00 — 17:59
     - Night:     18:00 — 23:59
     - Early:     00:00 — 05:59

  4. Route to secretariat:
     - Morning/Afternoon → "Morning Secretariat"
     - Night → "Night Secretariat"
     - Early → "Early Morning Secretariat" (if defined)

  5. Log audit events:
     - radio.broadcast.incoming
     - radio.broadcast.timezone-converted
     - radio.broadcast.routed-to-[secretariat-name]

  6. Return routing result with converted time for caller display
}
```

---

## DTO & Schema

### IncomingRadioBroadcastDto

```typescript
export class IncomingRadioBroadcastDto {
  @IsISO8601()
  @IsNotEmpty()
  broadcastTimeSydney: Date;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  callerTimezone: string; // IANA timezone identifier
}
```

### BroadcastSession (Prisma)

```prisma
model BroadcastSession {
  id                    String   @id @default(cuid())

  // Input data
  broadcastTimeSydney   DateTime
  callerTimezone        String

  // Computed field (on insert)
  convertedLocalTime    DateTime @default(now()) // computed value

  // Routing result
  routedToSecretariat   String   // "Morning Secretariat", "Night Secretariat", etc.
  routingReason         String?  // Optional explanation
  routingStatus         String   // "routed_to_morning" | "routed_to_night" | "routed_to_special"

  // Metadata
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([routedToSecretariat])
  @@index([broadcastTimeSydney])
}
```

---

## Secretariat Configuration

Store secretariat operating hours in `SystemConfig`:

```json
{
  "key": "contact.radio_broadcast_secretariat_schedule",
  "type": "JSON",
  "value": {
    "secretariats": [
      {
        "name": "Morning Secretariat",
        "localHourRange": [6, 12],
        "timezone": "Asia/Ho_Chi_Minh",
        "staffCount": 3,
        "priority": 1
      },
      {
        "name": "Night Secretariat",
        "localHourRange": [18, 24],
        "timezone": "Asia/Ho_Chi_Minh",
        "staffCount": 2,
        "priority": 2
      },
      {
        "name": "Early Morning Secretariat",
        "localHourRange": [0, 6],
        "timezone": "Asia/Ho_Chi_Minh",
        "staffCount": 1,
        "priority": 3
      }
    ]
  }
}
```

---

## Audit Trail

All broadcast routing events must be logged with full context:

| Event | Trigger | Logged Fields |
|---|---|---|
| `radio.broadcast.incoming` | Request received at endpoint | broadcastTimeSydney, callerTimezone, sessionId |
| `radio.broadcast.timezone-converted` | Conversion successful | sydneyTime, callerLocalTime, timezone, offset |
| `radio.broadcast.routed-to-morning` | Routed to Morning Secretariat | sessionId, convertedLocalTime, reason |
| `radio.broadcast.routed-to-night` | Routed to Night Secretariat | sessionId, convertedLocalTime, reason |
| `radio.broadcast.routed-to-special` | Routed to other secretariat | sessionId, secretariatName, reason |

### Audit Log Schema

```typescript
interface AuditEntry {
  timestamp: DateTime;
  event: string;
  sessionId: string;
  broadcastTimeSydney?: DateTime;
  callerTimezone?: string;
  convertedLocalTime?: DateTime;
  routedTo?: string;
  offset?: string; // e.g., "UTC+11" or "UTC+10"
  reason?: string;
  context?: Record<string, any>;
}
```

---

## Error Handling

### timezone_conversion_failed (500)

Occurs when `date-fns-tz` cannot parse timezone or convert time. Very rare.

**Response:**
```json
{
  "statusCode": 500,
  "message": "Timezone conversion failed",
  "error": "timezone_conversion_failed",
  "details": {
    "broadcastTimeSydney": "2026-04-05T08:00:00+11:00",
    "callerTimezone": "Invalid/Timezone",
    "conversionError": "Unknown time zone"
  }
}
```

**Action:** Log full error context with sessionId. Alert ops. Do NOT expose error details to frontend.

### Other Errors

- **400 Bad Request:** Malformed datetime or invalid timezone identifier
  - Log warning (not error)
  - Return clear validation message
- **422 Unprocessable Entity:** Valid timezone but business rule violation
  - Return user-friendly message
  - Log as info

---

## Implementation Notes

### date-fns-tz Usage

```typescript
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Convert FROM Sydney TO caller's timezone
const sydneyTime = toZonedTime(broadcastTimeSydney, 'Australia/Sydney');
const localTime = toZonedTime(broadcastTimeSydney, callerTimezone);

// OR: Create Date in Sydney, convert to caller's display
const sydneyDate = new Date(broadcastTimeSydney);
const localDisplay = toZonedTime(sydneyDate, callerTimezone);

// NEVER: Hardcode offset
const wrong = new Date(broadcastTimeSydney.getTime() + (4 * 60 * 60 * 1000));
```

### DST Edge Cases

April DST transition (when this feature was built):
- **Before 2026-04-05 02:00 AEDT:** UTC+11 offset applies
- **After 2026-04-05 02:00 AEDT:** Clocks "fall back" to AEST (UTC+10)
- This is **why** we never hardcode offset — `date-fns-tz` handles the transition automatically

### Computed Fields in Prisma

`convertedLocalTime` should be computed on insert, not stored as dynamic field:

```typescript
// In service layer, before insert:
const localTime = toZonedTime(broadcastTimeSydney, callerTimezone);
const broadcastSession = await this.prisma.broadcastSession.create({
  data: {
    broadcastTimeSydney,
    callerTimezone,
    convertedLocalTime: localTime,  // Computed once, stored
    routedToSecretariat,
    routingReason,
    routingStatus
  }
});
```

---

## Internal Admin Panel Notes

### BroadcastSession Display

Admin panel should show:

```
Broadcast Session #abc123

📍 Broadcast Time (Sydney):  2026-04-05 08:00 AEDT (UTC+11)
📍 Caller Timezone:          Asia/Ho_Chi_Minh
📍 Converted Local Time:     2026-04-04 19:00 ICT (UTC+7)

🎯 Routed To:               Night Secretariat
✓ Status:                   routed_to_night
📋 Reason:                  Converted time 19:00 falls in night shift (18:00-24:00)

⏰ Created:                  2026-04-04 08:15:32 UTC
```

### Timezone Validation Tool

Provide admin UI to test timezone conversions:

```
Input:
  Broadcast Time (Sydney): [2026-04-05T08:00]
  Caller Timezone:         [Asia/Ho_Chi_Minh ▼]

Output (real-time preview):
  → Converted to caller:   2026-04-04 19:00 ICT
  → Route to:              Night Secretariat
  → Sydney offset:         UTC+11 (AEDT)
```

---

## Testing Strategy

### Unit Tests

- [x] Timezone parsing (valid IANA identifiers)
- [x] Conversion accuracy (known date pairs)
- [x] DST transition handling (Oct & Apr boundaries)
- [x] Secretariat routing logic (all hour ranges)
- [x] Error handling (invalid timezone, malformed datetime)

### Integration Tests

- [x] End-to-end broadcast routing (POST endpoint)
- [x] Audit event logging
- [x] Database storage & retrieval
- [x] Admin panel display

### Test Data

```typescript
// Morning routing
{
  broadcastTimeSydney: "2026-04-05T08:00:00+11:00", // AEDT
  callerTimezone: "Asia/Ho_Chi_Minh",
  expected: {
    convertedLocalTime: "2026-04-04T19:00:00+07:00", // Previous day, evening
    routedTo: "Night Secretariat"
  }
}

// Afternoon routing
{
  broadcastTimeSydney: "2026-04-05T14:00:00+11:00",
  callerTimezone: "Asia/Ho_Chi_Minh",
  expected: {
    convertedLocalTime: "2026-04-05T01:00:00+07:00", // Early next morning
    routedTo: "Early Morning Secretariat"
  }
}

// AEST (winter) conversion
{
  broadcastTimeSydney: "2026-07-15T08:00:00+10:00", // AEST (July)
  callerTimezone: "Asia/Ho_Chi_Minh",
  expected: {
    convertedLocalTime: "2026-07-15T15:00:00+07:00", // Same day, afternoon
    routedTo: "Afternoon Secretariat" // If defined
  }
}
```

---

## Related

- [totem-hotline-dst-countdown.md](./totem-hotline-dst-countdown.md) — Sydney Totem Hotline DST handling (similar pattern, user-facing)
- [manage-volunteer-directory.md](./manage-volunteer-directory.md) — Secretariat staff directory
- [update-contact-info.md](./update-contact-info.md) — Contact info management
