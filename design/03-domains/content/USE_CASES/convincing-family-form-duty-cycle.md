# Chu kỳ An toàn của "Thăng Văn Khuyến Đạo" — Convincing Family Form Duty Cycle

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 852; Phase 31)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Thăng Văn Khuyên Đạo là đơn xin Bồ Tát mở trí tuệ cho người nhà để họ tin theo Phật Pháp. Có hai ràng buộc cốt lõi:

1. **Chu kỳ nghỉ ngơi:** Nếu dâng đơn liên tục quá 30 ngày mà không nghỉ, công đức của chính bạn sẽ bị rút cạn để "đắp" cho đối phương. Bắt buộc nghỉ 7 ngày sau mỗi 30 ngày liên tục. Trong 7 ngày nghỉ, chỉ được phép niệm Tâm Kinh cho người đó — không được đọc đơn.

2. **Cấm đốt đơn:** Đơn Khuyến Đạo **TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỐT**. Đơn được đặt trên bàn thờ trong thời gian nhang cháy (15-30 phút) rồi cất đi — để quá lâu sẽ làm hồn phách người được khuyên đạo bất an, dễ nổi cáu.

---

## Owner module

`content` — SacredFormsService / DutyCycleGatekeeper
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người dâng Thăng Văn Khuyến Đạo cho người nhà
- `system` — track ngày liên tục, trigger cooldown, bật incense timer, block nút đốt

---

## Trigger

1. User log một ngày dâng đơn Thăng Văn Khuyến Đạo
2. User vào màn hình xem đơn đang đặt trên bàn thờ
3. User cố gắng đốt đơn loại `CONVINCING_FORM`

---

## Business Rules

### Part A: Chu Kỳ 30 Ngày + 7 Ngày Nghỉ

| Điều kiện | Hành động |
|---|---|
| Log Thăng Văn ≤ 30 ngày liên tục | ✅ ALLOWED |
| Log Thăng Văn = 30 ngày liên tiếp | ⚠️ Trigger auto-cooldown, khóa form |
| Hệ thống đang ở trạng thái COOLDOWN (7 ngày) | ❌ Form bị khóa — chỉ cho phép Tâm Kinh |
| Trong COOLDOWN: user cố log thêm Thăng Văn | ❌ BLOCKED — 400 BadRequest |
| Trong COOLDOWN: user niệm Tâm Kinh cho người đó | ✅ ALLOWED — không chặn |
| Sau 7 ngày Cooldown kết thúc | ✅ Form re-enable, chu kỳ mới bắt đầu |

### Part B: Cấm Đốt Đơn + Bộ Đếm Nhang

| Điều kiện | Hành động |
|---|---|
| User đặt đơn lên bàn thờ và thắp nhang | ✅ Khởi động đồng hồ đếm ngược 15–30 phút |
| Đồng hồ hết giờ | ⚠️ Notification khẩn: cất đơn đi ngay |
| User cố gắng đốt đơn `CONVINCING_FORM` | ❌ BLOCKED — 400 BadRequest |
| Đơn ở trên bàn thờ quá giờ nhang tàn | ⚠️ Push notification nhắc cất đơn |

---

## Input Contract

```typescript
interface LogConvincingFormSessionDto {
  formType:    'CONVINCING_FORM'
  recipientId: string   // người được khuyên đạo
  sessionDate: string   // ISO date
}

interface ConvincingFormSession {
  userId:           string
  recipientId:      string
  consecutiveDays:  number
  status:           'ACTIVE' | 'COOLDOWN'
  cooldownStartAt?: Date
  cooldownEndsAt?:  Date
}
```

---

## Write Path

```
POST /api/content/sacred-forms/convincing/log-session

1. Load ConvincingFormSession for (userId, recipientId)
2. If session.status == 'COOLDOWN':
   → throw 400 { error: 'convincing_form_cooldown_active',
                 cooldownEndsAt: session.cooldownEndsAt }
3. Increment consecutiveDays
4. If consecutiveDays >= 30:
   → Update status = 'COOLDOWN'
   → Set cooldownStartAt = now(), cooldownEndsAt = now() + 7 days
   → Emit push notification: cooldown activated

--- Cron job (hàng ngày) ---
1. Find sessions where status = 'COOLDOWN' AND cooldownEndsAt <= now()
2. Update status = 'ACTIVE', consecutiveDays = 0
3. Audit: form.thang_van.cooldown_ended

--- Burn endpoint ---
POST /api/content/sacred-forms/burn
1. If formType == 'CONVINCING_FORM':
   → throw 400 { error: 'convincing_form_burn_forbidden' }
```

---

## FE Behavior

### Màn hình trong giai đoạn COOLDOWN:

```
┌────────────────────────────────────────────────────────┐
│ 🛑 Đơn Khuyến Đạo — Đang Nghỉ Ngơi                     │
│────────────────────────────────────────────────────────│
│ Bạn đã dâng đơn liên tục 30 ngày.                      │
│ Hệ thống tự động kích hoạt chu kỳ nghỉ 7 ngày để       │
│ bảo vệ công đức của bạn.                               │
│                                                        │
│ Mở lại sau: ⏱ 05 ngày 14 giờ 23 phút                  │
│                                                        │
│ Trong thời gian này, bạn CHỈ ĐƯỢC PHÉP:                │
│  ✅ Niệm Tâm Kinh cho [Tên người nhà]                  │
│  ❌ Không được dâng Thăng Văn Khuyến Đạo               │
│                                                        │
│          [Niệm Tâm Kinh Cho Họ Ngay]                   │
└────────────────────────────────────────────────────────┘
```

### Incense Timer khi đặt đơn lên bàn thờ:

```
┌────────────────────────────────────────────────────────┐
│ 🕯️  Đơn Đang Trên Bàn Thờ — Hẹn Giờ Cất Đơn           │
│────────────────────────────────────────────────────────│
│ Hãy đặt đơn gần lư hương và thắp nhang.                │
│ Khi nhang tàn (≈15–30 phút), HÃY CẤT ĐƠN NGAY.        │
│                                                        │
│           ⏳  Còn lại: 17:43                           │
│                                                        │
│ TUYỆT ĐỐI KHÔNG ĐỂ ĐƠN Ở LẠI TRÊN BÀN THỜ            │
│ sau khi nhang tàn — hồn phách người nhà sẽ bất an.    │
└────────────────────────────────────────────────────────┘
```

### Khi user cố đốt đơn:

```
┌────────────────────────────────────────────────────────┐
│ ❌ Không Thể Đốt Đơn Khuyến Đạo                         │
│────────────────────────────────────────────────────────│
│ TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỐT Thăng Văn Khuyến Đạo.        │
│                                                        │
│ Đơn này được đặt lên bàn thờ trong thời gian nhang     │
│ cháy, sau đó cất đi — không bao giờ đốt.               │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model ConvincingFormSession {
  id               String   @id @default(cuid())
  userId           String
  recipientId      String
  consecutiveDays  Int      @default(0)
  status           String   @default("ACTIVE")  // ACTIVE | COOLDOWN
  cooldownStartAt  DateTime?
  cooldownEndsAt   DateTime?
  updatedAt        DateTime @updatedAt
  @@unique([userId, recipientId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `form.thang_van.cycle_start` | Người dùng log Thăng Văn lần đầu |
| `form.thang_van.day_30_reached` | Đạt 30 ngày liên tục |
| `form.thang_van.cooldown_activated` | Khóa 7 ngày |
| `form.thang_van.cooldown_ended` | Mở khóa trở lại |
| `form.thang_van.burn_attempt_blocked` | Cố đốt đơn |
| `form.thang_van.incense_timer_started` | Khởi động đồng hồ |
| `form.thang_van.incense_timer_expired` | Hết giờ — cần cất đơn |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Đang trong COOLDOWN mà cố log thêm | `convincing_form_cooldown_active` | 400 |
| Cố đốt đơn Khuyến Đạo | `convincing_form_burn_forbidden` | 400 |

---

## Notes for AI/codegen

- `consecutiveDays` reset về 0 sau cooldown — mỗi chu kỳ mới bắt đầu lại từ đầu
- Incense timer duration: `15–30` phút = config constant `CONVINCING_FORM_INCENSE_DURATION_MINUTES` (default 25)
- Timer là client-side countdown — không cần server round-trip mỗi giây
- `CONVINCING_FORM_BURN_FORBIDDEN` error phải có HTTP 400, không 403 (đây là business rule, không phải auth)
- Trong COOLDOWN UI, nút [Niệm Tâm Kinh Cho Họ Ngay] deep-link trực tiếp vào E-Reader với Tâm Kinh preloaded

---

## Related

- [convincing-family-form-incense-timer.md](./convincing-family-form-incense-timer.md) — chi tiết về incense timer mechanics
- [name-change-temporal-burn-lock.md](./name-change-temporal-burn-lock.md) — burn rules cho đơn Đổi Tên