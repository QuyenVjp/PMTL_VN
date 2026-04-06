# Phóng Sinh Nghi Thức — Life Liberation Ritual Procedure

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

---

## Purpose

Phóng sinh là một hình thức bố thí tròn đầy (tài thí, pháp thí, vô úy thí), mang lại công đức vô lượng cho người tu hành. Nghi thức phóng sinh được thiết kế để:
- **Tiêu tai, kéo dài thọ mạng** (remove calamities, extend lifespan)
- **Kết duyên với chúng sinh** (create karmic connection with sentient beings)
- **Hóa giải oan kết, tiêu trừ nghiệp chướng** (resolve karmic debts)

Tài liệu này hướng dẫn trình tự 5 bước chuẩn (Appreciation → Recitation → Prayer → Liberation → Appreciation) và các biến thể cho những tình huống khác nhau.

---

## Owner Module

`altar-management` — LifeLiberationService / RitualSequenceValidator

---

## Actors

- `member` — thực hành phóng sinh
- `system` — hướng dẫn, validate điều kiện, ghi nhận hoàn thành
- `teacher/mentor` — huấn luyện cách thực hiện đúng nghi thức

---

## Trigger

User khởi tạo quy trình phóng sinh → system hướng dẫn 5 bước chuẩn và các tùy chỉnh theo tình huống.

---

## Business Rules — 5 Bước Nghi Thức Phóng Sinh

### Bước 1: Cảm Ân (Appreciation & Gratitude)

**Hành động:**
- Chắp tay hướng lên trời
- Xưng ba lần:

> "Cảm ân Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát (Ma Ha Tát)."

**Ý nghĩa:** Bày tỏ lòng cảm ơn đối với Bồ Tát Quán Thế Âm đã gia hộ, tạo tâm tuyệt đối tôn kính.

**Audit:** `life-liberation.gratitude_expressed`

---

### Bước 2: Niệm Kinh (Recitation of Scriptures)

**Trên đường đi phóng sinh (En route to liberation site):**

Có thể bắt đầu niệm kinh khi đang trên đường. Trước tiên:

1. **Niệm 3 biến Chân Ngôn Tịnh Khẩu Nghiệp** (Mouth-Karma Purification Mantra)
2. **Xưng tên của mình:**
   > "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX tiêu tai kéo dài thọ mạng, con nhất định sẽ làm thêm nhiều công đức hơn nữa."

3. **Hoặc (nếu phóng sinh thay người khác):**
   > "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho XXX tiêu tai kéo dài thọ mạng..."

4. **Tiếp tục niệm Chú Đại Bi** (càng nhiều càng tốt)

**Tại nơi phóng sinh (At liberation site):**

Niệm theo thứ tự:
- **1 biến Chú Đại Bi** (Great Compassion Mantra)
- **1 biến Tâm Kinh** (Heart Sutra)
- **7 biến Chân Ngôn Diệt Tội của Bảy Đức Phật** (Seven Buddhas Extinction Karma Mantra)

**Nếu chưa biết niệm kinh:**
- ✅ Có thể **nhất tâm niệm thánh hiệu:**
  > "Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát."

**Audit:** `life-liberation.recitation_completed`

---

### Bước 3: Cầu Nguyện (Prayer & Wishes)

**Tình huống 1: Tự mình phóng sinh**

Cầu rằng:

> "Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát, con XXX hôm nay phóng sinh **[số lượng] con [loài]**, xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX **tiêu tai kéo dài thọ mạng**, hoặc **hóa giải oan kết, tiêu trừ nghiệp chướng** (hoặc những điều cầu nguyện hợp lý khác), con nhất định sẽ làm thêm nhiều công đức hơn nữa."

**Tình huống 2: Phóng sinh thay người khác**

Cầu rằng:

> "Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát, **XXX (tên người đó)** hôm nay phóng sinh **[số lượng] con [loài]**, xin Quán Thế Âm Bồ Tát gia hộ cho XXX **tiêu tai kéo dài thọ mạng** (hoặc gia hộ việc gì đó)."

**Lưu ý quan trọng:** Bất kể dùng tiền của người đó hay tiền của mình, **tốt nhất không nên nói số tiền**.

**Thêm một câu bảo vệ (QUAN TRỌNG):**

> "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX, hôm nay con giúp XXX phóng sinh, xin Bồ Tát gia hộ cho **nghiệp lực của XXX không do con XXX gánh chịu**, mong rằng việc phóng sinh của XXX có thể tiêu trừ nghiệp chướng của người ấy."

**Tình huống 3: Phóng sinh cho Sư phụ/Thầy cô**

Cầu rằng:

> "Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát, hôm nay con XXX phóng sinh **[số lượng] con [loài]** cho **Sư phụ Lư Đài Trưởng**, xin Bồ Tát gia hộ cho Sư phụ **thân thể khỏe mạnh, cứu độ được nhiều chúng sinh hơn nữa**."

Thêm câu:
> "Chúng con đồng sinh tâm từ bi, pháp hỷ."

**Tình huống 4: Phóng sinh cho người đã mất**

Có thể trong vòng **49 ngày sau khi mất** mà phóng sinh cho người thân.

Cầu rằng:

> "Nam Mô Đại Từ Đại Bi Quán Thế Âm Bồ Tát, con XXX (tên của con) hôm nay phóng sinh **[số lượng] con [loài]**, xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho **ZZZ (tên người mất) tiêu trừ nghiệp chướng**."

**Audit:** `life-liberation.wishes_recorded`, `life-liberation.scenario_validated`

---

### Bước 4: Phóng Sinh (Actual Liberation)

**Bước 4a: Cầu xin tha thứ cho môi trường (Environmental Declaration)**

Trước khi phóng sinh, cần cầu xin một câu:

> "Nếu việc phóng sinh này có liên quan đến vấn đề về **chủng loại hoặc ô nhiễm**, xin **Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát** và **chư vị Thần Hộ Pháp** từ bi tha thứ."

**Ý nghĩa:** Tránh những vấn đề do không thích hợp về:
- Loài được thả không thích hợp sinh tồn tại khu vực đó
- Nước (ví dụ: cá nước ngọt thả vào nước mặn, hoặc ngược lại)
- Ô nhiễm, hay trong nước có loài lớn ăn loài nhỏ

**Best practice:** Lựa chọn địa điểm phù hợp trước để bảo đảm việc phóng sinh được **viên mãn và như pháp**.

**Bước 4b: Niệm kinh liên tục trong quá trình phóng sinh**

Trong quá trình phóng sinh, liên tục niệm:
- **Chú Đại Bi** (Great Compassion Mantra)
- **Tâm Kinh** (Heart Sutra)
- **Vãng Sanh Chú** (Amitabha's Pure Land Mantra)

**Số biến không hạn định — càng nhiều càng tốt.**

**Bước 4c: Lần thứ hai xưng lại mục đích (Reaffirm before release)**

Trước khi thả cá/sinh vật xuống nước, cần nói lại một lần nữa:

> "XXX phóng sinh **[số lượng] con [loài]**, xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX (hoặc người thân XXX) **tiêu tai kéo dài thọ mạng**..."

**Bước 4d: Thực hiện phóng sinh (Gentle release)**

- **Nhẹ nhàng thả cá/sinh vật xuống nước** — tránh làm tổn thương
- **Không hướng kinh xuống nước** — hướng **lên trời** mà niệm

**Bước 4e: Xử lý cá chết (Dead Animal Protocol)**

Nếu có cá chết trong quá trình:
- **Niệm Vãng Sanh Chú** để siêu độ
- **Mỗi con cá chết: ít nhất 7 biến** Vãng Sanh Chú

**Audit:** `life-liberation.release_initiated`, `life-liberation.creatures_released`, `life-liberation.dead_animals_processed`

---

### Bước 5: Cảm Ân (Final Gratitude)

**Hành động:**
- Chắp tay
- Nói:

> "Cảm ân Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát (Ma Ha Tát)!"

**Ý nghĩa:** Kết thúc nghi thức, bày tỏ cảm ơn về sự linh ứng và gia hộ.

**Audit:** `life-liberation.ceremony_completed`, `life-liberation.session_logged`

---

## Input Contract (API/UI)

```typescript
interface LifeLiberationSessionDto {
  creatureType: "freshwater_fish" | "saltwater_fish" | "bird" | "insect" | "other"
  quantity: number
  releaseLocation: {
    lat: number
    lng: number
    label?: string
  }

  // Scenario
  scenario: "SELF" | "FOR_SOMEONE_ELSE" | "FOR_TEACHER" | "FOR_DECEASED"
  beneficiaryName?: string                    // For scenarios other than SELF
  beneficiaryType?: "TEACHER" | "FRIEND" | "STRANGER" | "DECEASED_RELATIVE"

  // Wishes/prayers
  wishes: Array<{
    type: "CALAMITY_REMOVAL" | "LIFESPAN_EXTENSION" | "KARMA_RESOLUTION" | "CUSTOM"
    details?: string
  }>

  // Environmental confirmation
  environmentalAwarenessConfirmed: boolean   // User confirms they checked habitat suitability

  // Tracking
  recitationMethod: "FULL_SUTRA" | "MANTRA_ONLY" | "MINDFULNESS_ONLY"
  deadAnimalsEncountered?: number
  completedAt?: DateTime
}
```

---

## Write Path

```
POST /api/altar-management/life-liberation/log-session

1. Load CreatureType + ReleaseLocation data
2. Validate eco-compatibility (see life-liberation-eco-compatibility-check.md):
   - If freshwater → freshwater location
   - If saltwater → saltwater location
   - Check for pollution/commercial fishing zones
3. Validate scenario + beneficiary details:
   - If FOR_SOMEONE_ELSE: require beneficiaryName + type
   - If FOR_DECEASED: ensure within 49 days of death (optional warning if older)
   - If FOR_TEACHER: validate teacher/mentor relationship
4. Validate wishes (max reasonable count)
5. Create LifeLiberationSession record:
   - userId, creatureType, quantity, releaseLocation
   - scenario, beneficiaryName, beneficiaryType
   - wishes[], recitationMethod
   - deadAnimalsEncountered, completedAt
6. Update UserStats.totalCreaturesLiberated += quantity
7. Emit audit events (see Audit section)
8. Return 200 success with session details + encouragement message
```

---

## FE Behavior — Life Liberation Ceremony Wizard

### Screen 1: Purpose & Readiness

```
┌─────────────────────────────────────────────────┐
│ 🕊️  Phóng Sinh — Giải Phóng Sinh Mạng          │
│─────────────────────────────────────────────────│
│                                                  │
│ Phóng sinh là bố thí trọn đầy:                  │
│ • Tài thí (tiền tài)                            │
│ • Pháp thí (dạy pháp)                           │
│ • Vô úy thí (ban sự bảo vệ)                    │
│                                                  │
│ Công dụng:                                      │
│ ✓ Tiêu tai, kéo dài thọ mạng                    │
│ ✓ Hóa giải oan kết, tiêu trừ nghiệp chướng    │
│ ✓ Tạo duyên với chúng sinh                      │
│                                                  │
│ Bạn đã sẵn sàng thực hiện nghi thức?           │
│ [Không, cần suy nghĩ thêm]                      │
│ [Vâng, tôi sẵn sàng]                            │
└─────────────────────────────────────────────────┘
```

### Screen 2: Choose Scenario

```
┌─────────────────────────────────────────────────┐
│ Chọn Loại Phóng Sinh                           │
│─────────────────────────────────────────────────│
│                                                  │
│ ⊙ Phóng sinh cho bản thân                       │
│   (tiêu tai, kéo dài thọ mạng)                  │
│                                                  │
│ ○ Phóng sinh thay người khác                    │
│   (bạn bè, người thân, người lạ)                │
│   Tên: [________]                               │
│                                                  │
│ ○ Phóng sinh cho Sư phụ/Thầy cô                │
│   Sư phụ: [________]                            │
│                                                  │
│ ○ Phóng sinh cho người đã mất                   │
│   (trong 49 ngày sau khi mất)                   │
│   Tên: [________]                               │
│                                                  │
│          [Tiếp tục →]  [Quay lại]               │
└─────────────────────────────────────────────────┘
```

### Screen 3: Creature Type & Quantity

```
┌─────────────────────────────────────────────────┐
│ Chọn Loài Sinh Vật                             │
│─────────────────────────────────────────────────│
│                                                  │
│ Loài: [Cá nước ngọt ▼]                          │
│       • Cá nước ngọt                             │
│       • Cá biển                                  │
│       • Chim chóc                                │
│       • Côn trùng                                │
│       • Khác                                     │
│                                                  │
│ Số lượng: [_____] con                            │
│                                                  │
│ 💡 Lưu ý: Cá không nên quá nhỏ                 │
│ (kích thước bàn tay trở lên là tốt)            │
│                                                  │
│          [Tiếp tục →]  [Quay lại]               │
└─────────────────────────────────────────────────┘
```

### Screen 4: Release Location & Eco Check

```
┌─────────────────────────────────────────────────┐
│ Địa Điểm Phóng Sinh                            │
│─────────────────────────────────────────────────│
│                                                  │
│ Vị trí: [_____________ ▼] (GPS tự động)        │
│                                                  │
│ Kiểm tra tương thích sinh cảnh:                │
│                                                  │
│ ⚠️  CẢNH BÁO:                                  │
│ Bạn chọn cá NƯỚC NGỌT nhưng vị trí là NƯỚC MẶN │
│ → Cá sẽ không sống sót                          │
│                                                  │
│ Hãy chọn vị trí với nước NGỌT hoặc thay đổi   │
│ loài cá sang cá biển (saltwater fish).         │
│                                                  │
│ [Thay đổi vị trí]  [Thay đổi loài]  [Tiếp tục] │
└─────────────────────────────────────────────────┘
```

### Screen 5: Wishes & Prayer

```
┌─────────────────────────────────────────────────┐
│ Cầu Nguyện                                      │
│─────────────────────────────────────────────────│
│                                                  │
│ Bạn cầu xin gì?                                 │
│                                                  │
│ ☐ Tiêu tai, kéo dài thọ mạng                   │
│ ☐ Hóa giải oan kết, tiêu trừ nghiệp chướng   │
│ ☐ Khác: [_____________________]                │
│                                                  │
│ 💡 Lưu ý: Cầu xin nên hợp lý, không quá tham │
│                                                  │
│          [Tiếp tục →]  [Quay lại]               │
└─────────────────────────────────────────────────┘
```

### Screen 6: Recitation Guidance & Confirmation

```
┌─────────────────────────────────────────────────┐
│ Hướng Dẫn Tụng Kinh & Xác Nhận                 │
│─────────────────────────────────────────────────│
│                                                  │
│ Trên đường đi phóng sinh:                       │
│ 1️⃣  Niệm 3 biến Tịnh Khẩu Nghiệp Chân Ngôn    │
│ 2️⃣  Xưng tên + cầu xin (tự tại)                │
│ 3️⃣  Niệm Chú Đại Bi (càng nhiều càng tốt)     │
│                                                  │
│ Tại nơi phóng sinh:                             │
│ • 1 biến Chú Đại Bi                             │
│ • 1 biến Tâm Kinh                               │
│ • 7 biến Chân Ngôn Diệt Tội 7 Đức Phật        │
│                                                  │
│ Trong quá trình phóng sinh:                    │
│ • Niệm Chú Đại Bi, Tâm Kinh, Vãng Sanh Chú   │
│ • Hướng kinh lên trời (không hướng xuống nước) │
│ • Thả sinh vật nhẹ nhàng, tránh tổn thương     │
│                                                  │
│ [ ] Tôi đã hiểu hướng dẫn trên                  │
│ [ ] Tôi sẵn sàng thực hiện đầy đủ              │
│                                                  │
│          [Bắt Đầu Phóng Sinh →]  [Quay lại]   │
└─────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model LifeLiberationSession {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Creature & location
  creatureType      String   // "freshwater_fish" | "saltwater_fish" | "bird" | "insect"
  quantity          Int
  releaseLocation   Json     // { lat, lng, label }

  // Scenario & beneficiary
  scenario          String   // "SELF" | "FOR_SOMEONE_ELSE" | "FOR_TEACHER" | "FOR_DECEASED"
  beneficiaryName   String?
  beneficiaryType   String?  // "TEACHER" | "FRIEND" | "STRANGER" | "DECEASED_RELATIVE"

  // Wishes & prayers
  wishes            Json[]   // Array of { type, details }
  recitationMethod  String   // "FULL_SUTRA" | "MANTRA_ONLY" | "MINDFULNESS_ONLY"

  // Special events
  deadAnimalsEncountered Int @default(0)

  // Completion
  completedAt       DateTime @default(now())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId, completedAt])
}

model UserAltarStats {
  // ... existing fields ...
  totalCreaturesLiberated Int @default(0)  // Cumulative quantity
  lastLifeLiberationAt    DateTime?
}
```

---

## Audit

| Action | Trigger | Severity |
|--------|---------|----------|
| `life-liberation.session_initiated` | User starts wizard | INFO |
| `life-liberation.scenario_selected` | User chooses scenario (self/other/teacher/deceased) | INFO |
| `life-liberation.eco_validated` | Creature type ↔ habitat compatibility confirmed | INFO |
| `life-liberation.recitation_started` | User begins recitation (en route) | INFO |
| `life-liberation.wishes_recorded` | Prayers/wishes captured | INFO |
| `life-liberation.release_initiated` | Liberation ceremony begins | INFO |
| `life-liberation.creatures_released` | Quantity liberated recorded | INFO |
| `life-liberation.dead_animals_processed` | Dead animals encountered, recited for | WARN |
| `life-liberation.ceremony_completed` | Final gratitude expressed | INFO |
| `life-liberation.session_logged` | Session record saved | INFO |

---

## Errors

| Condition | Code | HTTP | Message |
|-----------|------|------|---------|
| Creature type ≠ habitat | `life_liberation_eco_mismatch` | 400 | "Loài được chọn không phù hợp với địa điểm (ví dụ: cá nước ngọt → nước biển)" |
| Release location in commercial fishing zone | `life_liberation_unsafe_zone` | 400 | "Vị trí này có hoạt động đánh cá thương mại. Chọn nơi khác." |
| Deceased scenario >49 days | `life_liberation_timing_exceeded` | 400 | "Phóng sinh cho người mất chỉ có hiệu quả trong 49 ngày. Vui lòng cân nhắc." (warning, not blocking) |
| No beneficiary name (FOR_SOMEONE_ELSE scenario) | `beneficiary_name_required` | 400 | "Vui lòng nhập tên người được phóng sinh thay" |
| Eco check failed | `eco_validation_failed` | 400 | (specific error from eco-check module) |
| User not logged in | `unauthorized` | 401 | — |

---

## Notes for AI/Codegen

1. **Scenario-Driven Variations:** The 5-step ritual is universal, but the Prayer (Step 3) changes based on scenario. UI must conditionally show different prayer templates based on selected scenario.

2. **Eco-Compatibility Integration:** Integrate with `life-liberation-eco-compatibility-check.md` module. Before releasing, system should validate creature-habitat match.

3. **Environmental Awareness:** Before actual release (Step 4a), show a special declaration screen asking user to acknowledge environmental considerations.

4. **Gentle Release Instructions:** Step 4d requires explicit instruction to release gently. Consider video/animation guide.

5. **Dead Animal Protocol:** If user reports dead animals encountered during (Step 4e), automatically log additional recitations needed (7× Vãng Sanh per animal).

6. **Progress Tracking:** Display cumulative stats: "You have liberated 2,547 creatures this year — tremendous compassion!"

7. **Localization:** All Vietnamese text must use full diacritics (Á, À, Ả, Ã, Ạ, etc.).

8. **Post-Liberation Encouragement:** After ceremony completes, show message encouraging future practice and linking to next step (e.g., "Next: Daily recitation practice").

---

## Related

- [life-liberation-eco-compatibility-check.md](./life-liberation-eco-compatibility-check.md) — Validate species-habitat compatibility before release
- [life-liberation-skyward-gaze-protocol.md](./life-liberation-skyward-gaze-protocol.md) — Where to look/direct gaze when releasing
- [incense-offering-ritual-procedure.md](./incense-offering-ritual-procedure.md) — Incense offering before daily practice
- [daily-recitation-system.md](../../wisdom-qa/USE_CASES/daily-recitation-system.md) — Daily recitation practice that sustains liberation vows
