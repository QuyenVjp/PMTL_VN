# BRD PHASE 23: Spatial Environment Guards & Ecological Protector

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Tầng Cảm Biến Môi Trường & Ràng Buộc Vật Lý
> **Trạng thái:** Verified source, Environmental Integrity Layer
> **Cập nhật:** 2026-04-04

---

## Executive Summary

Phase 23 introduces centralized environmental sensing through new module `spatial-environment-guard`, plus 8 advanced ecological and physical safeguards ensuring practitioners maintain proper form, environment, and energetic alignment during all spiritual activities.

---

## 🏗️ NEW ARCHITECTURAL MODULE: `spatial-environment-guard`

> **Module Type:** NestJS Guard/Middleware + External API Integration
> **Responsibility:** Centralized environmental validation for all ritual actions

### Purpose

Instead of dispersing environmental checks across 11 modules, create single source of truth for:
- Real-time weather validation
- Geolocation verification
- Timezone/time-of-day enforcement
- Celestial event detection (solar/lunar)
- Environmental hazard alerts

### Module Architecture

```typescript
// Guard that all ritual endpoints pass through
@Injectable()
export class SpatialEnvironmentGuard implements CanActivate {
  constructor(
    private weatherService: WeatherService,
    private geolocationService: GeolocationService,
    private timezoneService: TimezoneService,
    private celestialService: CelestialService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const userId = request.user.id
    const ritualType = request.body.ritualType

    // Fetch current environment state
    const environment = await this.getEnvironmentState(userId)

    // Check against ritual requirements
    const validation = this.validateEnvironment(ritualType, environment)

    if (!validation.allowed) {
      throw new ForbiddenException({
        code: validation.code,
        message: validation.message,
        reason: validation.reason
      })
    }

    // Attach to request for downstream use
    request.environment = environment
    return true
  }

  private async getEnvironmentState(userId: string) {
    const user = await this.userService.findWithLocation(userId)
    const location = await this.geolocationService.getUserLocation(userId)
    const timezone = await this.timezoneService.getUserTimezone(userId)
    const weather = await this.weatherService.getWeatherAtLocation(location)
    const celestial = await this.celestialService.getCelestialEvents(location)

    return {
      location,
      timezone,
      currentTime: dayjs.tz(timezone),
      weather,
      celestial,
      isStorming: weather.thunderstorm || weather.heavyRain,
      sunsetTime: this.calculateSunset(location, new Date()),
      isSunrise: this.isCurrentlySunrise(location)
    }
  }
}
```

### Integration Points

```typescript
// Controller example
@Post('/little-house/burn')
@UseGuards(SpatialEnvironmentGuard)
async burnLittleHouse(
  @Request() req,
  @Body() dto: BurnLittleHouseDto
) {
  const { environment } = req
  // Logic has access to validated environment state
  return this.littleHouseService.burn(dto, environment)
}
```

### Audit Logging

```prisma
model EnvironmentalCheckLog {
  id            String @id @default(cuid())
  userId        String

  ritualType    String  // BURN_LH, RECITATE, RELEASE
  timestamp     DateTime @default(now())

  weather       String  // CLEAR, CLOUDY, RAINY, THUNDERSTORM
  temperature   Decimal
  humidity      Decimal
  windSpeed     Decimal

  locationLatitude   Decimal
  locationLongitude  Decimal
  timezone       String

  checkResult   String  // ALLOWED, BLOCKED_WEATHER, BLOCKED_TIME
  blockReason   String?

  user          User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, timestamp])
}
```

---

## 🚀 LOGIC 1: Targeted Midnight Override for Prefilled Little Houses

> **Domain:** `little-house`, `content`
> **Owner:** TimeGuardService / TargetedOverrideEngine

### Purpose

Standard rule: Recitations blocked after 22:00. Exception: If Little House recipient name already filled (offeredTo field populated), system allows recitation until 23:59:59 because spiritual vector is locked to beneficiary.

### Business Rules

| Condition | Action |
|---|---|
| Time = 22:00 - 23:59 | ✅ Check LH status |
| LH.offeredTo = null (empty) | ❌ Block, standard curfew |
| LH.offeredTo != null (named) | ✅ Allow until 23:59:59 |
| Time = 00:00+ | ❌ Block all, absolute cutoff |
| Extension active | ✅ Log extended session |

### Override Logic

```typescript
function getAllowedRecitationTime(
  littleHouseId: string,
  currentTime: DateTime
): { allowed: boolean; cutoffTime: DateTime } {
  const lh = await prisma.littleHouse.findUnique({ where: { id: littleHouseId } })
  const hour = currentTime.hour()

  if (hour >= 0 && hour < 22) {
    return { allowed: true, cutoffTime: null }
  }

  if (hour >= 22 && hour < 24) {
    // Check if recipient is filled
    if (lh.offeredTo === null || lh.offeredTo === '') {
      return {
        allowed: false,
        cutoffTime: dayjs(currentTime).hour(22).minute(0).second(0).toDate()
      }
    } else {
      // Recipient exists, allow until midnight
      return {
        allowed: true,
        cutoffTime: dayjs(currentTime).hour(23).minute(59).second(59).toDate()
      }
    }
  }

  return { allowed: false, cutoffTime: null }
}
```

### FE Behavior

```
Recitation Counter (22:30 PM):

Little House: [Nguyễn Văn A]
Recipient: ✅ Đã ghi (Filled)

🟢 ALLOWED UNTIL 23:59:59

Counter enabled. Extended curfew active.

⏰ Cutoff: 23:59:59

---

(Without recipient name filled):

Little House: [TRỐNG]
Recipient: ❌ Chưa ghi (Empty)

🔴 BLOCKED AFTER 22:00

Counter disabled.

⚠️ Standard curfew: 22:00
Hãy ghi tên người nhận để mở khóa
đến 23:59:59.
```

### Audit

| Action | Trigger |
|---|---|
| `lh.extension_check` | Time = 22:00-24:00 |
| `lh.override_granted` | offeredTo != null |
| `lh.override_blocked` | offeredTo = null |
| `lh.extended_session_logged` | Override active |

---

## 🚀 LOGIC 2: Hardware Posture Enforcer (Device Orientation)

> **Domain:** `content`, `wisdom-qa`
> **Owner:** RecitationService / PostureGuard

### Purpose

Scripture is dharma treasure. Cannot be read while lying flat, under waist, or touched with saliva. Device orientation detection enforces respectful posture.

### Business Rules

| Condition | Action |
|---|---|
| Device fully horizontal (lying) | ⚠️ Detect via accelerometer |
| User in flat position | ❌ Dim screen, show warning |
| User sits upright (0-45°) | ✅ Allow full functionality |
| Device vertical (portrait) | ✅ Ideal reading position |
| Warning acknowledged | ✅ Allow resume reading |

### Device Orientation Detection

```typescript
// Frontend: Monitor device orientation
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (event) => {
    const beta = event.beta  // -180 to 180
    const gamma = event.gamma // -90 to 90

    // Flat/horizontal threshold
    if (Math.abs(beta) < 10 && Math.abs(gamma) < 30) {
      // Device is nearly flat
      showPostureWarning()
    }
  })
}
```

### Warning Modal

```
⚠️ CẢNH BÁO TÔN KÍNH

Kinh Phật không được để thấp hơn
thắt lưng hoặc đọc nằm xuống.

LUẬT PHÁP MÔN:
────────────────────────────────────

• CẤM nằm ngang mà đọc Kinh
• CẤM để Kinh dưới chân giường
• CẤM kẹp Kinh dưới nách
• TUYỆT ĐỐI KHÔNG dùng nước bọt
  lật trang (thực tế hay kỹ thuật số)

════════════════════════════════════

Hành động cần thực hiện:

✅ Ngồi dậy
✅ Đưa thiết bị cao lên ngang ngực
✅ Bộ lạ trang bằng ngón tay khô

[Tôi đã ngồi đúng cách]
(modal dismisses, reading resumes)
```

### Audit

| Action | Trigger |
|---|---|
| `posture.horizontal_detected` | Device nearly flat |
| `posture.warning_shown` | User alerted |
| `posture.correction_acknowledged` | User confirms upright |

---

## 🚀 LOGIC 3: Repentance-LH Ratio Auto-Downgrade

> **Domain:** `wisdom-qa`, `engagement`
> **Owner:** RecitationService / KarmaBalanceEnforcer

### Purpose

Excessive repentance chanting (Lễ Phật) activates karma debt rapidly. If user recites without corresponding Little House burning quota, system automatically downgrades plan to safe level and locks escalation.

### Business Rules

| Condition | Action |
|---|---|
| Weekly scan runs (Sun 23:59) | ✅ Compare Lễ Phật vs LH |
| User.dailyLePhat >= 5 | ✅ Check weekly LH burned |
| user.weeklyLittleHouseBurnt < 5 | 🚨 Activate downgrade |
| Imbalance confirmed | ✅ Auto-adjust daily task |
| Downgraded plan locked | ❌ User cannot escalate until balance restored |

### Auto-Downgrade Logic

```typescript
async function enforceLePhatLHBalance(userId: string) {
  const weekStats = await this.getWeeklyStats(userId)

  if (weekStats.dailyLePhat >= 5 && weekStats.weeklyLHTurned < 5) {
    // CRITICAL IMBALANCE DETECTED
    await this.emergencyAlert.send(userId, {
      severity: 'CRITICAL',
      message: '业障已被激活！你正在忏悔但没有小房子来偿债。'
    })

    // Auto-downgrade next week's plan
    const safeConfig = {
      lePhat: 1, // Force down to 1/day
      shaPhat: 0,
      daBei: 49,
      lockedUntil: dayjs().add(1, 'week').toDate()
    }

    await this.configService.updateDailyTask(userId, safeConfig)

    await this.auditLog.create({
      userId,
      action: 'AUTO_DOWNGRADE_LEPH AT',
      reason: 'KARMA_ACTIVATION_PREVENTION',
      previousConfig: weekStats.config,
      newConfig: safeConfig
    })
  }
}
```

### Emergency Notification

```
🚨 CẢNH BÁO TỐi CAO 🚨

TÌNH TRẠNG: Nghiệp Chướng Bùng Phát

────────────────────────────────────

週統計 (本週):
• 禮佛: 35遍 (5遍/天)
• 小房子: 0张 ❌

────────────────────────────────────

⚡ 問題:
你在懺悔大量業障但沒有小房子來償債。
業障已被激活，可能導致：
✗ 突然身體不適
✗ 心理波動
✗ 靈性騷擾

════════════════════════════════════

✅ 自動調整已執行:

下週時課 (Next Week's Plan):
• 禮佛: 1遍/天 (已自動降低)
• 大悲咒: 49遍
• 其他: [...]

此計劃已鎖定，禁止升級。
直到你補足小房子債務。

[確認已讀]
```

### Audit

| Action | Trigger |
|---|---|
| `leph at.weekly_balance_check` | Sun 23:59 |
| `leph at.imbalance_detected` | Ratio < 1:7 |
| `leph at.emergency_alert_sent` | Notification dispatched |
| `leph at.auto_downgrade_applied` | Config locked |
| `leph at.user_restored_balance` | User rebuilds quota |
| `leph at.lock_removed` | Safe to resume |

---

## 🚀 LOGIC 4: Ecological Liability Exemption Prayer

> **Domain:** `life-liberation`
> **Owner:** LifeLiberationService / EcologyValidator

### Purpose

Releasing animals into polluted water or wrong ecosystem creates negative karma. User must recite liability exemption prayer before logging release as valid.

### Business Rules

| Condition | Action |
|---|---|
| User initiates release | ✅ Show location & species input |
| Release details entered | ✅ Display exemption prayer |
| User checks confirmation | ✅ Unlock submit button |
| Prayer not acknowledged | ❌ Submit disabled |

### Exemption Prayer

```
"Nếu việc phóng sinh này gây ra vấn đề ô nhiễm,
hoặc sinh vật không hợp môi trường sống dẫn đến chết mau,
xin Bồ Tát và Hộ Pháp tha thứ cho con.
Con xin chuyên chở toàn bộ ác nghiệp đó
để người thả thay con chịu hậu quả."
```

### FE Behavior

```
Phóng Sinh Tại Địa Điểm:

Địa điểm: [Sông Sài Gòn]
Loài vật: [Cá chép] x 100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧘 XÁC NHẬN TRÁCH NHIỆM SINH THÁI

Hãy đọc lời khấn:

"Nếu việc phóng sinh này gây ra
vấn đề ô nhiễm, hoặc sinh vật
không hợp môi trường dẫn đến
chết mau, xin Bồ Tát và Hộ Pháp
tha thứ cho con..."

[ ] Tôi đã đọc và cam kết lời khấn này

[Ghi nhận đã thả] (disabled until checked)
```

### Audit

| Action | Trigger |
|---|---|
| `release.ecology_prayer_required` | Release initiated |
| `release.prayer_displayed` | Exemption shown |
| `release.prayer_acknowledged` | Checkbox confirmed |
| `release.logged_with_exemption` | Record created |

---

## 🚀 LOGIC 5: No-Water-Staring Protocol

> **Domain:** `life-liberation`
> **Owner:** LifeLiberationService / MentalFocusGuard

### Purpose

Staring intently at water while reciting during animal release attracts water spirits (aquatic entities). User must keep focus upward toward sky, not downward toward water.

### Business Rules

| Condition | Action |
|---|---|
| User at water location (GPS verified) | ✅ Detect proximity |
| Recitation counter active | ✅ Screen instruction mode |
| Counter recording | 🔴 Dim water-view, enlarge text |
| User glances down | ⚠️ Visual reminder |

### Display Mode Activation

```typescript
// When at water location + actively reciting
if (environment.location.nearWater && counter.isReciting) {
  screen.blur(videoFeed)  // Blur real camera
  screen.show({
    backgroundColor: 'white',
    textSize: '120px',
    textContent: '🙏 HÃY NGẨNG ĐẦU LÊN TRỜI',
    fontSize: 'XXLARGE',
    animation: 'pulse'
  })
}
```

### Screen Content

```
═══════════════════════════════════════════

  🙏 HÃY NGẨNG ĐẦU LÊN TRỜI 🙏

═══════════════════════════════════════════

CẤM NHÌN CHẰM CHẰM XUỐNG MẶT NƯỚC

════════════════════════════════════════════

Lý do:
────────────────────────────────────────
Khi bạn đang kết nối năng lượng Kinh
và nhìn chằm chằm xuống nước, bạn có
thể thu hút vong linh/thủy quái từ
dưới nước kéo trường khí của bạn.

════════════════════════════════════════════

✅ Hành động đúng:
   Ngẩng đầu lên trời
   Nhìn vào mây, ánh sáng Mặt trời
   Cảm nhận năng lượng từ trên cao

════════════════════════════════════════════

Lần niệm: [████░░░░░░] 34/49
```

### Audit

| Action | Trigger |
|---|---|
| `water.proximity_detected` | User at lake/river |
| `water.staring_guard_active` | Recitation started |
| `water.screen_blur_applied` | Water view obscured |
| `water.focus_reminder_shown` | Upward guidance displayed |

---

## 🚀 LOGIC 6: Zen-PureLand Syncretic Router

> **Domain:** `content`, `identity`
> **Owner:** BHFFService / ContextualRecommender

### Purpose

BHFF articles split into two schools: Zen (solving worldly problems) and Pure Land (transcendence/letting go). System recommends based on user's life stage and current mental state.

### Business Rules

| Condition | Action |
|---|---|
| User opens BHFF library | ✅ Analyze user profile |
| Age < 70 + healthStatus = good | ✅ Prioritize Zen articles |
| Age >= 70 + healthStatus = critical | ✅ Prioritize Pure Land articles |
| Recent log: depression/divorce | ✅ Boost Zen recommendations |
| Recent log: terminal diagnosis | ✅ Boost Pure Land recommendations |
| User reads article | ✅ Suggest related school |

### Content Classification

```typescript
enum BHFFSchool {
  ZEN = 'ZEN',           // 人間智慧 (Worldly wisdom)
  PURE_LAND = 'PURE_LAND'  // 超越往生 (Transcendence)
}

interface BHFFArticle {
  id: string
  title: string
  content: string
  school: BHFFSchool
  topics: string[]
  targetAge: { min?: number; max?: number }
  keywords: string[]
}

const SCHOOL_MAP = {
  // Zen articles (solve worldly problems)
  ZEN: [
    '解決婚姻衝突',
    '克服職場焦慮',
    '應對親子關係',
    '管理財務壓力',
    '治癒心理創傷'
  ],
  // Pure Land articles (transcendence)
  PURE_LAND: [
    '放下執著',
    '準備來世',
    '面對死亡',
    '護理臨終者',
    '超越輪迴'
  ]
}
```

### Router Logic

```typescript
async function getPersonalizedRecommendations(userId: string) {
  const user = await this.userService.find(userId)
  const health = await this.healthService.getStatus(userId)
  const recentLogs = await this.emotionalLog.getRecent(userId, 30)

  let recommendedSchool = BHFFSchool.ZEN

  // Age-based routing
  if (user.age >= 70) {
    recommendedSchool = BHFFSchool.PURE_LAND
  }

  // Health-based routing
  if (health.status === 'TERMINAL' || health.status === 'CRITICAL') {
    recommendedSchool = BHFFSchool.PURE_LAND
  }

  // Emotion-based routing
  const emotionalKeywords = recentLogs.map(l => l.keywords).flat()
  if (emotionalKeywords.includes('divorce') || emotionalKeywords.includes('depression')) {
    recommendedSchool = BHFFSchool.ZEN
  }

  // Return articles sorted by school
  return this.bhffService.getArticles({
    school: recommendedSchool,
    limit: 20
  })
}
```

### UI Display

```
📚 BHFF Thư Viện

┌─ GỢI Ý RIÊNG CHO BẠN ────────────┐
│ Dựa trên tình trạng của bạn,     │
│ hệ thống khuyến nghị:             │
│                                   │
│ ✅ Các bài Thiền Tông             │
│    (Xử lý vấn đề nhân gian)       │
└───────────────────────────────────┘

[Trí Tuệ Nhân Gian - Thiền]
(18 bài)

1. Giải Quyết Cãi Vã Gia Đình
2. Vượt Qua Thất Nghiệp
3. Chữa Lành Từ Nỗi Sợ Hãi
...

┌─ CÓ THÊM: SIÊU THOÁT VÃNG SANH ──┐
│ (9 bài dành cho người lớn tuổi)   │
│ [Xem Chi Tiết]                    │
└───────────────────────────────────┘
```

### Audit

| Action | Trigger |
|---|---|
| `bhff.router_analyzed_profile` | User opens library |
| `bhff.school_recommended` | Zen or Pure Land selected |
| `bhff.articles_prioritized` | Content reordered |
| `bhff.user_browsed_school` | User views school |

---

## 🚀 LOGIC 7: No-Altar 1-1 Pre-requisite Enforcement

> **Domain:** `engagement`, `little-house`
> **Owner:** LittleHouseService / AltarPrerequisiteGuard

### Purpose

Burning Little House at altar requires only incense offering. Without altar, user must add **1 recitation of Great Compassion Mantra + 1 recitation of Heart Sutra** before burning to establish energetic bridge.

### Business Rules

| Condition | Action |
|---|---|
| User selects location | ✅ Choose: Has Altar / No Altar |
| Location = Has Altar | ✅ Standard flow, incense → burn |
| Location = No Altar | ✅ Inject prerequisite tasks |
| User completes both recitations | ✅ Unlock burn button |
| Recitations not done | ❌ Burn button disabled |

### Prerequisite Injection

```typescript
function injectAltarPrerequisites(littleHouseId: string, hasAltar: boolean) {
  if (hasAltar) {
    return { required: false }
  }

  // No altar: inject mandatory recitations
  return {
    required: true,
    tasks: [
      {
        id: 'prereq_1',
        name: 'Niệm 1 biến Chú Đại Bi',
        completed: false,
        order: 1
      },
      {
        id: 'prereq_2',
        name: 'Niệm 1 biến Tâm Kinh',
        completed: false,
        order: 2
      }
    ],
    message: 'Vì không có bàn thờ, bạn BẮT BUỘC niệm 2 bài này trước để thành lập cầu nối năng lượng.'
  }
}
```

### UI Flow

```
Đốt Ngôi Nhà Nhỏ:

[1. Chọn Vị Trí]

Địa điểm: ○ Có Bàn Thờ
          ● Không Bàn Thờ (Ban công/Sân)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2. Hoàn Thành Tiên Quyết]

❌ Niệm 1 biến Chú Đại Bi
❌ Niệm 1 biến Tâm Kinh

[Bắt Đầu Niệm Chú Đại Bi]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(After both completed:)

✅ Niệm 1 biến Chú Đại Bi
✅ Niệm 1 biến Tâm Kinh

[3. Bắt Đầu Đốt] (enabled)

[Thắp Tâm Hương] → [Đốt NNN]
```

### Audit

| Action | Trigger |
|---|---|
| `lh.altar_status_selected` | User chooses location type |
| `lh.no_altar_detected` | No Altar option selected |
| `lh.prerequisites_injected` | 2 recitation tasks created |
| `lh.prerequisite_1_completed` | First recitation done |
| `lh.prerequisite_2_completed` | Second recitation done |
| `lh.burn_allowed` | Both prerequisites met |

---

## 🚀 LOGIC 8: Burn Container Sanitization Enforcement

> **Domain:** `engagement`, `altar-management`
> **Owner:** LittleHouseService / ContainerSanitizer

### Purpose

After burning Little House, ceramic plate absorbs Yin energy (negative energy from burned offering). Must be thoroughly washed immediately with water before storing. Cannot store dirty plate.

### Business Rules

| Condition | Action |
|---|---|
| Burn session completes | ✅ Post-burn checklist triggered |
| User confirms burn done | ✅ Show sanitization reminder |
| Checklist items unchecked | ❌ Session marked incomplete |
| Both checklist items checked | ✅ Session marked complete |

### Post-Burn Checklist

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ✅ ĐỐT NNN XONG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧼 DANH SÁCH SAU ĐỐT (Post-Burn)

[ ] Bước 1: Vị trí Đĩa Sứ
    ✓ Đĩa được đặt trên ghế nhỏ/
      tấm gỗ cách mặt đất
    ✓ KHÔNG đặt trên bàn thờ Phật
    ✓ KHÔNG đặt trực tiếp xuống nền

[ ] Bước 2: Tẩy Rửa Ngay Lập Tức
    ✓ Tôi cam kết mang chiếc đĩa này
      đi rửa sạch sẽ bằng nước ngay
      lập tức
    ✓ Loại bỏ hoàn toàn tro đen dính
      trên đĩa
    ✓ Không cất đi khi còn dính tro
      (để dính tro sẽ rước âm khí vào
      nhà)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lý do tẩy rửa:
────────────────────────────────────
Chiếc đĩa sứ sau khi hóa NNN sẽ
dính tro tàn (năng lượng cõi âm).
Bắt buộc phải rửa sạch sẽ trước khi
cất đi để tái sử dụng, tránh để
nguyên đĩa dính bụi tro đen sẽ rước
linh tính tà ác vào nhà.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Hủy] [Xác Nhận Danh Sách]
(button enabled only when both checked)
```

### Post-Burn State Machine

```typescript
enum PostBurnStatus {
  BURN_COMPLETED = 'BURN_COMPLETED',
  CHECKLIST_PENDING = 'CHECKLIST_PENDING',
  CHECKLIST_ACKNOWLEDGED = 'CHECKLIST_ACKNOWLEDGED',
  SANITIZATION_COMPLETE = 'SANITIZATION_COMPLETE'
}

interface PostBurnSession {
  littleHouseId: string
  burnedAt: DateTime
  status: PostBurnStatus

  positionConfirmed: boolean
  sanitizationCommitted: boolean

  completedAt?: DateTime
}
```

### Audit

| Action | Trigger |
|---|---|
| `burn.session_completed` | Flames extinguished |
| `burn.post_checklist_shown` | Reminder displayed |
| `burn.position_confirmed` | User checks item 1 |
| `burn.sanitization_committed` | User checks item 2 |
| `burn.session_finalized` | Both checked, session complete |

---

## 📊 Phase 23 Priority & Dependencies

| # | Logic | Module | Effort | Impact | Dependencies |
|---|-------|--------|--------|--------|--------------|
| **Arch** | spatial-environment-guard | New | MEDIUM | CRITICAL | None |
| 1 | Midnight Override (Prefilled) | little-house | LOW | MEDIUM | Environment Guard |
| 2 | Posture Enforcer | content | MEDIUM | MEDIUM | Device API |
| 3 | LePhat-LH Auto-Downgrade | wisdom-qa | MEDIUM | HIGH | Weekly scheduler |
| 4 | Ecology Liability Prayer | life-liberation | LOW | MEDIUM | Release form |
| 5 | No-Water-Staring Protocol | life-liberation | MEDIUM | LOW | GPS proximity |
| 6 | Zen-PureLand Router | content | HIGH | HIGH | User profile |
| 7 | No-Altar 1-1 Prerequisite | engagement | MEDIUM | MEDIUM | Location selector |
| 8 | Container Sanitization | engagement | LOW | MEDIUM | Post-burn workflow |

---

## 🔗 Integration Architecture

```
NestJS Controller Layer
        ↓
SpatialEnvironmentGuard (Middleware)
   ↓       ↓       ↓        ↓
Weather  Geo    Time   Celestial
APIs     APIs   Zone   Service
        ↓
Request allowed/denied
        ↓
Specific Module Guards
(Logic 1-8)
        ↓
Service Layer
        ↓
Database/Audit
```

---

**Status:** Ready for implementation
**Complexity:** Enterprise-Critical with external integrations
**Review Level:** PMTL Architecture Council

