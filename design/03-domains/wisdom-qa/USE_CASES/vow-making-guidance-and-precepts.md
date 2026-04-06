# Phát Nguyện và Giữ Giới — Vow-Making Guidance and Precepts

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-05

## Purpose

Practitioners must understand the spiritual gravity of vow-making. Breaking vows creates karmic debt that drains lifespan and health. The system guides practitioners to:
1. Make vows **suited to their capacity** (avoid "false speech" / vọng ngữ)
2. Fulfill vows faithfully
3. If broken, repent through structured mantra practice to restore balance

## Owner Module

`wisdom-qa` — RepentanceSystem / VowCommitmentGuard

## Actors

- **Practitioner**: Makes vow, commits to precept, or reports breach
- **System**: Validates vow feasibility, warns of consequences, offers repentance path
- **Wisdom Archive**: Records vow intent and fulfillment status

## Trigger

1. User begins *Vow-Making Flow* (e.g., dietary precept, life practice commitment)
2. User reports breaking a vow
3. System detects pattern of repeated vow-breaking

## Business Rules

### Making Vows (Phát Nguyện)

| Rule ID | Vietnamese | English | Severity |
|---------|-----------|---------|----------|
| VOW_001 | Phát nguyện phải tùy duyên, tùy sức | Vow must match capacity and circumstance | BLOCK |
| VOW_002 | Nếu không làm được, thì không phát nguyện | If you cannot do it, do not make vow | BLOCK |
| VOW_003 | Phát nguyện mà không làm được = nói dối (vọng ngữ) | Making vow you cannot keep = false speech | HIGH |
| VOW_004 | Nói dối sẽ nhận lấy ác báo | False speech incurs karmic punishment | HIGH |
| VOW_005 | Chư Phật Bồ Tát không nói dối | Buddhas and Bodhisattvas never speak falsely | REFERENCE |

### Consequences of Breaking Vows (Phạm Giới)

| Condition | Consequence | Severity |
|-----------|-------------|----------|
| Vow made + vow broken repeatedly | Lifespan drains (dương thọ hao tổn) | CRITICAL |
| Dietary vow broken (e.g., vegetarian vow broken) | Rapid disease manifestation (e.g., cancer) | CRITICAL |
| Vow broken due to negligence (chủ quan) | Punishment from Bodhisattvas & Dharma Protectors | HIGH |
| Vow broken due to force majeure (natural cause) | Compassionate reduction of karmic debt | MEDIUM |
| Number of break × severity = lifespan reduction | Each breach multiplies damage | CUMULATIVE |

### Repentance Path (Sám Hối)

| Step | Action | Detail |
|------|--------|--------|
| 1 | Acknowledge breach | Confess clearly to Bodhisattva: "I broke vow X" |
| 2 | Recite *Lễ Phật Đại Sám Hối Văn* | Minimum 7 repetitions, preferably daily for 7 days |
| 3 | Contemplate the error | Mental reflection (tĩnh tâm quán chiếu) on cause and consequence |
| 4 | Re-commit vow | "I will do my utmost (tận hết sức mình)" — measured promise |
| 5 | Life redemption acts | Phóng sinh (release life), donate, help others |
| 6 | Monitor restoration | Track health, lifespan, energy recovery |

## Nghi Thức Phát Nguyện Chi Tiết (Detailed Vow Ritual Procedure)

### Part E.1: Chuẩn Bị Trước Phát Nguyện (Pre-Vow Preparation Checklist)

Phát nguyện không chỉ là lời nói suông, mà là thiết lập "hợp đồng tâm linh" trực tiếp với chư Phật, Bồ Tát. Thiên địa quỷ thần sẽ ghi nhận lời thề này.

**Lựa chọn Ngày tháng (Flexibility Hack):**

| Rule | Detail | Lý do |
|------|--------|-------|
| PREP_001 | Không gắn chết vào ngày cố định (Ví dụ: không khấn "con xin ăn chay mùng 1, rằm, mùng 8, 23") | Tạo "bộ đệm an toàn" (buffer) để tránh thất nguyện nếu lịch công tác không thể tránh |
| PREP_002 | Dùng cấu trúc linh hoạt: "Con xin phát nguyện mỗi tháng ăn chay 4 ngày" | Cho phép ăn chay bù vào ngày khác trong tháng mà không bị khép tội "Vi phạm lời thề" |
| PREP_003 | Nếu vô tình quên hoặc gặp tình huống bất khả kháng, phải khấn báo cáo xin lỗi Quán Thế Âm Bồ Tát từ trước | Giao thức "Emergency Override" ngăn chặn hình phạt tự động |

**Không gian Thực hiện:**

| Điều Kiện | Yêu Cầu |
|-----------|---------|
| Nếu có bàn thờ PMTL | Thực hiện trực tiếp trước bàn thờ, thắp đèn dầu, dâng 3 nén nhang |
| Nếu KHÔNG có bàn thờ | Tìm nơi yên tĩnh, sáng sủa (cạnh cửa sổ hướng ra trời), TUYỆT ĐỐI CẤM làm trong bếp hay phòng ngủ vợ chồng. Thực hiện giao thức "Thắp Tâm Hương" (quán tưởng trong đầu, không gập người bái lạy vật lý để tránh rước vong linh) |

---

### Part E.2: Sáu Bước Nghi Thức Phát Nguyện (Six-Step Ritual Sequence)

**Bước 1: Kích Hoạt Không Gian & Cảm Tạ (Activation & Gratitude)**

Nếu có bàn thờ thì quỳ xuống; nếu dùng Tâm hương thì chỉ chắp tay nhìn lên trời. Đọc đúng thứ bậc chư vị Bồ Tát:

```
"Cảm tạ Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát"
"Cảm tạ Nam mô Nam Kinh Bồ Tát"
"Cảm tạ Nam mô Thái Tuế Bồ Tát"
"Cảm tạ Nam mô Quan Đế Bồ Tát, Châu Xương Bồ Tát, Quan Bình Bồ Tát"
```

**Bước 2: Mở Đầu Lời Nguyện (Opening Statement — Identity Verification)**

```
"Xin Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát
phù hộ cho con [Họ Tên thật của người phát nguyện] thân thể khỏe mạnh,
gia trì năng lượng cho con, để con có thể cố gắng học Phật, tu tâm, niệm kinh, tu hành."
```

**Bước 3: Đọc Lời Phát Nguyện (Core Vow Statement — The Binding Contract)**

```
"Con [Họ Tên] xin phát nguyện với Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại
Linh Cảm Quán Thế Âm Bồ Tát:
[Đọc lời nguyện đã soạn: 'Kể từ nay trở đi con nguyện mỗi tháng ăn chay 4 ngày...']"
```

**Bước 4: Cầu Xin Phần Thưởng/Mục Tiêu (Goal Request — Reward Specification)**

Sau khi phát nguyện, người có thể cầu xin Bồ Tát ban cho mình điều mong muốn. **Quy định nghiêm ngặt:**

| Rule | Detail |
|------|--------|
| GOAL_001 | Chỉ được cầu xin tối đa 2 đến 3 việc cụ thể |
| GOAL_002 | TUYỆT ĐỐI CẤM cầu xin qua loa (ví dụ: "Xin cho cả nhà khỏe mạnh") |
| GOAL_003 | Phải chỉ đích danh: "Xin Bồ Tát phù hộ cho [Tên người cụ thể] được [Sự việc cụ thể như: công việc thuận lợi, khỏi bệnh gan, v.v.]" |
| GOAL_004 | Lời nguyện càng lớn, cầu xin càng linh ứng |

**Bước 5: Lặp Lại Cảm Tạ & Đóng Giao Thức (Closing Gratitude — Contract Finalization)**

Đọc lại danh hiệu chư Bồ Tát một lần nữa để tạ ơn:

```
"Cảm tạ Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát"
"Cảm tạ Nam mô Nam Kinh Bồ Tát"
"Cảm tạ Nam mô Thái Tuế Bồ Tát"
"Cảm tạ Nam mô Quan Đế Bồ Tát, Châu Xương Bồ Tát, Quan Bình Bồ Tát"
```

**Bước 6: Bái Lạy (Physical Closure — Energetic Sealing)**

| Điều Kiện | Thực Hiện |
|-----------|----------|
| Nếu có bàn thờ | Lạy đúng 7 lạy để kết thúc |
| Nếu dùng Tâm hương (không bàn thờ) | Quán tưởng (tưởng tượng) trong đầu 1 hoặc 3 lạy. TUYỆT ĐỐI CẤM gập người bái lạy vật lý để tránh rước vong linh qua đường |

---

### Part E.3: Ba Định Luật Ràng Buộc Nhân Quả Sau Phát Nguyện (Three Karmic Binding Laws)

**Định Luật 1: Trừng Phạt Nếu Thất Nguyện (Vow-Breaker Penalty)**

| Tình Huống | Hậu Quả |
|-----------|--------|
| Phát nguyện là việc chư Phật, Bồ Tát, thiên địa quỷ thần đều biết | Bắt buộc phải thực hiện được |
| Nếu vì lý do cá nhân mà tự ý phá vỡ lời thề (ví dụ: tháng đó quên ăn chay hoặc cố tình ăn mặn) | Chắc chắn sẽ phải nhận hình phạt (báo ứng) rất nặng từ hệ thống nhân quả |
| Hình phạt | Mất năng lượng, tuổi thọ hao tổn, bệnh tật gia tăng |

**Định Luật 2: Giao Thức Báo Cáo Khẩn Cấp (Emergency Override Protocol)**

| Tình Huống | Hành Động Bắt Buộc |
|-----------|-------------------|
| Vô tình quên ngày ăn chay | Phải khấn báo cáo xin lỗi Quán Thế Âm Bồ Tát từ trước |
| Gặp tình huống bất khả kháng không thể ăn chay được | Phải khấn báo cáo xin lỗi và cam kết sẽ ăn bù vào một ngày khác sơm hơn hoặc muộn hơn trong tháng đó |
| Nếu im lặn cho qua | **CẤMI** — bắt buộc phải báo cáo |

**Định Luật 3: Giao Thức Hoàn Nguyện (Vow Fulfillment Protocol)**

| Tình Huống | Yêu Cầu |
|-----------|---------|
| Khi Bồ Tát đã giúp họ đạt được nguyện vọng (2-3 điều cầu xin ở Bước 4 thành hiện thực) | Họ **bắt buộc phải thực hiện nghi thức Hoàn Nguyện** |
| Thực hiện Hoàn Nguyện | Quay trở lại chính ngôi chùa hoặc Quán Âm Đường (nơi đã phát nguyện lúc đầu) để thắp hương, bái lạy, làm công đức hoặc bố thí tạ lễ (số lượng tùy tâm) |
| Nếu phát nguyện ăn chay tại bàn thờ ở nhà | Phải kiên trì thực hiện lời hứa ăn chay liên tục không bỏ cuộc — đó chính là đang Hoàn Nguyện |

---

## Input Contract (TypeScript DTOs)

```typescript
interface VowCommitmentDto {
  vowType: 'dietary_vegetarian' | 'precept_abstinence' | 'daily_recitation' | 'life_practice' | 'custom';
  vowDescription: string;
  estimatedDurationMonths: number;
  practitionerCapacityLevel: 'beginner' | 'intermediate' | 'advanced';
  motivationSource: string; // e.g., "health recovery", "karmic cleansing", "spiritual deepening"
}

interface VowBreachReportDto {
  vowId: string;
  breachReason: 'negligence' | 'force_majeure' | 'unclear_commitment';
  breachCount: number;
  dateOfBreach: Date;
  acknowledgment: string;
}

interface RepentancePlanDto {
  vowBreachId: string;
  mantras: {
    lePhatDaiSamHoiVanCount: number; // Lễ Phật Đại Sám Hối Văn repetitions
    durationDays: number;
  };
  supplementaryActs?: {
    phongSinhQuantity?: number;
    donationAmount?: number;
  };
  recommitmentStatement: string; // e.g., "I will do my utmost"
}

interface VowValidationResult {
  isValid: boolean;
  warnings: string[];
  riskFactors: {
    capacityMismatch: boolean;
    historicalFailureRate: number;
    lifeExpectancyRisk: 'low' | 'medium' | 'high';
  };
}
```

## Write Path (Pseudocode API)

### 1. Validate Vow at Creation

```
POST /api/wisdom-qa/vows/create

1. Extract vowType, estimatedDuration, practitionerCapacity
2. Query user's historical vow fulfillment rate
3. Calculate capacity mismatch:
   - IF duration > 12 months AND capacity = 'beginner'
     → warnings.push("VOW_001: Vow duration exceeds typical beginner capacity")
   - IF vow is dietary AND user has <90 days clean history
     → warnings.push("VOW_003: High risk of false speech; consider starting with 1 month commitment")

4. Calculate lifespan risk:
   - IF practitioner age > 55 AND high-commitment vow
     → riskFactors.lifeExpectancyRisk = 'high'

5. RETURN VowValidationResult {
     isValid: true (always allow vow creation, but surface warnings)
     warnings: [...],
     riskFactors: {...}
   }

6. FE displays acknowledgment modal if warnings exist
   User must click [理解风险，继续提交] to proceed
```

### 2. Record Vow Breach

```
POST /api/wisdom-qa/vows/report-breach

1. Extract vowId, breachReason, breachCount
2. IF breachReason = 'force_majeure'
   → Apply 30% karmic reduction (Bodhisattva compassion)
   → lifeExpectancyPenalty = breachCount * 0.7 years

3. IF breachReason = 'negligence'
   → Full penalty applies
   → lifeExpectancyPenalty = breachCount * 1.0 years

4. Update vow record:
   vow.breachCount += breachCount
   vow.lifeExpectancyDamage += lifeExpectancyPenalty
   vow.status = 'BROKEN'

5. Trigger RepentancePath workflow
   → Return repentance options (see step 3 below)
```

### 3. Offer Repentance Plan

```
GET /api/wisdom-qa/vows/{vowId}/repentance-options

1. Calculate minimum repentance required:
   - IF lifeExpectancyDamage = 3 years → MIN lePhatCount = 21 × 7 = 147 repetitions
   - Spread over 7 days = 21 daily

2. Calculate phóng sinh recommendation:
   - IF lifeExpectancyDamage = 3 years → Recommend 10,000–20,000 fish release

3. Build RepentancePlanDto with options:
   - Option A: "Intensive 7-day regimen" (21 repetitions daily × 7 days = 147 total)
   - Option B: "Extended 21-day" (7 repetitions daily × 21 days = 147 total)
   - Option C: "Ongoing" (7 repetitions daily indefinitely)

4. RETURN options with lifespan recovery projection
```

### 4. Monitor Repentance Progress

```
POST /api/wisdom-qa/repentance/{repentancePlanId}/log-session

1. Record mantra recitation count, date, Phóng Sinh acts
2. Calculate progress toward target
3. IF repentance complete:
   → Return message: "Sám hối hoàn thành. Chư Phật Bồ Tát sẽ tha thứ."
   → Restore: vow.status = 'REPENTED', lifeExpectancyDamage partially recovered
4. Update daily energy score reflecting "spiritual cleansing"
```

## FE Behavior (ASCII Wireframe)

### VOW CREATION FLOW

```
┌─────────────────────────────────────────────────────┐
│ TẠO NGUYỆN — Commit to a Vow                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Loại nguyện: [Dropdown: Ăn chay (Vegetarian) ▼]   │
│ Thời gian cam kết: [Input: 6 months]              │
│ Năng lực hiện tại: [Dropdown: Beginner ▼]         │
│ Lý do: [Text: Health recovery...]                 │
│                                                     │
│ [Tiếp tục]                                        │
│                                                     │
└─────────────────────────────────────────────────────┘

IF warnings exist:

┌─────────────────────────────────────────────────────┐
│ ⚠️ CẢNH BÁO: NGUYỆN KHÔNG PHÙ HỢP NĂNG LỰC         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Lý do cảnh báo:                                    │
│                                                     │
│ • Bạn là người bắt đầu, nhưng lại cam kết 6 tháng │
│ • Lịch sử: Chỉ giữ được 2 tháng lần trước         │
│ • Rủi ro: Nếu phá vỡ → mất năng lượng tuổi thọ   │
│                                                     │
│ ⚠️ LỰA CHỌN:                                       │
│                                                     │
│ ☐ Giảm xuống 1-2 tháng (an toàn hơn)              │
│ ☐ Hiểu rủi ro, vẫn cam kết 6 tháng                │
│                                                     │
│ [Hủy]  [Tiếp tục]                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### VOW BREACH REPORTING FLOW

```
┌─────────────────────────────────────────────────────┐
│ BÁO CÁO: PHẠM GIỜ — Report Broken Vow              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Nguyện đã phá vỡ: [Ăn Chay / Vegetarian]          │
│ Nguyên nhân:                                       │
│   ○ Do sơ suất của mình (negligence)              │
│   ○ Do hoàn cảnh bất khả kháng (force majeure)    │
│   ○ Do không rõ cam kết (unclear)                  │
│                                                     │
│ Số lần phá vỡ: [Dropdown: 1 lần]                  │
│ Lời thú nhận: [Text: Tôi đã ăn mặn vô tình...]   │
│                                                     │
│ [Hủy]  [Gửi Thông Báo]                            │
│                                                     │
└─────────────────────────────────────────────────────┘

AFTER SUBMISSION (REPENTANCE PATH TRIGGERED):

┌─────────────────────────────────────────────────────┐
│ SÁM HỐI — Repentance Plan                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Hệ quả: Mất ~1 năm tuổi thọ                       │
│ Cách phục hồi:                                     │
│                                                     │
│ 🔷 PHƯƠNG ÁN A: Cường độ cao (7 ngày)             │
│   • Niệm Lễ Phật 21 biến mỗi ngày                │
│   • Phóng sinh 2.000 con cá                       │
│   • Khôi phục tuổi thọ: +1 năm                    │
│                                                     │
│ 🔷 PHƯƠNG ÁN B: Kéo dài (21 ngày)                 │
│   • Niệm Lễ Phật 7 biến mỗi ngày                 │
│   • Phóng sinh tùy duyên                          │
│   • Khôi phục tuổi thọ: +1 năm                    │
│                                                     │
│ [Chọn A]  [Chọn B]  [Hủy]                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### REPENTANCE IN PROGRESS

```
┌─────────────────────────────────────────────────────┐
│ SÁM HỐI ĐANG TIẾN HÀNH — Repentance In Progress    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Ngôn ngữ: Ăn Chay / Vegetarian                    │
│ Phương án: Cường độ cao (7 ngày)                   │
│                                                     │
│ Progress:                                          │
│ ⬜ Ngày 1: ✅ 21 biến Lễ Phật + 200 cá phóng sinh │
│ ⬜ Ngày 2: [Nhập kết quả của hôm nay]              │
│ ⬜ Ngày 3–7: [Chờ...]                              │
│                                                     │
│ 📊 Phục hồi tuổi thọ: 1 năm / 1 năm (100%)        │
│                                                     │
│ [Ghi nhận phiên niệm hôm nay]                      │
│ [Xem hướng dẫn chi tiết]                          │
│                                                     │
└─────────────────────────────────────────────────────┘

AFTER REPENTANCE COMPLETION:

┌─────────────────────────────────────────────────────┐
│ ✅ SÁM HỐI HOÀN THÀNH — Repentance Complete        │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🙏 Lễ Phật Đại Sám Hối Văn: 147 biến ✅           │
│ 🐟 Phóng sinh: 2.000 con cá ✅                     │
│                                                     │
│ 📍 Chư Phật Bồ Tát sẽ tha thứ.                     │
│    Tuổi thọ bạn đã được khôi phục +1 năm.        │
│                                                     │
│ ⚠️ MỘT LẦN NỮA:                                    │
│                                                     │
│ Khi phát nguyện, hãy:                              │
│ • Cân đối với năng lực thực tế                     │
│ • KHÔNG hứa những điều không chắc làm được        │
│ • Tùy duyên, tùy sức                              │
│                                                     │
│ Nếu như vậy, bạn sẽ tránh được mất mát này.      │
│                                                     │
│ [Tạo nguyện mới]  [Xem chi tiết]                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Schema Notes (Prisma Snippet)

```prisma
model VowCommitment {
  id                String   @id @default(cuid())
  practitionerId    String
  vowType           String   // dietary_vegetarian, precept_abstinence, etc.
  vowDescription    String

  // Commitment metrics
  estimatedDurationMonths Int
  practitionerCapacity String // beginner, intermediate, advanced
  motivationSource  String?

  // Fulfillment tracking
  status            String   @default("ACTIVE") // ACTIVE, BROKEN, REPENTED, COMPLETED
  breachCount       Int      @default(0)
  breachReasons     String[] // negligence, force_majeure, unclear

  // Karmic impact
  lifeExpectancyDamageDays Int @default(0)
  healthImpactNotes String?

  // Audit trail
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  breachReportedAt  DateTime?

  repentancePlans   RepentancePlan[]

  @@index([practitionerId])
  @@index([status])
}

model RepentancePlan {
  id                    String   @id @default(cuid())
  vowCommitmentId       String
  vowCommitment         VowCommitment @relation(fields: [vowCommitmentId], references: [id])

  // Repentance prescription
  mantras               Json     // { lePhatCount: 147, durationDays: 7 }
  phongSinhRecommendation Int?   // e.g., 10000 fish

  // Progress tracking
  status                String   @default("IN_PROGRESS") // IN_PROGRESS, COMPLETED
  sessionsCompleted     Int      @default(0)
  lifeExpectancyRecovered Int @default(0)

  completedAt           DateTime?
  createdAt             DateTime @default(now())

  repentanceSessions    RepentanceSession[]

  @@index([vowCommitmentId])
  @@index([status])
}

model RepentanceSession {
  id                    String   @id @default(cuid())
  repentancePlanId      String
  repentancePlan        RepentancePlan @relation(fields: [repentancePlanId], references: [id])

  mantrasRecitedCount   Int      // Lễ Phật biến count
  phongSinhActCount     Int      // Number of animals released
  sessionDate           DateTime
  notes                 String?

  createdAt             DateTime @default(now())
}

model VowBreach {
  id                String   @id @default(cuid())
  vowCommitmentId   String
  breachReason      String   // negligence, force_majeure, unclear
  breachDate        DateTime
  acknowledgment    String?

  createdAt         DateTime @default(now())
}
```

## Audit

All vow-related actions logged:

| Action | Code | Trigger |
|--------|------|---------|
| Vow created | `vow.created` | New commitment made |
| Vow capacity warning | `vow.capacity_mismatch_warned` | Duration exceeds capacity |
| Breach reported | `vow.breach_reported` | User acknowledges violation |
| Breach penalty applied | `vow.lifespan_damage_recorded` | Karma calculation complete |
| Repentance started | `repentance.plan_initiated` | User begins mantra practice |
| Repentance session logged | `repentance.session_recorded` | Mantra count tracked |
| Repentance completed | `repentance.complete` | Target met, lifespan restored |

```sql
INSERT INTO audit_log (action, vow_commitment_id, details, created_at)
VALUES ('vow.breach_reported', $1, $2, NOW())
```

## Errors

| Code | HTTP | Message VI | Message EN |
|------|------|-----------|-----------|
| `vow_capacity_exceeded` | 422 | Nguyện vượt quá năng lực của bạn | Vow exceeds your capacity |
| `vow_false_speech_risk` | 422 | Rủi ro nói dối (vọng ngữ) lớn | High risk of false speech |
| `vow_already_broken` | 400 | Nguyện này đã bị phá vỡ, cần sám hối trước | Vow already broken, must repent first |
| `repentance_incomplete` | 400 | Sám hối chưa hoàn thành | Repentance plan incomplete |
| `insufficient_capacity` | 403 | Năng lực hiện tại không đủ để cam kết | Current capacity insufficient |

## Notes for AI/Codegen

1. **Capacity Assessment**: Implement capacity model based on:
   - Age (elder practitioners have less flexibility)
   - Health status (chronic illness affects capacity)
   - Historical vow success rate
   - Current workload / life obligations

2. **Lifespan Damage Calculation**:
   - Base: 1 year per negligent breach
   - Modifier: 0.3x if force majeure
   - Cumulative: breachCount × modifier
   - Recovery: phóng sinh (releases fish), mantra recitations (Lễ Phật) restore proportionally

3. **Repentance Prescription**:
   - Minimum: 21 repetitions × damage years = total Lễ Phật count
   - Spread: Over 7 days (intensive) or 21 days (extended)
   - Phóng sinh complement: 10,000 fish per year of damage

4. **FE Recommendation Display**: Always surface repentance path with lifespan recovery projection (e.g., "This plan restores +1 year to your life expectancy").

5. **Re-commitment Safety**: After repentance, guide user through VOW CREATION flow again, but surface historical data so they make **smaller, achievable vows**.

## Related

- `wisdom-qa/USE_CASES/non-fungible-repentance-rule.md` — Mantra choice (cannot substitute Lễ Phật with Thất Phật)
- `wisdom-qa/USE_CASES/heavy-karma-activation-nnn-commitment-gate.md` — Karma severity assessment
- `altar-management/USE_CASES/life-liberation-procedures-and-merits.md` — Phóng sinh as repentance act
- `wisdom-qa/USE_CASES/daily-recitation-system.md` — Core recitation system
