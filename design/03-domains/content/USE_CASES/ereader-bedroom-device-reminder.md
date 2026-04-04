# Nhắc Nhở Lưu Trữ Thiết Bị Đọc Kinh Trong Phòng Ngủ — E-Reader Bedroom Device Reminder

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 21, 22)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Thiết bị điện tử chứa kinh thư là Pháp bảo kỹ thuật số. Nếu để trong phòng ngủ, **tuyệt đối không được để ở vị trí dưới chân giường (foot of the bed)**. Tốt nhất là để ở đầu giường và dùng một tấm vải đỏ sạch đậy lại để tôn trọng Pháp bảo. Khi user đóng app hoặc app vào background vào ban đêm (sau 21:00), hệ thống bắn push notification nhắc nhở.

---

## Owner module

`content` — E-Reader / DevicePlacementReminder
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang đọc kinh trên thiết bị và chuẩn bị đi ngủ
- `system` — lắng nghe AppState change + thời gian ban đêm, bắn push notification

---

## Trigger

Khi **đồng thời** xảy ra:
1. User đang ở trong module `content` / E-Reader (đang đọc kinh văn `isSacredText = true`)
2. App chuyển sang background (user nhấn Home hoặc tắt màn hình)
3. Thời gian hiện tại nằm trong khung **21:00 – 05:00** (theo timezone của user)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| App background + sacred text + 21:00–05:00 | ✅ Bắn push notification |
| App background + non-sacred content + 21:00–05:00 | ❌ Không bắn |
| App background + sacred text + 05:00–21:00 | ❌ Không bắn |
| User đã dismiss notification lần này | Không bắn lại trong cùng session |

---

## Notification Payload

```json
{
  "title": "Pháp Bảo Kỹ Thuật Số 📿",
  "body": "Nếu bạn để thiết bị trong phòng ngủ, hãy đặt ở ĐẦU GIƯỜNG — không để dưới chân giường. Tốt nhất hãy dùng một miếng vải đỏ sạch đậy thiết bị lại để tôn trọng Pháp bảo.",
  "data": {
    "type": "BEDROOM_DEVICE_REMINDER",
    "deepLink": "pmtl://content/ereader/placement-guide"
  }
}
```

---

## FE Behavior

### AppState Listener (React Native / Next.js PWA)

```typescript
// React Native
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'background') {
    const hour = new Date().getHours()  // user local time
    const isNighttime = hour >= 21 || hour < 5
    const isReadingSacredText = currentSutra?.isSacredText === true

    if (isNighttime && isReadingSacredText) {
      scheduleLocalNotification({
        delay: 30_000,   // 30 giây delay — chắc chắn user đã rời app
        title: "Pháp Bảo Kỹ Thuật Số 📿",
        body: "Nếu bạn để thiết bị trong phòng ngủ, hãy đặt ở ĐẦU GIƯỜNG — không để dưới chân giường. Tốt nhất hãy dùng một miếng vải đỏ sạch đậy thiết bị lại.",
      })
    }
  }
})
```

### In-App Banner (Web PWA fallback — khi không có push permission)

Nếu user chưa cấp push notification permission, hiển thị in-app banner khi user quay lại app sau khi đã background:

```
┌──────────────────────────────────────────────────────────┐
│  📿  Nhắc Nhở Pháp Bảo                                  │
│                                                          │
│  Nếu bạn để điện thoại trong phòng ngủ:               │
│  • Đặt ở ĐẦU GIƯỜNG, không để dưới chân giường.       │
│  • Tốt nhất dùng vải đỏ sạch đậy lại.                │
│                                                          │
│  [Đã hiểu]                                             │
└──────────────────────────────────────────────────────────┘
```

---

## Write Path

Không cần API — logic hoàn toàn client-side. Chỉ log nếu user mở deep link từ notification:

```
POST /api/content/device-placement/reminder-opened
────────────────────────────────────────────────────
Body: { sutraId?: string }
→ Audit: content.device-placement.reminder-opened
```

---

## Schema Notes

Không cần model mới — notification là stateless event. Analytics qua audit log.

---

## Audit

| Action | Trigger |
|---|---|
| `content.device-placement.reminder-sent` | Push notification scheduled (client-side log) |
| `content.device-placement.reminder-opened` | User tap vào notification |

---

## Notes for AI/codegen

- 30-second delay trước khi bắn notification — tránh bắn ngay khi user chỉ switch app tạm thời.
- Dùng `sessionStorage` flag `bedroom_reminded_today` để không bắn nhiều lần trong cùng đêm.
- Web PWA dùng `document.addEventListener('visibilitychange')` thay vì AppState.
- Không cần backend scheduling — local notification đủ cho Phase 1.
- `hour >= 21 || hour < 5` phải dùng user's **local timezone**, không phải UTC.

---

## Related

- [ereader-hand-hygiene-gate.md](./ereader-hand-hygiene-gate.md) — Pre-reading hygiene gate
- [ereader-anti-face-down.md](./ereader-anti-face-down.md) — Anti-face-down rule
- [ereader-memorization-mode-warning.md](./ereader-memorization-mode-warning.md) — Memorization mode warning
