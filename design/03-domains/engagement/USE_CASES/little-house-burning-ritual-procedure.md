# Ngôi Nhà Nhỏ — Nghi Thức Đốt — Little House: Burning Ritual Procedure

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

The burning ritual is the **final energy transfer ceremony** in the Little House lifecycle. The system guides practitioners through:
1. **Optimal timing selection** (auspicious hours, weather)
2. **Location preparation** (with/without altar, container setup)
3. **Pre-burning invocation** (prayers by altar status)
4. **Safe burning technique** (angle, combustion, ashes)
5. **Post-burning gratitude** (acknowledgment, personal requests)
6. **Proxy burning rules** (modified prayers for releasing on behalf of others)

Proper procedure ensures spiritual energy reaches the intended recipient without interruption or interference.

## Owner Module

`engagement` — LittleHouseBurningService / BurningRitualExecutor

## Actors

- **Practitioner**: Performs burning ritual, recites prayers, manages fire
- **System**: Guides timing selection, validates preconditions, suggests location/container setup
- **Bodhisattva**: Receives offering and transmits merit (spiritual role)
- **Recipient spirit**: Receives transmitted merit through burning

## Trigger

1. Little House sheet complete (recited, filled, dotted)
2. User initiates burning session
3. System validates timing/weather and offers guidance
4. User performs ritual and confirms completion

## Business Rules

### Part A: Optimal Timing (Auspicious Hours)

| Time | Auspiciousness | Rationale | Notes |
|------|----------------|-----------|-------|
| **8:00 AM** | ⭐⭐⭐ Excellent | Early morning, fresh yang energy | Official recommendation #1 |
| **10:00 AM** | ⭐⭐⭐ Excellent | Morning peak energy | Official recommendation #2 |
| **4:00 PM** | ⭐⭐⭐ Excellent | Afternoon balance | Official recommendation #3 |
| **5:00 AM – 8:00 AM** | ⭐⭐ Good | Early daylight acceptable | Before #1 optimal time |
| **10:00 AM – 4:00 PM** | ⭐⭐ Good | Daytime acceptable | Between optimal times |
| **4:00 PM – Sunset** | ⭐ Acceptable | Late afternoon OK if sunny | Must complete before dark |
| **After sunset** | ❌ BLOCKED | No burning after dark | Unless emergency (critical illness) |
| **Before sunrise** | ❌ BLOCKED | No burning before dawn | Yin energy too strong |
| **Rainy/overcast day** | ⚠️ Caution | Not ideal but acceptable | Proceed with reservation if needed |
| **Stormy weather** | ❌ BLOCKED | Never burn during storms | Wait for safe conditions |

**Emergency Exception**: If `isEmergency = true` (critical illness, spirit demanding urgently), timing restrictions may be relaxed with **Bodhisattva invocation enhancement**.

### Part B: Location & Container Setup

#### With Altar (有佛台)

| Requirement | Specification | Details |
|------------|---------------|---------|
| **Distance** | 靠近佛台旁边 | Beside/near the altar |
| **Base** | 垫盒子或木头 (substrate) | Place box or wood block on floor |
| **Alternative base** | 新的专用凳子 (new dedicated stool) | Can use new dedicated stool |
| **Container** | 盘子 (tray/plate) | Metal/ceramic tray on top of base |
| **Tray placement** | ❌ 不能放在佛台上 | NEVER place tray on altar itself |
| **Tray placement** | ❌ 不能直接放地上 | NEVER place tray directly on floor |
| **Height** | Elevated (elevated by box/stool) | Raised from ground, not on altar |

#### Without Altar (无佛台)

| Location | Acceptable | Notes |
|----------|-----------|-------|
| **Balcony** (阳台) | ✅ Yes | Preferred open-air location |
| **Living room window** (客厅的窗口) | ✅ Yes | Acceptable with open window |
| **Backyard** (后院) | ✅ Yes | Garden or outdoor space |
| **Bathroom** | ❌ No | Unclean space, forbidden |
| **Kitchen** | ⚠️ Caution | Avoid if cooking with meat |
| **Bedroom** | ⚠️ Caution | Not ideal, but acceptable |
| **Enclosed indoor room** | ⚠️ Caution | Needs good ventilation |

### Part C: Pre-Burning Prayers (By Altar Status)

#### WITH ALTAR (有佛台)

**Step 1: Incense Offering**
```
Dâng hương trước.
(Light incense first.)
```

**Step 2: Invocation (Three Times)**
```
Cung thỉnh Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn
Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát
(三称 / Recite three times)

[English: Respectfully invoke Guanyin Bodhisattva, Great Compassion, Salvation from Suffering]
```

**Step 3: Elevate Sheet & Place on Altar**
```
Nâng Ngôi Nhà Nhỏ qua đỉnh đầu,
rồi đặt lên bàn Phật.

(Raise Little House above head, then place on altar.)
```

**Step 4: Kneeling Prayer**
```
Quỳ bạch:
"Cung thỉnh Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
xin giúp con XXX (tên người niệm)
có thể đem những Ngôi Nhà Nhỏ này
gửi cho YYY (nội dung phần kính tặng)."

Interpretation:
"Respectfully invoke Guanyin Bodhisattva,
please help me [Reciter's Name]
deliver these Little Houses
to [Recipient Name/Title]."

Example YYY values:
- "Người cần kinh của Mẹ" (Spirit creditor of Mother)
- "Con của Tôi" (My child/fetus)
- "Bà [Name] (người đã mất)" (Grandmother [Name] deceased)
- "Người cần kinh của căn nhà" (House spirit)
- "Tôi hóa giải oan kết" (I resolve enmity)
```

---

#### WITHOUT ALTAR (无佛台)

**Step 1: Heart Incense (Mental Invocation)**
```
Dâng tâm hương:
Cung thỉnh Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn
Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát
(三称 / Three times)

[Offer incense from the heart (tâm hương) = mental invocation]
```

**Step 2: Mantra Recitation**
```
Niệm 1 biến Chú Đại Bi (Compassion Mantra)
Niệm 1 biến Tâm Kinh (Heart Sutra)

(Recite one repetition of each)
```

**Step 3: Elevate Sheet to Sky**
```
Nâng Ngôi Nhà Nhỏ qua đỉnh đầu,
hướng lên trời.

(Raise Little House above head, face toward sky.)
```

**Step 4: Bow or Mental Kneeling**
```
Lạy ba lạy hoặc trong tâm quỳ bạch:

"Cung thỉnh Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
xin giúp con XXX (tên người niệm)
có thể đem những Ngôi Nhà Nhỏ này
gửi cho YYY (nội dung phần kính tặng)."

(Three physical bows OR mental kneeling while reciting the same prayer)
```

---

### Part D: Burning Technique & Safety

| Procedure | Specification | Details | Safety |
|-----------|---------------|---------|--------|
| **Ignition** | Bật lửa hoặc diêm | Lighter or matchstick | ❌ Don't use altar oil lamp |
| **Starting point** | Góc trên bên phải "kính tặng" | Top-right corner (recipient area) | Symbolic direction |
| **Burning rate** | Từng tờ một | One sheet at a time | ❌ Never multiple simultaneously |
| **Combustion** | Phải đốt cháy hoàn toàn | Must burn completely | ❌ No paper residue left |
| **Ashes** | Không được dùng tay chạm | Do NOT touch with bare hands | Spiritual protection |
| **Container** | Tray beneath (盘子) | Metal/ceramic tray catches ash | Safety + cleanliness |
| **Observation** | Quan sát cháy hoàn toàn | Watch until completely burned | Ensure full combustion |

**Burning Pattern:**
- Light top-right corner (敬赠/recipient area)
- Flame will travel downward naturally
- Entire sheet should burn to ash in seconds–1 minute
- If sheet doesn't catch, re-light

**Multi-Sheet Batching:**
- Different recipient types = separate prayers and separate burning
- Same recipient type = can batch within time interval
- Interval: minimum 1–2 minutes between different recipients
- Wait for ash to settle before next sheet

### Part E: During Burning — Mantra (Optional)

| Timing | Prayer | Details |
|--------|--------|---------|
| **While burning** | "Xin Quán Thế Âm Bồ Tát đại từ đại bi từ bi." | Short invocation during combustion |
| **Simplicity rule** | Không nên tùy tiện thêm lời khác | Don't improvise or add extra language |
| **Purpose** | Tập trung năng lượng | Focus energy during transfer |

**Note**: This is optional. Core obligation is pre-burning prayer + post-burning gratitude.

### Part F: Post-Burning Gratitude Prayer

**Timing**: Immediately after sheet burns completely

```
"Cảm tạ Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát
đã giúp con XXX (tên người niệm)
có thể đem những Ngôi Nhà Nhỏ này
gửi cho YYY (nội dung phần kính tặng).

Cảm ân Quán Thế Âm Bồ Tát đại từ đại bi gia hộ!"

(One bow)

English:
"Thank you Guanyin Bodhisattva for helping me [Reciter's Name]
deliver these Little Houses to [Recipient].
Gratitude to Guanyin's great compassion for protection!"
(One bow)
```

**Optional Additional Requests** (same time as gratitude):
```
If burning for spirit creditor:
"Xin Quán Thế Âm Bồ Tát gia hộ cho XXX
thân thể khỏe mạnh, bình an cát tường."
(Please protect XXX with health, peace, and good fortune.)

If burning for karma resolution:
"Xin Quán Thế Âm Bồ Tát gia hộ cho XXX và YYY
hóa giải ác duyên."
(Please help XXX and YYY resolve their karmic enmity.)

If burning for deceased:
"Xin Quán Thế Âm Bồ Tát gia hộ cho [Deceased Name]
được siêu độ đến cõi Tây Phương."
(Please help [Deceased] transcend to the Pure Land.)
```

### Part G: Proxy Burning (Đốt Thay Người Khác)

#### Case 1: Helper Is Burning on Behalf of Practitioner

If **Helper burns** sheets that **Practitioner recited**:

```
Pre-burning prayer:
"Cung thỉnh Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
xin giúp XXX (TÊN NGƯỜI NIỆM)
có thể đem những Ngôi Nhà Nhỏ này
gửi cho YYY (nội dung phần kính tặng)."

XXX = Reciter's name (the one who chanted the mantras)
[NOT the helper's name]
```

#### Case 2: Helper Is Burning on Request of Someone Else

If **Helper burns** on behalf of **someone else's request** (not the reciter):

```
Pre-burning prayer:
"Cung thỉnh Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
xin giúp XXX (TÊN NGƯỜI THỈNH CẦU)
có thể đem những Ngôi Nhà Nhỏ này
gửi cho YYY (nội dung phần kính tặng)."

XXX = Requester's name (the person who asked for burning)
[NOT the reciter, NOT the helper]
```

**Selection Rule**: Use **Reciter's name** if clear. If burning at someone else's urgent request (e.g., sick relative), use **Requester's name** instead.

---

## Input Contract (TypeScript DTOs)

```typescript
interface BurningRitualDto {
  sheetId: string;
  practitionerId: string;          // person burning (may be different from reciter)

  // Pre-burning validation
  sheetStatus: 'DOTTED';           // must be complete
  hasAltarAtHome: boolean;
  location: 'balcony' | 'living_room_window' | 'backyard' | 'other';

  // Timing
  selectedTime: Date;
  isEmergency?: boolean;           // critical illness exception
  weatherCondition?: 'clear' | 'rainy' | 'stormy';

  // Prayer context
  recipientName: string;           // from sheet's right side
  reciterName: string;             // from sheet's left side
  proxyBurningFor?: string;        // name to use if burning on someone's request

  // During ritual
  mantrasRecited: {
    compassionMantra?: number;     // optional during burning
  };
  sheetBurnedCompletely: boolean;
  ashesRemainder?: 'none' | 'small_bits' | 'significant'; // flag if not complete
}

interface BurningRitualValidation {
  canProceed: boolean;
  blockers: string[];              // hard blocks
  warnings: string[];              // soft warnings (advisory)
  timedOptimal: boolean;           // true if 8/10/16
  altarSetupGuided: boolean;
  prayerTemplate?: string;         // pre-generated prayer based on conditions
}

interface BurningCompletion {
  sessionId: string;
  sheetId: string;
  burnedAt: Date;
  completionStatus: 'success' | 'incomplete' | 'residue_remained';
  recipientMeritTransferred: boolean;
  auditNote: string;
}
```

## Write Path (Pseudocode API)

### 1. Pre-Burning Validation & Setup

```
POST /api/engagement/little-house/:sheetId/prepare-burning

1. Load sheet: validate status = 'DOTTED', fully filled/signed
2. Extract recipientName, reciterName
3. Check timing:
   - IF selectedTime not in optimal hours (8/10/16):
     → WARNING: "Không phải giờ tốt lành (tốt nhất 8, 10, 16 giờ)"
   - IF after sunset AND !isEmergency:
     → BLOCK: "Trời tối rồi, không được đốt"
   - IF stormy AND !isEmergency:
     → BLOCK: "Sấm sét — không đốt"

4. Generate prayer template:
   IF hasAltarAtHome:
     → altar version (incense, elevation, place on altar)
   ELSE:
     → non-altar version (heart incense, sky-facing, three bows)

5. Guide location setup:
   IF hasAltarAtHome:
     → suggest box/stool + tray beside altar
   ELSE:
     → suggest balcony, window, or backyard

6. RETURN BurningRitualValidation {
     canProceed: boolean,
     warnings: [...],
     prayerTemplate: "full prayer text",
     altarSetupGuided: true/false
   }
```

### 2. Burning Session

```
POST /api/engagement/little-house/:sheetId/execute-burning

1. Verify pre-burning prayer was offered
2. User ignites sheet at top-right corner
3. Monitor combustion:
   - IF sheet doesn't catch: suggest re-ignite
   - IF partial burn: warn "Phải cháy hoàn toàn"

4. Log burning observation:
   - Time started
   - Complete combustion (yes/no)
   - Ash residue (none/small/significant)

5. Prompt post-burning gratitude prayer + optional requests

6. Mark sheet as BURNED in database
```

### 3. Post-Burning Completion

```
POST /api/engagement/little-house/:sheetId/confirm-burning-complete

1. Record burning completion:
   - sheetId
   - burnedAt timestamp
   - completionStatus (success/incomplete)
   - recipientMeritTransferred flag

2. IF ashesRemainder != 'none':
   → WARNING: "Nên kiểm tra lại — nên cháy hoàn toàn"
   → Can still mark as complete (soft warning)

3. Generate completion message:
   "Ngôi Nhà Nhỏ đã được gửi thành công cho YYY.
    Quán Thế Âm Bồ Tát sẽ giúp [recipient get benefit]."

4. Log audit: "little_house.burned_successfully"

5. Unlock next action: Archive/Reprint/Start New Sheet
```

---

## FE Behavior (ASCII Wireframe)

### PRE-BURNING SETUP

```
┌──────────────────────────────────────────────────────┐
│ CHUẨN BỊ ĐỐT NGÔI NHÀ NHỎ — Prepare to Burn        │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ✅ Ngôi Nhà Nhỏ: Hoàn thành chấm điểm               │
│                                                      │
│ Chọn thời gian:                                     │
│ Giờ giấc: [Dropdown: 10:00 AM ▼]                    │
│ Ngày: [Date picker: 2026-04-05]                     │
│                                                      │
│ ⚠️ GỢI Ý:                                           │
│ • 8:00, 10:00, 16:00 là những giờ tốt lành nhất   │
│ • Không được đốt sau khi trời tối                   │
│                                                      │
│ Bạn có bàn Phật tại nhà không?                       │
│ ○ Có — [Hướng dẫn cách dặt bàn Phật]              │
│ ○ Không — [Hướng dẫn vị trí thay thế]              │
│                                                      │
│ Thời tiết hôm nay:                                  │
│ [Display: Trời nắng, 28°C ✓ Tốt]                    │
│                                                      │
│ [Quay Lại]  [Tiếp Tục]                              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### DURING BURNING

```
┌──────────────────────────────────────────────────────┐
│ ĐANG ĐỐT — Burning in Progress                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🔥 Ngôi Nhà Nhỏ: "Người cần kinh của Mẹ" — Ngân    │
│                                                      │
│ Hướng dẫn:                                          │
│ 1. Châm lửa vào góc trên bên phải (chỗ kính tặng)  │
│ 2. Để cho nó cháy hoàn toàn (2–3 phút)              │
│ 3. Không được chạm vào tro với tay                 │
│ 4. Niệm tĩnh: "Xin Quán Thế Âm Bồ Tát đại từ      │
│    đại bi từ bi." (tùy chọn)                        │
│                                                      │
│ ⏱️ Đang đốt... [Cháy hoàn toàn]                      │
│                                                      │
│ □ Ngôi Nhà Nhỏ đã cháy hoàn toàn?                   │
│ □ Không còn mảnh giấy sót lại?                     │
│                                                      │
│ [Tiếp Tục — Cảm Tạ]                                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### POST-BURNING GRATITUDE

```
┌──────────────────────────────────────────────────────┐
│ CẢMTA — Post-Burning Gratitude                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🙏 Ngôi Nhà Nhỏ đã được gửi thành công!             │
│                                                      │
│ Lời cảm tạ:                                         │
│ "Cảm tạ Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát │
│  đã giúp con Ngân có thể đem những Ngôi Nhà        │
│  Nhỏ này gửi cho Người cần kinh của Mẹ.            │
│                                                      │
│  Cảm ân Quán Thế Âm Bồ Tát đại từ đại bi           │
│  gia hộ!"                                            │
│                                                      │
│ (Lạy một lạy)                                       │
│                                                      │
│ ──────────────────────────────────────────────────  │
│                                                      │
│ Bạn có muốn cầu xin thêm điều gì không?             │
│                                                      │
│ □ "Xin Quán Thế Âm Bồ Tát gia hộ cho Mẹ            │
│   thân thể khỏe mạnh, bình an cát tường."          │
│                                                      │
│ [Quay Lại]  [Hoàn Thành]                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Schema Notes (Prisma Snippet)

```prisma
model LittleHouseSheet {
  // ... previous fields ...

  // Burning status
  status              String @default("DOTTED") // DOTTED, BURNING, BURNED, ARCHIVED
  burningStatus       String? // scheduled, in_progress, completed
  burnedAt            DateTime?
  burnedByUserId      String?  // who performed burning (may differ from practitioner)
  burningLocation     String?  // balcony, living_room_window, backyard, altar
  burningTime         DateTime?

  // Combustion quality
  combustionComplete  Boolean @default(false)
  ashesRemainder      String? // none, small_bits, significant
  combustionNotes     String?

  // Spiritual transfer
  meritTransferred    Boolean @default(false)
  transferredTo       String? // recipient name confirmed
  transferTimestamp   DateTime?

  // Audit
  burningAudit        BurningAuditRecord[]
}

model BurningAuditRecord {
  id                String   @id @default(cuid())
  sheetId           String
  sheet             LittleHouseSheet @relation(fields: [sheetId], references: [id])

  burnerUserId      String
  burnedAt          DateTime @default(now())
  location          String   // balcony, window, backyard, altar
  timeOfDay         String   // morning, afternoon, evening
  weatherCondition  String?  // clear, rainy

  combustionComplete Boolean
  ashesRemainder    String?  // none, small, significant

  recipientName     String   // who it was sent to (from sheet)
  meritTransferred  Boolean @default(true)

  @@index([sheetId])
  @@index([burnerUserId])
  @@index([burnedAt])
}
```

## Audit

All burning activities logged:

| Action | Code | Trigger |
|--------|------|---------|
| Pre-burning validation passed | `little_house.burn_validation_passed` | User confirms setup |
| Burning ritual started | `little_house.burning_started` | Fire ignited |
| Sheet combusted | `little_house.sheet_combusted` | Full burn observed |
| Post-burning gratitude offered | `little_house.gratitude_offered` | User completes prayer |
| Burning session complete | `little_house.burned_successfully` | Merit transferred |
| Incomplete combustion detected | `little_house.combustion_incomplete` | Residue found |

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `sheet_not_ready_to_burn` | 400 | Ngôi Nhà Nhỏ chưa sẵn sàng để đốt | Sheet not complete/dotted |
| `burning_time_not_optimal` | 422 | Không phải giờ tốt lành | Non-optimal time (advisory) |
| `burning_after_dark` | 400 | Trời tối rồi — không được đốt | Cannot burn after sunset |
| `burning_during_storm` | 400 | Sấm sét — cấm đốt Ngôi Nhà Nhỏ | Storm in progress |
| `combustion_incomplete` | 422 | Ngôi Nhà Nhỏ cháy không hoàn toàn | Residue detected (warning) |
| `proxy_prayer_ambiguous` | 400 | Không rõ ai là người nhận cầu nguyện | Proxy naming unclear |

## Notes for AI/Codegen

1. **Timing Validation**:
   - Check if selectedTime in [8:00, 10:00, 16:00] → mark as optimal
   - Compare to sunset time (from API) → block if after
   - Compare to sunrise → block if before
   - Allow emergency override if `isEmergency = true`

2. **Prayer Generation**:
   - Generate two versions: with-altar and without-altar
   - Parse recipient name from sheet's right side
   - Parse reciter name from sheet's left side
   - If proxyBurningFor provided, use that instead of reciter
   - Substitute XXX/YYY placeholders in prayer template

3. **Combustion Monitoring**:
   - Allow user to report: "completely burned", "some residue", "incomplete"
   - If residue detected → soft warning (can still complete)
   - If incomplete → can mark complete but flag for future

4. **Multi-Sheet Batching**:
   - Track time between different recipient types
   - Enforce 1–2 min gap between different prayers
   - Same recipient = can batch within timeframe

5. **Post-Burning Requests**:
   - Offer template requests based on recipient type
   - User can skip or customize
   - Log whichever requests were made

## Related

- `engagement/USE_CASES/validate-little-house-burn-conditions.md` — Pre-burn validation gates
- `engagement/USE_CASES/little-house-specification-and-production.md` — Sheet specs
- `engagement/USE_CASES/little-house-filling-and-dotting-procedures.md` — Form filling workflow
- `engagement/USE_CASES/little-house-anti-theft-field-lock.md` — Recipient field protection
- `engagement/USE_CASES/burn-container-sanitization-protocol.md` — Container hygiene
- `design/04-schemas/LittleHouseSheet.prisma` — Data model
