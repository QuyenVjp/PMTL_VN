# Vùng Chết Âm Khí 2–5 Giờ Sáng — Yin-Time Deadzone (2–5 AM)

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Từ 2:00–4:59 AM là đỉnh điểm âm khí. **BẤT KỲ** hoạt động tụng niệm nào trong khung giờ này đều thu hút ngạ quỷ và đảo ngược công đức thành ác nghiệp. Hệ thống khóa **tất cả** bộ đếm tụng niệm và hiển thị cảnh báo khẩn cấp.

> **Khác với** `88-buddhas-overnight-deadzone.md`: file đó chỉ áp dụng cho Lễ Phật Đại Sám Hối Văn từ 10 PM–5 AM. File này áp dụng cho **TẤT CẢ** kinh văn từ 2–5 AM.

---

## Owner module

`calendar` — TimeGuardService / YinDeadzoneEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người dùng cố tụng niệm trong khung giờ cấm
- `system` — phát hiện giờ địa phương của user, khóa counter, hiển thị cảnh báo

---

## Trigger

Khi user mở bất kỳ counter tụng niệm, e-reader, hoặc NNN trong khung giờ 2:00–4:59 AM (theo múi giờ địa phương của user).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Giờ địa phương user = 02:00–04:59 | ✅ Kích hoạt deadzone |
| Deadzone active | ❌ Vô hiệu hóa TẤT CẢ counter tụng niệm |
| User cố ghi nhận tụng kinh | ❌ Block + hiển thị cảnh báo đỏ |
| E-Reader mở | 🔇 Mờ màn hình + hiển thị banner |
| NNN form mở | ❌ Disable submit, hiển thị thông báo |
| Giờ vượt qua 05:00 | ✅ Tự động mở khóa, resume bình thường |

---

## Input Contract

```typescript
// Server-side time guard — không có DTO user input
// Mọi API write liên quan tụng niệm phải gọi:
interface YinDeadzoneCheckResult {
  isInDeadzone: boolean
  blockUntil: ISO8601String  // 05:00 local time
  userTimezone: string
}
```

---

## Write Path

```
// Middleware thêm vào mọi recitation write endpoint:
function enforceYinDeadzone(userId: string, userTimezone: string): void {
  const localHour = getLocalHour(userTimezone)
  if (localHour >= 2 && localHour < 5) {
    throw new ForbiddenException({
      code: 'yin_time_deadzone_active',
      blockUntil: getNext5AM(userTimezone)
    })
  }
}

// Áp dụng cho:
POST /api/wisdom-qa/recitation/log
POST /api/engagement/little-house/sheets/*/complete
POST /api/engagement/little-house/burn
POST /api/content/ereader/progress
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 CẢNH BÁO TỐI CAO 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KHUNG GIỜ CẤM KỴ: 2:00 - 5:00 SÁNG

Tuyệt đối KHÔNG tụng niệm bất kỳ Kinh văn nào!

Lý do:
• Âm khí cực thịnh vào lúc này
• Niệm Kinh sẽ rước Ngạ quỷ, Lâm Tỷ Tật
• Công đức sẽ biến thành ác nghiệp

Hãy chờ đến 5:00 AM để tiếp tục.

╭─────────────────────────────────────╮
│ Thời gian còn lại: [45 phút]        │
╰─────────────────────────────────────╯

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

Không cần model mới — guard là stateless middleware. Có thể log incidents vào `SystemGuardEvent` nếu cần audit.

```prisma
// Optional audit only:
model SystemGuardEvent {
  id           String   @id @default(cuid())
  userId       String
  guardType    String   // 'YIN_DEADZONE'
  triggeredAt  DateTime @default(now())
  blockedAction String
  userTimezone String
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `deadzone.activated` | 02:00 AM theo giờ user |
| `deadzone.counter_disabled` | User trong 2–5 AM window |
| `deadzone.recitation_blocked` | User cố log |
| `deadzone.deactivated` | 05:00 AM |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Tụng niệm trong 2–5 AM | `yin_time_deadzone_active` | 403 |

---

## Notes for AI/codegen

- Dùng `dayjs.tz(userTimezone)` hoặc `date-fns-tz` — **không hardcode UTC offset**.
- User timezone lấy từ profile hoặc browser `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Deadzone check là middleware, không phải business logic trong service — tái dùng cho mọi recitation endpoint.

---

## Related

- [88-buddhas-overnight-deadzone.md](../../wisdom-qa/USE_CASES/88-buddhas-overnight-deadzone.md) — deadzone 10 PM–5 AM cho riêng Lễ Phật Đại Sám Hối
- [advanced-recitation-time-exceptions.md](../../content/USE_CASES/advanced-recitation-time-exceptions.md) — exceptions cho giờ tụng niệm
