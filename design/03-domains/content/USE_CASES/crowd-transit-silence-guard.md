# Cảnh Báo Đám Đông / Đi Lại — Crowd/Transit Silence Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Bảo vệ năng lượng niệm tụng trong môi trường không tĩnh tại
> **Trạng thái:** Phase 42 Logic 3
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi user mở E-Reader để đọc/niệm Tâm Kinh hoặc Vãng Sanh Chú trong môi trường công cộng ồn ào hoặc đang di chuyển bằng phương tiện giao thông, hệ thống phát hiện và cảnh báo:

1. **Cảm biến tiếng ồn (Microphone API):** Nếu mức độ tiếng ồn nền vượt 70dB → indicate nguy hiểm
2. **Định vị GPS:** Nếu user đang trong phương tiện giao thông công cộng (transit mode) → cảnh báo
3. **Hình thức cảnh báo:** Viền flashing vàng trên nội dung kinh, kèm thông báo advisory (không hard block)
4. **Khuyến nghị:** Chuyển sang chế độ **NIỆM THẦM** (silent recitation) để bảo vệ năng lượng Pháp bảo

---

## Owner module

`content` — E-Reader / SutraReader
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — mở E-Reader để đọc/niệm Tâm Kinh (Tâm Kinh/Vãng Sanh Chú) trong xe/xe buýt/tàu/chỗ công cộng
- `system` — detect noise level + GPS location, show warning overlay

---

## Trigger

User gọi `POST /api/content/sutras/start-session` với `sutraId` = Tâm Kinh hoặc Vãng Sanh Chú (Heart Sutra / Amitabha Sutra shortform chants).

---

## Business Rule

| Điều kiện | Hành động |
|---|---|
| `backgroundNoiseLevel >= 70dB` OR `isInTransit == true` | Hiện viền flashing vàng + cảnh báo advisory |
| Cả hai điều kiện false | Render bình thường, không có cảnh báo |

**Advisory chỉ là thông báo — không block content, không prevent interaction.**

Thông báo:
```
⚠️ CẢNH BÁO ĐÁM ĐÔNG: Bạn đang ở khu vực ồn ào/đông người.
Hãy chuyển sang chế độ NIỆM THẦM (không phát ra tiếng)
để bảo vệ năng lượng của Pháp bảo!
```

---

## Write Path

```
POST /api/content/sutras/start-session
─────────────────────────────────────
Body: {
  sutraId:               string          // e.g., "heart-sutra", "amitabha-shortform"
  backgroundNoiseLevel?: number          // dB value from Microphone API (0-100+)
  isInTransit?:          boolean          // GPS transit detection flag
}

1. Validate sutraId exists & is one of {heart-sutra, amitabha-shortform, ...}.
2. Measure backgroundNoiseLevel via Microphone API (optional — null if permission denied).
3. Detect isInTransit via GPS geofence (optional — null if permission denied).
4. Create SutraSession record:
   {
     userId,
     sutraId,
     backgroundNoiseDetected: backgroundNoiseLevel >= 70 || false,
     transitModeActive:       isInTransit || false,
     sessionStartedAt:        now(),
     sessionId:               uuid()
   }
5. Return {
     sessionToken: jwt_short_lived(sutraId, userId, exp: +4h),
     warningTriggered: boolean,
     warningMessage?: string
   }

FE checks warningTriggered → render yellow flashing border + advisory overlay.
```

---

## Frontend Display

When `warningTriggered == true`, apply:

```tsx
<div className="sutra-reader" style={{
  border: "4px solid #FFD700",
  animation: "flash-yellow 0.6s infinite"
}}>
  {/* Sutra content */}

  {warningTriggered && (
    <div className="advisory-banner" style={{
      backgroundColor: "rgba(255, 193, 7, 0.1)",
      borderLeft: "4px solid #FFC107"
    }}>
      <span>⚠️ CẢNH BÁO ĐÁM ĐÔNG: Bạn đang ở khu vực ồn ào/đông người.</span>
      <span>Hãy chuyển sang chế độ NIỆM THẦM (không phát ra tiếng) để bảo vệ năng lượng của Pháp bảo!</span>
    </div>
  )}
</div>

@keyframes flash-yellow {
  0%, 100% { border-color: #FFD700; box-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
  50% { border-color: transparent; box-shadow: 0 0 2px rgba(255, 215, 0, 0.2); }
}
```

**Silent Mode Toggle:**
```tsx
<button onClick={() => setRecitationMode('silent')}>
  🔇 Chế độ NIỆM THẦM
</button>
```

---

## Schema Notes

```prisma
model SutraSession {
  id                      String    @id @default(cuid())
  userId                  String
  sutraId                 String    // e.g., "heart-sutra"

  backgroundNoiseDetected Boolean   @default(false)
  transitModeActive       Boolean   @default(false)

  sessionStartedAt        DateTime  @default(now())
  sessionEndedAt          DateTime?

  user                    User      @relation(fields: [userId], references: [id])

  @@index([userId, sutraId])
  @@index([sessionStartedAt])
}

// Add to User or SutraSession relation table:
model SutraRecitationMode {
  id                String    @id @default(cuid())
  sessionId         String
  mode              String    @default("normal")  // "normal" | "silent"
  activatedAt       DateTime?

  @@unique([sessionId])
}
```

---

## Scope

| Sutra Type | Applies? |
|---|---|
| Tâm Kinh (Heart Sutra) | ✅ YES |
| Vãng Sanh Chú (Amitabha Shortform) | ✅ YES |
| Đại Từ Bi Chú (Great Compassion Mantra) | ✅ YES |
| Hướng dẫn thường | ❌ NO |
| Bài viết blog | ❌ NO |

Phân biệt qua `sutraId` hoặc `sutra.category` flag.

---

## Microphone + GPS Permissions

**Client-side:**

```typescript
// Microphone Permission
async function requestMicrophoneAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // User granted → measure noise
    measureAudioLevel(stream);
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    // User denied → treat as optional, set backgroundNoiseLevel = null
    console.log("Mic permission denied");
  }
}

// GPS Permission (Geolocation API)
function detectTransitMode() {
  navigator.geolocation.watchPosition(
    (pos) => {
      // Check if lat/lng is inside transit geofence (train, bus, subway areas)
      const isInTransit = checkTransitGeofence(pos.coords);
      return isInTransit;
    },
    (err) => {
      // Location denied → treat as optional, set isInTransit = null
      console.log("Location permission denied");
    }
  );
}

// Fallback: if both permissions denied, send API call with all nulls
// → Backend treats as normal session, no warning
```

---

## Audit

| Action | Trigger |
|---|---|
| `sutra.crowd-silence-warning.shown` | Advisory banner rendered |
| `sutra.transit-mode.activated` | Transit mode detected & warning shown |
| `sutra.crowd-silence-warning.dismissed` | User closes advisory (if UI allows) |
| `sutra.recitation-mode.switched-to-silent` | User clicks "Chế độ NIỆM THẦM" button |
| `sutra.background-noise.measured` | Microphone API called & level recorded |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `sutraId` không tồn tại hoặc không phải sacred sutra | `invalid_sutra_for_guard` | 400 |
| `sutraId` null | `missing_sutra_id` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

**Note:** Microphone/GPS permission errors → logged as warning, not fatal. Session created with `backgroundNoiseDetected: false, transitModeActive: false`.

---

## Notes for AI/codegen

- **Advisory-only:** No hard block. User can continue reading despite warning.
- **Permission-first:** Request Microphone & GPS only when user opens E-Reader for these sutras. Cache permission state.
- **Flashing border:** Use CSS animation, not JS interval (better performance).
- **Session timeout:** SutraSession remains open for 4h (matching JWT exp). Close manually on session end.
- **Phase 1:** Simple noise threshold (70dB) & geofence (transit areas). Phase 2+: ML-based ambient classification (e.g., "crowded cafe" vs "quiet library").
- **Recitation mode toggle:** Once "NIỆM THẦM" enabled, hide audio speaker icon & disable any sound playback for mantras/chants.

---

## Related

- [ereader-hand-hygiene-gate.md](./ereader-hand-hygiene-gate.md) — Pre-reading hygiene confirmation
- [ereader-anti-face-down.md](./ereader-anti-face-down.md) — Device orientation guard
