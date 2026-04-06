# Ngôi Nhà Nhỏ — Quy Tắc Trì Tụng — Little House: Recitation Practice Guidelines

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

Reciting Little House (Ngôi Nhà Nhỏ) mantras properly requires strict adherence to foundational practices, time/location restrictions, quality standards, and prayer intentions. The system guides practitioners to:
1. Establish **foundation mantras** (Compassion Mantra, Heart Sutra, etc.) before attempting Little House
2. **Respect time and location boundaries** to maintain energy integrity
3. **Maintain recitation quality** through proper pronunciation, complete verses, no skipping
4. **Handle interruptions correctly** to avoid energy loss and re-chanting requirements
5. **Match prayer intention** to the specific type of Little House being recited

This ensures Little House carries full spiritual power and achieves intended results (resolving karma, helping spirits, clearing obstacles).

## Owner Module

`wisdom-qa` — LittleHouseRecitationService / MantraQualityGuard

## Actors

- **Practitioner**: Recites Little House mantras, manages interruptions, respects boundaries
- **System**: Validates prerequisites, warns about time/location violations, tracks interruptions, guides recovery
- **Wisdom Archive**: Records recitation sessions, quality metrics, completion status

## Trigger

1. User begins Little House recitation session (after creating/printing a sheet)
2. System validates foundation mantra completion
3. User reports interruption during recitation
4. User needs guidance on prayer intention (different for spirits vs. health vs. debt repayment)

## Business Rules

### Part A: Prerequisites & Foundations

| Rule ID | Vietnamese | English | Severity |
|---------|-----------|---------|----------|
| FOUND_001 | Phải hoàn thành công khóa căn bản trước | Must complete foundation daily task first | BLOCK |
| FOUND_002 | Công khóa = Chú Đại Bi + Tâm Kinh + Lễ Phật tối thiểu | Foundation = minimum daily Compassion/Heart/Repentance mantras | BLOCK |
| FOUND_003 | Phải bảo đảm Ngôi Nhà Nhỏ của mình trước, rồi mới giúp người khác | Secure own Little House quota first before helping others | MEDIUM |
| FOUND_004 | Kinh văn công khóa ≠ kinh văn Ngôi Nhà Nhỏ (không tính chung) | Foundation mantras ≠ Little House mantras (keep separate) | HIGH |
| FOUND_005 | Người bình thường đều có thể niệm Ngôi Nhà Nhỏ | Any practitioner can recite Little House after foundations | REFERENCE |

### Part B: Time & Location Restrictions

#### Timing Rules (By Mantra Type)

| Mantra Type | Valid Hours | Valid Conditions | Invalid Conditions |
|-------------|------------|-----------------|------------------|
| **Chú Đại Bi** (Compassion Mantra) | 5:00 AM – 12:00 AM (midnight) | Any weather, day/night OK (after 5 AM) | During thunder/lightning only Compassion allowed |
| **Tâm Kinh** (Heart Sutra) | Daytime – before 10 PM | Good weather | Nighttime after 10 PM, isolated/crowded noisy places, cemeteries, crematories |
| **Vãng Sanh Chú** (Pure Land Mantra) | Daytime – before 10 PM | Good weather | Nighttime after 10 PM, isolated areas, crowded noisy places |
| **Chân Ngôn Diệt Tội Bảy Đức Phật** (Seven Buddha Repentance) | Daytime – before 12 PM | Good weather | Nighttime, rain/heavy wind/lightning |

#### Location Rules

| Location | Permitted? | Notes |
|----------|-----------|-------|
| Quiet room indoors | ✅ Yes | Ideal; minimize interruptions |
| Kitchen (while cooking meat) | ❌ No | Polluted environment |
| Bathroom / toilet | ❌ No | Unclean space |
| Hospital (patient reciting) | ⚠️ Conditional | Only Compassion Mantra; Heart Sutra/Pure Land only daytime before 10 PM |
| Hospital (healthy visitor) | ✅ Daytime | Same restrictions as hospital patient |
| Crematory / cemetery | ❌ No | Spiritually incompatible |
| Isolated/desolate place | ❌ No (nighttime) | ✅ Daytime only |
| Noisy crowded place | ⚠️ Conditional | Daytime only; avoid loud/disturbing |
| Vehicle in transit | ⚠️ Conditional | Acceptable if quiet; Heart Sutra/Pure Land not recommended |
| Thunderstorm/lightning | ❌ No (except Compassion) | Only Compassion Mantra permitted |
| Heavy rain/wind | ⚠️ Conditional | Not ideal; dark/yin energy suppresses merit |

### Part C: Recitation Quality Standards

| Standard | Requirement | Consequence if Violated |
|----------|-------------|------------------------|
| **Full title every repetition** | Each Compassion Mantra = recite "Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni" before mantra text | Repetition doesn't count; must re-do |
| **No missing verses** | Heart Sutra, Pure Land Mantra — must recite complete text, no skipping lines | Missing verses = mantra ineffective; may backfire (反作用) |
| **Pronunciation accuracy** | Chant with correct tone/accent per original Sanskrit/Chinese | Minor mispronunciations OK; major errors require 3–7 "Bổ Khuyết Chân Ngôn" (補闕真言) corrections |
| **Intentional focus** | Sincere heart (thành tâm) — cannot be rushed, distracted, or rote | Low-quality recitation = reduced merit, possible negative effects |
| **No foam at mouth** | If reciting so hard mouth foams, you're over-exerting (quá sức) | Stop immediately; rest; risk of health damage |
| **Stop if physical discomfort** | If headache, dizziness, or body pain occurs mid-recitation | Pause; recite Compassion Mantra to restore energy; continue only if improved |

### Part D: Handling Interruptions

| Interruption Type | Duration | Recovery Action | Re-chant Required? |
|------------------|----------|-----------------|-------------------|
| Brief distraction (phone, knock) | < 30 seconds | Recite "Ông lai mẫm sô ha" (Om Ah Hum) 1 time, continue | No |
| Moderate interruption | 30 seconds – 2 hours | Recite "Ông lai mẫm sô ha" 1 time after interruption ends; can continue from where stopped | No (if same mantra) |
| Long interruption | > 2 hours (longer than one "time period" / 時辰) | Must restart entire mantra from beginning | Yes |
| Short mantra interrupted | Mid-Heart Sutra (short text) | Must restart entire sutra | Yes |
| External compulsion | Forced stop (emergency, etc.) | No penalty; just resume when able | No (force majeure) |

**Recovery Mantra Rules:**
- After resuming from interruption, always recite "Ông lai mẫm sô ha" (Om Ah Hum Svaha) once
- If interruption ≥ 2 hours, full re-chant from beginning mandatory
- If reciting Heart Sutra and interrupted ≥ 30 seconds, safer to restart the entire sutra

### Part E: Prayer Intentions (By Little House Type)

| Little House Type | Prayer Format | Example | Merit Focus |
|------------------|---------------|---------|----|
| **For living person's spirit creditor** | "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX (practitioner name), giúp con đem Ngôi Nhà Nhỏ này gửi cho YYY (spirit creditor name / description)" | "Người cần kinh của con" / "Thai nhi bị sảy / phá bỏ của con" | Clear debts, prevent haunting |
| **For deceased person** | "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX, giúp con đem Ngôi Nhà Nhỏ này gửi cho YYY (deceased's full name)" | "(Tên người mất)" | Guide deceased to better realm |
| **For resolving bad karma/enmity** | "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX và YYY (other person), hóa giải ác duyên" | Conflict between practitioner and family/friend | Dissolve karmic ties, restore harmony |
| **Reserve supply (Dự Trữ)** | "Xin Quán Thế Âm Bồ Tát đại từ đại bi chứng giám cho con XXX đã niệm các kinh văn trên Ngôi Nhà Nhỏ (list sutras), để dự phòng khi cần" | For future use; no specific recipient | Store merit for emergency use |
| **Proxy release on behalf of self** | Include own name: "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX, niệm Ngôi Nhà Nhỏ này cho con" | Self-healing, self-debt repayment | Personal karma clearing |

**Critical Rule:**
> **NEVER pray like daily foundation** (never say "为了自己" — "for myself" as primary beneficiary during Little House). Prayer must **always name the recipient spirit or person**, not the reciter (except in reserve supply or proxy-for-self cases).

---

## Input Contract (TypeScript DTOs)

```typescript
interface LittleHouseRecitationSessionDto {
  practitionerId: string;
  sheetId: string;

  // Foundation check
  foundationMantraStatus: {
    compassionMantraDaily: number;      // count completed today
    heartSutraDaily: number;             // count completed today
    repentanceMantraDaily: number;       // Lễ Phật count today
  };
  foundationComplete: boolean;           // all minimums met?

  // Session context
  recitationTime: Date;
  location: string;
  weather?: 'clear' | 'rainy' | 'stormy';
  timeOfDay: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';

  // Mantra being recited
  mantraType: 'compassion' | 'heart_sutra' | 'pure_land' | 'seven_buddha_repentance';
  repetitionsPlanned: number;

  // Prayer intention
  prayerIntention: 'spirit_creditor' | 'deceased' | 'resolve_enmity' | 'reserve_supply' | 'self_healing';
  recipientName?: string;               // spirit/deceased/other person name
  recipientRelation?: string;           // 'người cần kinh của con', 'thai nhi', etc.

  // Interruption tracking
  interruptionOccurred?: boolean;
  interruptionDurationSeconds?: number;
  interruptionType?: 'brief' | 'moderate' | 'long';
}

interface RecitationQualityValidation {
  foundationMet: boolean;               // did daily task complete?
  timeLocationValid: boolean;            // time/location allowed for this mantra?
  warningsIfAny: string[];               // e.g., "nighttime reduces merit", "stormy weather advisory"
  canProceed: boolean;                  // true = proceed, false = block
  recoveryAction?: string;               // e.g., "recite Om Ah Hum before continuing"
}

interface InterruptionRecoveryDto {
  sessionId: string;
  interruptionDurationSeconds: number;
  nextAction: 'recite_recovery_mantra' | 'restart_from_beginning' | 'continue_where_stopped';
  recoveryMantra?: string;               // "Om Ah Hum Svaha"
  instruction: string;
}
```

## Write Path (Pseudocode API)

### 1. Validate Foundation & Start Session

```
POST /api/wisdom-qa/little-house/validate-start

1. Extract foundationMantraStatus from DTO
2. Check if practitioner completed daily foundation:
   - IF not completed:
     → BLOCK with message: "Bắt buộc hoàn thành công khóa trước (Chú Đại Bi, Tâm Kinh, Lễ Phật)"
     → Redirect to Daily Recitation System

3. Check daily Little House quota for practitioner:
   - IF practitioner has unfinished own Little House sheets:
     → WARNING: "Hãy bảo đảm Ngôi Nhà Nhỏ của mình trước, rồi mới giúp người khác"
     → Still allow, but surface warning

4. RETURN RecitationQualityValidation {
     foundationMet: true,
     canProceed: true,
     warningsIfAny: [...]
   }
```

### 2. Validate Time & Location

```
POST /api/wisdom-qa/little-house/validate-session-context

1. Extract mantraType, recitationTime, location, weather
2. Map mantraType → allowed hours/locations from rules table
3. Check current time against restrictions:
   - IF mantraType = 'heart_sutra' AND time > 10 PM:
     → WARNING: "Tâm Kinh không nên niệm sau 10 tối. Công đức giảm."
     → canProceed: true but with reduced merit

4. Check location:
   - IF location = 'bathroom' → BLOCK
   - IF location = 'cemetery' → BLOCK
   - IF location = 'kitchen_cooking_meat' → BLOCK

5. Check weather:
   - IF weather = 'stormy' AND mantraType ≠ 'compassion':
     → BLOCK: "Lúc có sấm chớp, chỉ được niệm Chú Đại Bi"

6. RETURN RecitationQualityValidation with warnings
```

### 3. Session In Progress — Monitor Quality

```
PATCH /api/wisdom-qa/little-house/:sessionId/log-repetition

1. Extract mantraType, repetitionCount, currentQualityNote
2. Validate each repetition:
   - Compassion Mantra must include full title (Thiên Thủ...)
   - Heart Sutra must include complete text (no skipping lines)
   - Check for mispronunciation patterns

3. IF quality issue detected:
   → Log warning: "Pronunciation issue detected; may need Bổ Khuyết"
   → Suggest user review pronunciation

4. IF physical discomfort reported (headache, dizziness):
   → RECOMMEND: Stop recitation, recite Compassion Mantra to restore energy
   → Suggest resuming only when comfortable

5. Update session progress:
   - sessionProgress.repetitionsCompleted += 1
   - IF foam_at_mouth detected → FORCE STOP with message: "Quá sức! Dừng lại ngay."

6. RETURN updated progress + quality feedback
```

### 4. Handle Interruption

```
POST /api/wisdom-qa/little-house/:sessionId/log-interruption

1. Extract interruptionDurationSeconds from DTO
2. Determine interruption severity:
   - IF < 30 seconds → BRIEF
   - IF 30 seconds – 2 hours → MODERATE
   - IF > 2 hours (> time period) → LONG

3. Based on interruption type, return recovery action:
   - BRIEF: "Recite Om Ah Hum once, continue from where stopped"
   - MODERATE: "Recite Om Ah Hum once, continue from where stopped"
   - LONG: "Must restart entire mantra/sutra from beginning"

4. IF reciting Heart Sutra and interruption ≥ 30 sec:
   → Recommend restart (Heart Sutra = short; better to be thorough)

5. Log interruption in audit trail
6. RETURN InterruptionRecoveryDto with next action + instruction
```

### 5. Validate Prayer Intention

```
POST /api/wisdom-qa/little-house/:sessionId/set-prayer-intention

1. Extract prayerIntention, recipientName, prayerText (user-entered)
2. Validate against rule: prayer must NAME THE RECIPIENT, not reciter
   - IF prayerIntention = 'spirit_creditor' AND !recipientName:
     → BLOCK: "Phải ghi tên người cần kinh"
   - IF prayerIntention = 'reserve_supply' → OK to have no recipient
   - IF prayerIntention = 'self_healing' → reciter name is recipient, OK

3. Validate prayer text format:
   - Should start with "Xin Quán Thế Âm Bồ Tát đại từ đại bi..."
   - Must include mantra types being recited
   - Parse for proper syntax

4. RETURN validation result + refined prayer text template if needed
```

---

## FE Behavior (ASCII Wireframe)

### FOUNDATION CHECK BEFORE STARTING

```
┌──────────────────────────────────────────────────────┐
│ KIỂM TRA CÓ ĐIỀU KIỆN NIỆM NGÔI NHÀ NHỎ            │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Bước 1: Hoàn thành công khóa hôm nay               │
│                                                      │
│ ✅ Chú Đại Bi: 49 biến (xong)                       │
│ ✅ Tâm Kinh: 7 biến (xong)                          │
│ ⬜ Lễ Phật Đại Sám Hối: 0/1 (chưa)                  │
│                                                      │
│ ❌ ĐỘI CÔNG KHÓA TRƯỚC TIÊN                        │
│                                                      │
│ Bạn cần niệm thêm ít nhất 1 Lễ Phật để hoàn       │
│ thành công khóa và mở khóa Ngôi Nhà Nhỏ.           │
│                                                      │
│ [Quay Lại]  [Niệm Công Khóa]                       │
│                                                      │
└──────────────────────────────────────────────────────┘

[AFTER FOUNDATION COMPLETE]:

┌──────────────────────────────────────────────────────┐
│ ✅ SẲN SÀNG NIỆM NGÔI NHÀ NHỎ                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Công khóa hôm nay: Hoàn thành ✓                     │
│                                                      │
│ ⚠️ NHẮC NHỎ:                                        │
│                                                      │
│ • Niệm xong Ngôi Nhà Nhỏ của mình trước            │
│ • Sau đó mới giúp niệm cho người khác               │
│                                                      │
│ Bạn hiện có Ngôi Nhà Nhỏ chưa xong: 3 tờ           │
│ Người khác chờ: 2 tờ                               │
│                                                      │
│ [Tiếp tục với Ngôi Nhà Nhỏ của Bạn]                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### TIME/LOCATION VALIDATION

```
┌──────────────────────────────────────────────────────┐
│ KIỂM TRA THỜI GIAN & ĐỊA ĐIỂM                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Kinh văn: [Dropdown: Tâm Kinh ▼]                   │
│ Thời gian: 21:00 (9 tối)                            │
│ Địa điểm: [Text: Phòng khách]                       │
│ Thời tiết: [Dropdown: Mưa ▼]                       │
│                                                      │
│ [Kiểm Tra]                                          │
│                                                      │
└──────────────────────────────────────────────────────┘

[VALIDATION RESULT - WARNINGS]:

┌──────────────────────────────────────────────────────┐
│ ⚠️ CẢNHgainBÁO: ĐIỀU KIỆN KHÔNG LÝ TƯỞNG           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Lý do:                                              │
│                                                      │
│ ❌ Tâm Kinh không nên niệm sau 22:00 (10 tối)     │
│    Công đức bị giảm bớt. Tốt nhất niệm trước       │
│    10 tối hoặc vào ban ngày.                       │
│                                                      │
│ ⚠️ Thời tiết mưa: Năng lượng âm yếu, nhưng vẫn    │
│    có thể tiếp tục.                                 │
│                                                      │
│ Địa điểm "Phòng khách" ✓ (tốt)                     │
│                                                      │
│ 💡 GỢI Ý:                                           │
│ • Hãy chờ thời gian tốt hơn (sáng hoặc chiều)      │
│ • Hoặc tiếp tục ngay bây giờ (với công đức giảm)   │
│                                                      │
│ [Tiếp Tục Bây Giờ]  [Chờ Thời Gian Tốt Hơn]       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### DURING RECITATION — QUALITY CHECK

```
┌──────────────────────────────────────────────────────┐
│ ĐANG NIỆM: Tâm Kinh                                │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Tiến độ:                                            │
│ ⬜ Biến 1: ✅ (đầy đủ, chất lượng tốt)             │
│ ⬜ Biến 2: ✅ (đầy đủ, chất lượng tốt)             │
│ ⬜ Biến 3: ⚠️ (thiếu 1 dòng — cần niệm lại)      │
│ ⬜ Biến 4: [Đang niệm...]                          │
│                                                      │
│ ℹ️ Biến 3 được ghi lại là không đầy đủ. Hãy      │
│    niệm lại biến này.                              │
│                                                      │
│ [Niệm Lại Biến 3]  [Tiếp Tục]                     │
│                                                      │
│ Cảm giác hiện tại:                                  │
│ □ Bình thường   □ Mệt   □ Đau đầu   □ Chóng mặt  │
│                                                      │
│ (Nếu không thoải mái, dừng lại; niệm Chú Đại Bi   │
│  để phục hồi)                                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### INTERRUPTION HANDLING

```
[INTERRUPTION DETECTED]:

┌──────────────────────────────────────────────────────┐
│ ⚠️ GIÁN ĐOẠN PHÁT HIỆN                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Bạn đã dừng niệm trong: 45 phút                     │
│                                                      │
│ Hành động kế tiếp:                                  │
│                                                      │
│ 1. Niệm "Ông Lai Mẫm Sô Ha" (ॐ ह्रीं श्रीं) 1 lần │
│ 2. Tiếp tục niệm Tâm Kinh từ nơi bạn dừng lại      │
│                                                      │
│ 📍 Cập nhật tiến độ:                                 │
│ Biến 2 — dừng ở dòng thứ 5                         │
│ → Sau Om Ah Hum, tiếp tục từ dòng 6                │
│                                                      │
│ [Bắt Đầu Om Ah Hum]                                │
│                                                      │
└──────────────────────────────────────────────────────┘

[IF LONG INTERRUPTION]:

┌──────────────────────────────────────────────────────┐
│ ❌ GIÁN ĐOẠN QUÁTÀI LÂULE                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Bạn đã dừng niệm: 3 giờ (> 1 thời辰 / 2 giờ)      │
│                                                      │
│ ⚠️ QUY TẮC: Gián đoạn > 2 giờ → Phải niệm lại      │
│             từ đầu                                  │
│                                                      │
│ Hành động:                                          │
│                                                      │
│ 1. Niệm "Ông Lai Mẫm Sô Ha" (ॐ ह्रीं श्रीं) 1 lần │
│ 2. Khôi động lại phiên niệm từ BẮT ĐẦU             │
│    Tâm Kinh lần này                                 │
│                                                      │
│ [Bắt Đầu Lại Từ Đầu]  [Chi Tiết QUY TẮC]          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### PRAYER INTENTION SETUP

```
┌──────────────────────────────────────────────────────┐
│ ĐẶT LẠI CẦU NGUYỆN — Set Prayer Intention           │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Loại Ngôi Nhà Nhỏ:                                  │
│ ○ Cho người cần kinh (spirit creditor)             │
│ ○ Cho người đã mất (deceased)                       │
│ ○ Hóa giải ác duyên (resolve enmity)              │
│ ○ Dự Trữ (reserve supply)                          │
│                                                      │
│ ──────────────────────────────────────────────────  │
│                                                      │
│ Tên người được hưởng: [Input: ________________]    │
│ Mối quan hệ: [Dropdown: Người cần kinh của con ▼] │
│                                                      │
│ Lời cầu nguyện (tạo sẵn):                          │
│                                                      │
│ "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ      │
│  cho con [Tên Con], giúp con đem những Ngôi Nhà    │
│  Nhỏ này gửi cho [Tên Người Cần Kinh]."           │
│                                                      │
│ [Chỉnh Sửa]  [Xác Nhận]                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Schema Notes (Prisma Snippet)

```prisma
model LittleHouseRecitationSession {
  id                    String   @id @default(cuid())
  practitionerId        String
  sheetId               String

  // Foundation validation
  foundationMetToday    Boolean @default(false)
  foundationNote        String?

  // Session context
  recitationDate        DateTime
  recitationTime        String   // HH:MM format
  location              String
  weather               String?  // clear, rainy, stormy
  timeOfDay             String   // early_morning, morning, afternoon, evening, night

  // Mantra being recited
  mantraType            String   // compassion, heart_sutra, pure_land, seven_buddha
  repetitionsPlanned    Int
  repetitionsCompleted  Int @default(0)

  // Quality tracking
  qualityIssuesFound    String[]  // ["missing_verse_3", "pronunciation_off"]
  foamAtMouthDetected   Boolean @default(false)
  physicalDiscomfortReported String? // "headache", "dizziness"

  // Prayer intention
  prayerIntention       String   // spirit_creditor, deceased, resolve_enmity, reserve_supply, self_healing
  recipientName         String?
  recipientRelation     String?
  prayerText            String?

  // Interruption handling
  interruptionOccurred  Boolean @default(false)
  interruptionDurationSeconds Int?
  interruptionType      String?  // brief, moderate, long
  recoveryActionTaken   String?

  // Audit
  completedAt           DateTime?
  status                String   @default("IN_PROGRESS") // IN_PROGRESS, COMPLETED, INTERRUPTED
  createdAt             DateTime @default(now())

  practitioner          Practitioner @relation(fields: [practitionerId], references: [id])
  sheet                 LittleHouseSheet @relation(fields: [sheetId], references: [id])

  interruptionRecords   InterruptionRecord[]
  qualityRecords        RecitationQualityRecord[]

  @@index([practitionerId])
  @@index([sheetId])
  @@index([status])
}

model RecitationQualityRecord {
  id                    String   @id @default(cuid())
  sessionId             String
  session               LittleHouseRecitationSession @relation(fields: [sessionId], references: [id])

  repetitionNumber      Int
  qualityIssue          String?  // e.g., "missing_verse", "pronunciation_off"
  requiresBoh?          Boolean  // needs Bổ Khuyết Chân Ngôn?
  recitedAt             DateTime @default(now())

  @@index([sessionId])
}

model InterruptionRecord {
  id                    String   @id @default(cuid())
  sessionId             String
  session               LittleHouseRecitationSession @relation(fields: [sessionId], references: [id])

  durationSeconds       Int
  interruptionType      String   // brief, moderate, long
  recoveryAction        String   // recite_recovery_mantra, restart_from_beginning
  recoveryMantras       String?  // e.g., "Om Ah Hum"
  resumedAt             DateTime?

  createdAt             DateTime @default(now())

  @@index([sessionId])
}

model LittleHouseSheet {
  id                    String   @id @default(cuid())
  practitionerId        String

  // Physical sheet info
  recipientName         String
  recipientRelation     String   // person vs. spirit vs. deceased
  recipientNote         String?

  // Mantra quota
  compassionMantrasTarget Int @default(27)
  heartSutraTarget      Int @default(21)
  pureLandTarget        Int @default(21)
  sevenBuddhaTarget     Int @default(7)

  // Progress
  compassionCompleted   Int @default(0)
  heartCompleted        Int @default(0)
  pureLandCompleted     Int @default(0)
  sevenBuddhaCompleted  Int @default(0)

  // Status
  status                String @default("IN_PROGRESS") // IN_PROGRESS, COMPLETED
  completedAt           DateTime?
  burnedAt              DateTime?

  recitationSessions    LittleHouseRecitationSession[]
  createdAt             DateTime @default(now())

  @@index([practitionerId])
  @@index([status])
}
```

## Audit

All Little House recitation activities logged:

| Action | Code | Trigger |
|--------|------|---------|
| Foundation check passed | `little_house.foundation_met` | User starts session |
| Foundation check failed | `little_house.foundation_missing` | User not ready yet |
| Time/location warning | `little_house.suboptimal_conditions` | Nighttime, bad location, etc. |
| Recitation started | `little_house.session_started` | User begins mantras |
| Quality issue detected | `little_house.quality_warning` | Missing verse, pronunciation error |
| Interruption logged | `little_house.interruption_occurred` | Distraction during chanting |
| Recovery action taken | `little_house.recovery_mantra_recited` | Om Ah Hum or full restart |
| Session completed | `little_house.session_completed` | All repetitions done |
| Prayer intention set | `little_house.prayer_intention_recorded` | Recipient, relation, type |

```sql
INSERT INTO audit_log (action, little_house_session_id, details, created_at)
VALUES ('little_house.session_completed', $1, $2, NOW())
```

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `foundation_not_met` | 400 | Phải hoàn thành công khóa trước | Foundation daily task incomplete |
| `invalid_time_location` | 400 | Thời gian/địa điểm không phù hợp | Timing or location invalid for this mantra |
| `time_restriction_blocked` | 400 | Tâm Kinh không được niệm sau 22:00 | Heart Sutra restricted after 10 PM |
| `location_forbidden` | 400 | Không được niệm ở nhà vệ sinh / nghĩa địa | Cannot recite in bathroom/cemetery |
| `recipient_not_specified` | 400 | Phải ghi tên người cần kinh | Recipient name required |
| `prayer_intention_invalid` | 400 | Lời cầu không hợp lệ | Prayer format error |
| `missing_verse_detected` | 422 | Thiếu câu — cần niệm lại biến này | Incomplete verse, must re-chant |
| `interruption_long` | 422 | Gián đoạn quá 2 giờ — phải niệm lại từ đầu | Long interruption, must restart |

## Notes for AI/Codegen

1. **Foundation Check**: Query `DailyRecitationTask` for today's completion. Block if not met. Map thresholds:
   - Compassion Mantra: ≥ 21 (or domain-specific minimum)
   - Heart Sutra: ≥ 1
   - Repentance Mantra: ≥ 1

2. **Time/Location Validation**:
   - Parse `recitationTime` → extract hour
   - Match against mantra rules (Heart Sutra blocked after 10 PM, etc.)
   - Validate location in forbidden list (bathroom, cemetery, kitchen-cooking-meat)

3. **Quality Tracking**:
   - On each repetition submission, check:
     - Full title/header included for Compassion Mantra
     - Complete text (no skipping) for Heart Sutra
     - Pronunciation score (if available from TTS/voice input)
   - Flag issues, suggest Bổ Khuyết if needed

4. **Interruption Logic**:
   - Calculate duration between last mantra recite and resumption
   - If < 30 sec → brief (Om Ah Hum recovery)
   - If 30 sec – 2 hours → moderate (Om Ah Hum recovery)
   - If > 2 hours → long (full restart)
   - For Heart Sutra (short text), recommend restart even at 30 sec to be thorough

5. **Prayer Intention Validation**:
   - Parse intent type (spirit_creditor, deceased, etc.)
   - If spirit_creditor or deceased → require recipientName (BLOCK if missing)
   - If reserve_supply → no recipient required (OK)
   - If self_healing → reciter is recipient (OK)
   - Generate template prayer text based on intent type

6. **Session Completion**:
   - Only mark COMPLETED when all repetitions (all mantras) reach target
   - At completion, offer burnSchedule / burn guidance (link to engagement domain)

### Part F: Case Scenarios When Little House Recitation Is Needed

| Scenario | Condition | Initial Quantity | Recipient Field | Continuation Rule |
|----------|-----------|-----------------|-----------------|------------------|
| **Practitioner beginning practice** | New to Dharma Monastery | 7 sheets | "Người cần kinh của XXX" (practitioner's own spirit creditor) | Continue until clear, or weekly 3+ sheets |
| **Dream of own spirit creditor** | Dream of being pressed/chased/demanded from/offered food/unexpected illness/temper | 7–21 sheets | Name or description: "Người cần kinh của XXX" | Assess dream pattern; may require ongoing |
| **Dream of deceased person** | Mộng thấy người đã mất; person died (relative or stranger) | ≥7 sheets per deceased | "XXX" (deceased name) or "ông/cha/mẹ của YYY" if unknown | Weekly 3–7 sheets maintenance |
| **Abortion, miscarriage, IVF loss** | Lost fetus (intentional or accidental: safe period, contraception, IVF failure) | 7–21 sheets per fetus | "con của XXX" (mother's name only) | Monitor dreams; if child comes seeking, continue indefinitely |
| **Unknown/forgotten miscarriages** | No conscious memory but child appears in dreams after starting practice | 7–21 sheets per child discovered | "con của XXX" | Treat same as known miscarriage |
| **Spirit creditor in home** | House feels dark/unfamiliar stranger appears in dreams/odd sounds/electrical failures | 4–7 sheets initial | "Người cần kinh của căn nhà XXX" (practitioner's name) | 3–7 sheets weekly until resolved |
| **Karmic enmity/conflict** | Ongoing conflict, enmity, or resentment with another person | Variable by severity | "XXX hóa giải oan kết" (practitioner's name) | Commit to batch (3–21 sheets) before expecting results |
| **Smooth living, no obstacles** | All aspects going well; preventive/maintenance | ~3 sheets/week | "Người cần kinh của XXX" | Ongoing weekly maintenance |
| **Reserved supply (Dự Trữ)** | Pre-printed, unfilled sheets for future emergency use | Unlimited (no burn until needed) | **Leave blank** (fill only when needed) | Fill name + burn when crisis arises |
| **Proxy/group ceremony support** | Assisting family member or group liberation ceremony | Per group agreement | Recipient varies; include proxy note | Per ceremony/group request |

**Critical Rules for Case Scenarios:**
- **Never add descriptors** like "đứa thứ N" (child #1), "bị phá" (aborted), "sảy" (miscarried) to fetus recipient field. Always use "con của XXX" only. Spirit distribution happens automatically after burning.
- **Assessment required** before continuation: if after reciting 7–21 sheets the dreams/phenomena stop, no further recitation needed for that case. If dreams/issues persist or escalate, continue indefinitely (3+ sheets/week).
- **Smooth living** practitioners still need continuous Little House to prevent future karma activation; 3 sheets/week is baseline to maintain protection.

---

### Part G: Quantity Guidelines & Batch Recitation Management

#### General Quantity Rules

| Practitioner Status | Minimum Weekly | Maximum Daily | Batch Size | Strategy |
|---|---|---|---|---|
| **Beginning (0–3 months)** | 7 sheets/week (own spirit creditors) | 5 sheets/day | 3–7 sheets/batch, burn after each batch | Steady, consistent work |
| **Established (3–12 months)** | 3+ sheets/week (own) | 7–21 sheets/day (if resolving acute crisis) | 3–21 sheets/batch | Flexible; scale up for crisis |
| **Smooth living, all well** | 3 sheets/week minimum (maintenance) | 5 sheets/day | 3–7 sheets/batch | Preventive; weekly rhythm |
| **Acute illness, lawsuit, major obstacle** | Up to 21+ sheets/day | 21 sheets/day | 3–21 sheets/batch, burn same-day | Intensive; commit to schedule |
| **Deceased support** | 21 sheets minimum (once) | 7–21 sheets/session | 7–21 sheets/batch per deceased | One-time or weekly until transferred |
| **Fetus support** | 7–21 sheets minimum (once) | 7–21 sheets/session | 7–21 sheets/batch | One-time, then monitor dreams |

**Key Principle:** *Little House recitation is a process, not a one-time cure.*
- Sheets recited only help current spirit creditors; future karma can activate anytime.
- Continuous weekly practice (3+ sheets) prevents new obstacles and maintains stability.
- Do NOT expect one batch to permanently solve long-standing issues.

#### Batch Recitation Approach (Recommended)

**What is a batch?** 3–7 sheets of the same recipient, recited over several sessions, then burned together.

**Why batches?** Like medication therapy — consistent doses over time are more effective than sporadic recitation.

**Process:**

```
1. SET VOWS (Before starting batch):
   "Con XXX sẽ trong thời gian [timeframe] niệm [number] tờ Ngôi Nhà Nhỏ
   cho Người cần kinh của con, xin Quán Thế Âm Bồ Tát đại từ đại bi gia
   hộ cho con XXX [specific request: heal illness, resolve conflict, clear
   debt, etc.]."

2. RECITE at least 1–2 sheets per day over [timeframe]
   (e.g., 7 sheets over 7 days, or 3 sheets over 3 days)

3. BURN all sheets together once batch complete
   (Timing: optimal 8/10/16 AM, daytime before sunset acceptable)

4. GRATITUDE prayer after burning
   (Thank Bodhisattva Guan Yin, acknowledge recipient received merit)

5. ASSESS:
   → If issue resolves → adjust to maintenance (3/week)
   → If persists → start new batch with adjusted number/timeframe
```

#### Daily Burning Schedule (When Burning Individual Sheets)

If NOT batching, use this conservative schedule:

| Practitioner Status | Per-Day Limit | Example |
|---|---|---|
| New, single recipient | 3 sheets/day | Monday: 1 + Tuesday: 1 + Wednesday: 1 |
| Multiple recipients (own) | 5 sheets/day | 2 for creditor A + 2 for creditor B + 1 reserve |
| In crisis / acute help needed | 7–21 sheets/day | Acceptable for acute illness, lawsuit, death in family |
| Deceased / fetus / group ceremony | 7–21 sheets/session | Can burn larger batches if coordinated |

**Note:** Batching (7 sheets → burn once) is PREFERRED over daily burning because the concentrated merit transfer is stronger.

#### Merit Dedication & Vow Format

**Standard Vow (Before Starting a Batch):**

```
"Con XXX sẽ trong thời gian [timeframe: 7 ngày, 21 ngày, 3 tháng, v.v...]
niệm [number: 7, 21, 49 tờ] Ngôi Nhà Nhỏ cho Người cần kinh của con,
xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX [specific
request: khiến bệnh nơi thân con sớm được khỏi, hóa giải oan kết, giúp
con vượt qua kiện tụng, v.v...]."
```

**Examples by Case:**

| Case | Vow Template |
|------|--------------|
| **Spirit creditor (own)** | "Con XXX sẽ trong 7 ngày niệm 7 tờ Ngôi Nhà Nhỏ cho Người cần kinh của con, xin Quán Thế Âm Bồ Tát giúp con thanh toán nợ này và mở ra con đường tươi sáng." |
| **Deceased family member** | "Con XXX sẽ trong 21 ngày niệm 21 tờ Ngôi Nhà Nhỏ cho [tên người mất], xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho [tên người mất] sớm siêu sinh cõi tốt lành." |
| **Fetus support** | "Con XXX sẽ trong 7 ngày niệm 21 tờ Ngôi Nhà Nhỏ cho con của con, xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con được siêu độ, và giúp con XXX xóa bỏ khoái lạc tâm." |
| **Acute illness** | "Con XXX sẽ mỗi ngày niệm 7–21 tờ Ngôi Nhà Nhỏ cho Người cần kinh của con, xin Quán Thế Âm Bồ Tát khiến bệnh nơi thân con sớm được hồi phục, thân tâm khoẻ lành." |
| **Resolving conflict** | "Con XXX sẽ trong 21 ngày niệm 21 tờ Ngôi Nhà Nhỏ để hóa giải oan kết với [tên người], xin Quán Thế Âm Bồ Tát đại từ đại bi giúp con và [tên người] quên sự giận hờn, quay lại hòa thuận." |
| **Reserved supply** | "Con XXX sẽ chuẩn bị [number] tờ Ngôi Nhà Nhỏ dự trữ, xin Quán Thế Âm Bồ Tát chứng giám, để khi con gặp khó khăn sẽ có hỗ trợ tâm linh sẵn." |

**Important Notes on Vow-Setting:**
- Always include **timeframe** (3 days, 7 days, 21 days, 3 months, ongoing)
- Always include **quantity** (3, 7, 21, 49 sheets, or daily count)
- Always include **specific request** (health, resolve enmity, clear debt, transfer to better realm, protect household)
- Speak with **sincerity** (thành tâm) — vow is a contract with Bodhisattva
- After vow is set, **follow through** — if interrupted, restart the batch
- Upon completion, offer **gratitude prayer** (see burning ritual section in Related document)

---

## Related

- `engagement/USE_CASES/little-house-chanting-mode-toggle.md` — Strict vs. Flexible recitation order
- `engagement/USE_CASES/little-house-specification-and-production.md` — Physical sheet specs
- `engagement/USE_CASES/little-house-filling-and-dotting-procedures.md` — Form filling rules (fetus field restrictions)
- `engagement/USE_CASES/little-house-burning-ritual-procedure.md` — Burning timing, location, pre/post prayers
- `engagement/USE_CASES/manage-little-house-reserved-proxy.md` — Sheet management
- `wisdom-qa/USE_CASES/daily-recitation-system.md` — Foundation mantra system
- `wisdom-qa/USE_CASES/little-house-recitation-error-buffer.md` — Bổ Khuyết Chân Ngôn correction mantra
- `design/04-schemas/LittleHouseRecitationSession.prisma` — Data model
