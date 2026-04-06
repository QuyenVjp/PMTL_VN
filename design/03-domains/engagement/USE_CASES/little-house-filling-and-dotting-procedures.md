# Ngôi Nhà Nhỏ — Quy Trình Điền Phiếu và Chấm Điểm — Little House: Filling and Dotting Procedures

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

Filling Little House forms and dotting circles correctly ensures spiritual energy is **properly directed** to the intended recipient and **protected from interference**. The system enforces:
1. **Correct field filling** (recipient name, practitioner name, dates) by Little House type
2. **Proper dotting procedure** (pen type, dot size, pattern, timing)
3. **Red cloth protection** (size, material, placement) during dotting to prevent spiritual interference
4. **Safety protocols** (no dotting during storms, timing restrictions)

Improper filling/dotting can render Little House ineffective or cause energy scattering (năng lượng bị phân tán).

## Owner Module

`engagement` — LittleHouseDottingService / FillingFieldValidator / RedClothProtectionGuard

## Actors

- **Practitioner**: Fills form fields, dots circles, manages red cloth protection
- **System**: Validates field syntax, guides dotting sequence, checks timing/weather safety
- **Audit Logger**: Records which fields filled, dotting progress, completion status

## Trigger

1. User creates new Little House sheet after recitation completion
2. System guides filling fields for specific Little House type
3. User initiates dotting session (post-recitation, pre-burning)
4. System validates red cloth placement and dotting parameters

## Business Rules

### Part A: Field Filling Rules (By Little House Type)

#### Type 1: Spirit Creditor of Living Person (Người Cần Kinh của Người Còn Sống)

| Field | Vietnamese Rule | English Rule | Example |
|-------|-----------------|-------------|---------|
| **Right side (kính tặng)** | Ghi: "Người cần kinh của XXX" | Write: "Spirit creditor of XXX" | "Người cần kinh của Mẹ" |
| **Left side (lạc khoản)** | Ghi tên người niệm | Write reciter's name | "Ngân" |
| **Date (left side)** | Điền sau khi niệm xong | Fill after recitation complete | "2026-04-05" or "二〇二六年四月五日" |
| **Pre-dotting** | OK để trống phần kính tặng trước khi niệm | Can leave blank before reciting | N/A |
| **Must fill before dotting** | Lạc khoản bắt buộc điền trước niệm | Reciter name MUST fill before reciting | Not optional |

#### Type 2: Deceased Person (Người Đã Mất)

| Field | Vietnamese Rule | English Rule | Example |
|-------|-----------------|-------------|---------|
| **Right side (kính tặng)** | Ghi tên người đã mất ± quan hệ | Deceased's name ± relationship | "Ông nội Minh" or "Bà Hoa" |
| **Relationship prefix** | Optional: "ông nội", "bà ngoại", "cha", "mẹ", etc. | Optional: grandfather, grandmother, father, mother | "Ông nội", "cô", etc. |
| **If name unknown** | Ghi "ông nội của XXX" (XXX = living person) | Write "grandfather of YYY" | "Cha của Mẹ" |
| **Left side (lạc khoản)** | Ghi tên người niệm | Write reciter's name | "Linh" |
| **Date (left side)** | Điền sau khi niệm xong | Fill after recitation complete | "2026-04-05" |

#### Type 3: Aborted/Miscarried Fetus (Thai Nhi Bị Sảy/Phá)

| Field | Vietnamese Rule | English Rule | Restriction |
|-------|-----------------|-------------|------------|
| **Right side (kính tặng)** | Ghi: "con của XXX" (XXX = tên mẹ) | Write: "child of XXX" (XXX = mother's name) | **Mother's name ONLY** |
| **Father's name** | ❌ NEVER write father's name | Cannot include father | Violates spirit protocol |
| **Both names** | ❌ NEVER write both parents | Cannot write both simultaneously | Energy becomes invalid |
| **Exception** | In rare cases, can write father's name instead of mother (if mother unknown) | Father can substitute if mother absent | Single name only |
| **Forbidden words** | ❌ NEVER write "sảy thai" / "phá thai" | NEVER write "miscarriage" / "abortion" | Little House becomes ineffective |
| **Left side (lạc khoản)** | Ghi tên người niệm | Write reciter's name | Often the mother |
| **Date (left side)** | Điền sau khi niệm xong | Fill after recitation complete | Post-completion |

#### Type 4: House Spirit Creditor (Người Cần Kinh của Căn Nhà)

| Field | Vietnamese Rule | English Rule | Example |
|-------|-----------------|-------------|---------|
| **Right side (kính tặng)** | Ghi: "Người cần kinh của căn nhà XXX" | Write: "Spirit of house XXX" | "Người cần kinh của căn nhà 123 Đường A" |
| **House identifier** | XXX = tên chủ hộ hoặc bất kỳ cư dân | XXX = homeowner or any resident's name | "Tên chủ" or "Tên người sống trong nhà" |
| **Address alternative** | Có thể ghi địa chỉ nhà | Can write address instead | "Căn nhà số 5, Đường Lê Lợi" |
| **Left side (lạc khoản)** | Ghi tên người niệm | Write reciter's name | Resident or family member |
| **Date (left side)** | Điền sau khi niệm xong | Fill after recitation complete | Post-completion |

#### Type 5: Karma Resolution / Enmity Dissolution (Hóa Giải Oan Kết)

| Field | Vietnamese Rule | English Rule | Restriction |
|-------|-----------------|-------------|------------|
| **Right side (kính tặng)** | Ghi: "XXX hóa giải oan kết" | Write: "XXX resolve enmity" | **Reciter's name ONLY** |
| **Other person's name** | ❌ NEVER write the other party's name | Do NOT name the other person | Violates karmic protocol |
| **Self-resolution case** | Ghi tên người niệm | Usually reciter's own name | "Ngân hóa giải oan kết" |
| **On behalf of parent** | Có thể ghi tên cha hoặc mẹ | Can write parent's name | Single parent only, not both |
| **Both parents** | ❌ NEVER write both parents simultaneously | One parent at a time | Separate sheets if needed |
| **Left side (lạc khoản)** | Ghi tên người niệm | Write reciter's name | Explicit requirement |
| **Date (left side)** | Điền sau khi niệm xong | Fill after recitation complete | Post-completion |

#### Type 6: Reserve Supply (Dự Trữ / Reserve)

| Field | Vietnamese Rule | English Rule | Filling Timing |
|-------|-----------------|-------------|----------------|
| **Left side (lạc khoản)** | Bắt buộc điền trước niệm | MUST fill before reciting | Pre-recitation |
| **Right side (kính tặng)** | Có thể để trống hoặc điền trước | Can leave blank or fill pre-recitation | Optional pre-filling |
| **Date (left side)** | Có thể để trống hoặc ghi ngày hoàn thành | Leave blank or write completion date | Post-completion or blank |
| **When using reserve** | Điền kính tặng + ngày tháng khi dùng | Fill recipient + date when using | At burning time |
| **No recipient scenario** | Để trống kính tặng để dùng sau | Blank recipient until needed | Pre-burning flexibility |

---

### Part B: Dotting Procedures (Chấm Điểm)

#### Pen Requirements

| Requirement | Specification | Details | Acceptable | Not Acceptable |
|------------|---------------|---------|-----------|----------------|
| **Color** | Màu đỏ | Red only | Bright red, dark red | Blue, black, green, pink, orange |
| **Pen type** | Bút nước | Water-based marker/pen | Red marker, red felt pen | Highlighter (too large), pencil (too light), pen with ball point |
| **Intensity** | Màu đỏ hơi đậm | Moderately dark red | Red ink that's clearly visible | Very faint red (too light), extremely dark (looks black) |
| **Consistency** | Bút phải được thử trước | Test pen before use | Verify color on paper first | Using untested pen |

#### Dot Size & Quality

| Parameter | Standard | Details |
|-----------|----------|---------|
| **Dot size** | 50%–80% of circle area | Occupy majority of circle, not tiny |
| **Shape** | Điểm (dot/点) | Circular/round dot |
| **Not allowed** | ❌ Checkmark (✓), X mark, filled circle, line mark | Must be a dot only |
| **Dot placement** | Chính giữa vòng tròn | Center of circle |
| **Overlap** | Không được tô chồng lên kinh văn | Don't mark over mantra text |
| **Darkness** | Đủ đậm để nhìn rõ | Clear and visible when burned |

#### Dotting Sequence & Timing

| Rule | Requirement | Rationale |
|------|------------|-----------|
| **Must complete recitation first** | Nhất định phải niệm xong rồi mới chấm | Never dot before reciting |
| **Can batch dot** | Có thể niệm nhiều biến rồi mới chấm hoặc niệm xong toàn bộ rồi chấm | Acceptable to batch-dot after completing multiple repetitions or entire sheet |
| **Pattern direction** | Tốt nhất chấm từ dưới lên trên | Best to dot upward (bottom to top) |
| **By mantra type** | Có thể chấm từng loại kinh hoặc đồng thời cả 4 loại | Can dot by mantra type or simultaneously |
| **No over-dotting** | Số biến niệm ≥ số vòng tròn quy định (không ít hơn) | Can exceed required dots, never do fewer repetitions than circles |
| **Excess repetitions** | Nếu niệm nhiều hơn, không cần chấm hết | If you recite more, don't need to dot all |
| **Before 10 PM** | Thông thường nên chấm trước 22 giờ | Standard before 10 PM; avoid late night |
| **Time limit** | Nếu lỡ không chấm trong ngày, có thể sang ngày hôm sau, nhưng thường không quá 7 ngày | If not dotted same day, can do next day, but not beyond 7 days |
| **Storm safety** | Khi có sấm sét, không nên chấm | During thunder/lightning, avoid dotting |

#### Correction Procedures

| Situation | Action | Details |
|-----------|--------|---------|
| **Mistakenly dotted before reciting** | Bổ sung niệm đủ số biến cho những vòng tròn đã chấm | Immediately recite the mantras for those dotted circles |
| **Dotted wrong mantra** | Có thể chấm lại bằng bút đỏ khác (hoặc để đó) | Can re-dot with different red pen or leave as-is (still valid) |
| **Dot too small** | Có thể chấm lại với điểm lớn hơn chồng lên trên | Re-dot with larger dot overlaying original |
| **Unclear dot** | Chấm lại để đảm bảo rõ ràng | Re-dot for clarity |

---

### Part C: Red Cloth Protection During Dotting (Vải Đỏ Bảo Hộ)

#### Purpose & Rationale

| Aspect | Detail |
|--------|--------|
| **Spiritual threat** | Khi chấm Ngôi Nhà Nhỏ, để tránh cô hồn vong linh đến tranh kinh | During dotting, spirits/ghosts may attempt to interfere; red cloth prevents this |
| **Energy barrier** | Vải đỏ tạo ra "trường năng lượng" bảo vệ | Red cloth creates protective energy barrier |
| **Recipient focus** | Năng lượng được hướng đúng đến người cần kinh, không bị phân tán | Energy correctly directed to recipient, not scattered |

#### Physical Requirements

| Requirement | Specification | Details | Acceptable | Not Acceptable |
|------------|---------------|---------|-----------|----------------|
| **Material** | Vải, giấy đỏ, nhựa đỏ | Fabric, red paper, red plastic | Cloth, kraft paper, plastic sheets | Uncoated paper (too fragile), vinyl, polyester |
| **Size minimum** | 60 cm × 60 cm (tối thiểu) | Minimum: 60×60 cm | 60×60, 70×70, 80×80 cm | Smaller than 60×60 |
| **Folding allowance** | Nếu gấp lại không được nhỏ hơn kích thước A4 | If folded, minimum A4 size (21×29.7 cm) | Folded to A4+ acceptable | Folded smaller than A4 |
| **Continuity** | Phải là một tấm liền | Must be one continuous piece | Single sheet, not patchwork | Stitched/glued patchwork pieces |
| **Patchwork** | Nếu ghép thì phải khâu hoặc dán lại thành một tấm | If joined, must be sewn or glued | Professionally joined seams | Multiple loose pieces |
| **Color** | Màu đỏ thuần | Pure red color | Bright red, dark red, burgundy | Orange-red, pink, mixed colors |
| **Pattern** | Có thể có hoa văn chìm (subtle) | Can have subtle/recessed patterns | Embossed designs, faint patterns | Bright/obvious patterns |
| **Prohibited imagery** | ❌ Không được có hình người hoặc động vật | NO human or animal images | Abstract patterns, geometric designs | Printed people, animals, faces |
| **Fabric type** | Có thể dùng bất kỳ loại vải đỏ | Any fabric type acceptable | Cotton, silk, linen, synthetic | Sheer fabric (too thin) |
| **Care** | Vải đỏ có thể giặt sạch | Can be washed | Washable fabric | One-use only |
| **Alternative table** | Có thể dùng một chiếc bàn màu đỏ mới | Can use a new red table instead | New red desk/table (correct size) | Used/stained table |

#### Placement & Setup

| Setup Aspect | Requirement | Details |
|------------|-------------|---------|
| **Placement** | Lót bên dưới Ngôi Nhà Nhỏ | Place red cloth UNDER the Little House |
| **Coverage** | Vải đỏ phải che phủ toàn bộ Ngôi Nhà Nhỏ | Red cloth must cover entire sheet |
| **Overlap minimum** | Vải phải lớn hơn khổ Ngôi Nhà Nhỏ (≥ 60×60 cm) | Cloth bigger than sheet dimensions |
| **Surface stiffness** | Nếu vải mềm, có thể đặt thêm tấm bìa cứng màu đỏ bên trên | If fabric too soft, place red cardboard on top for rigidity |
| **Glass prohibition** | ❌ Không được đặt kính lên trên vải đỏ | NEVER place glass over red cloth (reduces efficacy) |
| **Dotting surface** | Chấm trực tiếp lên vải hoặc bìa cứng | Dot on fabric or cardboard surface directly |

#### Color Specifications

| Color Detail | Requirement | Examples | Not Acceptable |
|-------------|------------|----------|----------------|
| **Color tone** | Màu đỏ tươi, đỏ chính | Bright red, true red | Faded red, brownish-red |
| **Hue** | Red primary color | Crimson, scarlet, cardinal red | Orange-red (cam đỏ), hot pink (hồng đậm) |
| **Single color** | Phải là màu đỏ thuần | Pure red, monochromatic | Printed with multiple colors |
| **Vibrancy** | Nên sáng/tươi | Ideally vibrant | Very dark or muddy red |

---

### Part D: Timing & Safety

| Consideration | Rule | Details |
|---------------|------|---------|
| **Dotting deadline** | Nên chấm trước 22 giờ (10 PM) | Standard: before 10 PM evening |
| **Extension allowance** | Nếu khí trường tốt có trải vải đỏ, không nên quá 24 giờ | With good feng shui + red cloth, max 24 hours |
| **Multi-day allowance** | Không nên kéo dài quá 7 ngày | Complete within 7 days of recitation |
| **Thunder/lightning** | Khi có sấm sét, không nên chấm Ngôi Nhà Nhỏ | Avoid dotting during thunderstorms |
| **Weather** | Không nên chấm khi mưa to, gió lớn | Avoid heavy rain, strong wind (dark yin energy) |
| **Batching* | Một ngày có thể chấm nhiều tờ Ngôi Nhà Nhỏ | Can dot multiple sheets in one session |

---

## Input Contract (TypeScript DTOs)

```typescript
interface LittleHouseFillingDto {
  sheetId: string;
  littleHouseType: 'spirit_creditor' | 'deceased' | 'fetus' | 'house_spirit' | 'karma_resolution' | 'reserve';

  // Field filling
  recipientField?: string;      // "người cần kinh của XXX", "Tên người mất", etc.
  practitionerName: string;     // Must match reciter
  completionDate?: string;      // YYYY-MM-DD or Chinese date

  fillingOrder?: {
    recipientFilledBeforeReciting?: boolean;
    practitionerFilledBeforeReciting?: boolean; // Must always be true
    dateFilledAfterReciting?: boolean;          // Should be true
  };
}

interface DottingSessionDto {
  sheetId: string;
  redClothPlaced: boolean;
  redClothDimensions?: { width: number; height: number; unit: 'cm' | 'inch' };
  dotColor: 'red';
  sessionTime: Date;
  mantrasCompleted: {
    compassionCount: number;
    heartSutraCount: number;
    pureLandCount: number;
    sevenBuddhaCount: number;
  };
  dotsAppliedCounts?: {
    compassionDots: number;
    heartSutraDots: number;
    pureLandDots: number;
    sevenBuddaDots: number;
  };
  dottingQuality: 'good' | 'acceptable' | 'needs_redo';
  weatherConditions?: 'clear' | 'rainy' | 'stormy';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

interface FillingValidationResult {
  isValid: boolean;
  fieldErrors: string[];
  warnings: string[];
  canProceedToDotting: boolean;
  dottingPrerequisites: {
    redClothReady: boolean;
    allRecitationsComplete: boolean;
    correctFillingDone: boolean;
  };
}

interface DottingValidationResult {
  isValid: boolean;
  redClothCompliant: boolean;
  dotQualityOK: boolean;
  safeConditions: boolean;  // not during storm, before 10 PM
  warnings: string[];
  readyToBurn: boolean;
}
```

## Write Path (Pseudocode API)

### 1. Validate Field Filling

```
POST /api/engagement/little-house/:sheetId/validate-filling

1. Extract littleHouseType, recipientField, practitionerName from DTO
2. Validate field syntax by type:

   IF littleHouseType = 'spirit_creditor':
     → recipientField must match "人需经文的XXX" pattern
     → practitionerName must be non-empty
     → BLOCK if missing either

   IF littleHouseType = 'deceased':
     → recipientField must contain name (± relationship prefix)
     → Can use "某某的父亲" pattern if name unknown
     → BLOCK if all blank

   IF littleHouseType = 'fetus':
     → recipientField must match "子的XXX" pattern (mother only)
     → ❌ BLOCK if contains father's name
     → ❌ BLOCK if contains "流产" or "堕胎" keywords
     → ❌ BLOCK if both parents listed

   IF littleHouseType = 'karma_resolution':
     → recipientField must match "XXX化解冤结" pattern
     → XXX = reciter name (NOT other party)
     → ❌ BLOCK if other party's name present

   IF littleHouseType = 'reserve':
     → practitionerName MUST be filled (required pre-reciting)
     → recipientField can be blank (fill at use time)

3. Check filling order:
   → practitionerName MUST be pre-filled before reciting
   → date SHOULD be filled post-reciting (optional pre-fill)

4. RETURN FillingValidationResult {
     isValid: boolean,
     fieldErrors: [...],
     warnings: [...],
     canProceedToDotting: (no errors & all required fields complete)
   }
```

### 2. Validate Red Cloth Setup

```
POST /api/engagement/little-house/:sheetId/validate-dotting-readiness

1. Extract redClothPlaced, redClothDimensions, weatherConditions, timeOfDay
2. Validate red cloth:
   - IF !redClothPlaced:
     → WARN: "Vải đỏ chưa lót bên dưới Ngôi Nhà Nhỏ (yêu cầu 60×60 cm)"
   - IF redClothDimensions AND (width < 60 OR height < 60):
     → BLOCK: "Kích thước vải đỏ không đủ (tối thiểu 60×60 cm)"

3. Check timing safety:
   - IF timeOfDay = 'night' AND time > 22:00:
     → WARN: "Sau 22 giờ tối, công đức có thể giảm"
   - IF weatherConditions = 'stormy':
     → BLOCK: "Sấm sét — không được chấm Ngôi Nhà Nhỏ"
   - IF weatherConditions = 'rainy' AND !redClothPlaced:
     → WARN: "Mưa + không có vải đỏ: năng lượng yin quá mạnh"

4. RETURN DottingValidationResult {
     redClothCompliant: boolean,
     safeConditions: boolean,
     warnings: [...]
   }
```

### 3. Log Dotting Session

```
POST /api/engagement/little-house/:sheetId/complete-dotting

1. Extract mantrasCompleted, dotsAppliedCounts, dottingQuality
2. Validate mantra-to-dot ratio:
   - FOR each mantra type:
     IF dotsAppliedCounts[type] > mantrasCompleted[type]:
       → BLOCK: "Chấm số lượng biến niệm được"

3. Validate dot quality metrics:
   - IF dottingQuality != 'good' AND dottingQuality != 'acceptable':
     → WARN: "Chất lượng chấm có vấn đề, cân nhắc chấm lại"

4. Check timing restrictions:
   - IF timeOfDay = 'night' AND time > 24:00:
     → BLOCK: "Vượt quá 24 giờ từ lúc hoàn thành niệm (hoặc 7 ngày nếu qua đêm)"

5. Mark sheet status:
   - littleHouseSheet.status = 'DOTTED'
   - littleHouseSheet.dottedAt = now()

6. Log audit: "little_house.dotting_completed"

7. Return success + ready-for-burning message
```

---

## FE Behavior (ASCII Wireframe)

### FIELD FILLING VALIDATION

```
┌──────────────────────────────────────────────────────┐
│ ĐIỀN NGÔI NHÀ NHỎ — Fill Little House Form          │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Loại Ngôi Nhà Nhỏ:                                  │
│ [Dropdown: Người cần kinh của người còn sống ▼]    │
│                                                      │
│ Phần KỊ TẶNG (bên phải):                             │
│ [Input: Người cần kinh của ___________]             │
│                                                      │
│ Phần LẠC KHOẢN (bên trái):                           │
│ Tên người niệm: [Input: ___________]                │
│ (⚠️ BẮT BUỘC điền trước niệm)                       │
│                                                      │
│ Ngày tháng: [Date picker] ← điền sau khi niệm xong│
│                                                      │
│ [Quay Lại]  [Kiểm Tra]                              │
│                                                      │
└──────────────────────────────────────────────────────┘

[VALIDATION RESULT - SUCCESS]:

┌──────────────────────────────────────────────────────┐
│ ✅ ĐIỀN ĐẦY ĐỦ — Form Complete                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Kị tặng: "Người cần kinh của Mẹ" ✓                  │
│ Lạc khoản: "Ngân" ✓                                 │
│ Ngày tháng: "2026-04-05" ✓                          │
│                                                      │
│ Sẵn sàng bắt đầu chấm điểm.                         │
│                                                      │
│ [Tiếp Tục Chấm Điểm]                                │
│                                                      │
└──────────────────────────────────────────────────────┘

[VALIDATION RESULT - ERROR]:

┌──────────────────────────────────────────────────────┐
│ ❌ ĐIỀN KHÔNG ĐẦY ĐỦ — Validation Error            │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Lỗi:                                                │
│ • Tên người niệm (lạc khoản) chưa điền             │
│   ⚠️ PHẢI điền tên trước khi bắt đầu niệm!         │
│                                                      │
│ • Phần kị tặng có thể để trống trước niệm,          │
│   nhưng PHẢI điền trước khi chấm.                   │
│                                                      │
│ [Chỉnh Sửa]  [Quay Lại]                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### RED CLOTH SETUP CHECK

```
┌──────────────────────────────────────────────────────┐
│ KIỂM TRA CHO CẢN CHẤM ĐIỂM — Pre-Dotting Check     │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ✅ Điền form xong:  ✓                               │
│ ✅ Niệm xong:       ✓ (49 biến Đại Bi, etc.)      │
│                                                      │
│ ⚠️ CHUẨN BỊ:                                        │
│                                                      │
│ □ Đã lót vải đỏ dưới Ngôi Nhà Nhỏ?                 │
│   → Kích thước tối thiểu: 60 cm × 60 cm             │
│   → Màu đỏ thuần (không cam, hồng, v.v.)          │
│                                                      │
│ □ Đã chuẩn bị bút đỏ?                              │
│   → Bút nước màu đỏ đậm                             │
│   → Thử bút trên giấy trước                         │
│                                                      │
│ □ Thời tiết:                                        │
│   ○ Trời sáng/chiều tốt    ✓                        │
│   ○ Mưa (ổn)               ⚠️ Cần vải đỏ bảo vệ   │
│   ○ Sấm sét / Giông bão    ❌ Không chấm            │
│                                                      │
│ Giờ giấc: 19:30 (Trước 22 giờ ✓)                   │
│                                                      │
│ [Quay Lại]  [Sẵn Sàng — Chấm Điểm]                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### DURING DOTTING SESSION

```
┌──────────────────────────────────────────────────────┐
│ ĐANG CHẤM ĐIỂM — Dotting in Progress                │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Ngôi Nhà Nhỏ: "Người cần kinh của Mẹ" — Ngân       │
│                                                      │
│ Tiến độ chấm (từ dưới lên):                        │
│                                                      │
│ 🔴 Chú Đại Bi:        ●●●●●●●○○ (7/9)             │
│ 🔴 Tâm Kinh:          ●●●○○○○ (3/7)               │
│ 🔴 Vãng Sanh Chú:      ●●○○○ (2/7)                 │
│ 🔴 Chân Ngôn 7 Phật:  ●○ (1/7)                     │
│                                                      │
│ Công dụng:                                          │
│ ✓ Chấm 1 biến Đại Bi xong                          │
│ ✓ Bút đỏ → Chấm vào vòng tròn tương ứng             │
│ ✓ Điểm phải chiếm 50–80% diện tích vòng            │
│                                                      │
│ ℹ️ Ghi chú:                                         │
│ • Chấm từ DƯỚI LÊN (tuân theo thứ tự)             │
│ • Mỗi lần niệm xong mới chấm (không chấm trước)    │
│ • Có thể chấm ngay hoặc chấm sau nhiều biến        │
│                                                      │
│ [Ghi Nhận Chấm Xong]  [Tiếp Tục]                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### DOTTING COMPLETE

```
┌──────────────────────────────────────────────────────┐
│ ✅ CHẤM ĐIỂM HOÀN THÀNH — Dotting Complete          │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Ngôi Nhà Nhỏ: "Người cần kinh của Mẹ" — Ngân       │
│                                                      │
│ ✅ Chú Đại Bi:        ●●●●●●●●● (9/9)  ✓           │
│ ✅ Tâm Kinh:          ●●●●●●● (7/7)     ✓           │
│ ✅ Vãng Sanh Chú:      ●●●●●●● (7/7)     ✓           │
│ ✅ Chân Ngôn 7 Phật:  ●●●●●●● (7/7)     ✓           │
│                                                      │
│ 📊 TỔNG HỢP:                                       │
│ • Tất cả kinh văn đã niệm xong               ✓      │
│ • Đã chấm điểm xong với bút đỏ               ✓      │
│ • Lót vải đỏ bảo hộ                          ✓      │
│                                                      │
│ 🔥 BỮC ĐỐT:                                        │
│                                                      │
│ Ngôi Nhà Nhỏ này sẵn sàng để đốt.                  │
│                                                      │
│ Lời khuyên:                                         │
│ • Chọn thời gian tốt lành để đốt                  │
│ • Hoặc lưu trữ để dùng khi cần                     │
│                                                      │
│ [Xem Hướng Dẫn Đốt]  [Hoàn Thành]                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Schema Notes (Prisma Snippet)

```prisma
model LittleHouseSheet {
  id                    String   @id @default(cuid())
  practitionerId        String

  // Type & recipients
  littleHouseType       String   // spirit_creditor, deceased, fetus, house_spirit, karma_resolution, reserve
  recipientName         String?
  recipientRelation     String?  // "người cần kinh của", "mẹ", "ông nội", etc.
  practitionerName      String   // MUST be filled pre-reciting

  // Dates
  completionDate        DateTime? // date recitation finished
  dottingDate           DateTime?
  burningDate           DateTime?

  // Dotting status
  filledFields          Json     // { recipientFilled: bool, practitionerFilled: bool, dateFilled: bool }
  dottingStatus         String   @default("NOT_STARTED") // NOT_STARTED, IN_PROGRESS, COMPLETE
  dotColor              String?  // "red"
  redClothPlaced        Boolean @default(false)

  // Dot counts
  compassionDots        Int @default(0)
  heartSutraDots        Int @default(0)
  pureLandDots          Int @default(0)
  sevenBuddaDots        Int @default(0)

  // Quality metrics
  dotQuality            String?  // good, acceptable, needs_redo
  dottingQualityNotes   String?

  // Status lifecycle
  status                String @default("IN_RECITATION") // IN_RECITATION, READY_FOR_DOTTING, DOTTED, BURNED, ARCHIVED
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  practitioner          Practitioner @relation(fields: [practitionerId], references: [id])
  dottingAudit          DottingAuditRecord[]

  @@index([practitionerId])
  @@index([status])
  @@index([littleHouseType])
}

model DottingAuditRecord {
  id                    String   @id @default(cuid())
  sheetId               String
  sheet                 LittleHouseSheet @relation(fields: [sheetId], references: [id])

  redClothDimensions    Json?    // { width: 60, height: 60, unit: "cm" }
  redClothColor         String?
  dottingTime           DateTime
  dotColor              String   // red
  qualityAssessment     String   // good, acceptable, needs_redo
  weatherCondition      String?  // clear, rainy, stormy
  timeOfDay             String   // morning, afternoon, evening, night

  createdAt             DateTime @default(now())

  @@index([sheetId])
  @@index([dottingTime])
}

model FillingAuditRecord {
  id                    String   @id @default(cuid())
  sheetId               String

  recipientFieldFilled  DateTime?
  practitionerFieldFilled DateTime?
  dateFieldFilled       DateTime?
  fillingCompletedAt    DateTime @default(now())
}
```

## Audit

All filling and dotting activities logged:

| Action | Code | Trigger |
|--------|------|---------|
| Fields filled | `little_house.fields_filled` | User completes recipient/date entry |
| Field validation passed | `little_house.field_validation_passed` | Syntax checked, no errors |
| Field validation failed | `little_house.field_validation_failed` | Missing/invalid fields |
| Red cloth placed | `little_house.red_cloth_placed` | Protection setup confirmed |
| Dotting started | `little_house.dotting_started` | User begins marking circles |
| Dot applied | `little_house.dot_applied` | Each circle dotted |
| Dotting completed | `little_house.dotting_completed` | All circles marked, quality OK |
| Dotting quality issue | `little_house.dotting_quality_warning` | Dot too small, clarity issue |
| Ready for burning | `little_house.ready_for_burning` | Sheet complete, can burn |

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `recipient_field_invalid` | 400 | Kị tặng không đúng định dạng | Recipient field format invalid |
| `practitioner_name_missing` | 400 | Phải điền tên người niệm | Practitioner name required |
| `fetus_has_father_name` | 400 | Không được ghi tên cha (chỉ mẹ) | Father's name not allowed for fetus |
| `fetus_forbidden_keywords` | 400 | Không được dùng từ "sảy" hay "phá" | Forbidden keywords "miscarriage/abortion" |
| `red_cloth_size_insufficient` | 400 | Vải đỏ quá nhỏ (tối thiểu 60×60 cm) | Red cloth too small |
| `dotting_during_storm` | 400 | Sấm sét — cấm chấm Ngôi Nhà Nhỏ | Cannot dot during thunderstorm |
| `dots_exceed_mantras` | 400 | Chấm nhiều hơn niệm được | More dots than recitations |
| `dotted_before_reciting` | 422 | Chấm trước niệm (cần bổ sung niệm) | Dotted before reciting (need correction) |
| `dotting_too_late` | 422 | Quá 7 ngày từ hoàn thành niệm | Dotting beyond 7-day window |

## Notes for AI/Codegen

1. **Field Validation by Type**:
   - Parse `littleHouseType` → apply regex/pattern checks
   - `spirit_creditor`: Match "人需经文的" pattern
   - `fetus`: Reject if father present, forbid "流产/堕胎" keywords
   - `karma_resolution`: Ensure only reciter named, not other party
   - `reserve`: Allow blank recipient (fill at use time)

2. **Red Cloth Validation**:
   - Check dimensions: min 60×60 cm (or A4 if folded)
   - Color validation: pure red (RGB thresholds: R>180, G<100, B<100 roughly)
   - Warn if no red cloth; block if storm detected

3. **Dotting Quality**:
   - Track dot size (estimate as % of circle area)
   - Flag if dot < 50% or > 80% of circle
   - Warn if dotted before all mantras complete

4. **Timing Enforcement**:
   - If timeOfDay > 22:00 → warning (not blocked)
   - If weatherConditions = 'stormy' → BLOCK
   - If dottingDate - completionDate > 7 days → BLOCK

5. **Type-Specific Field Rules**:
   - Maintain regex patterns for each Little House type
   - Return specific error messages (not generic validation)
   - Suggest corrections (e.g., "Use mother's name only for fetus")

## Related

- `engagement/USE_CASES/little-house-specification-and-production.md` — Physical specs and purpose
- `engagement/USE_CASES/little-house-recipient-syntax-validator.md` — Recipient name validation
- `engagement/USE_CASES/validate-little-house-burn-conditions.md` — Burning procedures (post-dotting)
- `wisdom-qa/USE_CASES/little-house-recitation-practice-guidelines.md` — Recitation prerequisites before filling
- `design/04-schemas/LittleHouseSheet.prisma` — Data model
