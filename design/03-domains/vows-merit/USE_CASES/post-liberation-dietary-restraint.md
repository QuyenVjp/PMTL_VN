# Kiêng Khem Sau Phóng Sinh — Post-Liberation Dietary Restraint

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngày phóng sinh, năng lượng công đức đang tích tụ. Ăn mặn (muối, đậm chất) hoặc ăn đúng loài vừa thả sẽ làm mất toàn bộ công đức và có thể bị báo thù từ vong linh. Hệ thống gửi nhắc nhở lúc 11:30 và 17:30 ngày hôm đó, bao gồm tên loài vừa phóng sinh.

---

## Owner module

`vows-merit` — LifeLiberationService / DietaryRestraint
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — nhận nhắc nhở kiêng khem
- `system` — schedule reminder notifications sau khi release event hoàn thành

---

## Trigger

Khi `LifeReleaseEvent` được persist thành công với status `COMPLETED`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Release event completed today | ✅ Schedule 2 reminders |
| 11:30 AM same day | ✅ Send morning dietary reminder |
| 17:30 PM same day | ✅ Send evening dietary reminder |
| Reminder content | ✅ Include species name + dietary rule |
| Release after 17:30 | ✅ Skip morning, only send evening |
| Release after 22:00 | ✅ Skip both (too late, will send next morning) |

---

## Input Contract

```typescript
interface DietaryRestraintSchedule {
  userId: string
  releaseEventId: string
  releaseDate: Date
  speciesReleased: string[]    // e.g. ['cá chép', 'tôm']
  morningReminderTime: '11:30'
  eveningReminderTime: '17:30'
}

// Auto-computed from release event
function scheduleDietaryReminders(event: LifeReleaseEvent): DietaryRestraintSchedule {
  const speciesName = event.creatureType
  const releaseDate = event.releasedAt
  return { ...schedule, speciesReleased: [speciesName] }
}
```

---

## Write Path

```
// After POST /api/vows-merit/life-release succeeds:
1. Schedule notification job for 11:30 today (if before 11:30)
2. Schedule notification job for 17:30 today (if before 17:30)
3. Jobs include: { userId, speciesName, releaseDate }
4. At trigger time: send push notification
5. Audit: release.dietary_reminder_sent
```

---

## Notification Content

```
🙏 Công Đức Phóng Sinh Đang Tích Tụ

Hôm nay bạn đã thực hiện Đại Công Đức
Phóng Sinh [100 con cá chép].

🚨 TUYỆT ĐỐI KHÔNG:

❌ Ăn mặn hoặc đậm chất (muối, miso...)
❌ Ăn bất kỳ loài thủy hải sản nào
❌ Đặc biệt: TUYỆT ĐỐI KHÔNG ăn [cá chép]

Nếu vi phạm:
• Mất toàn bộ công đức phóng sinh
• Bị báo thù từ vong linh
• Sức khỏe suy đồi

Hãy ăn chay thuần túy hoặc ăn nhạt
để bảo vệ từ trường hôm nay.

[Xác Nhận Đã Hiểu]
```

---

## Audit

| Action | Trigger |
|---|---|
| `release.dietary_restraint_scheduled` | Release completed |
| `release.dietary_reminder_morning_sent` | 11:30 AM |
| `release.dietary_reminder_evening_sent` | 17:30 PM |
| `release.dietary_commitment_confirmed` | User acknowledges notification |

---

## Notes for AI/codegen

- Species name phải dynamic trong notification body — không generic.
- Không gửi reminder nếu user đã phóng sinh sau 22:00 (hôm sau mới gửi).
- Scheduler cần handle timezone: dùng `Asia/Ho_Chi_Minh`.

---

## Related

- [log-life-release.md](./log-life-release.md) — base logging flow
- [casualty-debt-calculator.md](./casualty-debt-calculator.md) — debt from deaths
- [anti-financial-attachment-regex.md](./anti-financial-attachment-regex.md) — notes filter
