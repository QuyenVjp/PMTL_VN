# Cổng Thời Gian Đốt Thăng Văn Đổi Tên — Name Change Burning Time-Gater

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức Thăng Văn Đổi Tên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trước khi user được phép đốt tờ **Thăng Văn Đổi Tên** (sacred name-change form), hệ thống kiểm tra
**thời gian** (lunar calendar + giờ cụ thể) và **thời tiết** (trời nắng) để quyết định gate outcome.

Khác với Little House (tuần hoàn từng ngày, golden time 8:00/10:00/16:00),
use-case này áp dụng riêng cho **Thăng Văn Đổi Tên**:
- Chỉ được đốt vào **Mùng 1 hoặc Rằm** (lunar calendar).
- Chỉ được đốt ở **8:00 AM (optimal), 6:00 AM, hoặc 4:00 PM**.
- Trời phải **nắng/trời quang** (no rain).
- Hard block: 400 `name_change_burning_time_restriction` nếu ngoài cửa sổ này.

---

## Owner module

`engagement` — [xem CONTRACTS.md](../CONTRACTS.md)
Thời tiết lấy từ external Weather API, được cache 30 phút.
Lịch âm lịch lấy từ calendar domain hoặc precalculated table.

---

## Actors

- `member` — khởi động luồng đốt
- `system` — kiểm tra điều kiện và quyết định gate outcome

---

## Trigger

User bấm **[Bắt đầu nghi thức đốt]** từ màn hình Thăng Văn Đổi Tên, sau khi form đã được chuẩn bị đầy đủ.

---

## Preconditions

- Có session hợp lệ.
- Form phải có đầy đủ `newName`, `reasonForChange`, và `currentName`.
- Form status phải là `READY_TO_BURN` hoặc `PENDING_BURN` (không thể đốt ở `DRAFT`).

---

## Input contract

```typescript
{
  formId:              string      // publicId của NameChangeForm
  attemptTime:         DateTime    // thời gian user bắt đầu đốt (ISO 8601)
  weatherCondition:    string      // weather API response (e.g., "clear", "rain", "cloudy")
  userTimezone?:       string      // timezone của user, default: "Asia/Ho_Chi_Minh"
}
```

---

## Read set

- session + actor role
- `NameChangeForm` record (validate ownership + status)
- Lịch âm lịch cho ngày hôm nay (`lunarDay`, `lunarMonth` — từ calendar service hoặc precalc)
- Thời gian hiện tại theo timezone của user
- Weather condition (từ Weather API cache, required — không thể bỏ qua)
- Auspicious day metadata (Mùng 1 hay Rằm?)

---

## Write path — Validation Guard (multi-gate)

### Gate 1: Form State Check

1. Load `NameChangeForm` theo `formId`.
2. Verify `form.userId = actorUserId` (hoặc admin).
3. Verify `form.status ∈ ["READY_TO_BURN", "PENDING_BURN"]`. Nếu không → `400 precondition_not_met`.
4. Verify `newName`, `reasonForChange`, và `currentName` đều có giá trị. Nếu thiếu → `400 incomplete_form`.

### Gate 2: Lunar Calendar Check (HARD BLOCK)

5. Lấy `lunarDay` và `lunarMonth` từ calendar service cho ngày `attemptTime`:
   ```
   isAuspiciousDay = (lunarDay === 1 OR lunarDay === 15)
   ```
6. Nếu `isAuspiciousDay = false`:
   - **HARD BLOCK** — trả về `400 name_change_burning_time_restriction` với message:
     *"Cửa trời không tiếp nhận Thăng Văn vào thời gian này. Bắt buộc phải thực hiện vào 8h, 6h sáng hoặc 16h chiều ngày trời nắng!"*
   - Gợi ý ngày Mùng 1 hoặc Rằm gần nhất.
   - Audit: `form.name-change.auspicious-day-failed`.

### Gate 3: Time Window Check (HARD BLOCK)

7. Lấy giờ từ `attemptTime` — chỉ cho phép:
   ```
   allowedHours = [06, 08, 16]  // 6:00 AM, 8:00 AM (optimal), 4:00 PM
   currentHour = attemptTime.getHours()
   isValidHour = currentHour ∈ allowedHours
   ```
8. Nếu `isValidHour = false`:
   - **HARD BLOCK** — trả về `400 name_change_burning_time_restriction` với message:
     *"Cửa trời không tiếp nhận Thăng Văn vào thời gian này. Bắt buộc phải thực hiện vào 8h, 6h sáng hoặc 16h chiều ngày trời nắng!"*
   - Gợi ý khung giờ hợp lệ gần nhất.
   - Audit: `form.name-change.burn-time-validated` (với kết quả fail).

### Gate 4: Weather Check (HARD BLOCK)

9. Gọi Weather API (cache 30 phút, timeout 2s). Nếu API fail → ABORT, không delay:
   ```
   allowedWeather = ["clear", "sunny", "partly_cloudy"]
   blockedWeather = ["rain", "thunderstorm", "drizzle"]
   isWeatherOk = weatherCondition ∈ allowedWeather
   ```
10. Nếu `isWeatherOk = false`:
    - **HARD BLOCK** — trả về `400 name_change_burn_weather_blocked` với message:
      *"Thời tiết không thích hợp. Theo quy định pháp môn, chỉ được đốt Thăng Văn khi trời nắng. Vui lòng chờ đến ngày trời khô ráo để thực hiện."*
    - Audit: `form.name-change.weather-cleared` (fail).

### Gate 5: Success Confirmation

11. Nếu qua cả 4 gates:
    - Cập nhật `NameChangeForm.burnedAt = now()`.
    - Ghi metadata: `{ attemptTime, weatherAtBurnTime, lunarDayBurned, auspiciousConfirmed }`.
    - Audit: `form.name-change.burn-gate.passed`, `form.name-change.auspicious-day-verified`, `form.name-change.weather-cleared`.

12. Render **Burn Confirmation Modal**:
    - Hiển thị tên cũ, tên mới, lý do thay đổi.
    - Hiển thị ngày âm lịch (Mùng 1 / Rằm), giờ đốt (6:00 / 8:00 / 16:00), điều kiện thời tiết.
    - User xác nhận `[ ] Tôi đã xác nhận để đốt tờ Thăng Văn Đổi Tên`.
    - Bấm **[Xác nhận Đốt]** để finalize.

13. Khi user bấm confirm:
    - Set `NameChangeForm.status = "BURNED"`.
    - Audit: `form.name-change.burn-completed`.

---

## Lunar Calendar Integration

**Dependency:** Calendar domain `GET /api/calendar/lunar/:date`

Response:
```json
{
  "date": "2026-04-04",
  "lunarDay": 15,
  "lunarMonth": 2,
  "isAuspiciousDay": true,
  "description": "Rằm tháng 2 (Đâu Là Pháp Tâm)"
}
```

If calendar service unavailable → ABORT gate, do not proceed. Return `503 service_unavailable`.

---

## Weather API Integration

**Dependency:** External Weather API (cached 30 min)

Request: `GET /weather?lat=userLat&lon=userLon` (or default Ho Chi Minh City)

Response:
```json
{
  "condition": "clear",
  "temperature": 28,
  "humidity": 65,
  "windSpeed": 5
}
```

Allowed conditions: `clear`, `sunny`, `partly_cloudy`, `overcast` (minor clouds OK).
Blocked conditions: `rain`, `thunderstorm`, `drizzle`, `heavy_rain`.

If API fail/timeout (>2s) → ABORT gate, return `400 name_change_burn_weather_blocked` with fallback message:
*"Không thể xác định thời tiết hiện tại. Vui lòng kiểm tra lại."*

---

## DTO: BurnNameChangeFormDto

```typescript
interface BurnNameChangeFormDto {
  formId:              string      // publicId
  attemptTime:         DateTime    // ISO 8601
  weatherCondition:    string      // from Weather API
  userTimezone:        string      // default: "Asia/Ho_Chi_Minh"
}
```

---

## Schema Update

```prisma
model NameChangeForm {
  id                    String      @id @default(cuid())
  userId                String
  currentName           String
  newName               String
  reasonForChange       String      @db.Text
  status                NameChangeFormStatus
  createdAt             DateTime    @default(now())
  burnedAt              DateTime?   // when successfully burned
  burnAttemptedAt       DateTime?   // first burn attempt (for audit)
  weatherAtBurnTime     String?     // weather condition at burn time
  lunarDayBurned        Int?        // lunar day (1-30)
  lunarMonthBurned      Int?        // lunar month (1-12)
  auspiciousConfirmed   Boolean     @default(false)

  user                  User        @relation(fields: [userId], references: [id])
  auditLogs             AuditLog[]
}

enum NameChangeFormStatus {
  DRAFT
  READY_TO_BURN
  PENDING_BURN
  BURNED
  CANCELLED
}
```

---

## Audit

| Action | Actor | Trigger | Error Code |
|---|---|---|---|
| `form.name-change.auspicious-day-verified` | actorUserId | Ngày âm lịch hợp lệ | — |
| `form.name-change.auspicious-day-failed` | actorUserId | Ngày không phải Mùng 1/Rằm | `name_change_burning_time_restriction` |
| `form.name-change.burn-time-validated` | actorUserId | Giờ hợp lệ (6/8/16) | — |
| `form.name-change.burn-time-failed` | actorUserId | Giờ ngoài cửa sổ | `name_change_burning_time_restriction` |
| `form.name-change.weather-cleared` | actorUserId | Thời tiết nắng | — |
| `form.name-change.weather-blocked` | actorUserId | Thời tiết có mưa | `name_change_burn_weather_blocked` |
| `form.name-change.burn-gate.passed` | actorUserId | Qua tất cả gates | — |
| `form.name-change.burn-completed` | actorUserId | Xác nhận đốt thành công | — |

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Form không ở trạng thái `READY_TO_BURN` / `PENDING_BURN` | `precondition_not_met` | 400 | Chuẩn bị form trước |
| Form thiếu `newName` / `currentName` / `reasonForChange` | `incomplete_form` | 400 | Điền đầy đủ thông tin form |
| Ngày không phải Mùng 1 hay Rằm | `name_change_burning_time_restriction` | 400 | Đợi đến Mùng 1 hoặc Rằm |
| Giờ ngoài cửa sổ (không phải 6/8/16) | `name_change_burning_time_restriction` | 400 | Chọn 6:00 AM, 8:00 AM, hoặc 4:00 PM |
| Thời tiết có mưa / bão | `name_change_burn_weather_blocked` | 400 | Chờ thời tiết nắng |
| Calendar service không phản hồi | `service_unavailable` | 503 | Thử lại sau |
| Weather API timeout | `name_change_burn_weather_blocked` | 400 | Kiểm tra thời tiết manual |
| Form không thuộc actor | `forbidden` | 403 | — |
| Form không tồn tại | `not_found` | 404 | — |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Rate-limit requirement

- Một form chỉ có thể đốt 1 lần duy nhất (enforce `burnedAt IS NULL` trước khi cho phép burn).
- Nếu user đốt nhiều forms trong 1 ngày (cùng Mùng 1 / Rằm) → không có rate limit, cho phép.

---

## Outbox event

- Event type: `engagement.name-change.burned`
- Subscriber: `identity` (update user profile `displayName` nếu burn thành công)
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu user báo đã đốt nhưng form status không update → Admin có thể manual set `status = BURNED` + `burnedAt = now()` qua admin panel.
- Nếu Weather API fail nhưng user muốn tiếp tục → phải retry request. Không có bypass path.
- Nếu calendar service unavailable → block hoàn toàn, không thể proceed. User phải thử lại sau.

---

## Notes for AI/codegen

- **Hard block tất cả gates** — Thăng Văn Đổi Tên là hình thức thiêng liêng cao, strict hơn Little House. Không có emergency override hay advisory-only mode.
- **Lunar calendar check bắt buộc** — phải gọi calendar domain, không thể hardcode danh sách Mùng 1/Rằm.
- **Weather là hard block** — khác với Little House (advisory). Thăng Văn phải đốt khi trời nắng.
- **Giờ cụ thể 3 slot** — 6:00 AM, 8:00 AM (optimal), 4:00 PM. Không có flexibility như Little House.
- **BurnAttemptedAt tracking** — ghi lần đầu user bấm burn, dù fail hay pass, cho audit trail.
- **Timezone handling** — default "Asia/Ho_Chi_Minh" nếu user không cung cấp. Sử dụng `dayjs().tz()` hoặc `date-fns` timezone utilities.
- **Form status → BURNED chỉ sau khi qua Gate 5** — không để form ở `PENDING_BURN` lâu. Nếu user cancel, revert về `READY_TO_BURN` hoặc `DRAFT`.
- **Confirmation modal phải show tất cả metadata** — lunar day, auspicious confirmation, weather, giờ đốt — để user review lần cuối trước khi confirm.
