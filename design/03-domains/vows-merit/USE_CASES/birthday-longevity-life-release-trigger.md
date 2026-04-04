# Kích Hoạt Phóng Sinh Cầu Trường Thọ Ngày Sinh Nhật — Birthday Longevity Life Release Trigger

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngày sinh nhật là thời điểm hiệu nghiệm nhất trong năm để phóng sinh cầu trường thọ. Hệ thống tự động nhắc nhở **7 ngày trước sinh nhật** để user lên kế hoạch phóng sinh đúng dịp.

---

## Owner module

`vows-merit` — LifeLiberationService / BirthdayTriggerScheduler
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — có sinh nhật được lưu trong profile
- `system` — cron job kiểm tra hàng ngày, gửi notification

---

## Trigger

Cron chạy 9:00 AM hàng ngày → kiểm tra user nào có `birthday - 7 days = today`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User có ngày sinh trong profile | ✅ Lưu vào birthday index |
| 7 ngày trước sinh nhật | ✅ Gửi push notification lúc 9 AM |
| User mở notification | ✅ Điều hướng đến Life Liberation section |
| Form phóng sinh hiển thị | ✅ Pre-fill tên user là beneficiary chính |
| User hoàn thành lên kế hoạch | ✅ Log birthday life release intent |

---

## Input Contract

```typescript
interface BirthdayLifeReleaseNotification {
  userId: string
  birthdayDate: Date       // Từ identity profile
  notificationDate: Date   // birthday - 7 days
  prefillBeneficiary: string // Tên user
}
```

---

## Write Path

```
CRON: daily 09:00 AM
1. SELECT users WHERE date_trunc('day', birthday) = today + 7 days
2. For each user:
   → Create notification: type=BIRTHDAY_LIFE_RELEASE_REMINDER
   → Dispatch push job with deepLink = /life-liberation?source=birthday
3. On click:
   → Navigate to life liberation flow
   → Pre-fill beneficiaryName = user.displayName
   → Pre-fill intent = LONGEVITY_BLESSING
```

---

## FE Behavior

```
Push Notification:
🎂 Sắp đến sinh nhật của bạn

"Theo PMTL, đây là thời điểm hiệu nghiệm nhất
trong năm để phóng sinh cầu trường thọ.
Hãy lên kế hoạch ngay!"

[Xem Chi Tiết Phóng Sinh]

---

Sau khi click:
Form phóng sinh pre-filled:
Người thụ hưởng: [Tên User]  ← readonly, không sửa được
Mục đích: Phóng sinh cầu trường thọ nhân ngày sinh nhật
```

---

## Schema Notes

```prisma
// Không cần model mới — thêm field vào notification:
model Notification {
  // ... existing fields ...
  birthdayReminderYear Int? // Năm đã gửi reminder, tránh duplicate
  // Migration: ALTER TABLE "Notification" ADD COLUMN "birthdayReminderYear" INT
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `birthday.reminder_sent` | Notification dispatched 7 days trước sinh nhật |
| `life_liberation.birthday_triggered` | User mở form từ birthday notification |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| User không có birthday trong profile | `birthday_not_set` | 422 |

---

## Notes for AI/codegen

- Cron phải dedup: kiểm tra `birthdayReminderYear = currentYear` trước khi gửi để tránh gửi 2 lần trong cùng năm.
- Nếu user chỉnh sửa birthday sau khi đã gửi reminder → không gửi lại cùng năm.

---

## Related

- [log-life-release.md](./log-life-release.md) — logging flow sau khi phóng sinh
- [proxy-name-card-generator.md](./proxy-name-card-generator.md) — khi phóng sinh thay cho người khác
