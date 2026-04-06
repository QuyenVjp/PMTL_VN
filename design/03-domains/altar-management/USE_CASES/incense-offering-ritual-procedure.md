# Trình Tự Dâng Hương Hàng Ngày — Daily Incense Offering Ritual Procedure

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

---

## Purpose

Trình tự dâng hương hàng ngày là một phần thiêng liêm của tu hành. Mỗi bước phải thực hiện đúng thứ tự, đúng điều kiện thời gian và địa điểm, để duy trì cân bằng năng lượng tinh thần và tôn trọng các Bồ Tát.

---

## Owner Module

`altar-management` — IncenseOfferingService / RitualSequenceValidator

---

## Actors

- `member` — thực hiện nghi thức dâng hương hàng ngày
- `system` — hướng dẫn, validate điều kiện thời gian/địa điểm, ghi nhận hoàn thành, tích lũy thống kê
- `admin` — quản lý tiêu chuẩn nghi thức, cập nhật hướng dẫn

---

## Trigger

User khởi động quy trình dâng hương từ altar interface hoặc practitioner app → system hướng dẫn từng bước theo trình tự 10 bước dưới đây.

---

## Business Rules — 10 Bước Trình Tự Dâng Hương

### Bước 1: Chuẩn Bị Địa Điểm (Preparation Area)

**Điều kiện:**
- ✅ Địa điểm sạch sẽ, trang nghiêm (bàn thờ, phòng tu)
- ✅ Hành động: Đảm bảo không có vật liệu nguy hiểm gần lửa
- ❌ KHÔNG dâng hương trong: phòng vệ sinh, nơi bẩn, nơi bệnh tật, nơi ô uế

**Audit:** `incense.preparation_started`

---

### Bước 2: Kích Hoạt Tâm Niệm (Activate Spiritual Intention)

**Hành động:**
- Người tu quỳ gối trước Phật đài (hoặc đứng tôn kính tùy tình hình thể chất)
- Niệm tịnh khẩu nghiệp chân ngôn 3-7 lần để thanh tịnh tâm niệm
- Cảnh báo: Tuyệt đối KHÔNG tính tiền cho bước này

**Điều kiện thời gian:**
- ✅ Sáng sớm (5:00-10:00 AM) — tối ưu
- ✅ Trưa / buổi chiều rõ ràng
- ⚠️ Cảnh báo: Sau 22:00 → Cảnh báo nhưng không block (trừ Heart Sutra)
- ❌ CẤIM: 2:00 AM - 5:00 AM — Không được dâng hương

**Điều kiện thời tiết:**
- ✅ Trời rõ, mưa nhỏ — có thể dâng
- ⚠️ Mưa bão, sấm chớp, mây đen — CẤM dâng (trừ Great Compassion Mantra)

**Audit:** `incense.intention_activated`, `incense.timing_validated`

---

### Bước 3: Tối Ưu Số Lượng Nhang (Validate Incense Count)

**Quy tắc số nén nhang bắt buộc:**
Phụ thuộc vào cấu hình bàn thờ:

| Cấu hình | Số nén nhang bắt buộc | Ghi chú |
|---------|----------------------|--------|
| 1 tượng, 1 lư | 1 nén | Dâng cho một vị Bồ Tát |
| N tượng, N lư (mỗi vị 1 lư riêng) | 1 nén/lư | Mỗi lư dâng riêng |
| N tượng, 1 lư (chung) | 3 nén (bắt buộc) | **PHẢI đầy đủ 3 nén** |

**Hành động:**
- System tính `requiredStickCount` từ `AltarProfile`
- Nếu user input không khớp → hiển thị lỗi và yêu cầu nhập lại
- Ghi nhận `stickCount` đã xác nhận

**Audit:** `incense.count_validated`

---

### Bước 4: Đốt/Chuẩn Bị Nhang (Ignite Incense)

**Hành động:**
- Người tu cầm nén nhang, châm lửa từ đèn dầu Phật hoặc bật lửa (tùy điều kiện)
- Nếu dâng **3 nén**, phải **cắm CÀ BA CÙNG LÚC** (xem `synchronized-incense-insertion.md`)
- Nếu dâng **1 nén**, cắm bình thường vào lư hương

**Cảnh báo:**
- ⚠️ Tuyệt đối KHÔNG thổi bằng miệng để tắt lửa → dùng **tay phẩy**
- ⚠️ Tuyệt đối KHÔNG cắm lẻ, không cắm từng cây một khi dâng 3 nén

**Audit:** `incense.ignited`, `incense.synchronized_insertion_confirmed` (if count == 3)

---

### Bước 5: Dâng Hương Trước Thích Ca (Offering to Buddha)

**Hành động:**
- Người tu cầm nhang (hoặc sau khi nhang đã cắm vào lư), quỳ gối trước tượng Thích Ca
- Niệm: "Xin Thích Ca Mục Ni Phật bảo vệ, gia hộ và ban phước cho con [Tên]"
- Thực hiện bái lạy (3 lần hoặc 9 lần tùy điều kiện thể chất)

**Điều kiện:**
- Sau khi nhang đã cắm hoàn thành → mới thực hiện bái lạy

**Audit:** `incense.buddha_offering_completed`

---

### Bước 6: Dâng Hương Trước Quán Thế Âm (Offering to Guanyin Bodhisattva)

**Hành động:**
- Chuyển sang tượng Quán Thế Âm (hoặc vị trí phù hợp trên bàn thờ)
- Niệm: "Xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát bảo vệ, gia hộ và ban phước cho con [Tên]"
- Thực hiện bái lạy (3 lần hoặc 9 lần)

**Audit:** `incense.guanyin_offering_completed`

---

### Bước 7: Dâng Hương Trước Địa Tạng Vương (Offering to Earth Store Bodhisattva) [Nếu Có]

**Điều kiện:**
- Chỉ áp dụng nếu bàn thờ có tượng Địa Tạng Vương (Earth Store Bodhisattva)

**Hành động:**
- Quỳ gối trước tượng Địa Tạng Vương
- Niệm: "Xin Địa Tạng Vương Bồ Tát bảo vệ gia tộc của con, hộ trì hành động tu hành"
- Bái lạy 3 lần

**Audit:** `incense.earth-store_offering_completed`

---

### Bước 8: Cầu Nguyện (Prayer & Wishes)

**Quy tắc cầu nguyện:**
- ✅ Tối đa **3 điều cầu xin** trên một lần dâng hương
- ❌ Quá 3 điều → Mất hiệu lực, không thành tựu
- ✅ Khi cầu xin cho người khác → Phải nêu rõ tên đầy đủ của người đó
- Lời khấn phải chân thành, cụ thể, không tham lam

**Ví dụ cầu nguyện hợp lệ:**
1. "Con cầu xin sức khỏe cho bản thân và gia đình"
2. "Con cầu xin trí tuệ để tu hành tốt hơn"
3. "Con cầu xin công việc thuận lợi"

**Điều kiện thêm:** Khi cầu nguyện xong, phải rõ ràng kết thúc: "Xin các Bồ Tát gia hộ"

**Audit:** `incense.wishes_recorded`, `incense.wish_count_validated`

---

### Bước 9: Hoàn Mãn Nghi Thức (Complete the Ritual)

**Hành động:**
- Thực hiện bái lạy cuối cùng (1 lần hoặc 3 lần) để biểu thị cảm ơn
- Quay ra, đứng dậy tôn kính
- Tâm niệm: "Cảm tạ Thích Ca, Quán Âm, Địa Tạng đã gia hộ"

**Cảnh báo:**
- ✅ Nhang được phép cháy hết tự nhiên (không cắt ngắn)
- ✅ Nếu nhang vô tình tắt → quay lại cắm lại, không cần lặp lại từ đầu

**Audit:** `incense.ritual_completed`

---

### Bước 10: Ghi Nhận Hoàn Thành (Log Completion)

**Hành động hệ thống:**
- System ghi nhận timestamp hoàn thành: `completedAt = now()`
- Tính tích lũy: `totalIncenseOfferingCount += stickCount`
- Hiển thị thống kê cho user (optional): "Bạn đã dâng X nén nhang trong tháng này"

**Thông báo:**
- ✅ Hiển thị toast: "Ghi nhận dâng hương thành công. Chúc bạn tu tập an lạc!"
- ✅ Gợi ý tiếp theo (nếu có): "Bước tiếp theo: tụng kinh Công Khóa hàng ngày"

**Audit:** `incense.session_logged`, `incense.stats_updated`

---

## Input Contract (API)

```typescript
interface DailyIncenseOfferingDto {
  altarProfileId: string
  stickCount: number              // Số nén nhang dâng (1 hoặc 3)
  buddhaOffering: {
    confirmed: boolean            // Đã dâng trước Thích Ca?
    timestamp?: DateTime
  }
  guanyinOffering: {
    confirmed: boolean            // Đã dâng trước Quán Âm?
    timestamp?: DateTime
  }
  earthStoreOffering?: {
    confirmed: boolean            // Đã dâng trước Địa Tạng? (optional)
    timestamp?: DateTime
  }
  wishes: Array<{
    text: string                  // Nội dung cầu nguyện
    targetName?: string           // Tên người được cầu cho
  }>                              // Max 3 wishes
  weatherCondition?: string       // "CLEAR" | "RAIN_LIGHT" | "STORM" | "THUNDER"
  timeOfDay?: string              // "EARLY_MORNING" | "MORNING" | "NOON" | "AFTERNOON" | "EVENING" | "NIGHT"
}
```

---

## Write Path

```
POST /api/altar-management/incense/log-daily-offering

1. Load AltarProfile (statueCount, burnerCount, config)
2. Validate weatherCondition & timeOfDay:
   - If STORM/THUNDER & (not Great-Compassion-only context):
     → 403 error: "Thời tiết không thích hợp để dâng hương"
   - If 2:00 AM - 5:00 AM:
     → 400 error: "Khung giờ này cấm dâng hương"
3. Compute requiredStickCount from AltarProfile
4. Validate dto.stickCount == requiredStickCount
5. Validate wishes.length <= 3
6. Create IncenseOfferingSession record:
   - userId, stickCount, buddhaOfferingAt, guanyinOfferingAt, earthStoreOfferingAt, wishesList, completedAt
7. Update UserStats.totalIncenseOfferings += stickCount
8. Emit audit events (see Audit section)
9. Return 200 success with session details + encouragement message
```

---

## FE Behavior — Multi-Step Wizard UI

### Screen 1: Preparation & Timing Check

```
┌─────────────────────────────────────────────────┐
│ 🏛️  Dâng Hương Hàng Ngày                       │
│─────────────────────────────────────────────────│
│                                                  │
│ Thời gian hiện tại: 09:30 (Sáng)               │
│ Thời tiết: Trời rõ ☀️                           │
│                                                  │
│ ✅ Điều kiện thuận lợi để dâng hương            │
│                                                  │
│ Số nén nhang bắt buộc: 3 nén                   │
│ (Vì bàn thờ 3 Bồ Tát, 1 lư hương chung)       │
│                                                  │
│ Chuẩn bị hoàn tất?                            │
│ [ ] Địa điểm sạch sẽ, không bẩn                │
│ [ ] Nhang đã chuẩn bị đầy đủ                    │
│                                                  │
│          [Tiếp tục →]  [Huỷ]                   │
└─────────────────────────────────────────────────┘
```

### Screen 2: Sequential Offering Checklist

```
┌─────────────────────────────────────────────────┐
│ Trình Tự Dâng Hương — Bước Cụ Thể              │
│─────────────────────────────────────────────────│
│                                                  │
│ ✅ Bước 1: Kích hoạt tâm niệm                  │
│ ✅ Bước 2: Cắm 3 nén nhang CÙNG LÚC             │
│ ⏳ Bước 3: Dâng hương trước Thích Ca            │
│    [ ] Đã niệm cầu xin                          │
│    [ ] Đã bái lạy                               │
│ ⏳ Bước 4: Dâng hương trước Quán Âm             │
│ ⏳ Bước 5: Cầu nguyện                           │
│                                                  │
│          [Tiếp tục bước 3 →]  [Quay lại]       │
└─────────────────────────────────────────────────┘
```

### Screen 3: Prayer Wishes Input

```
┌─────────────────────────────────────────────────┐
│ Cầu Nguyện (Tối Đa 3 Điều)                     │
│─────────────────────────────────────────────────│
│                                                  │
│ ① Cầu xin:                                     │
│    [Con cầu xin sức khỏe cho gia đình]         │
│                                                  │
│ ② Cầu xin:                                     │
│    [Con cầu xin tu hành tiến bộ]               │
│                                                  │
│ ③ Cầu xin:                                     │
│    [Để trống — không bắt buộc]                 │
│                                                  │
│ Số cầu xin: 2/3 ✅                              │
│                                                  │
│          [Hoàn Mãn →]  [Quay lại]              │
└─────────────────────────────────────────────────┘
```

---

## Part II: Detailed Ceremony Procedure — Step-by-Step

### For Practitioner with Buddha Altar at Home

**Prerequisites:** Must wash hands before approaching altar.

#### **Step 1: Light the Incense**

- Use flame from oil lamp to light incense stick
- Hold between two hands, raise to forehead level
- Mental recitation (silently in heart):

> "Đệ tử / thiện nam / tín nữ con tên là XXX, cảm ân Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát gia hộ, đệ tử / thiện nam / tín nữ con nay tại đây dâng hương vấn an Quán Thế Âm Bồ Tát."

#### **Step 2: Insert Incense into Holder**

- Insert incense stick(s) into incense burner
- If offering to multiple Bodhisattvas with separate burners: insert one per burner
- If shared burner: hold 3 sticks and insert together (no need to separate)

#### **Step 3: Invite and Pay Respect**

Recite respectfully (aligned with system's invitation audio if available):

> "Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát,
> Nam Mô Nam Kinh Bồ Tát,
> Nam Mô Thái Tuế Bồ Tát,
> Nam Mô Quan Đế Bồ Tát,
> Nam Mô Châu Thương Bồ Tát,
> Nam Mô Quan Bình Bồ Tát.
>
> Thiện nam / tín nữ XXX (own name) tại đây kính lễ vấn an Nam Mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát Ma Ha Tát, Nam Mô Nam Kinh Bồ Tát, Nam Mô Thái Tuế Bồ Tát, Nam Mô Quan Đế Bồ Tát, Nam Mô Châu Thương Bồ Tát, Nam Mô Quan Bình Bồ Tát, chư vị Bồ Tát."

#### **Step 4: Prostrate Seven Times**

**Proper form:**
- Place two palms together
- Kneel down, press hands to ground
- Forehead touches prayer mat (NOT hands touching ground with palms up)
- Stand back up naturally (no need to fully stand to height — can rise with hands still together)
- One complete prostration = down and back up once

**Repeat 7 times consecutively**

**Timing note:** Not rushed; each prostration should be intentional and respectful.

#### **Step 5: Recite Great Compassion Mantra**

- Recite 1 complete repetition of **Chú Đại Bi** (full mantra with title: Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni)

#### **Step 6: Recite Heart Sutra**

- Recite 1 complete repetition of **Tâm Kinh** (full mantra with title: Bát Nhã Ba La Mật Đa Tâm Kinh)

#### **Step 7: Prayer Request**

State wishes clearly (maximum 3 requests):

> "Cầu xin Quán Thế Âm Bồ Tát đại từ đại bi cứu khổ cứu nạn gia hộ cho con XXX (own name) thân thể khỏe mạnh, cát tường bình an..."

Examples (pick up to 3):
- Health recovery
- Family harmony
- Career success
- Spiritual progress
- Wisdom opening

#### **Step 8: Express Gratitude**

Recite with sincerity:

> "Cảm ân Nam Mô Quán Thế Âm Bồ Tát, Nam Mô Nam Kinh Bồ Tát, Nam Mô Thái Tuế Bồ Tát, Nam Mô Quan Đế Bồ Tát, Nam Mô Châu Thương Bồ Tát, Nam Mô Quan Bình Bồ Tát, chư vị Bồ Tát."

#### **Step 9: Prostrate Seven Times (Again)**

- Repeat the 7 prostrations from Step 4

#### **Step 10: Recite Purification Mantra**

- Recite 7 repetitions of **Thất Phật Diệt Tội Chân Ngôn** (Seven Buddhas Karma-Elimination Mantra)

#### **Step 11: Rise and Depart**

- Stand, place palms together
- Perform one final bow
- Step back one pace
- Can now proceed to daily recitation practice (công khóa) or personal scripture copying (kinh văn tự tu)

---

### For Practitioner WITHOUT Home Altar or While Traveling

**Mental Incense Offering (Tâm Hương Dâng)**

**Procedure:**

1. **Visualize your altar** — Mentally imagine the Buddha/Bodhisattva statue you normally venerate, positioned in front of you

2. **Mental incense ritual:**
   - Visualize lighting an oil lamp
   - Visualize lighting incense
   - Visualize raising the incense with both hands to forehead level
   - Visualize inserting incense into burner in front of Bodhisattva

3. **Mental prostration:**
   - In heart, kneel respectfully and bow deeply
   - Simultaneously recite one **Chú Đại Bi** and one **Tâm Kinh**

4. **Prayer request:**
   - State wishes clearly (maximum 3)
   - Use same prayer format as above

---

### Critical Warnings

**1) Incense Timing Requirements**

- ✅ **Optimal times:** 6am, 8am, 10am (morning); 6pm, 8pm (evening)
- ✅ Time should be consistent daily (if possible)
- ✅ Minimum: One incense offering per day (morning preferred if only one possible)
- ❌ **FORBIDDEN window:** 2:00–5:00 AM — absolutely no incense offering
- ⚠️ After 22:00: Warning but not blocked (except Heart Sutra which blocks after 22:00)

**2) Oil Lamp Management**

- ❌ **MUST extinguish oil lamp BEFORE incense completely burns out**
- ❌ **MUST NOT leave altar unattended** while oil lamp or incense is burning
- If lamp/incense still burning: practitioner must stay near altar; long absence = disrespect to Bodhisattva

**3) Offerings Location Rules**

- ❌ **NEVER offer incense in:** bathrooms, bedrooms (intimate space), dirty locations, illness areas, contaminated spaces
- ✅ **Proper locations:** dedicated altar, meditation room, living room (if clean)

**4) Altar Images on Screen**

- ❌ **Digital images (computer screen, book photos, phone pictures) are NOT suitable for incense offering**
- **Reason:** Screen images are not officially blessed; lack Bodhisattva's protective aura; can attract unintended spirits
- Mental incense is acceptable for traveling, but actual incense should only be offered before **permanently installed, blessed altar**

**5) Weather Restrictions**

- ❌ **NO incense during:** Thunder storms, heavy lightning, dark clouds, heavy rain
- ✅ **Exception:** Chú Đại Bi (Great Compassion Mantra) can be offered even in storms
- ✅ Light rain or overcast: OK to offer

---

## Schema Notes

```prisma
model IncenseOfferingSession {
  id                        String   @id @default(cuid())
  userId                    String
  user                      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  altarProfileId            String
  altarProfile              UserAltarProfile @relation(fields: [altarProfileId], references: [id])

  // Ritual sequence tracking
  stickCount                Int      // 1 hoặc 3
  buddhaOfferingAt          DateTime?
  guanyinOfferingAt         DateTime?
  earthStoreOfferingAt      DateTime?

  // Wishes / prayers
  wishes                    String[] // JSON array of wish objects

  // Metadata
  weatherCondition          String?  // "CLEAR" | "RAIN_LIGHT" | "STORM"
  timeOfDay                 String?  // "EARLY_MORNING" | ... | "NIGHT"

  // Completion
  completedAt               DateTime @default(now())
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt

  @@index([userId, completedAt])
}

model UserAltarStats {
  // ... existing fields ...
  totalIncenseOfferings     Int      @default(0) // Cumulative stick count
  lastIncenseOfferingAt     DateTime?
}
```

---

## Audit

| Action | Trigger | Severity |
|--------|---------|----------|
| `incense.offering_started` | User initiates ritual | INFO |
| `incense.preparation_validated` | Timing & location confirmed | INFO |
| `incense.stick_count_validated` | Required stick count matched | INFO |
| `incense.intention_activated` | Mind-karma purification completed | INFO |
| `incense.buddha_offering_completed` | Offering to Buddha confirmed | INFO |
| `incense.guanyin_offering_completed` | Offering to Guanyin completed | INFO |
| `incense.wishes_recorded` | Prayers logged (max 3) | INFO |
| `incense.ritual_completed` | All steps finished | INFO |
| `incense.session_logged` | Session record created | INFO |
| `incense.timing_blocked` | 2:00-5:00 AM attempt rejected | WARN |
| `incense.weather_blocked` | Storm/thunder attempt rejected | WARN |
| `incense.stick_count_mismatch` | Provided count ≠ required count | ERROR |

---

## Errors

| Condition | Code | HTTP | Message |
|-----------|------|------|---------|
| Wrong time (2-5 AM) | `incense_timing_blocked` | 400 | "Khung giờ 2:00-5:00 sáng cấm dâng hương" |
| Bad weather (storm/thunder) | `incense_weather_blocked` | 400 | "Thời tiết không thích hợp. Chỉ được dâng Great Compassion Mantra trong lúc bão." |
| Stick count mismatch | `incense_count_mismatch` | 400 | "Số nén nhang không khớp (yêu cầu: X, nhập: Y)" |
| Too many wishes (>3) | `incense_wish_count_exceeded` | 400 | "Tối đa 3 cầu xin. Vui lòng xóa bớt." |
| No altar profile | `altar_profile_not_found` | 404 | "Vui lòng setup bàn thờ trước" |
| User not logged in | `unauthorized` | 401 | — |

---

## Notes for AI/Codegen

1. **UI Wizard Pattern:** Implement as a 3-5 screen wizard with progress indicator. Each screen validates before advancing.
2. **Real-time Condition Checks:** On screen load, check current time & weather API. If conditions unfavorable, show red warning banner.
3. **Stick Count Auto-Population:** Load `AltarProfile`, compute `requiredStickCount`, pre-fill in UI (user can override if needed, but validation catches mismatch).
4. **Audit Trail:** Log every step completion with timestamp. Useful for tracking user consistency and spiritual progress analytics.
5. **Optional Stats Display:** After ritual completion, show monthly/yearly cumulative stats (e.g., "You've offered 127 incense sticks this month — great dedication!").
6. **Localization:** All Vietnamese text must use full diacritics (Á, À, Ả, Ã, Ạ, etc.).

---

## Related

- [synchronized-incense-insertion.md](./synchronized-incense-insertion.md) — Synchronized insertion rule for 3 sticks
- [grand-incense-state-machine.md](./grand-incense-state-machine.md) — Sandalwood ritual on auspicious days
- [daily-recitation-system.md](../../wisdom-qa/USE_CASES/daily-recitation-system.md) — Daily recitation practice (follow incense offering)
- [altar-offerings-guide.md](../../content/USE_CASES/altar-offerings-guide.md) — General altar offering practices
