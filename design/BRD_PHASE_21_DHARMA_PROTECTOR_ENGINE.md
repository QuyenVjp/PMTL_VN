# BRD PHASE 21: Bộ Máy Hộ Pháp — Advanced Dharma Protector Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Tầng Kiến Trúc Hộ Pháp Kỹ Thuật Số
> **Trạng thái:** Verified source, Critical Infrastructure
> **Cập nhật:** 2026-04-04

---

## Executive Summary

Phase 21 introduces 10 advanced protective logic systems that transform PMTL_VN from documentation platform into an active **Dharma Protector Engine (Bộ Máy Hộ Pháp)**. These logics address catastrophic karmic consequences from casual mistakes, ecological harm, vow-breaking, and improper ritual timing.

---

## 🚀 LOGIC 1: Age-Based Calamity Engine (Nạn Quan 3-6-9)

> **Domain:** `wisdom-qa`, `calendar`, `identity`
> **Owner:** CalamityService / AgeMonitor

### Purpose

Years ending in 3, 6, 9 (ages 13, 19, 33, 39, 43, 66, 73, 83...) trigger "Nạn Quan" (Great Calamity Years). Karma explodes during these periods. System must auto-prescribe protective recitations 3 months before birthday and mandate specific Little House quotas.

### Business Rules

| Condition | Action |
|---|---|
| User age mod 10 = 3, 6, or 9 | ✅ Mark as calamity year |
| Current date = 90 days before birthday | ✅ Trigger calamity alert |
| Alert triggered | ✅ Auto-inject *Tiêu Tai Cát Tường Thần Chú* (49 variations) |
| Calamity alert active | ✅ Create mandatory Little House milestone |
| User age < 100 | ✅ LH quota = {User's Age} sheets before + {Age} after |
| Year ends (post-birthday) | ✅ Verify completion, unlock normal mode |

### Calamity Alert Notification

```
🚨 CẢNH BÁO NẠN QUAN 3-6-9

Bạn chuẩn bị bước vào Nạn Quan [Tuổi].
Năm nay, nghiệp chướng sẽ bùng phát dữ dội.

Hệ thống đã tự động điều chỉnh phác đồ của bạn:

✅ Thêm: Tiêu Tai Cát Tường Thần Chú (49 biến)
   vào Daily Task hằng ngày

✅ Mục Tiêu Bắt Buộc:
   • Hoàn thành [Tuổi] tấm NNN trước sinh nhật
   • Hoàn thành [Tuổi] tấm NNN sau sinh nhật

[Xem Chi Tiết Phác Đồ]
```

### Schema Additions

```prisma
model CalamityYear {
  id            String @id @default(cuid())
  userId        String
  userAge       Int
  isCalamityYear Boolean @default(false)

  alertTriggeredAt  DateTime?
  alertExpiresAt    DateTime?

  preNNNQuota       Int // Age-based quota before birthday
  postNNNQuota      Int // Age-based quota after birthday
  preNNNCompleted   Int @default(0)
  postNNNCompleted  Int @default(0)

  status            String @default("PENDING") // PENDING, ACTIVE, COMPLETED

  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Audit

| Action | Trigger |
|---|---|
| `calamity.age_identified` | User age in 3-6-9 cycle |
| `calamity.alert_triggered` | 90 days before birthday |
| `calamity.mantras_auto_injected` | Alert activated |
| `calamity.lh_quota_enforced` | Milestone created |
| `calamity.quota_completed` | User completes sheets |
| `calamity.year_survived` | Post-birthday verification |

---

## 🚀 LOGIC 2: Merit Percentage Splitter

> **Domain:** `vows-merit`
> **Owner:** MeritService / FractionalTransferEngine

### Purpose

Merit from volunteering, scripture reading, or ritual support can be transferred as precise percentages (1%-100%) to beneficiaries. System enforces transactional integrity and vocal pledge.

### Business Rules

| Condition | Action |
|---|---|
| User earns merit event (volunteer/read/support) | ✅ Log to MeritLedger |
| User initiates transfer | ✅ Show percentage input (1-100%) |
| Percentage selected | ✅ Calculate fractional amount |
| Transfer submitted | ✅ Require mandatory pledge recitation |
| Pledge read/confirmed | ✅ Execute Prisma transaction |
| Transaction success | ✅ Deduct from user, add to beneficiary |
| Transaction fails | ❌ Rollback, show error |

### Merit Transfer DTO

```typescript
interface MeritFractionalTransferRequest {
  fromUserId: string
  toUserId: string
  matureEventId: string     // Source merit event
  percentageAmount: number  // 1-100
  beneficiaryName: string
  reason: string           // "Mang thai / Bệnh nan y / Tế độ"
  pledgeText?: string      // User's pledge recitation
}
```

### Mandatory Pledge Template

```
Người chuyển giao:
"Con xin nguyện chuyển {percentage}% công đức từ việc
[Tên sự kiện: Trợ duyên Pháp hội / Đọc BHFF / Tình nguyện]
cho [Tên người nhận], cầu xin Bồ Tát phù hộ cho họ
[Mục đích: Mang thai / Bệnh tật / Vượt qua khó khăn...]."
```

### FE Behavior

```
Transfer Merit:

Source Event: [Trợ duyên Pháp hội - 100 điểm công đức]

Chuyển cho: [Tên người nhận]
Tỷ lệ %:  [Slider: 1% --- 50% --- 100%]

Lựa chọn: 50%
Số điểm: 50 công đức

Lý do: Cầu cơ hội mang thai

---

Hãy đọc lời khấn này:

"Con xin nguyện chuyển 50% công đức từ việc
Trợ duyên Pháp hội cho [Tên người nhận],
cầu xin Bồ Tát phù hộ cho cô ấy có cơ hội mang thai."

[ ] Tôi đã đọc lời khấn

[Hủy] [Xác Nhận Chuyển]
```

### Audit

| Action | Trigger |
|---|---|
| `merit.fractional_transfer_requested` | User submits percentage |
| `merit.pledge_recitation_recorded` | Pledge confirmed |
| `merit.transfer_transaction_executed` | Funds transferred |
| `merit.transfer_ledger_recorded` | Both parties logged |

---

## 🚀 LOGIC 3: Print Hardware Calibration Lock

> **Domain:** `content`, `engagement`
> **Owner:** PDFService / PrintValidator

### Purpose

Little House physical dimensions must be **exactly 9.1cm × 13.95cm**. Incorrect scaling during printing converts sacred paper into junk. System enforces via digital ruler calibration before PDF download.

### Business Rules

| Condition | Action |
|---|---|
| User requests NNN PDF download | ✅ Show calibration UI |
| Calibration mode active | ✅ Display digital ruler + instructions |
| User measures with real credit card | ✅ Compare actual vs expected |
| Scale matches (100% Actual Size) | ✅ Enable PDF download |
| Scale incorrect (Fit to Page etc.) | ❌ Block, show correction steps |
| User confirms commitment | ✅ Log calibration check |

### Calibration Instructions

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖨️  Kiểm tra Tỷ lệ In NNN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hãy lấy một thẻ ATM/thẻ tín dụng thật
và áp vào màn hình.

Chiều dài chuẩn: 8.56cm

Nếu thẻ có độ dài bằng đoạn này:
━━━━━━━━━━━━━━
thì tỷ lệ của bạn là 100% ✅

Nếu ngắn hơn hoặc dài hơn:
❌ Tỷ lệ SAI - Hãy điều chỉnh

────────────────────────────────────

[ ] Tôi cam kết khi in sẽ chọn:
    ✅ "Actual Size" hoặc "100%"
    ❌ KHÔNG chọn "Fit to Page"
    ❌ KHÔNG chọn "Scale"

Kích thước viền đen NNN:
📏 9.1cm x 13.95cm (PHẢI CHÍNH XÁC)

[Quay Lại] [Đã Hiểu, Tải PDF]
```

### Audit

| Action | Trigger |
|---|---|
| `nnn.pdf_download_requested` | User clicks download |
| `nnn.calibration_mode_shown` | Ruler UI displayed |
| `nnn.scale_verified` | User confirms 100% |
| `nnn.commitment_acknowledged` | Print guidelines accepted |
| `nnn.pdf_released` | File ready for download |

---

## 🚀 LOGIC 4: Absolute Yin-Time Deadzone (2-5 AM Freeze)

> **Domain:** `calendar`, `content`, `wisdom-qa`
> **Owner:** TimeGuardService / YinDeadzoneEngine

### Purpose

2 AM - 5 AM is peak Yin energy. Any recitation during this period attracts malevolent spirits and inverts merit. System locks all counters and displays urgent warning.

### Business Rules

| Condition | Action |
|---|---|
| Current local time = 02:00 - 04:59 | ✅ Activate deadzone |
| Deadzone active | ❌ Disable ALL recitation counters |
| User attempts to log recitation | ❌ Block with red warning |
| E-Reader opened | 🔇 Dim screen, show banner |
| Time exits deadzone (05:00+) | ✅ Re-enable counters |

### Deadzone Banner (Full Screen)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CẢNH BÁO TỐI CAO 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KHUNG GIỜ CẤM KỴ: 2:00 - 5:00 SÁNG

Tuyệt đối KHÔNG tụng niệm bất kỳ Kinh văn nào!

Lý do:
• Âm khí cực thịnh vào lúc này
• Niệm Kinh sẽ rước Ngạ quỷ, Lâm Tỷ Tật
• Công đức sẽ biến thành ác nghiệp

Hãy chờ đến 5:00 AM để tiếp tục.

╭─────────────────────────────────────╮
│ Thời gian còn lại: [45 phút]        │
╰─────────────────────────────────────╯

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Time Guard Implementation

```typescript
function isInYinDeadzone(userTimezone: string): boolean {
  const localTime = dayjs.tz(userTimezone)
  const hour = localTime.hour()

  // 02:00 - 04:59 inclusive
  return hour >= 2 && hour < 5
}

function enforceYinDeadzone(userId: string): GuardResult {
  if (isInYinDeadzone(userTimezone)) {
    return {
      allowed: false,
      message: "KHUNG GIỜ CẤM KỴ",
      blockUntil: dayjs.tz(userTimezone).hour(5).minute(0)
    }
  }
  return { allowed: true }
}
```

### Audit

| Action | Trigger |
|---|---|
| `deadzone.activated` | 02:00 AM reached |
| `deadzone.counter_disabled` | User in 2-5 AM window |
| `deadzone.recitation_blocked` | User attempts log |
| `deadzone.deactivated` | 05:00 AM reached |

---

## 🚀 LOGIC 5: Broken Vow Penalty Engine

> **Domain:** `vows-merit`, `engagement`
> **Owner:** VowService / PenaltyEngine

### Purpose

Breaking a vow causes multiplied karmic debt. System auto-detects missed deadlines, flags vow as "Broken", locks new vow-making, and mandates 49-recitation repentance cycle.

### Business Rules

| Condition | Action |
|---|---|
| Vow deadline = today at 00:01 | ✅ Run verification scan |
| Progress < 100% on deadline | ❌ Mark vow STATUS = BROKEN_VOW |
| Vow marked broken | ✅ Disable `[Phát Nguyện Mới]` button |
| Broken vow flagged | ✅ Auto-create repentance task |
| Repentance task: *Lễ Phật Đại Sám Hối Văn* 49x | ⏳ Lock until complete |
| User completes 49 recitations | ✅ Mark vow status resolved |
| All 49 complete + pledge | ✅ Re-enable vow-making |

### Broken Vow Flow

```
Original Vow:
├─ Target: Ăn chay 30 ngày
├─ Deadline: 2026-03-31
├─ Progress: 18/30 ❌

Deadline Trigger (00:01 AM):
├─ Status change: PENDING → BROKEN_VOW 🔴
├─ UI Lock: `[Phát Nguyện Mới]` disabled
└─ Auto-Task: Repentance 49x created

Repentance Prescription:
├─ Lễ Phật Đại Sám Hối Văn (49 biến)
├─ Mandatory Pledge:
│  "Xin Bồ Tát tha thứ cho việc con
│   không giữ đúng lời thề ăn chay 30 ngày.
│   Con hứa sẽ cần thận hơn lần sau."
└─ Lock Until: 49 biến hoàn thành + pledge
```

### Audit

| Action | Trigger |
|---|---|
| `vow.deadline_reached` | Date check at 00:01 |
| `vow.progress_incomplete` | Progress < 100% |
| `vow.broken_vow_flagged` | Status = BROKEN_VOW |
| `vow.new_vow_making_locked` | Button disabled |
| `vow.repentance_task_created` | 49-recitation cycle |
| `vow.repentance_completed` | All 49 + pledge done |
| `vow.status_resolved` | Lock removed |

---

## 🚀 LOGIC 6: Hardware UUID Prohibition (Phật Cụ Định Danh)

> **Domain:** `altar-management`, `vows-merit`
> **Owner:** AltarService / HardwareRoleEngine

### Purpose

Once a ritual implement (cup, incense holder, water bowl) is dedicated to a specific Bodhisattva, it is bound eternally. Reassigning to another deity or personal use is desecration.

### Business Rules

| Condition | Action |
|---|---|
| HardwareItem created | ✅ Assign UUID + Bodhisattva |
| Item assigned to Bodhisattva A | 🔐 Lock to A permanently |
| User drags item to Bodhisattva B | ❌ Reject drag-drop, show error |
| User clicks `[Thay Phật Cụ Mới]` | ✅ Create NEW item, retire old one |
| Old item retired | ✅ Mark STATUS = RETIRED |
| Retired item | ⚠️ Require user commitment to wrap in red cloth |

### Hardware Item Schema

```prisma
model HardwareItem {
  id                String @id @default(cuid())
  userId            String

  name              String    // "Cốc nước", "Lư hương", etc.
  itemType          String    // CUP, INCENSE_BURNER, WATER_BOWL
  assignedTo        String    // Bodhisattva name (immutable)
  assignedAt        DateTime

  status            String @default("ACTIVE") // ACTIVE | RETIRED
  retiredAt         DateTime?

  retirementPledge  String?   // "Tôi sẽ bọc vải đỏ..."

  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### FE Behavior on Reassignment Attempt

```
❌ LỖI: KHÔNG ĐƯỢC ĐỔI CHỦ PHẬT CỤ

Cốc nước này đã được ấn định cho:
🙏 Thích Ca Mâu Ni Phật

Luật PMTL: Phật cụ đã được tách riêng
cho vị Bồ Tát nào thì vĩnh viễn
không được đổi chủ.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lựa chọn:

[Giữ nguyên cốc cũ]
[Thêm cốc mới cho Bồ Tát khác]

---

Modal: Thêm Phật Cụ Mới

Cốc cũ (Thích Ca) sẽ được Retired.

Bạn cam kết sẽ:
[ ] Bọc vải đỏ/giấy đỏ cốc cũ
[ ] Cất đi, KHÔNG dùng làm sinh hoạt

[Hủy] [Tạo Phật Cụ Mới]
```

### Audit

| Action | Trigger |
|---|---|
| `hardware.created_and_assigned` | Item dedicated |
| `hardware.reassignment_attempted` | Drag-drop blocked |
| `hardware.status_retired` | Item replaced |
| `hardware.retirement_commitment_logged` | Pledge recorded |

---

## 🚀 LOGIC 7: Ecological Speech-to-Text Guard

> **Domain:** `life-liberation`, `engagement`
> **Owner:** LifeLiberationService / EcologicalValidator

### Purpose

Animal release must include vocal pledge acknowledging ecological responsibility. If released species harms ecosystem or dies shortly after, user accepts karmic consequence.

### Business Rules

| Condition | Action |
|---|---|
| User initiates release | ✅ Show on-site verification UI |
| Release location & species entered | ✅ Display liability pledge |
| User presses Microphone button | ⏳ Record voice pledge |
| Pledge recorded/confirmed | ✅ Show pledge transcript |
| User acknowledges pledge | ✅ Unlock `[Ghi nhận đã thả]` button |
| Button not acknowledged | ❌ Keep button locked |

### Ecological Liability Pledge

```
"Nếu việc phóng sinh này gây ra vấn đề sinh thái,
hoặc vật nuôi không hợp môi trường sống dẫn đến chết mau,
xin Bồ Tát và Hộ Pháp tha thứ cho con và
chuyên chở nghiệp chướng để người thả thay con chịu."
```

### FE Behavior

```
On-Site Release (Phóng Sinh Thực Địa):

Địa điểm: [Sông Sài Gòn]
Loài vật: [Cá chép] x 100 con
Thời gian: [14:30]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ XÁC NHẬN TRÁCH NHIỆM SINH THÁI

Hãy đọc lời khấn này:

"Nếu việc phóng sinh này gây ra
vấn đề sinh thái, xin Bồ Tát
và Hộ Pháp tha thứ..."

[🎤 Bấm để Ghi Âm]

---

Transcription (AI Speech-to-Text):
✅ Pledge recorded successfully

[ ] Tôi xác nhận đã khấn

[Ghi nhận đã thả] (enabled)
```

### Audit

| Action | Trigger |
|---|---|
| `release.on_site_initiated` | User at location |
| `release.pledge_required` | Species/location loaded |
| `release.voice_pledge_recorded` | Audio captured |
| `release.pledge_confirmed` | User acknowledges |
| `release.logged` | Release recorded |

---

## 🚀 LOGIC 8: Auspicious Beast AI Filter

> **Domain:** `altar-management`, `community`
> **Owner:** AltarService / BeautyFilterEngine

### Purpose

Altar environment must be free of dragon imagery, fierce animals, and stranger photos. Such items attract wandering spirits seeking hosts.

### Business Rules

| Condition | Action |
|---|---|
| User uploads altar photo | ✅ Show tagging interface |
| User tags/describes altar items | ✅ Scan for forbidden keywords |
| Keywords detected: dragon/tiger/stranger photo | ❌ Block photo approval |
| Forbidden keywords found | ✅ Show protective warning |
| User removes forbidden items | ✅ Re-upload, approve |

### Forbidden Keywords

```typescript
const FORBIDDEN_ALTAR_ITEMS = [
  'rồng',          // Dragon
  'hổ',            // Tiger
  'tỳ hưu',        // Lion-like beast
  'cóc thiềm thừ',  // Toad for fortune
  'ảnh gia đình',   // Family photo
  'ảnh cưới',       // Wedding photo
  'ảnh người',      // Human photo
  'ảnh người lạ',   // Stranger's photo
]
```

### Warning Message

```
🚫 CẢNH BÁO: PHẬT CỤ CẤM KỴ

Bàn thờ của bạn chứa hình ảnh cấm:
❌ Hình rồng / Linh thú / Con người lạ

LUẬT PHÁP MÔN:
────────────────────────────────────
Tuyệt đối không đặt hình rồng, hổ,
linh thú, hoặc ảnh người phàm gần
bàn thờ để tránh linh giới nhập vào.

Lý do: Những hình ảnh này sẽ thu hút
các linh tính/ngạ quỷ tìm xác để
mượn, gây rối loạn trường khí.

════════════════════════════════════

Hãy loại bỏ những vật phẩm trên
và tải lại ảnh bàn thờ.

[Quay Lại Tải Ảnh]
```

### Audit

| Action | Trigger |
|---|---|
| `altar.photo_submitted` | User uploads image |
| `altar.tagging_mode_active` | Item descriptions requested |
| `altar.forbidden_keyword_detected` | Dragon/beast/photo found |
| `altar.photo_rejected` | Block with warning |
| `altar.photo_approved` | Clean items only |

---

## 🚀 LOGIC 9: 8-Hour Deathbed Lockdown Protocol

> **Domain:** `engagement`, `calendar`
> **Owner:** EndOfLifeService / DeathbedProtocol

### Purpose

When loved one passes, 8-hour window is critical. Any weeping, body movement, or disturbance sends spirit to lower realms. System enforces continuous recitation, mutes all notifications, and displays urgent reminders.

### Business Rules

| Condition | Action |
|---|---|
| User activates `[Chế độ Lâm Chung]` | ✅ Enter lockdown mode |
| Lockdown activated | 🔇 Mute all notifications |
| Lockdown mode | 📍 Simplify UI to recitation counter only |
| 8 hours elapsed | ⏰ Auto-deactivate, normal mode |
| User manual exit | ✅ Confirm exit, log session |

### Deathbed Mode UI (Full Screen Replacement)

```
════════════════════════════════════════
           🙏 TRỢ NIỆM LÂM CHUNG 🙏
════════════════════════════════════════

              BẠN ĐÃ KHẤN:

      "Namo Đại Từ Đại Bi Quán
          Thế Âm Bồ Tát"

════════════════════════════════════════

         Lần Niệm: [███████░░░] 847

════════════════════════════════════════

🚨 BÁO ĐỘNG ĐỎ 🚨

HỆ THỐNG ĐANG TRONG CHẾ ĐỘ TRỢ NIỆM

┌─────────────────────────────────────┐
│ TUYỆT ĐỐI KHÔNG KHÓC LÓC            │
│ KHÔNG ĐỤNG CHẠM VÀO THI THỂ         │
│ KHÔNG DI CHUYỂN GIƯỜNG CHIẾU         │
│ GIỮ BÌNH TĨNH & NIỆM LIÊN TỤC       │
└─────────────────────────────────────┘

        Thời gian còn lại:
         07:12:34 (hh:mm:ss)

════════════════════════════════════════

Audio: [🔊 Chú Vãng Sanh Lặp Lại]

════════════════════════════════════════
```

### Deathbed Schema

```prisma
model DeathbedSession {
  id                String @id @default(cuid())
  userId            String

  deceasedName      String
  deceasedRelation  String  // "Mẹ", "Cha", "Con"

  activatedAt       DateTime
  expiresAt         DateTime  // 8 hours later

  recitationCount   Int @default(0)
  mantraPlayed      String @default("VANG_SANH")

  status            String @default("ACTIVE") // ACTIVE | COMPLETED | MANUAL_EXIT

  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Audit

| Action | Trigger |
|---|---|
| `deathbed.mode_activated` | User clicks emergency button |
| `deathbed.8h_lockdown_started` | Session created, counter begins |
| `deathbed.notifications_muted` | All alerts silenced |
| `deathbed.recitation_counted` | Counter incremented |
| `deathbed.8h_expired` | Auto-exit at 8 hours |
| `deathbed.mode_exited` | Session logged |

---

## 🚀 LOGIC 10: Menstrual & Pregnancy Physical Guard

> **Domain:** `identity`, `vows-merit`, `altar-management`
> **Owner:** HealthService / BiologicalGuard

### Purpose

Women during menstruation or pregnancy retain ability to bow and recite, but should take precautions: hand washing before touching sacred objects, standing bows instead of kneeling for pregnant women.

### Business Rules

| Condition | Action |
|---|---|
| User gender = FEMALE | ✅ Enable optional health tracking |
| User logs: "Kỳ kinh nguyệt" | ✅ Flag status in profile |
| User performs `[Dâng Hương/Thay Nước]` | ✅ Show soft reminder |
| User logs: "Mang thai" | ✅ Recommend standing bows |
| Status reminder shown | 📲 Gentle, respectful nudge |

### Soft Reminder UI

```
💡 Lưu ý Vệ Sinh Tâm Linh

┌─────────────────────────────────────┐
│ Bạn đang trong kỳ kinh nguyệt.      │
│                                     │
│ Bạn hoàn toàn có thể bái lạy và    │
│ niệm kinh bình thường.              │
│                                     │
│ Khi dâng hương/thay nước/hoa quả:  │
│ ✅ Rửa tay thật kỹ bằng xà phòng   │
│ ✅ Giữ vệ sinh sạch sẽ             │
│                                     │
│ Luật PMTL không cấm, chỉ khuyến    │
│ khích cẩn thận để giữ trang nghiêm. │
└─────────────────────────────────────┘

[Đã Hiểu] [Thêm Chi Tiết]
```

### Pregnancy-Specific Reminder

```
💡 Lưu ý Cho Phụ Nữ Mang Thai

┌─────────────────────────────────────┐
│ Bạn đang mang thai.                │
│                                     │
│ ✅ Có thể bái lạy & niệm kinh      │
│ ✅ Khuyến khích đứng thay vì quỳ   │
│ ✅ Tránh cúi gập người kéo dài     │
│ ✅ Bảo vệ thai nhi & trang nghiêm  │
│                                     │
│ Bặc Tát sẽ hiểu rõ hoàn cảnh       │
│ của con.                            │
└─────────────────────────────────────┘

[Đã Hiểu]
```

### Audit

| Action | Trigger |
|---|---|
| `health.menstrual_status_logged` | User updates profile |
| `health.pregnancy_status_logged` | User updates profile |
| `health.reminder_shown_menstrual` | Ritual activity attempted |
| `health.reminder_shown_pregnancy` | Ritual activity attempted |
| `health.handwashing_acknowledged` | User confirms |

---

## 📊 Phase 21 Implementation Priority

| Priority | Logic | Effort | Impact |
|----------|-------|--------|--------|
| **CRITICAL** | Logic 4 (Yin Deadzone) | Low | High (prevent karmic inversion) |
| **CRITICAL** | Logic 5 (Vow Penalty) | Medium | High (enforce vow integrity) |
| **HIGH** | Logic 1 (Calamity Engine) | High | Medium (protective) |
| **HIGH** | Logic 3 (Print Lock) | Medium | Medium (prevents sacrilege) |
| **HIGH** | Logic 9 (Deathbed) | Medium | High (life-critical) |
| **MEDIUM** | Logic 2 (Merit Split) | Medium | Medium (enhance transfer system) |
| **MEDIUM** | Logic 6 (Hardware UUID) | Medium | Low (altar management) |
| **MEDIUM** | Logic 7 (Ecology Guard) | Low | Low (liability protection) |
| **LOW** | Logic 8 (Beast Filter) | Low | Low (altar hygiene) |
| **LOW** | Logic 10 (Health Guard) | Low | Low (gentle reminders) |

---

## 🔗 Database Schema Updates Required

1. **Prisma Schema additions:** `CalamityYear`, `DeathbedSession`, `MeritTransfer` (with percentage field)
2. **Indexes:** `idx_calamity_userId_targetDate`, `idx_vow_userId_status_deadline`
3. **Constraints:** Immutable UUID on `HardwareItem.assignedTo`
4. **Migration notes:** Event sourcing for `DebtLedger` (append-only)

---

## 📚 Related Documentation

- `design/03-domains/` — Individual domain logic files (Phases 16-20)
- `BRD_PHASE_20_GOLDEN_PRACTICES.md` — Foundational protector logics
- `schema.prisma` — Core data models
- `.claude/agents/README.md` — PMTL subagent responsibilities

---

**Status:** Ready for implementation
**Last Updated:** 2026-04-04
**Complexity Level:** Enterprise-Critical
**Reviewed by:** PMTL Architecture Council

