# Đồng Hồ Đếm Ngược Đơn Khuyến Đạo — Convincing Family Form Incense Timer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đơn Khuyến Đạo Người Nhà (`NEVER_BURN`) có một ràng buộc thời gian nguy hiểm thường bị bỏ qua:
**Sau khi đọc xong / khi hương tàn, phải gấp lại và cất ngay**. Nếu để quên trên bàn thờ, sẽ khiến người nhà nổi cơn thịnh nộ, mất kiểm soát và hồn phách bị thất tán.

Hệ thống phải tự động chạy **Countdown Timer** khi user bắt đầu làm lễ đọc đơn, và bắn **Critical Alert** khi timer về 0.

---

## Owner module

`content` (Spiritual Forms flow) + `vows-merit` (AltarIncenseSession)
Notification dispatch qua `notification` module

---

## Actors

- `member` — đang làm lễ đọc Đơn Khuyến Đạo
- `system` — chạy countdown, bắn critical alert

---

## Trigger

User bấm **[Bắt đầu làm lễ đọc Đơn Khuyến Đạo]** trong Spiritual Forms flow.

---

## Preconditions

- User đã tải PDF Đơn Khuyến Đạo (hoặc đang xem on-screen).
- `burnable === false` đã được xác nhận (form type = FAMILY_PERSUASION).
- User đã có AltarIncenseSession đang `BURNING` **HOẶC** user khai báo thời gian hương ước tính.

---

## Session Lifecycle

```
IDLE
  │
  ├─[User bấm Bắt đầu làm lễ]
  ▼
RITUAL_ACTIVE (countdown chạy)
  │
  ├─[Timer về 00:00] ──────────────────────▶ ALERT_FIRED
  │                                              │
  ├─[User bấm Đã cất đơn]                       ├─[User confirm đã cất]
  ▼                                              ▼
COMPLETED                                    COMPLETED
```

---

## Input Contract

```
ConvincingFamilyRitualStartDto {
  spiritualFormId:      string    // ID của Đơn Khuyến Đạo record
  incenseDurationMinutes: number  // thời gian hương ước tính: [15, 20, 30, 45, 60, 90]
}
```

---

## Write Path

```
POST /api/content/spiritual-forms/:id/ritual-start
────────────────────────────────────────────────────
1. Validate form.burnRule === "NEVER_BURN" (Đơn Khuyến Đạo).
   - Nếu form khác → throw 400 { error: "wrong_form_type" }.
2. Validate incenseDurationMinutes ∈ [10, 120].
3. Tạo ConvincingFamilyRitualSession:
   {
     userId,
     formId:           spiritualFormId,
     startedAt:        now(),
     durationMinutes:  incenseDurationMinutes,
     alertAt:          now() + incenseDurationMinutes * 60s,
     status:           "ACTIVE"
   }
4. Enqueue ScheduledNotificationJob tại alertAt:
   {
     type:    "CONVINCING_FAMILY_FORM_TIMEOUT",
     userId,
     title:   "⚠️ Hương đã tàn — LẬP TỨC cất đơn!",
     body:    "Hương đã tàn! Lập tức lấy Đơn Khuyến Đạo ra khỏi bàn thờ và cất đi. Để quên trên bàn thờ sẽ làm người nhà mất kiểm soát và hồn phách bị thất tán!",
     priority: "CRITICAL",
     deepLink: "/don-tu/khuyen-dao/alert"
   }
5. Return { sessionId, alertAt, countdownSeconds: incenseDurationMinutes * 60 }.
```

```
POST /api/content/spiritual-forms/ritual-sessions/:id/complete
───────────────────────────────────────────────────────────────
1. Validate session owned by actor, status = ACTIVE | ALERT_FIRED.
2. Set status = COMPLETED, completedAt = now().
3. Cancel pending notification job nếu chưa fire.
4. Audit: spiritual-form.convincing-family.ritual.completed.
```

---

## FE Behavior

### Màn hình Làm Lễ (Ritual Active)

```
┌──────────────────────────────────────────────────────────┐
│  Đơn Khuyến Đạo — Đang làm lễ                          │
│                                                          │
│  ⏱  Thời gian còn lại:                                  │
│                                                          │
│            38 : 42                                       │
│         (phút : giây)                                    │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  📋 Nhắc nhở:                                           │
│  • Đọc đơn 1 lần trước Bồ Tát                           │
│  • GẤP LẠI và CẤT ĐI khi hương tàn                     │
│  • TUYỆT ĐỐI KHÔNG ĐỂ QUÊN trên bàn thờ               │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  [Đã cất đơn — Hoàn thành]                             │
└──────────────────────────────────────────────────────────┘
```

### Khi Timer về 00:00 — Critical Alert

```
┌──────────────────────────────────────────────────────────┐
│  🚨  HƯƠNG ĐÃ TÀN — HÀNH ĐỘNG NGAY!                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  LẬP TỨC lấy Đơn Khuyến Đạo ra khỏi bàn thờ           │
│  và CẤT GIỮ CẨN THẬN.                                  │
│                                                          │
│  Để quên trên bàn thờ sẽ khiến người nhà               │
│  nổi cơn thịnh nộ, mất kiểm soát và hồn               │
│  phách bị thất tán!                                     │
│                                                          │
│  [Đã cất đơn — Xác nhận]                               │
│  (Không thể dismiss bằng cách nhấn ra ngoài)            │
└──────────────────────────────────────────────────────────┘
```

- Alert modal **full-screen**, không thể dismiss bằng back button hay tap outside.
- Điện thoại **rung liên tục** (vibration pattern) cho đến khi user bấm [Đã cất đơn].
- Nếu app ở background: push notification với `priority: HIGH` + sound.
- Alert màu đỏ toàn màn hình (không phải bottom sheet).

---

## Schema Notes

```prisma
model ConvincingFamilyRitualSession {
  id                 String    @id @default(cuid())
  userId             String
  formId             String    // FK to Download (FAMILY_PERSUASION)
  startedAt          DateTime
  durationMinutes    Int
  alertAt            DateTime
  alertFiredAt       DateTime?
  completedAt        DateTime?
  status             RitualSessionStatus

  user               User      @relation(fields: [userId], references: [id])
}

enum RitualSessionStatus {
  ACTIVE
  ALERT_FIRED
  COMPLETED
  ABANDONED     // session > 3 giờ không complete
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `spiritual-form.convincing-family.ritual.started` | User bắt đầu làm lễ |
| `spiritual-form.convincing-family.alert.fired` | Timer hết, critical alert bắn |
| `spiritual-form.convincing-family.ritual.completed` | User xác nhận đã cất đơn |
| `spiritual-form.convincing-family.ritual.abandoned` | Session quá 3 giờ không complete |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Form type không phải FAMILY_PERSUASION | `wrong_form_type` | 400 |
| `incenseDurationMinutes` ngoài [10, 120] | `invalid_body` | 400 |
| Session đang chạy khác | `conflict` | 409 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- FE countdown timer nên dùng `useIncenseTimer()` custom hook — nhận `{ durationSeconds, onExpire }`.
- Backend là source of truth cho `alertAt` — FE chỉ dùng countdown để UX, không tự tính logic nghiệp vụ.
- Nếu user close app trong lúc ACTIVE, session vẫn tồn tại. Khi mở lại app, check session ACTIVE + alertAt < now() → auto trigger alert locally.
- Job runner phải retry nếu push notification fail (user tắt notification) — fallback sang in-app persistent banner.

---

## Related

- [spiritual-applications.md](./spiritual-applications.md) — Catalog đơn từ và burn rules
- [schedule-altar-lamp-reminder.md](../../vows-merit/USE_CASES/schedule-altar-lamp-reminder.md) — Lamp-incense sync (tương tự pattern)
- [name-change-deceased-exemption.md](./name-change-deceased-exemption.md) — Rule cho Đơn Đổi Tên
