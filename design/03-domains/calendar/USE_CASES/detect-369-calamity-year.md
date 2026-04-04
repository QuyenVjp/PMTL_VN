# Phát Hiện Năm Quan Trạch 369 — Detect 369 Calamity Year

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy luật Quan Trạch tuổi tác
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hệ thống tự động phát hiện khi user bước vào **năm Quan Trạch** (tuổi kết thúc bằng 3, 6, hoặc 9),
bắn push notification cảnh báo, và tự động inject *Tiêu Tai Cát Tường Thần Chú* vào
`DailyRecitation` plan của user để tăng cường bảo vệ trong năm đó.

---

## Owner module

`calendar` — calamity year detection, cron scheduling
`content` → `SutraCatalog` — nguồn mantra template
`notification` — push dispatch
`engagement` — DailyRecitation plan injection

---

## Actors

- `system` (cron job) — tự động tính toán và trigger
- `member` — nhận notification và thấy mantra được thêm vào plan
- `admin` — xem dashboard calamity alerts, override nếu cần

---

## Trigger

Cron job chạy **2 lần/năm**:
1. `0 9 1 1 *` — Mùng 1 tháng 1 dương lịch (đầu năm mới)
2. `0 9 * * *` — Mỗi ngày kiểm tra: nếu hôm nay là ngày sinh nhật của user → re-evaluate

---

## Business Rule: Tuổi Quan Trạch

### Tính tuổi

```
currentAge = currentYear - birthYear

// Dùng tuổi mụ (âm lịch) nếu user cung cấp năm sinh âm lịch
// Fallback: dùng tuổi dương lịch nếu không có

isCalamityYear = (currentAge % 10) in [3, 6, 9]
                 OR currentAge % 10 == 0  // tuổi tròn chục cũng là quan trạch lớn
```

### Ví dụ tuổi Quan Trạch: 13, 19, 23, 26, 29, 33, 36, 39, 43, 46, 49, 53, 56, 59, 63...

### Phân loại mức độ

| Điều kiện | Mức độ | Màu alert |
|---|---|---|
| Tuổi tận cùng = 3 hoặc 9 | `CALAMITY_MINOR` | Vàng cam |
| Tuổi tận cùng = 6 | `CALAMITY_MODERATE` | Cam đỏ |
| Tuổi tròn chục (30, 40, 50...) | `CALAMITY_MAJOR` | Đỏ đậm |

---

## Write path — Cron Job Flow

### Step 1: Eligible user scan

```sql
SELECT u.id, u.birthYear, u.birthMonth, u.birthDay, u.lunarBirthYear
FROM UserProfile u
WHERE u.birthYear IS NOT NULL
  AND u.notificationOptIn = true
```

### Step 2: Per-user calamity check

```typescript
function checkCalamityYear(birthYear: number, currentYear: number): CalamityResult {
  const age = currentYear - birthYear
  const lastDigit = age % 10
  if ([3, 6, 9].includes(lastDigit)) return { isCalamity: true, age, severity: getSeverity(lastDigit) }
  if (lastDigit === 0) return { isCalamity: true, age, severity: "CALAMITY_MAJOR" }
  return { isCalamity: false }
}
```

### Step 3: Nếu `isCalamity = true`

3a. Kiểm tra `CalamityAlert` record đã tạo cho `(userId, year)` chưa → **idempotent** (không bắn 2 lần cùng năm).

3b. Tạo `CalamityAlert` record:
```
{
  userId, year: currentYear, age,
  severity, detectedAt: now(), status: "ACTIVE"
}
```

3c. Dispatch push notification qua `notification` module:
```
{
  title:   "⚠️ Năm Quan Trạch [Tuổi]",
  body:    "Năm nay bạn bước vào Quan Trạch tuổi [age]. Hệ thống đã thêm Tiêu Tai Cát Tường Thần Chú vào bài tập hàng ngày để bảo vệ bạn.",
  type:    "CALAMITY_YEAR_ALERT",
  deepLink: "/tu-tap/bai-tap-hang-ngay"
}
```

3d. **Inject mantra vào DailyRecitation plan** (qua `engagement` module):
```
DailyRecitationPlanItem {
  userId,
  sutraKey:    "tieu_tai_cat_tuong_than_chu",
  countMin:    27,
  countMax:    49,
  addedReason: "CALAMITY_YEAR_AUTO_INJECT",
  addedYear:   currentYear,
  isRemovable: false   // user không thể tự xóa item này
}
```

3e. Nếu `severity = CALAMITY_MAJOR`: thêm khuyến nghị tăng Tiểu Phương Tử (advisory, không inject tự động):
```
CalamityAdvisory {
  userId,
  advisoryType: "INCREASE_LITTLE_HOUSE",
  message:      "Tuổi tròn chục là Quan Trạch lớn. Khuyến nghị tăng đốt Tiểu Phương Tử và phóng sinh trong năm này.",
  severity:     "CALAMITY_MAJOR"
}
```

### Step 4: Audit

`calendar.calamity.detected` — per user per year.

---

## Birthday Re-check Flow

Cron daily: nếu hôm nay là `birthday của user (month + day match)`:
- Re-run calamity check với `currentYear` hiện tại.
- Nếu đã có `CalamityAlert` cho năm này → skip (idempotent).
- Nếu chưa có (user mới đăng ký sau Tết) → trigger đầy đủ flow như trên.

---

## Admin Dashboard

```
GET /api/admin/calendar/calamity-alerts?year=2026&severity=CALAMITY_MAJOR

Response:
{
  total: number,
  items: CalamityAlertSummary[]  // không expose PII — chỉ anonymized stats
}
```

Admin có thể:
- Xem số lượng user đang ở năm Quan Trạch (aggregate, anonymized).
- Manual trigger alert cho user cụ thể (nếu user report bị thiếu).
- Override `severity` nếu có nguồn tham chiếu mới.

---

## Data Models mới

```
CalamityAlert {
  id          String   @id
  publicId    String   @unique
  userId      String
  year        Int
  age         Int
  severity    String   // "CALAMITY_MINOR" | "CALAMITY_MODERATE" | "CALAMITY_MAJOR"
  detectedAt  DateTime
  status      String   // "ACTIVE" | "ACKNOWLEDGED" | "EXPIRED"

  @@unique([userId, year])   // idempotency constraint
}

DailyRecitationPlanItem {
  id           String   @id
  userId       String
  sutraKey     String
  countMin     Int
  countMax     Int
  addedReason  String   // "CALAMITY_YEAR_AUTO_INJECT" | "USER_CUSTOM" | "ADMIN_ASSIGNED"
  addedYear    Int?
  isRemovable  Boolean  @default(true)
  createdAt    DateTime
}
```

---

## NNN Quota Assignment — Bổ Sung Phase 21 Logic 1

Khi `isCalamity = true`, ngoài inject mantra, hệ thống còn tạo **mục tiêu NNN bắt buộc** dựa trên tuổi:

### Business Rules

| Điều kiện | Hành động |
|---|---|
| Calamity detected, alert 90 ngày trước sinh nhật | ✅ Create CalamityLHMilestone |
| preNNNQuota = age (tấm NNN trước sinh nhật) | ⏳ Lock track cho đến khi hoàn thành |
| postNNNQuota = age (tấm NNN sau sinh nhật) | ⏳ Mở sau khi sinh nhật qua |
| Cả pre + post hoàn thành | ✅ Mark calamity year survived |

### 90-Day Early Alert

Cron phụ chạy daily: `today = birthday - 90 days`
→ Trigger **sớm hơn** Jan 1 cron, đảm bảo user có đủ thời gian hoàn thành pre-quota.

### NNN Quota Notification

```
🚨 CẢNH BÁO NẠN QUAN 3-6-9

Bạn sắp bước vào Nạn Quan Tuổi [X].
Nghiệp chướng sẽ bùng phát dữ dội.

Hệ thống đã điều chỉnh phác đồ:
✅ Thêm: Tiêu Tai Cát Tường Thần Chú (49 biến)/ngày
✅ Mục tiêu bắt buộc NNN:
   • [X] tấm trước sinh nhật
   • [X] tấm sau sinh nhật

[Xem Chi Tiết Phác Đồ]
```

### Schema Bổ Sung

```prisma
model CalamityLHMilestone {
  id               String   @id @default(cuid())
  userId           String
  calamityAlertId  String
  userAge          Int
  preNNNQuota      Int      // = userAge
  postNNNQuota     Int      // = userAge
  preNNNCompleted  Int      @default(0)
  postNNNCompleted Int      @default(0)
  status           String   @default("PENDING") // PENDING | PRE_DONE | COMPLETED
  // Migration: CREATE TABLE "CalamityLHMilestone" (...)
}
```

---

## Async side-effects

- Push notification dispatch qua `notification` module.
- `DailyRecitationPlanItem` inject qua `engagement` module.
- `CalamityLHMilestone` create qua `engagement` module.
- **Phase 2+:** Outbox event `calendar.calamity.detected` → downstream modules.

---

## Errors

| Condition | Recovery |
|---|---|
| `birthYear` null (user chưa điền) | Skip user, no alert |
| Push notification token expired | Log failure, retry next day |
| DailyRecitation plan inject conflict | Upsert by `(userId, sutraKey, addedYear)` |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `calendar.calamity.detected` | system | Cron phát hiện tuổi Quan Trạch |
| `calendar.calamity.mantra-injected` | system | Tiêu Tai Chú được thêm vào plan |
| `calendar.calamity.notification-sent` | system | Push notification dispatch thành công |
| `calendar.calamity.admin-override` | adminUserId | Admin manual trigger hoặc override |

---

## Rate-limit / Idempotency

- `@@unique([userId, year])` trên `CalamityAlert` đảm bảo không bắn 2 lần/năm.
- Cron job phải check existence trước khi insert — không dùng `createOrFail`.
- Nếu cron bị restart giữa chừng: replay toàn bộ eligible user list, idempotency constraint bảo vệ.

---

## Notes for AI/codegen

- `isRemovable = false` trên `DailyRecitationPlanItem` do calamity inject: enforce ở cả API level (reject DELETE request) và UI level (ẩn nút xóa).
- Notification body phải bao gồm tuổi cụ thể, không generic — inject `age` vào template.
- Cron chạy lúc 9:00 AM Vietnam time (`Asia/Ho_Chi_Minh`) — không chạy lúc nửa đêm.
- `CalamityAlert.status = "EXPIRED"` được set bởi cron cuối năm (31/12) — clean up sau 1 năm.
- Không expose `userId` trong admin aggregate response — chỉ count theo severity/age-group.
- `tieu_tai_cat_tuong_than_chu` phải tồn tại trong `SutraCatalog` trước khi inject — validate FK trước write.
