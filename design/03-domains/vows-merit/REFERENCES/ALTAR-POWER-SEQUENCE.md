# ALTAR-POWER-SEQUENCE

## Owner
- `vows-merit` (altar maintenance domain)

## Purpose
Quy định **trình tự bật/tắt thiết bị điện và lửa** khi dâng hương và kết thúc hương. Đây là giao thức vận hành Phật đài để tránh thu hút linh tính.

---

## Business Rule: Power On/Off Sequence

### Rule - Incense Session State Machine
**Nghiệp vụ:**
Đèn sen điện (Electric Lotus Lamps) **tuyệt đối KHÔNG được bật 24/24** nếu không có hương cháy, vì sẽ thu hút linh tính vào nhà.

Quy trình dâng hương và tắt hương phải tuân thủ **đúng thứ tự vật lý**:

---

## START Sequence (Dâng Hương)

### Bước 1: Bật đèn sen điện (Electric Lotus Lamp)
- Bật công tắc đèn sen điện trước.
- **Mục đích:** Tạo trường ánh sáng trước khi châm lửa.

### Bước 2: Châm đèn dầu (Oil Lamp)
- Dùng que diêm hoặc bật lửa gas châm đèn dầu.
- **Mục đích:** Tạo nguồn lửa thánh để mồi hương.

### Bước 3: Mồi lửa hương từ đèn dầu
- Dùng đèn dầu để châm hương.
- **Tuyệt đối KHÔNG dùng bật lửa gas hoặc que diêm châm hương trực tiếp**.

---

## END Sequence (Kết Thúc Hương)

### Bước 1: Dùng nắp đậy tắt đèn dầu
- **KHÔNG thổi** (sẽ bất kính).
- Dùng nắp đèn dầu đậy lại để tắt lửa.

### Bước 2: Tắt đèn sen điện
- Tắt công tắc đèn sen điện.
- **Mục đích:** Không để đèn điện bật khi không có hương.

---

## State Machine

### States
```
IDLE → STARTING → BURNING → ENDING → IDLE
```

### Transition Rules

**IDLE → STARTING:**
- Trigger: User bấm `[Bắt đầu dâng hương]`
- Required steps (in order):
  1. `electricLotusLamp = ON`
  2. `oilLamp = ON`
  3. `incense = ON`
- Validation: Tất cả 3 bước phải tick theo thứ tự.

**BURNING → ENDING:**
- Trigger: Hương sắp tàn (Timer notification hoặc user bấm `[Kết thúc hương]`)
- Required steps (in order):
  1. `oilLamp = OFF` (dùng nắp đậy)
  2. `electricLotusLamp = OFF`

**ENDING → IDLE:**
- Auto-complete sau khi tắt hết.

---

## UX Flow

### Flow: Start Incense Session
```
User bấm [Bắt đầu dâng hương]
  ↓
Show IncenseStartChecklist (Step-by-step)
  ↓
Step 1/3: "Bật đèn sen điện"
  [✓] Đã bật
  ↓
Step 2/3: "Châm đèn dầu"
  [✓] Đã châm
  ↓
Step 3/3: "Mồi lửa hương từ đèn dầu"
  [✓] Đã mồi
  ↓
[Hoàn tất] → Set state = BURNING
  ↓
Start timer (default: 30 minutes)
```

### Flow: End Incense Session
```
Timer hết hoặc User bấm [Kết thúc hương]
  ↓
Show IncenseEndChecklist
  ↓
Step 1/2: "Dùng nắp đậy tắt đèn dầu"
  ⚠️ Không thổi!
  [✓] Đã tắt
  ↓
Step 2/2: "Tắt đèn sen điện"
  [✓] Đã tắt
  ↓
[Hoàn tất] → Set state = IDLE
```

---

## Schema Hints

### Enum: IncenseSessionState
```prisma
enum IncenseSessionState {
  IDLE
  STARTING
  BURNING
  ENDING
}
```

### Table: IncenseSession
```prisma
model IncenseSession {
  id                    String               @id @default(cuid())
  publicId              String               @unique @map("public_id")
  userId                String               @map("user_id")
  state                 IncenseSessionState  @default(IDLE)
  startedAt             DateTime?            @map("started_at")
  endedAt               DateTime?            @map("ended_at")
  electricLampOn        Boolean              @default(false) @map("electric_lamp_on")
  oilLampOn             Boolean              @default(false) @map("oil_lamp_on")
  incenseOn             Boolean              @default(false) @map("incense_on")
  durationMinutes       Int                  @default(30) @map("duration_minutes")
  createdAt             DateTime             @default(now()) @map("created_at")
  updatedAt             DateTime             @updatedAt @map("updated_at")

  user User @relation("incenseSessions", fields: [userId], references: [id])

  @@index([userId])
  @@index([state])
  @@map("incense_sessions")
}
```

---

## Service Logic

### IncenseSessionService (NestJS)
```typescript
export class IncenseSessionService {
  async startSession(userId: string): Promise<IncenseSession> {
    // Create new session in STARTING state
    return this.prisma.incenseSession.create({
      data: {
        userId,
        state: 'STARTING',
        startedAt: new Date(),
      },
    });
  }

  async completeStartSequence(
    sessionId: string,
    dto: {
      electricLampOn: boolean;
      oilLampOn: boolean;
      incenseOn: boolean;
    }
  ) {
    // Validate all steps completed
    if (!dto.electricLampOn || !dto.oilLampOn || !dto.incenseOn) {
      throw new BadRequestException('All steps must be completed in order');
    }

    return this.prisma.incenseSession.update({
      where: { id: sessionId },
      data: {
        state: 'BURNING',
        electricLampOn: true,
        oilLampOn: true,
        incenseOn: true,
      },
    });
  }

  async endSession(sessionId: string): Promise<IncenseSession> {
    return this.prisma.incenseSession.update({
      where: { id: sessionId },
      data: {
        state: 'ENDING',
      },
    });
  }

  async completeEndSequence(
    sessionId: string,
    dto: {
      oilLampOff: boolean;
      electricLampOff: boolean;
    }
  ) {
    if (!dto.oilLampOff || !dto.electricLampOff) {
      throw new BadRequestException('All steps must be completed in order');
    }

    return this.prisma.incenseSession.update({
      where: { id: sessionId },
      data: {
        state: 'IDLE',
        endedAt: new Date(),
        electricLampOn: false,
        oilLampOn: false,
        incenseOn: false,
      },
    });
  }
}
```

---

## UI Components

### 1. IncenseStartChecklist
```
┌────────────────────────────────────────────┐
│  🕯️ Bắt đầu dâng hương                    │
├────────────────────────────────────────────┤
│  Làm theo đúng thứ tự:                    │
│                                            │
│  ●━━○━━○  (Bước 1/3)                      │
│                                            │
│  1️⃣ Bật đèn sen điện                      │
│  [✓] Đã bật                                │
│                                            │
│  [Tiếp theo] →                             │
└────────────────────────────────────────────┘
```

(Step 2/3, 3/3 tương tự)

### 2. IncenseEndChecklist
```
┌────────────────────────────────────────────┐
│  🕯️ Kết thúc hương                        │
├────────────────────────────────────────────┤
│  Làm theo đúng thứ tự:                    │
│                                            │
│  ●━━○  (Bước 1/2)                         │
│                                            │
│  1️⃣ Dùng nắp đậy tắt đèn dầu              │
│  ⚠️ KHÔNG THỔI                            │
│  [✓] Đã tắt                                │
│                                            │
│  [Tiếp theo] →                             │
└────────────────────────────────────────────┘
```

### 3. BurningStateWidget (Dashboard)
```
┌────────────────────────────────────────────┐
│  🔥 Đang dâng hương                       │
├────────────────────────────────────────────┤
│  Bắt đầu: 10:30                           │
│  Thời gian: 15/30 phút                    │
│  ▓▓▓▓▓░░░░░ 50%                           │
│                                            │
│  💡 Còn 15 phút                           │
│                                            │
│  [Kết thúc sớm]                           │
└────────────────────────────────────────────┘
```

---

## Warning Messages

### Cảnh báo khi đèn điện bật lâu
```
⚠️ CẢNH BÁO:
Đèn sen điện không nên bật quá 2 giờ
khi không có hương cháy.
Điều này sẽ thu hút linh tính.

Bạn có muốn tắt đèn ngay không?
[Tắt đèn]  [Để sau]
```

---

## References
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`
- `design/03-domains/vows-merit/REFERENCES/ALTAR-MAINTENANCE-CHECKLIST.md`
- External source: Wenda Q&A về trình tự thắp hương, tắt đèn dầu

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 7 Logic 1
