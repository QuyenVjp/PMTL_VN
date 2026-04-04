# Calamity Avoidance Life Release Engine — Phóng Sinh Ngày Vàng Quan Trạch

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy luật Phóng sinh nhân ngày Tết & sinh nhật
> **Trạng thái:** Verified source — advisory notification only
> **Cập nhật:** 2026-04-04

---

## Purpose

Hệ thống tự động phát hiện **Giao Thừa** (New Year's Eve) và **sinh nhật của user** hàng năm,
bắn push notification vàng khuyến khích phóng sinh trong những "Ngày Vàng" này với
tương tác siêu ứng (up to 10,000x merit multiplier). Hệ thống highlight nút phóng sinh
với badge sao vàng để khuyến khích hành động.

---

## Owner module

`calendar` — CalamityAvoidanceLifeReleaseEngine, cron scheduling, special date detection
`notification` — push dispatch (Yellow notification type)
`engagement` → `LifeRelease` — UI badge highlighting

---

## Actors

- `system` (cron job) — tự động phát hiện ngày Tết và sinh nhật, trigger notification
- `member` — nhận yellow push notification, xem UI badge trên nút phóng sinh
- `admin` — view analytics dashboard, manual trigger if needed

---

## Trigger

Cron job chạy **mỗi ngày lúc 06:00 AM Vietnam time** (`Asia/Ho_Chi_Minh`):
- Kiểm tra nếu hôm nay là **Giao Thừa** (New Year's Eve âm lịch) → trigger all active users
- Kiểm tra nếu hôm nay là **sinh nhật** của bất kỳ user nào → trigger per-user

---

## Business Rule: Golden Days for Life Release

### Điều kiện Golden Day

| Tiêu chí | Điều kiện | Tương tác |
|---|---|---|
| Giao Thừa (New Year's Eve) | today = last day of lunar year | Tất cả user nhận notification |
| Sinh nhật | today matches (birthMonth + birthDay) | Per-user notification |

### Tương tác Merit Multiplier

- **Giá trị cơ bản:** Standard life release merit = `creatureCount * basePoints`
- **Multiplier trên Giao Thừa + sinh nhật:** Up to **10,000x** (system setting, configurable per ceremony)
- **Advisory:** Recommend **daytime only** (sunrise to sunset), **avoid nighttime**
- **UI Enhancement:** Golden star badge on life release button on these days

### Notification Template

```
Tiêu đề: "🌟 Thời Khắc Chuyển Giao Sinh Mệnh Đã Đến"

Nội dung:
"Hôm nay là [Giao Thừa / sinh nhật của bạn]. Đây là ngày vàng để phóng sinh —
tương tác merite sẽ được nhân lên tối đa.

💛 Lưu ý: Chọn ban ngày có nắng, TRÁNH phóng sinh vào ban đêm!

[Phóng Sinh Ngay]"

Type: YELLOW
Category: CALAMITY_AVOIDANCE_LIFE_RELEASE
```

---

## Write path — Cron Job Flow

### Step 1: Detect special dates

```sql
-- Check if today is Giao Thừa (lunar New Year's Eve)
-- Using lunar calendar conversion library
SELECT 1 WHERE isLunarNewYearsEve(TODAY())

-- Check if today is any user's birthday (dương lịch)
SELECT u.id, u.birthMonth, u.birthDay
FROM UserProfile u
WHERE u.birthMonth = MONTH(TODAY())
  AND u.birthDay = DAY(TODAY())
  AND u.notificationOptIn = true
```

### Step 2: Build special date DTO

```typescript
interface LifeReleaseMultiplierDto {
  date: DateTime                    // today
  isNewYearsEve: boolean           // Giao Thừa?
  isBirthday: boolean              // user's birthday?
  userId?: string                  // null if broadcast (Giao Thừa)
  multiplierFactor: number         // 10000 or configurable
}
```

### Step 3: Nếu `isNewYearsEve = true` hoặc `isBirthday = true`

3a. Kiểm tra `SystemNotification` record đã tạo cho `(date, type, userId)` chưa → **idempotent** (không bắn 2 lần/ngày/user).

3b. Tạo `SystemNotification` record:
```
{
  userId: (per-user) hoặc NULL (broadcast for Giao Thừa),
  type: "CALAMITY_AVOIDANCE_LIFE_RELEASE",
  specialDate: today,
  multiplierFactor: 10000,
  sentAt: now(),
  status: "SENT",
  messageTemplate: "yellow-life-release-golden-day"
}
```

3c. Dispatch yellow push notification:
```
{
  title:    "🌟 Thời Khắc Chuyển Giao Sinh Mệnh Đã Đến",
  body:     "Hôm nay là [Giao Thừa / sinh nhật của bạn]. Đây là ngày vàng để phóng sinh. 💛 Lưu ý: Chọn ban ngày có nắng, TRÁNH phóng sinh vào ban đêm!",
  type:     "YELLOW",
  category: "CALAMITY_AVOIDANCE_LIFE_RELEASE",
  deepLink: "/engagement/life-release",
  priority: "HIGH"
}
```

3d. Dispatch **UI badge** to engagement layer (if feature flagged):
```
{
  userId,
  badgeType: "GOLDEN_STAR",
  appliedTo: "life-release-button",
  validUntil: tomorrow 00:00:00,
  multiplierHint: "10,000x"
}
```

### Step 4: Audit

| Action | Trigger |
|---|---|
| `calendar.calamity-avoidance.new-years-eve-detected` | Giao Thừa phát hiện |
| `calendar.calamity-avoidance.birthday-detected` | Birthday phát hiện |
| `calendar.calamity-avoidance.notification-sent` | Yellow notification dispatch thành công |

---

## Data Models

```prisma
model SystemNotification {
  id              String    @id @default(cuid())
  publicId        String    @unique
  userId          String?   // NULL if broadcast (Giao Thừa)
  type            String    // "CALAMITY_AVOIDANCE_LIFE_RELEASE"
  specialDate     DateTime
  multiplierFactor Int      @default(10000)
  sentAt          DateTime  @default(now())
  status          String    @default("SENT")
  messageTemplate String?   // "yellow-life-release-golden-day"

  @@unique([userId, type, specialDate])  // idempotency per user per type per date
  @@index([type])
  @@index([specialDate])
}

model LifeReleaseMultiplier {
  id              String    @id @default(cuid())
  publicId        String    @unique
  date            DateTime
  isNewYearsEve   Boolean   @default(false)
  isBirthday      Boolean   @default(false)
  multiplierFactor Int      @default(10000)

  @@unique([date, isNewYearsEve, isBirthday])
}
```

---

## Async Side-effects

- Yellow push notification dispatch qua `notification` module.
- UI badge update qua `engagement` module (feature-flagged).
- **Phase 2+:** Outbox event `calendar.calamity-avoidance.life-release-golden-day-triggered` → downstream.

---

## Success Result

- System sends **exactly 1 yellow notification per user per special date** (idempotent).
- User sees golden star badge on life release button if implemented.
- Audit trail captures detection and notification dispatch.
- User can still perform life release on any day (golden day is advisory, not blocking).

---

## Errors

| Condition | Recovery |
|---|---|
| birthMonth/birthDay NULL (user chưa điền) | Skip per-user birthday check, still broadcast Giao Thừa |
| Push notification token expired | Log failure, retry next day cron |
| Lunar calendar conversion library unavailable | Fallback to fixed Giao Thừa date (e.g., Jan 29 2026 for Tết Giáp Ngọ) |
| Notification already sent today | Skip (idempotency check) |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `calendar.calamity-avoidance.new-years-eve-detected` | system | Cron phát hiện Giao Thừa |
| `calendar.calamity-avoidance.birthday-detected` | system | Cron phát hiện sinh nhật user |
| `calendar.calamity-avoidance.notification-sent` | system | Yellow notification dispatch thành công |

---

## Rate-limit / Idempotency

- `@@unique([userId, type, specialDate])` trên `SystemNotification` đảm bảo không bắn 2 lần cùng user cùng ngày.
- Cron job phải check existence trước khi insert — không dùng `createOrFail`.
- Nếu cron bị restart giữa chừng: replay toàn bộ special date check, idempotency constraint bảo vệ.
- Notification chỉ gửi **1 lần duy nhất** cho mỗi user trên mỗi special date.

---

## Notes for AI/codegen

- **Advisory only:** Golden day không block user từ phóng sinh các ngày khác. Nó chỉ tăng khuyến khích.
- **Lunar calendar:** Giao Thừa phải được tính toán dựa trên lunar calendar (âm lịch). Có thể hardcode fixed dates hoặc dùng library (e.g., `lunisolar-js`).
- **Daytime recommendation:** Message phải nhấn mạnh "ban ngày có nắng, tránh ban đêm" — không enforcement, chỉ advisory.
- **Multiplier setting:** 10,000x là configurable per system setting hoặc per life release ceremony type. Không hardcode.
- **Golden star badge:** Feature flag required if implementing UI enhancement. Default off if not yet designed.
- **Timezone:** Cron chạy lúc 06:00 AM Vietnam time (`Asia/Ho_Chi_Minh`), không UTC.
- **Broadcast vs per-user:** Giao Thừa notification broadcast tất cả active users (userId = NULL), sinh nhật per-user (userId = specific).
- **No blocking:** Không fetch user profile synchronously trong cron — keep cron fast, async dispatch only.
