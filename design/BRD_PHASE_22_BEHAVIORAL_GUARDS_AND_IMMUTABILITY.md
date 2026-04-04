# BRD PHASE 22: Behavioral Guards & Immutable Ledger Architecture

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Tầng Kiến Trúc Toàn Vẹn & Phòng Chống Gian Lận Tâm Linh
> **Trạng thái:** Verified source, Critical Integrity Layer
> **Cập nhật:** 2026-04-04

---

## Executive Summary

Phase 22 introduces 10 behavioral safeguards protecting against karmic fraud, merit falsification, and accidental corruption of spiritual data. Includes architectural mandate: **Immutable Event Sourcing for all merit/debt/karma tracking** to ensure karmic causality cannot be tampered with.

---

## 🚀 LOGIC 1: Yin-Time Anti-Spoofing Guard (Offline Sync)

> **Domain:** `content`, `engagement`
> **Owner:** SyncService / OfflineTrustEngine

### Purpose

Offline recitation logging creates timestamp spoofing risk. Users could change device time to bypass 2-5 AM deadzone. System validates all offline events against server clock and delta-time analysis.

### Business Rules

| Condition | Action |
|---|---|
| App goes offline | ✅ Log recitations to IndexedDB with client timestamp |
| Client time drifts | ⚠️ System records time-of-day during logging |
| User changes device clock | ❌ Next sync detects anomaly |
| App comes online | ✅ POST `/api/engagement/sync` with full batch |
| Backend validates timestamps | ✅ Compare against server time |
| Detected timestamps in 02:00-05:00 range | ❌ Reject entire batch |
| Delta time > 4 hours | ⚠️ Flag suspicious sync, require user confirmation |

### Offline Event Schema

```typescript
interface OfflineRecitationEvent {
  id: string
  sutraId: string
  localTimestamp: Date      // Client clock at logging
  count: number
  clientVersion: string     // For debugging

  // Populated on sync
  serverReceivedAt?: Date
  validatedAt?: Date
  validationStatus?: 'ACCEPTED' | 'REJECTED_YIN_TIME' | 'FLAGGED_TIME_DRIFT'
}

interface SyncBatch {
  userId: string
  events: OfflineRecitationEvent[]
  lastSyncAt: Date         // Last successful sync
  clientTimeRange: {
    earliest: Date
    latest: Date
  }
  estimatedTimeDrift: number // milliseconds
}
```

### Backend Validation Logic

```typescript
async function validateOfflineSyncBatch(batch: SyncBatch): Promise<ValidationResult> {
  const now = new Date()
  const lastSync = batch.lastSyncAt

  // Check for Yin-time violations
  const yinViolations = batch.events.filter(event => {
    const hour = event.localTimestamp.getUTCHours()
    return hour >= 2 && hour < 5
  })

  if (yinViolations.length > 0) {
    return {
      status: 'REJECTED',
      reason: 'YIN_TIME_VIOLATION',
      rejectedCount: yinViolations.length,
      message: '系统检测到以下变经是在禁忌时间（凌晨2-5点）记录的。为了保护您的气场，系统拒绝接受这些记录。'
    }
  }

  // Check for time drift
  const timeDrift = Math.abs(now.getTime() - batch.clientTimeRange.latest.getTime())
  const timeDriftHours = timeDrift / (1000 * 60 * 60)

  if (timeDriftHours > 4) {
    return {
      status: 'FLAGGED',
      reason: 'EXCESSIVE_TIME_DRIFT',
      timeDriftHours,
      message: `您的设备时间与服务器相差 ${timeDriftHours.toFixed(1)} 小时。请确认您是否更改了设备时间。`
    }
  }

  return { status: 'ACCEPTED' }
}
```

### FE Behavior on Rejection

```
🚫 SYNC FAILED: YIN-TIME VIOLATION

离线期间，系统检测到以下变经
被记录在禁忌时间（凌晨2-5点）：

变经 1: Đại Bi Chú (7 biến)
时间: 02:47 AM

为了保护您的气场，这些变经
被拒绝入帐。

━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 解决方案：
在正确的时间重新念诵这些变经
然后再同步。

[重新念诵] [忽略此警告]
```

### Audit

| Action | Trigger |
|---|---|
| `sync.offline_batch_received` | User comes online |
| `sync.yin_time_violation_detected` | Timestamps in 2-5 AM |
| `sync.batch_rejected` | Violation confirmed |
| `sync.time_drift_flagged` | Delta > 4 hours |
| `sync.user_confirmed_drift` | User acknowledges anomaly |

---

## 🚀 LOGIC 2: Passive Listening vs Active Chanting Segregation

> **Domain:** `content`, `wisdom-qa`
> **Owner:** RecitationService / ListeningGuard

### Purpose

Hearing mantras via audio recording does NOT generate merit. Only active vocal recitation (breathing, mouth movement, vocal cords) creates spiritual energy. System prevents auto-counting and educates users.

### Business Rules

| Condition | Action |
|---|---|
| User opens E-Reader with audio player | ✅ Load both UI states independently |
| Audio plays | ✅ Track `AudioPlayer_Progress` separately |
| Recitation counter exists | ✅ Keep as manual-click only |
| User clicks counter while audio plays | ⚠️ Show soft warning tooltip |
| User clicks after audio ends | ✅ Allow increment, no warning |
| Audio auto-completes | ❌ Do NOT auto-increment counter |

### Counter Lock Implementation

```typescript
function getCounterButtonState(audioState: AudioPlayerState): ButtonState {
  if (audioState.isPlaying) {
    return {
      enabled: true,
      tooltip: '🎧 Nghe ghi âm không tạo ra công đức. Bạn BẮT BUỘC phải tự nhép miệng phát ra âm thanh thì mới được tính số lượng.',
      warningColor: '#FFA500'
    }
  }

  if (audioState.isCompleted && !audioState.isPlaying) {
    return {
      enabled: true,
      tooltip: 'Bạn có thể nhập số lần bạn đã tụng kinh này.',
      warningColor: null
    }
  }

  return { enabled: true, tooltip: null }
}
```

### FE Behavior

```
E-Reader: Tiêu Tai Cát Tường Thần Chú

┌─ AUDIO PLAYER ────────────────────┐
│ [🎧] [Play] [Pause] [×]          │
│ Progress: ████████░░░ 2:34 / 5:20│
└────────────────────────────────────┘

KINH VĂN:
Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát...

COUNTER:
[+1] ← Cảnh báo: Nghe audio ≠ Công đức
     (Vàng cam tooltip)

---

Audio kết thúc:

[+1] ← Tooltip biến mất ✅
```

### Audit

| Action | Trigger |
|---|---|
| `audio.playback_started` | User plays recording |
| `counter.click_with_audio_playing` | Warning shown |
| `counter.click_audio_complete` | No warning |
| `counter.never_auto_incremented` | Design verified |

---

## 🚀 LOGIC 3: Anti-Greed Wish Limiter

> **Domain:** `vows-merit`
> **Owner:** VowService / GreedGuard

### Purpose

Excessive wishes (>3) dilute aspiration force. Bodhisattva will not respond to greedy prayers. System enforces strict limit and educates on karmic dilution.

### Business Rules

| Condition | Action |
|---|---|
| User creates prayer request | ✅ Show wish input form |
| User adds wish 1, 2, 3 | ✅ All buttons enabled |
| User attempts wish 4 | ❌ Button disabled |
| Array length reaches 3 | 🔒 Lock "Add Wish" button |
| User completes vow | ✅ Enable new prayer |

### Prayer Request DTO

```typescript
interface CreatePrayerRequest {
  intentions: string[]  // @ArrayMaxSize(3)
  beneficiaryName: string
  pledgeText: string
}
```

### Disabled Button UI

```
Điều cầu xin:

1. [×] Xin hết bệnh tiểu đường
2. [×] Xin có công việc tốt
3. [×] Xin gia đình yên bình

[Thêm Điều Cầu Xin] ← DISABLED (Màu xám)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ LƯU Ý LUẬT PHÁP MÔN:

Lòng tham sẽ làm loãng nguyện lực.
Mỗi lần chỉ được cầu xin tối đa
3 việc cụ thể.

Bạn đã đạt giới hạn.
Hãy hoàn nguyện các mục tiêu cũ
trước khi xin thêm.

[Xem Các Nguyện Đang Chờ]
```

### Audit

| Action | Trigger |
|---|---|
| `prayer.wish_limit_reached` | 3rd wish added |
| `prayer.wish_4_blocked` | User attempts add |
| `prayer.vow_completed` | Unlock for new prayer |

---

## 🚀 LOGIC 4: Vow Escalation Engine

> **Domain:** `vows-merit`, `engagement`
> **Owner:** VowService / EscalationPrompt

### Purpose

Completing vow creates energetic peak. System suggests natural progression (e.g., vegetarian 1 year → lifetime vegetarian) aligned with user's spiritual momentum.

### Business Rules

| Condition | Action |
|---|---|
| Vow reaches 100% completion | ✅ Trigger escalation engine |
| Status = COMPLETED | ✅ Show escalation modal |
| User views suggestion | ⏳ Display 2-3 progression options |
| User selects progression | ✅ Create new vow at higher level |
| User declines | ✅ Log choice, move to normal mode |

### Escalation Suggestions

```typescript
interface VowEscalationSuggestion {
  originalVow: string
  completionDate: Date
  suggestions: {
    name: string
    description: string
    targetDate: Date
  }[]
}

const ESCALATION_MAP = {
  'ĂN CHAY 1 NĂNG': [
    { name: 'ĂN CHAY 3 NĂNG', description: 'Mỗi tháng 15 ngày chay' },
    { name: 'ĂN CHAY TRỌN ĐỜI', description: 'Cam kết suốt đời' }
  ],
  'NIỆM 100K GIẢI KẾT CHÚ': [
    { name: 'NIỆM 1 TRIỆU GIẢI KẾT CHÚ', description: 'Công đức lớn lao' },
    { name: 'NIỆM 100K ĐẠI BI CHÚ', description: 'Chuyển sang tâm linh sâu hơn' }
  ]
}
```

### Escalation Modal

```
🎉 CHÚC MỪNG BẠN!

Bạn đã hoàn thành đại nguyện:
[Ăn Chay 1 Năm]

Trường khí của bạn đang rất thanh tịnh.
Đây là lúc Bồ Tát mong muốn bạn
nâng cao cấp độ tu tập.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 GỢI Ý THĂNG CẤP:

[ ] Ăn chay 3 năng (Mỗi tháng 15 ngày)
    Hoàn thành trước: 2027-04-04

[ ] Ăn chay trọn đời
    Cam kết vĩnh viễn

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Không, Tạm Dừng] [Chọn Thăng Cấp]
```

### Audit

| Action | Trigger |
|---|---|
| `vow.completion_detected` | Progress = 100% |
| `vow.escalation_modal_shown` | Suggestions displayed |
| `vow.escalation_accepted` | New vow created |
| `vow.escalation_declined` | User passes |

---

## 🚀 LOGIC 5: Anti-Financial Attachment Regex

> **Domain:** `life-liberation`, `engagement`
> **Owner:** LifeLiberationService / AttachmentFilter

### Purpose

Mentioning money spent during animal release creates karmic contamination (dính mắc). System blocks currency-related keywords and educates on detachment.

### Business Rules

| Condition | Action |
|---|---|
| User fills liberation journal | ✅ Show notes input |
| User types currency keyword | ❌ Prevent form submission |
| Regex matches forbidden patterns | ✅ Show specific warning |
| User removes keywords | ✅ Form enabled |

### Forbidden Patterns

```typescript
const FINANCIAL_ATTACHMENT_REGEX = /
  (vnđ|vnd|đồng|đ|usd|\$|euro|€|tiền|cost|spent|pay|price|fee|charge|mua|giá|bao|tốn)
/gi

// More specific
const CURRENCY_PATTERNS = [
  /\d+\s*(k|ngàn|triệu|tỷ|đồng|vnd)/gi,  // "500k đồng"
  /\$\s*\d+/gi,                            // "$50"
  /usd\s*\d+/gi,                          // "USD 100"
  /(spend|spent|cost|pay)\s*\d+/gi        // "spent 500"
]
```

### Validation & FE Response

```
Nhật Ký Phóng Sinh:

Ghi chú (Notes):
[____________________________]
"Hôm nay tôi mua hết 500k tiền cá"

❌ CẤM KỴ: DÍNH MẮC TÀI CHÍNH

Tuyệt đối không ghi chép hoặc
nhắc đến số tiền khi phóng sinh.

Việc nghĩ đến tiền bỏ ra sẽ sinh
ra "dính mắc" (chấp niệm), làm
rò rỉ và thiêu rụi toàn bộ công
đức phóng sinh.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Bạn chỉ được ghi chép:
   [Số lượng] sinh vật đã thả

VD: "Hôm nay tôi thả 100 con cá chép"

[Chỉnh Sửa]
```

### Audit

| Action | Trigger |
|---|---|
| `release.financial_keyword_detected` | Regex match |
| `release.attachment_warning_shown` | User alerted |
| `release.submitted_clean` | No keywords |

---

## 🚀 LOGIC 6: Pregnant Creature Merit Multiplier

> **Domain:** `life-liberation`
> **Owner:** LifeLiberationService / PregnancyDetector

### Purpose

Rescuing pregnant animal saves countless lives simultaneously (offspring in womb/eggs). Automatic merit multiplier and special chant recommendation.

### Business Rules

| Condition | Action |
|---|---|
| User creates liberation event | ✅ Show checkbox: "Có mang thai?" |
| User checks "Có" (Yes) | ✅ Mark as high-merit event |
| Badge: "Vô Lượng Công Đức" | ✅ Attach special label |
| System auto-suggests mantra | ✅ Recommend *Công Đức Bảo Sơn Thần Chú* |

### Pregnant Creature Event

```typescript
interface LifeReleasEvent {
  creatureType: string
  quantity: number
  includesPregnantCreatures: boolean  // NEW
  pregnancyCount?: number              // How many pregnant

  meritsMultiplier: number  // 1.0 for normal, X for pregnant
}
```

### FE Behavior

```
Phóng Sinh Chi Tiết:

Loài vật: [Cá chép]
Số lượng: [100] con

☑️ Có mang thai (cá ôm trứng)
   Số con: [42]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 VÔ LƯỢNG CÔNG ĐỨC 🌟

Bạn vừa cứu không chỉ 100 con cá
mà còn [42 × số con trong trứng],
tức là hàng ngàn sinh mạng!

Công đức này lớn gấp vô số lần.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 GỢI Ý:

Hãy niệm thêm bài
"Công Đức Bảo Sơn Thần Chú"
để chuyển hóa lượng việc thiện
khổng lồ này thành công đức
bảo vệ bản thân.

[Bắt Đầu Niệm]
```

### Audit

| Action | Trigger |
|---|---|
| `release.pregnant_creatures_detected` | User checks Yes |
| `release.merit_multiplier_applied` | Calculation done |
| `release.boundless_merit_badge_attached` | Label shown |
| `release.mantra_suggested` | Recommendation displayed |

---

## 🚀 LOGIC 7: Anti-Skimming Merit Guard

> **Domain:** `content`
> **Owner:** BHFFService / ReadingTimeValidator

### Purpose

Speed-reading BHFF articles without comprehension generates zero merit. System enforces minimum reading time proportional to article length.

### Business Rules

| Condition | Action |
|---|---|
| Article loads | ✅ Calculate `estimatedReadTime` |
| User scrolls to bottom | ⏱️ Check elapsed time |
| Elapsed < 30% of estimate | ❌ Disable merit transfer button |
| Elapsed ≥ 30% of estimate | ✅ Enable button, no warning |
| User scrolls within 30% time | ⚠️ Show tooltip |

### Reading Time Calculation

```typescript
function calculateEstimatedReadTime(content: string): number {
  const wordCount = content.split(/\s+/).length
  const avgWordsPerMinute = 200

  // For Buddhist texts, add 20% buffer for reflection
  const reflectionBuffer = 1.2

  return Math.ceil((wordCount / avgWordsPerMinute) * reflectionBuffer)
}
```

### Button Lock UI

```
Bài Viết: [Tôi Bị Trầm Cảm Vì Công Việc]

Thời gian ước tính: 8 phút
Bạn đã đọc: 1 phút 30 giây (18%)

Progress: ██░░░░░░░░░░░░░░░░ 18%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Chuyển Giao Công Đức] (DISABLED)

⚠️ Bạn đã cuộn quá nhanh!

Trí tuệ Phật pháp cần sự thẩm thấu.
Hãy đọc thêm một chút nữa
để thực sự giác ngộ nội dung.

Cần đọc tối thiểu: 2 phút 24 giây
nữa (30% của 8 phút).
```

### Audit

| Action | Trigger |
|---|---|
| `bhff.reading_started` | User opens article |
| `bhff.time_check` | User scrolls to bottom |
| `bhff.reading_too_fast` | < 30% time elapsed |
| `bhff.transfer_blocked` | Button disabled |
| `bhff.reading_sufficient` | ≥ 30% time, button enabled |

---

## 🚀 LOGIC 8: Re-reading Depth Tracker

> **Domain:** `content`
> **Owner:** BHFFService / DepthMetrics

### Purpose

Re-reading deepens understanding and raises awareness level. System tracks read counts and suggests re-reading intervals based on previous reading date.

### Business Rules

| Condition | Action |
|---|---|
| User completes article (≥30% time) | ✅ Log read event |
| Article has read history | ✅ Track readCount |
| readCount = 1, 3, 7, 21, 108 | 🏆 Award depth badges |
| > 30 days since last read | 💡 Suggest re-reading |

### Depth Badge System

```typescript
enum DepthBadge {
  SEED_PLANTING = 1,        // 1st read: Gieo duyên (Plant seed)
  UNDERSTANDING = 3,         // 3rd read: Minh Lý (Understanding)
  EGO_DISSOLUTION = 7,       // 7th read: Phá Ngã (Dissolve ego)
  ENLIGHTENMENT = 21,        // 21st read: Giác Ngộ (Awakening)
  BUDDHA_MIND = 108          // 108th read: Phật Tâm (Buddha mind)
}
```

### Re-reading Suggestion UI

```
Thư Viện:

[Tôi Bị Trầm Cảm...]
Đã đọc: 1 tháng trước
Lần đọc: 1️⃣ (Huy hiệu Gieo Duyên)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 GỢI Ý TỪ HỆ THỐNG:

Bạn đã đọc bài này 1 tháng trước.
Hệ thống khuyến nghị bạn đọc lại
lần 2 để lĩnh hội tầng năng lượng
sâu hơn.

Tiến độ đến Huy Hiệu "Minh Lý":
2/3 lần đọc

[Đọc Lại Ngay]
```

### Audit

| Action | Trigger |
|---|---|
| `bhff.read_event_logged` | Article completed |
| `bhff.read_count_incremented` | History updated |
| `bhff.depth_badge_earned` | Milestone hit |
| `bhff.reread_suggested` | 30+ days passed |

---

## 🚀 LOGIC 9: Karma Activation Cascade Alert

> **Domain:** `wisdom-qa`, `engagement`
> **Owner:** RecitationService / KarmaActivationMonitor

### Purpose

Excessive repentance (Lễ Phật) without corresponding Little House burning awakens karma debt, leading to spiritual emergency. System detects imbalance and triggers urgent warnings.

### Business Rules

| Condition | Action |
|---|---|
| Weekly cronjob runs (Sun 23:59) | ✅ Scan weekly stats |
| Sum(Lễ Phật biến/tuần) calculated | ✅ Get total repentance count |
| Sum(LH sheets burned/tuần) calculated | ✅ Get debt payment |
| LH_burned < (Repentance / 7) | 🚨 Activate emergency |
| Imbalance detected | ✅ Send urgent notification |

### Imbalance Detection

```typescript
interface WeeklyKarmaBalance {
  userId: string
  weekEnding: Date

  totalRepentanceMantras: number    // Lễ Phật
  littleHouseBurned: number         // NNN
  requiredRatio: number             // 1:7 (1 sheet per 7 mantras)

  isBalanced: boolean
  imbalanceAmount?: number          // How many sheets short
  severityLevel: 'CRITICAL' | 'WARNING' | 'OK'
}

function assessBalance(stats: WeeklyKarmaBalance): AlertLevel {
  const required = stats.totalRepentanceMantras / 7

  if (stats.littleHouseBurned < required * 0.5) {
    return 'CRITICAL'  // Burning less than 50% needed
  }
  if (stats.littleHouseBurned < required) {
    return 'WARNING'   // Burning some but not enough
  }
  return 'OK'
}
```

### Emergency Alert

```
🚨 CẢNH BÁO TỐI CAO 🚨

TÌNH TRẠNG: Nghiệp Chướng Bùng Phát

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tuần này (3/28 - 4/3):

Lễ Phật Đại Sám Hối: 35 biến
(Tức 5 biến/ngày)

Ngôi Nhà Nhỏ Đốt: 0 tấm ❌

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ VẤN ĐỀ:

Bạn đang sám hối số lượng lớn
nhưng KHÔNG có Ngôi Nhà Nhỏ
để trả nợ.

Nghiệp chướng đã bị đánh thức
và đang bùng phát!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🆘 HÀ ĐỘNG KHẨN CẤP:

Lập tức GIỮ CẤP LỄ PHẬT xuống:
[ ] Giảm xuống 1-2 biến/ngày

HOẶC:

[ ] BỔ SUNG GẤP NNN:
    Cần phải đốt ít nhất 5 tấm/tuần

⏰ Hạn chót: 7 ngày

[Chỉnh Sửa Thời Khóa] [Bắt Đầu Đốt NNN]
```

### Audit

| Action | Trigger |
|---|---|
| `karma.weekly_scan_executed` | Sun 23:59 |
| `karma.balance_calculated` | Stats aggregated |
| `karma.imbalance_detected` | LH < Repentance/7 |
| `karma.emergency_alert_sent` | Notification dispatched |
| `karma.user_adjusted_schedule` | User responds |

---

## 🚀 LOGIC 10: Non-Fungible Repentance Rule

> **Domain:** `wisdom-qa`, `calendar`
> **Owner:** RecitationService / RepentanceSubstitutionGuard

### Purpose

Lesser repentance chants (Thất Phật) cannot substitute for major repentance (Lễ Phật). System prevents dangerous replacements that would leave major karma unaddressed.

### Business Rules

| Condition | Action |
|---|---|
| User sets Daily Task config | ✅ Load recitation plan |
| User sets Lễ Phật = 0 | ⚠️ Warning activated |
| User sets Thất Phật > 21 | ⚠️ Double warning |
| Both conditions met | ❌ Block save, show error |
| User attempts to save | 🔒 Require acknowledgment |

### Substitution Prevention

```typescript
interface DailyTaskValidation {
  lePhapCount: number
  thatPhapCount: number

  validate(): ValidationResult {
    // FORBIDDEN: Lễ Phật = 0 and Thất Phật > 21
    if (this.lePhapCount === 0 && this.thatPhapCount > 21) {
      return {
        valid: false,
        severity: 'CRITICAL',
        message: 'THẤT PHẬT KHÔNG THỂ THAY THẾ LỄ PHẬT'
      }
    }

    // WARNING: Low Lễ Phật, high Thất Phật
    if (this.lePhapCount < 3 && this.thatPhapCount > 21) {
      return {
        valid: false,
        severity: 'HIGH',
        message: 'Bạn bắt buộc phải có ít nhất 3 biến Lễ Phật hằng ngày'
      }
    }

    return { valid: true }
  }
}
```

### Prevention Modal

```
❌ CẢNH BÁO: THAY THẾ KHÔNG ĐƯỢC PHÉP

THẤT PHẬT CÓ KHÔNG THỂ THAY THẾ LỄ PHẬT!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lý do:

• Thất Phật Diệt Tội Chân Ngôn:
  → Xóa các ác nghiệp NHỎ hàng ngày
  → Phù hợp cho việc dưỡng sinh

• Lễ Phật Đại Sám Hối Văn:
  → Xóa các ác nghiệp LỚN kiếp trước
  → Bắt buộc cho việc tu hành sâu

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bạn không thể bỏ Lễ Phật để thay
vào là Thất Phật, vì kiếp trước
của bạn vẫn còn nợ chưa trả.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ GIẢI PHÁP:

Bạn bắt buộc phải có ít nhất
1 biến Lễ Phật trong thời khóa
hằng ngày.

Bạn có thể:
[ ] Thêm 1 biến Lễ Phật
[ ] Giữ 3-5 biến Lễ Phật + 21 Thất Phật

[Hủy] [Chỉnh Sửa Cấu Hình]
```

### Audit

| Action | Trigger |
|---|---|
| `repentance.substitution_attempted` | Le=0, That>21 |
| `repentance.validation_failed` | Error modal shown |
| `repentance.config_corrected` | User adjusts |
| `repentance.valid_config_saved` | Safe plan saved |

---

## 🏗️ ARCHITECTURAL MANDATE: Immutable Audit Ledger

> **New Module:** `audit-ledger` (Tầng Bảo Vệ Tính Toàn Vẹn)

### Problem

Current CRUD model allows UPDATE/DELETE on karma/merit records. Single admin error or intentional tampering corrupts entire karmic causality chain.

### Solution: Event Sourcing Pattern

Replace direct updates with append-only event ledger:

```prisma
// OLD (FORBIDDEN)
model Debt {
  id        String @id
  userId    String
  amount    Int
  // ❌ Can be UPDATE/DELETE

  user      User @relation(fields: [userId], references: [id])
}

// NEW (REQUIRED)
model KarmaEvent {
  id                String @id @default(cuid())
  userId            String

  eventType         String  // KARMA_INCURRED | OFFSET | MERIT_TRANSFERRED
  amount            Decimal
  reason            String
  timestamp         DateTime @default(now())

  // Immutability
  createdAt         DateTime @default(now())
  // NO UPDATE, NO DELETE allowed

  user              User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([eventType])
}

// Balance calculated on-the-fly
type UserKarmaBalance = Aggregate<KarmaEvent>.Sum(
  WHERE eventType = OFFSET ? -amount : +amount
)
```

### Implementation Rules

1. **Insert-Only:** All karma-related writes must use `INSERT` on `KarmaEvent`
2. **No Direct Updates:** Ban `UPDATE` on `Debt`, `Merit`, `LittleHouse` principal tables
3. **Calculated Balance:** Query balance via `SELECT SUM(amount) FROM KarmaEvent WHERE userId = ?`
4. **Audit Trail:** Every event immutably logged with creator, timestamp, reason
5. **Blockchain Analogy:** Treat karma ledger like blockchain—append-only, cryptographically sound

### Migration Path

```sql
-- Create new immutable ledger
CREATE TABLE karma_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_karma_user_time ON karma_events(user_id, created_at DESC);

-- Migrate existing records to events
INSERT INTO karma_events (user_id, event_type, amount, reason, created_at)
SELECT id, 'INITIAL_BALANCE', current_debt, 'Legacy migration', created_at
FROM debt_ledger;
```

### Benefits

✅ **Karmic Integrity:** No erasure, only accumulation and offsetting
✅ **Audit Trail:** Complete history of every transaction
✅ **Forensics:** Can trace exact point of tampering (if any)
✅ **Compliance:** Aligns with spiritual law of karma
✅ **CQRS Ready:** Separation of command (events) and query (balance)

---

## 📊 Phase 22 Priority Matrix

| # | Logic | Effort | Impact | Dependencies |
|---|-------|--------|--------|--------------|
| **Arch** | Immutable Ledger | HIGH | CRITICAL | None (foundational) |
| 1 | Yin-Time Anti-Spoofing | MEDIUM | HIGH | Sync system |
| 2 | Passive/Active Segregation | LOW | MEDIUM | Audio player |
| 3 | Anti-Greed Limiter | LOW | HIGH | Vow form validation |
| 4 | Vow Escalation | MEDIUM | MEDIUM | Vow completion tracking |
| 5 | Financial Attachment Filter | LOW | MEDIUM | Release journal |
| 6 | Pregnant Creature Multiplier | MEDIUM | MEDIUM | Merit calculation |
| 7 | Anti-Skimming Guard | MEDIUM | HIGH | BHFF reader |
| 8 | Depth Tracker | LOW | LOW | Article metadata |
| 9 | Karma Cascade Alert | MEDIUM | CRITICAL | Weekly scheduler |
| 10 | Non-Fungible Repentance | LOW | HIGH | Task config validator |

---

## 🔗 Integration Points

- **`vows-merit`:** Immutable event sourcing base
- **`engagement`:** Karma activation monitoring
- **`content`:** Reading time & depth tracking
- **`life-liberation`:** Release validation
- **`calendar`:** Weekly balance scanning
- **`sync`:** Offline-first validation

---

**Status:** Ready for implementation by PMTL subagents
**Complexity:** Enterprise-Critical
**Reviewed by:** PMTL Architecture Council

