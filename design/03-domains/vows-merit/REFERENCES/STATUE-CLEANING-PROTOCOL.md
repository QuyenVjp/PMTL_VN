# STATUE-CLEANING-PROTOCOL

## Owner
- `vows-merit` (altar maintenance domain)

## Purpose
Giao thức vệ sinh tôn tượng (Statue Cleaning Protocol) - Không được tùy tiện chạm vào tượng Bồ Tát.

---

## Business Rule: Statue Cleaning Restrictions

### Rule 1 - Only Clean When Dusty
**Nghiệp vụ:**
- Chỉ được lau chùi tượng khi **có nhiều bụi**.
- Không được tùy tiện chạm vào tượng để "kiểm tra" hoặc "sắp xếp lại".

### Rule 2 - Daytime Only
**Nghiệp vụ:**
- Bắt buộc phải lau vào **ban ngày** (sau khi mặt trời mọc, trước khi mặt trời lặn).
- **Tuyệt đối KHÔNG lau vào ban đêm** (sau khi trời tối).

### Rule 3 - Use New Dry Cloth
**Nghiệp vụ:**
- Dùng **khăn khô mới tinh** (new piece of dry cloth).
- **KHÔNG dùng** khăn ướt, khăn cũ, hoặc khăn đã lau đồ khác.

### Rule 4 - Recite Heart Sutra While Cleaning
**Nghiệp vụ:**
- Phải **vừa lau vừa niệm Tâm Kinh** (Heart Sutra).
- **Mục đích:** Giữ tâm tôn kính, tránh tâm phân tán.

---

## UX Flow

### Flow: Initiate Statue Cleaning
```
User bấm [Vệ sinh Phật đài]
  ↓
Check: Local time of user
  ↓ If after sunset → BLOCK
  ↓   Show error: "Chỉ được lau tượng vào ban ngày"
  ↓   Disable button
  ↓
If daytime → Show StatueCleaningChecklist
  ↓
Pre-cleaning Checklist:
  [ ] Tượng có nhiều bụi (cần lau)
  [ ] Đã chuẩn bị khăn khô mới
  [ ] Đã rửa tay sạch
  ↓
[Bắt đầu lau] → Auto-start Heart Sutra audio (loop)
  ↓
During cleaning:
  • Play Heart Sutra audio (background loop)
  • Show instructions: "Vừa lau nhẹ nhàng, vừa niệm Tâm Kinh"
  ↓
User bấm [Hoàn tất]
  ↓
Post-cleaning:
  • Stop audio
  • Log AltarLog with actionType = STATUE_CLEANING
  ↓
Toast: "Đã hoàn thành vệ sinh Phật đài"
```

---

## Time Validation Logic

### Daytime Detection
```typescript
function isDaytime(userTimezone: string): boolean {
  const now = DateTime.now().setZone(userTimezone);
  const sunrise = now.set({ hour: 6, minute: 0 }); // Approx sunrise
  const sunset = now.set({ hour: 18, minute: 0 }); // Approx sunset

  return now >= sunrise && now < sunset;
}
```

**Better:** Integrate sunrise/sunset API based on user's geolocation.

---

## Schema Hints

### Extend AltarActionType enum:
```prisma
enum AltarActionType {
  INCENSE
  MAINTENANCE
  MOVE
  RELOCATION
  HEART_INCENSE
  TRAVEL_MODE_START
  TRAVEL_MODE_END
  STATUE_CLEANING  // NEW
}
```

### Table: StatueCleaningEvent
```prisma
model StatueCleaningEvent {
  id                String    @id @default(cuid())
  publicId          String    @unique @map("public_id")
  userId            String    @map("user_id")
  cleanedAt         DateTime  @map("cleaned_at")
  usedNewDryCloth   Boolean   @map("used_new_dry_cloth")
  recitedHeartSutra Boolean   @map("recited_heart_sutra")
  note              String?
  createdAt         DateTime  @default(now()) @map("created_at")

  user User @relation("statueCleaningEvents", fields: [userId], references: [id])

  @@index([userId])
  @@map("statue_cleaning_events")
}
```

---

## Service Logic

### StatueCleaningService (NestJS)
```typescript
export class StatueCleaningService {
  async validateCleaningTime(userTimezone: string): Promise<boolean> {
    const now = DateTime.now().setZone(userTimezone);
    const sunrise = now.set({ hour: 6, minute: 0 });
    const sunset = now.set({ hour: 18, minute: 0 });

    const isDaytime = now >= sunrise && now < sunset;

    if (!isDaytime) {
      throw new BadRequestException(
        'Statue cleaning is only allowed during daytime (6 AM - 6 PM)'
      );
    }

    return true;
  }

  async createCleaningEvent(
    userId: string,
    dto: {
      usedNewDryCloth: boolean;
      recitedHeartSutra: boolean;
      note?: string;
    }
  ) {
    // Validate
    if (!dto.usedNewDryCloth) {
      throw new BadRequestException('Must use new dry cloth');
    }

    if (!dto.recitedHeartSutra) {
      throw new BadRequestException('Must recite Heart Sutra while cleaning');
    }

    // Create event
    return this.prisma.statueCleaningEvent.create({
      data: {
        userId,
        cleanedAt: new Date(),
        usedNewDryCloth: dto.usedNewDryCloth,
        recitedHeartSutra: dto.recitedHeartSutra,
        note: dto.note,
      },
    });
  }
}
```

---

## UI Components

### 1. StatueCleaningButton (Conditional)
```typescript
// Frontend logic
const isDaytime = checkDaytime(userTimezone);

<Button
  disabled={!isDaytime}
  onClick={() => startCleaning()}
>
  {isDaytime ? 'Vệ sinh Phật đài' : 'Chỉ lau vào ban ngày'}
</Button>

{!isDaytime && (
  <Text color="red">
    ⚠️ Chỉ được lau tượng vào ban ngày (6h sáng - 6h chiều)
  </Text>
)}
```

### 2. StatueCleaningChecklist
```
┌────────────────────────────────────────────┐
│  🧹 Vệ sinh Phật đài                      │
├────────────────────────────────────────────┤
│  Trước khi bắt đầu:                       │
│                                            │
│  [✓] Tượng có nhiều bụi                   │
│  [✓] Đã chuẩn bị khăn khô mới             │
│  [✓] Đã rửa tay sạch                      │
│                                            │
│  Lưu ý:                                   │
│  • Chỉ dùng khăn khô, KHÔNG dùng nước     │
│  • Vừa lau vừa niệm Tâm Kinh              │
│                                            │
│  [Hủy]              [Bắt đầu lau]         │
└────────────────────────────────────────────┘
```

### 3. CleaningInProgressWidget
```
┌────────────────────────────────────────────┐
│  🧹 Đang vệ sinh Phật đài                 │
├────────────────────────────────────────────┤
│  🎵 Tâm Kinh đang phát...                 │
│  [▶️ Pause] [🔄 Restart]                   │
│                                            │
│  Hướng dẫn:                               │
│  • Lau nhẹ nhàng từ trên xuống            │
│  • Vừa lau vừa niệm Tâm Kinh              │
│  • Giữ tâm tôn kính                       │
│                                            │
│  [Hoàn tất]                               │
└────────────────────────────────────────────┘
```

---

## Audio Integration

### Auto-play Heart Sutra
```typescript
// Frontend
const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

function startCleaning() {
  const audio = new Audio('/assets/audio/heart-sutra-loop.mp3');
  audio.loop = true;
  audio.play();
  setAudioPlayer(audio);
}

function finishCleaning() {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  // Submit event to backend
}
```

---

## Warning Messages

### Nighttime Block
```
┌────────────────────────────────────────────┐
│  🌙 Không thể lau tượng vào ban đêm       │
├────────────────────────────────────────────┤
│  Hiện tại là 20:30 (sau khi mặt trời lặn) │
│                                            │
│  Bạn chỉ có thể vệ sinh Phật đài vào:     │
│  • Từ 6h sáng đến 6h chiều                │
│  • Khi trời còn sáng                      │
│                                            │
│  [Đóng]                                   │
└────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`
- `design/03-domains/vows-merit/REFERENCES/ALTAR-MAINTENANCE-CHECKLIST.md`
- External source: Wenda Q&A về vệ sinh tượng Bồ Tát

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 3
