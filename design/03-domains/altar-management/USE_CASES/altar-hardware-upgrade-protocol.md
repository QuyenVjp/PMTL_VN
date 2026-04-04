# Nâng Cấp Yêu Cầu Nhang theo Ngày Vía — Altar Hardware Upgrade Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Thắp nhang theo Ngày Vía / Mùng 1 / Rằm
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trên các **Ngày Vía** (vía Quan Âm, vía Địa Tạng, vía Phổ Hiền, vía Thích Ca, vía Dược Sư, v.v.), hoặc **Mùng 1 / Rằm** lịch âm,
hệ thống tự động nâng cấp yêu cầu từ **1 nén nhang / lư hương → 3 nén nhang / lư hương**.

Logic này đảm bảo user không vô tình log "1 nén nhang" vào các ngày thánh, vi phạm quy tắc linh thiêng.
Nếu user cố gắng log, API sẽ block với error code cụ thể và message hướng dẫn.

---

## Owner module

`altar-management` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khi log daily incense offering bằng POST /api/altar-management/incense/log-daily
- `system` — validate lịch âm, check auspicious day, enforce 3-stick requirement, audit

---

## Trigger

User bấm **[Thắp Nhang Hôm Nay]** hoặc submit form log daily incense offering via POST /api/altar-management/incense/log-daily.

---

## Preconditions

- User đã đăng nhập và có `memberProfile` hợp lệ.
- Có ít nhất 1 burner đã được set up trên altar profile.

---

## Input contract

```typescript
LogIncenseDto {
  burnerCount:      number        // số lư hương (>= 1)
  sticksPerBurner:  number        // nén nhang mỗi lư (>= 1)
  date:             DateTime      // ngày log (default = today)
  notes?:           string        // ghi chú optional
}
```

---

## Read set

- `session` + `userId`
- `UserAltarProfile` (có `burnerCount` setup)
- Lịch âm của `date` — check nếu là Mùng 1, Rằm, hoặc Ngày Vía
- `AuspiciousDayCalendar` lookup table hoặc integration với external lunar calendar service

---

## Business rule — Auspicious Day Detection

Một ngày được coi là **Auspicious Day (Ngày Vía)** nếu:

1. **Mùng 1 âm lịch** (1st day of lunar month)
2. **Rằm âm lịch** (15th day of lunar month)
3. **Buddha Holy Days** — danh sách sau (sử dụng solar calendar hoặc lunar fixed dates):
   - Quan Âm Bồ Tát Ngày Thành Đạo: Mùng 19 tháng 2 âm lịch
   - Thích Ca Mâu Ni Phật Ngày Thành Đạo: Mùng 8 tháng 4 âm lịch
   - Dược Sư Phật Ngày Thành Đạo: Mùng 15 tháng 9 âm lịch
   - Địa Tạng Bồ Tát Ngày Thành Đạo: Mùng 30 tháng 7 âm lịch
   - Phổ Hiền Bồ Tát Ngày Thành Đạo: Mùng 21 tháng 3 âm lịch
   - Quan Đế Thánh Nhân Ngày Thành Đạo: Mùng 13 tháng 6 âm lịch
   - Quốc Tổ Hung Vương: Mùng 10 tháng 3 âm lịch

---

## Write path — Validation Guard

### Step 1: Parse & Validate Input

1. Parse `burnerCount`, `sticksPerBurner` qua Zod schema:
   ```typescript
   z.object({
     burnerCount: z.number().int().min(1),
     sticksPerBurner: z.number().int().min(1),
     date: z.coerce.date(),
     notes: z.string().max(200).optional()
   })
   ```
2. Nếu parse fail → `400 invalid_body`.

### Step 2: Load User Altar Profile

3. Load `UserAltarProfile` theo `userId`.
4. Verify `burnerCount` <= profile configured burners. Nếu user submit `burnerCount: 10` nhưng chỉ setup 3 → optional warning hoặc `400 burner_count_mismatch`.

### Step 3: Check Auspicious Day

5. **Chuyển `date` sang lịch âm** (dùng lunar calendar lib hoặc API call):
   - Nếu date là `Mùng 1` hoặc `Rằm` âm lịch → `isAuspiciousDay = true`
   - Nếu date trùng với Buddha Holy Day → `isAuspiciousDay = true`
   - Ngược lại → `isAuspiciousDay = false`

6. **Ghi audit:** `altar.incense.auspicious-day-detected` nếu `isAuspiciousDay = true`.

### Step 4: Enforce 3-Stick Requirement on Auspicious Days

7. **Nếu `isAuspiciousDay = true`:**
   - Kiểm tra: `sticksPerBurner >= 3` cho tất cả burners?
   - Nếu **ANY** burner có `sticksPerBurner < 3` → **HARD BLOCK**:
     ```json
     {
       "error": "auspicious_day_incense_mismatch",
       "code": "400",
       "message": "Hôm nay là Ngày Vía / Mùng 1, luật bắt buộc phải thắp 3 nén nhang cho mỗi lư hương!",
       "severity": "SPIRITUAL_BLOCK",
       "requiredSticksPerBurner": 3,
       "userSubmittedSticksPerBurner": sticksPerBurner
     }
     ```

8. **Nếu `isAuspiciousDay = false`:**
   - User có thể log tùy ý (1 nén, 2 nén, etc.)
   - Proceed bình thường.

### Step 5: Create Incense Log Record

9. Tạo `IncenseLog` record:
   ```prisma
   IncenseLog {
     id:                     String @id
     userId:                 String
     date:                   DateTime
     burnerCount:            Int
     sticksPerBurner:        Int
     isAuspiciousDay:        Boolean  // computed field
     auspiciousDayType:      String?  // "LUNAR_1ST" | "LUNAR_15TH" | "BUDDHA_HOLY_DAY" | null
     notes:                  String?
     createdAt:              DateTime
     updatedAt:              DateTime
   }
   ```

10. Audit: `altar.incense.3-sticks-logged` nếu `isAuspiciousDay = true` và validation passed.

### Step 6: Return Success

11. Return `LogIncenseDto` + `{ isAuspiciousDay, message }`:
    ```json
    {
      "success": true,
      "data": {
        "incenseLogId": "uuid",
        "date": "2026-04-04",
        "burnerCount": 2,
        "sticksPerBurner": 3,
        "isAuspiciousDay": true,
        "auspiciousDayType": "LUNAR_1ST",
        "message": "Ghi nhận thắp 3 nén nhang cho 2 lư hương vào Mùng 1 âm lịch. Chúc bạn tu tập an lạc!"
      }
    }
    ```

---

## FE Behavior

### UI Auto-Upgrade Incense Requirement

1. **Form Load (GET incense form):**
   - Frontend gọi `GET /api/altar-management/incense/calendar?date=today` để lấy thông tin Auspicious Day.
   - Nếu `isAuspiciousDay = true` → Hiển thị:
     ```
     ⭐ Hôm nay là Ngày Vía / Mùng 1. Yêu cầu: 3 nén nhang / lư hương
     ```
   - Default input value `sticksPerBurner = 3` (thay vì 1).

2. **Number Input State:**
   - `sticksPerBurner` input field có `min="3"` khi `isAuspiciousDay = true`.
   - `min="1"` khi `isAuspiciousDay = false`.
   - User không thể manual input giá trị < 3 trên Auspicious Day.

3. **Submit Button:**
   - Nút [Lưu] disabled nếu `isAuspiciousDay = true` và `sticksPerBurner < 3`.
   - Inline error: *"Vui lòng thắp ít nhất 3 nén nhang mỗi lư hương hôm nay."*

4. **Error Handling:**
   - Nếu API trả `auspicious_day_incense_mismatch` → Hiển thị **modal cảnh báo đỏ**:
     ```
     ❌ Không được thắp 1 nén nhang hôm Ngày Vía
     Hôm nay là Ngày Vía / Mùng 1, luật bắt buộc phải thắp 3 nén nhang cho mỗi lư hương!

     [Chỉnh sửa] [Hủy]
     ```
   - Bấm [Chỉnh sửa] → Quay lại form, reset `sticksPerBurner = 3`.

---

## Errors

| Condition | Error code | HTTP | Message |
|---|---|---|---|
| `burnerCount` hoặc `sticksPerBurner` missing/invalid | `invalid_body` | 400 | "Missing or invalid field: burnerCount, sticksPerBurner" |
| `sticksPerBurner < 3` trên Auspicious Day | `auspicious_day_incense_mismatch` | 400 | "Hôm nay là Ngày Vía / Mùng 1, luật bắt buộc phải thắp 3 nén nhang cho mỗi lư hương!" |
| `burnerCount` > profile setup | `burner_count_mismatch` | 400 | "Số lư hương vượt quá cấu hình hiện tại" |
| User không đăng nhập | `unauthorized` | 401 | — |
| No altar profile setup | `altar_profile_not_found` | 404 | "Vui lòng setup bàn thờ trước khi ghi nhận nhang" |

---

## Audit

| Action | Trigger | Severity |
|---|---|---|
| `altar.incense.auspicious-day-detected` | `isAuspiciousDay = true` được phát hiện | INFO |
| `altar.incense.3-sticks-logged` | User submit successfully với 3+ nén nhang trên Auspicious Day | INFO |
| `altar.incense.invalid-auspicious-day-attempt` | User cố submit < 3 nén nhang trên Auspicious Day | WARN |

---

## Rate-limit requirement

- Không rate limit trên endpoint này (user có thể log multiple times daily nếu cần).

---

## Schema Notes for AI/codegen

```prisma
model IncenseLog {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  date                  DateTime // ngày ghi nhận
  burnerCount           Int      // số lư hương
  sticksPerBurner       Int      // nén nhang mỗi lư

  // Computed fields (tính toán khi create)
  isAuspiciousDay       Boolean  @default(false)
  auspiciousDayType    String?  // "LUNAR_1ST" | "LUNAR_15TH" | "BUDDHA_HOLY_DAY"

  notes                 String?  @db.VarChar(200)

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId, date])
}

enum AuspiciousDayType {
  LUNAR_1ST           // Mùng 1 âm lịch
  LUNAR_15TH          // Rằm âm lịch
  BUDDHA_HOLY_DAY     // Ngày Vía Bồ Tát/Phật
}
```

---

## Related

- [grand-incense-state-machine.md](./grand-incense-state-machine.md) — Sandalwood burning ritual (companion logic)
- [schedule-altar-lamp-reminder.md](../../../vows-merit/USE_CASES/schedule-altar-lamp-reminder.md) — Lamp-Incense sync
- [altar-offerings-guide.md](../../../content/USE_CASES/altar-offerings-guide.md) — General altar offering guide
