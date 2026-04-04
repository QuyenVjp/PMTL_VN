# Cổng Địa Chỉ Mộ Phần — Cemetery Geo-Fencing Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc tụng kinh tại khu vực mộ phần, bệnh viện, nhà xác
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tiết Thanh Minh (4/5-4/6 dương lịch) và Rằm Tháng Bảy (7/13-7/15 âm lịch) là hai dịp mở cửa Âm Tính đặc biệt, khi các linh hồn chết đã đó được giải phóng tạm thời. Tại những khu vực này (mộ phần, bệnh viện, nhà xác, thiên đường hỏa táng), khí âm rất nặng.

**Quy tắc tuyệt đối:**
- **Tâm Kinh (Bát Nhã)** tuyệt đối CẤAM (có khí âm quá mạnh, dễ gây nhiểu loạn Tâm Kinh).
- **Vãng Sinh Chú** cấm (liên quan đến đưa linh hồn đi, có thể dẫn đến mở cửa Tây Phương nhầm lẫn).
- **CHỈ CHU ĐẠI BI** được phép (Chú Đại Bi có khí Từ, bảo vệ được toàn bộ năng lượng của người tụng và can thiệp vào khu vực âm).

Hệ thống khoá cứng 2 kinh trên tại những ngày/khu vực này, chỉ cho phép bắt đầu phiên Chú Đại Bi. UI hiển thị cảnh báo đỏ, giải thích lý do.

---

## Owner module

`content` — CemeteryGeoFencingGuard, E-Reader / SutraReader
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người muốn bắt đầu phiên tụng kinh trên điện thoại, cung cấp tọa độ GPS
- `system` — kiểm tra ngày đặc biệt + vị trí địa lý, áp dụng rule lock

---

## Trigger

User gọi `POST /api/content/sutras/start-session` trong ngày Tiết Thanh Minh hoặc Rằm Tháng Bảy, và cung cấp tọa độ GPS nằm trong danh sách geofence mộ phần/bệnh viện/nhà xác.

---

## Special Dates

### Tiết Thanh Minh (Qingming Festival)
- **Dương lịch:** 4/5 - 4/6 (lịch Gregorian)
- **Nhận dạng:** Kiểm tra ngày hiện tại

### Rằm Tháng Bảy (Ghost Month Full Moon)
- **Âm lịch:** 15/7 (Lunar Calendar)
- **Chuyển đổi:** Tính toán từ âm lịch sang dương lịch sử dụng hàm chuyển đổi lịch
- **Cửa sổ:** 7/13 - 7/15 dương lịch (buffer 1 ngày trước/sau để đảm bảo không tính nhầm)

Cả 2 ngày phải được lưu trong `CalendarService.isSpecialCemeteryDate(date: Date): boolean`.

---

## Geofence — Khu Vực Áp Dụng

Danh sách cứng các tọa độ cemetery/hospital/crematorium zone được lưu trong cấu hình:

```typescript
// Ví dụ (phải mở rộng theo địa danh thực tế)
const CEMETERY_GEOFENCES = [
  {
    name: "Linh Thiêu - Thạnh Mỹ Lợi (TP.HCM)",
    center: { lat: 10.7632, lng: 106.7324 },
    radius: 500  // meters
  },
  {
    name: "Bệnh Viện Việt Đức (Hà Nội)",
    center: { lat: 21.0255, lng: 105.8581 },
    radius: 800  // hospital grounds
  },
  {
    name: "Nhà Xác T. Công An (Hà Nội)",
    center: { lat: 21.0120, lng: 105.8520 },
    radius: 600  // morgue grounds
  },
  // ... add more as needed
];

function isInCemeteryGeofence(lat: number, lng: number): boolean {
  return CEMETERY_GEOFENCES.some(zone => {
    const dist = haversineDistance(
      { lat, lng },
      zone.center
    );
    return dist <= zone.radius;
  });
}
```

Lưu trong `packages/shared/config/geofence.config.ts` hoặc `apps/api/src/config/geofence.ts`.

---

## Business Rule

| Điều kiện | Trạng thái Tâm Kinh | Trạng thái Vãng Sinh Chú | Trạng thái Chú Đại Bi |
|---|---|---|---|
| **Ngoài ngày + ngoài khu vực** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| **Trong ngày đặc biệt + ngoài geofence** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| **Ngoài ngày + trong geofence** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép |
| **TRONG ngày + TRONG geofence** | 🚫 **KHOÁ** (400) | 🚫 **KHOÁ** (400) | ✅ **CHỈ KINH NÀY** |

Khi bị khoá, user chỉ có thể bắt đầu phiên Chú Đại Bi.

---

## Write Path

### Endpoint

```
POST /api/content/sutras/start-session
───────────────────────────────────────
Body: {
  suturaType: "tam_kinh" | "vang_sinh_chu" | "chu_dai_bi" | "le_phat",
  coordinates?: {
    lat: number,    // 0 = không cung cấp GPS
    lng: number
  }
}

Response (Success):
{
  sessionId: string,
  sutraType: string,
  cemeteryGeofenceDetected: boolean,
  cemeteryMessage?: string  // Red alert nếu detected = true
}

Response (Locked):
{
  error: "cemetery_geofence_sutra_lock",
  code: 400,
  message: "CẢNH BÁO ÂM KHÍ: Bạn đang ở khu vực mộ phần/bệnh viện. Hãy liên tục tụng Chú Đại Bi để hộ thân bảo vệ năng lượng, tuyệt đối không niệm Tâm Kinh tại đây!",
  allowedSutra: "chu_dai_bi",
  cemeteryGeofenceDetected: true,
  specialDate: "qingming" | "ghost_month"
}
```

### Logic

```typescript
async startSutraSession(dto: StartSutraSessionDto, userId: string) {
  const { suturaType, coordinates } = dto;

  // 1. Kiểm tra ngày đặc biệt
  const today = new Date();
  const isSpecialDate = CalendarService.isSpecialCemeteryDate(today);

  // 2. Kiểm tra geofence (nếu có coordinates)
  let isInGeofence = false;
  let geofenceName = null;
  if (coordinates && coordinates.lat && coordinates.lng) {
    const result = this.geofenceService.findNearestCemetery(
      coordinates.lat,
      coordinates.lng
    );
    isInGeofence = result !== null;
    geofenceName = result?.name;
  }

  // 3. Kiểm tra lock condition
  const shouldLock = isSpecialDate && isInGeofence &&
                     (suturaType === "tam_kinh" || suturaType === "vang_sinh_chu");

  if (shouldLock) {
    // Audit trước khi throw
    await this.auditService.log({
      action: "content.cemetery-geofence.blocked",
      userId,
      metadata: {
        attemptedSutra: suturaType,
        geofence: geofenceName,
        specialDate: CalendarService.getSpecialDateName(today),
        coordinates
      }
    });

    throw new HttpException(
      {
        error: "cemetery_geofence_sutra_lock",
        message: "CẢNH BÁO ÂM KHÍ: Bạn đang ở khu vực mộ phần/bệnh viện. Hãy liên tục tụng Chú Đại Bi để hộ thân bảo vệ năng lượng, tuyệt đối không niệm Tâm Kinh tại đây!",
        allowedSutra: "chu_dai_bi",
        cemeteryGeofenceDetected: true,
        geofence: geofenceName,
        specialDate: CalendarService.getSpecialDateName(today)
      },
      HttpStatus.BAD_REQUEST
    );
  }

  // 4. Tạo session thông thường
  const session = await this.sutraSessionService.create({
    userId,
    suturaType,
    startedAt: new Date(),
    cemeteryDetectedAt: isInGeofence ? new Date() : null,
    specialDateGeofenceCheckAt: isSpecialDate && isInGeofence ? new Date() : null,
    geofenceZone: geofenceName || null,
    coordinates
  });

  // 5. Audit successful start
  await this.auditService.log({
    action: isInGeofence && isSpecialDate
      ? "content.cemetery-geofence.dai-bi-allowed"
      : "content.sutra.session-started",
    userId,
    metadata: {
      sessionId: session.id,
      sutraType,
      cemeteryDetected: isInGeofence
    }
  });

  return {
    sessionId: session.id,
    sutraType,
    cemeteryGeofenceDetected: isInGeofence && isSpecialDate,
    cemeteryMessage: isInGeofence && isSpecialDate
      ? "CẢNH BÁO ÂM KHÍ: Bạn đang ở khu vực mộ phần/bệnh viện. Hãy liên tục tụng Chú Đại Bi để hộ thân bảo vệ năng lượng."
      : null
  };
}
```

---

## Red Alert Banner (FE)

Khi `cemeteryGeofenceDetected = true`:

```
┌──────────────────────────────────────────────────┐
│ 🚨 CẢNH BÁO ÂM KHÍ                              │
│                                                  │
│ Bạn đang ở khu vực mộ phần/bệnh viện.           │
│                                                  │
│ Hãy liên tục tụng Chú Đại Bi để hộ thân         │
│ bảo vệ năng lượng, tuyệt đối không niệm          │
│ Tâm Kinh tại đây!                               │
│                                                  │
│ 📿 Chỉ Chú Đại Bi được phép trong khu vực này.  │
│                                                  │
│ [Bắt đầu tụng Chú Đại Bi]                       │
└──────────────────────────────────────────────────┘
```

- Banner **màu đỏ** (`bg-red-100`, `text-red-900`, `border-red-500`)
- **Pin at top**, không thể dismiss
- Button dẫn trực tiếp tới Chú Đại Bi session

---

## Schema Changes

```prisma
model SutraSession {
  id                              String    @id @default(cuid())
  userId                          String
  suturaType                      String    // "tam_kinh" | "vang_sinh_chu" | "chu_dai_bi" | "le_phat"
  startedAt                       DateTime  @default(now())
  endedAt                         DateTime?

  // Cemetery geofence fields
  cemeteryDetectedAt              DateTime?  // set nếu user detected in cemetery zone
  specialDateGeofenceCheckAt      DateTime?  // set nếu ngày đặc biệt + geofence
  geofenceZone                    String?    // name của cemetery zone (e.g., "Linh Thiêu - Thạnh Mỹ Lợi")

  // GPS coordinates (audit trail)
  latitude                        Float?
  longitude                       Float?

  user                            User      @relation(fields: [userId], references: [id])

  @@index([userId, startedAt])
  @@index([cemeteryDetectedAt])
}
```

---

## Audit

| Action | Trigger | Details |
|---|---|---|
| `content.cemetery-geofence.detected` | User bắt đầu session trong geofence + ngày đặc biệt | userId, geofence name, date type |
| `content.cemetery-geofence.dai-bi-allowed` | User bắt đầu session Chú Đại Bi trong geofence | userId, sessionId, geofence name |
| `content.cemetery-geofence.tam-kinh-blocked` | User cố niệm Tâm Kinh bị khoá | userId, geofence name, date type, coordinates |
| `content.cemetery-geofence.vang-sinh-blocked` | User cố niệm Vãng Sinh Chú bị khoá | userId, geofence name, date type, coordinates |

---

## Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| `suturaType` = `tam_kinh` \| `vang_sinh_chu` + ngày đặc biệt + geofence | `cemetery_geofence_sutra_lock` | 400 | Cảnh báo âm khí (như trên) |
| Coordinates không hợp lệ (NaN, out of bounds) | `invalid_location_coordinates` | 400 | "Tọa độ GPS không hợp lệ. Vui lòng kiểm tra lại." |
| `sutraType` không tồn tại | `invalid_sutra_type` | 400 | "Loại kinh không được hỗ trợ." |
| User chưa đăng nhập | `unauthorized` | 401 | "Cần đăng nhập để bắt đầu phiên tụng kinh." |

---

## Geofence Validation

```typescript
function validateCoordinates(lat?: number, lng?: number): {
  valid: boolean,
  error?: string
} {
  if (!lat || !lng) return { valid: true }; // Optional coords

  if (typeof lat !== "number" || typeof lng !== "number") {
    return { valid: false, error: "Tọa độ phải là số." };
  }

  if (lat < -90 || lat > 90) {
    return { valid: false, error: "Vĩ độ phải nằm trong [-90, 90]." };
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, error: "Kinh độ phải nằm trong [-180, 180]." };
  }

  return { valid: true };
}
```

---

## Notes for AI/codegen

1. **Geofence check phải server-side** — không tin coordinates từ client (có thể giả mạo). Chuẩn bị sẵn GPS từ device OS (iOS/Android geolocation API).

2. **Calendar conversion âm/dương lịch** — sử dụng thư viện `lunar-calendar` hoặc equivalent đã được verify. Không hardcode.

3. **Audit các lần cố gắng block** — giúp product team hiểu user behavior tại những khu vực này.

4. **FE caching**:
   - `sessionStorage` chứa flag `cemeteryGeofenceAlert_{sessionId}` để không hiện banner lặp.
   - Nếu user start new session → reset flag, hiện lại banner.

5. **Red alert banner**: Không có nút "Đóng" hay "Bỏ qua" — phải focus on Chú Đại Bi.

6. **Migration timing**: Thêm `cemeteryDetectedAt`, `specialDateGeofenceCheckAt`, `geofenceZone`, `latitude`, `longitude` vào `SutraSession` model trước khi deploy.

7. **Testing**: Mock `CalendarService.isSpecialCemeteryDate()` để test cả 2 ngày đặc biệt; mock `GeofenceService` để test các vị trí khác nhau.

---

## Related

- [ereader-hand-hygiene-gate.md](./ereader-hand-hygiene-gate.md) — Pre-reading hygiene checklist
- [advanced-recitation-time-exceptions.md](./advanced-recitation-time-exceptions.md) — Time gates cho Tiểu Phương Tử
- [great-compassion-water-rules.md](./great-compassion-water-rules.md) — Chú Đại Bi + nước lọc quy tắc
