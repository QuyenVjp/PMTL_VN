# ENVIRONMENT-CROWD-SENSOR

## Owner
- `content` (E-Reader)

## Purpose
Biến số Thời tiết và Đám đông (Environment & Crowd Sensor)

---

## Business Rule

### Rule - Geolocation + Speed Detection → Volume Warning
**Nghiệp vụ:**
- Ở **nông thôn hẻo lánh** (countryside/rural): Từ trường phức tạp
- Trên **xe ô tô** (in vehicle, speed > 15km/h): Năng lượng không ổn định
- Ở **chỗ đám đông** (crowded area): Nhiều từ trường lẫn lộn
- → Phải **niệm nhỏ tiếng lại** để bảo vệ bản thân

---

## UX Flow

```
User mở E-Reader
  ↓
Request GPS permission (one-time)
  ↓
Detect:
  - Speed > 15km/h (In vehicle)
  - Population density < threshold (Rural)
  - Event API: Large gathering nearby (Crowded)
  ↓
If detected:
  Push Warning:
    "⚠️ BẠN ĐANG Ở NGOÀI ĐƯỜNG/TRÊN XE
     Từ trường phức tạp. Hãy niệm kinh
     NHỎ TIẾNG LẠI để bảo vệ bản thân."
```

---

## Schema Hints

```prisma
model ReadingEnvironmentLog {
  id              String   @id
  userId          String
  loggedAt        DateTime
  locationType    String   // VEHICLE, RURAL, CROWDED, HOME, OTHER
  speed           Float?   // km/h
  latitude        Float?
  longitude       Float?
  warningIssued   Boolean  @default(false)
  createdAt       DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  @@map("reading_environment_logs")
}
```

---

## Service Logic

```typescript
export class ReadingEnvironmentService {
  async checkEnvironment(
    userId: string,
    location: { lat: number; lng: number; speed: number }
  ): Promise<{ shouldWarn: boolean; message: string | null }> {
    // Check speed (vehicle)
    if (location.speed > 15) {
      await this.logEnvironment(userId, 'VEHICLE', location);
      return {
        shouldWarn: true,
        message: 'Bạn đang trên xe. Từ trường phức tạp. Hãy niệm kinh NHỎ TIẾNG LẠI để bảo vệ bản thân.',
      };
    }

    // Check rural (simplified - can use reverse geocoding)
    const isRural = await this.checkRuralArea(location.lat, location.lng);
    if (isRural) {
      await this.logEnvironment(userId, 'RURAL', location);
      return {
        shouldWarn: true,
        message: 'Bạn đang ở khu vực nông thôn. Từ trường phức tạp. Hãy niệm kinh NHỎ TIẾNG LẠI.',
      };
    }

    return { shouldWarn: false, message: null };
  }

  private async checkRuralArea(lat: number, lng: number): Promise<boolean> {
    // Implement via Google Maps API or similar
    // Check population density or place type
    return false; // Placeholder
  }
}
```

---

## UI Components

### Environment Warning (Push Notification)
```
┌────────────────────────────────────────────┐
│  ⚠️ CẢNH BÁO: Từ trường phức tạp          │
├────────────────────────────────────────────┤
│  Bạn đang ở trên xe/ngoài đường.          │
│                                            │
│  Từ trường phức tạp, năng lượng không     │
│  ổn định.                                  │
│                                            │
│  Hãy niệm kinh NHỎ TIẾNG LẠI để bảo vệ   │
│  bản thân.                                 │
│                                            │
│  [Tôi đã hiểu]                            │
└────────────────────────────────────────────┘
```

---

## References
- External source: Wenda Q&A về niệm kinh ở nơi phức tạp

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 9
