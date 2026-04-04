# Đồng Hồ Đếm Ngược Đường Dây Đồ Đằng Sydney — Totem Hotline DST Countdown

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Thông tin liên hệ chính thức
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đường dây nóng xem Đồ Đằng (Totem Reading) tại Sydney chỉ mở **3 buổi/tuần** trong khung giờ rất hẹp. Đồng tu Việt Nam thường gọi sai giờ vì không tính đúng **Daylight Saving Time (DST)** của Úc — thay đổi mỗi năm 2 lần, làm lệch giờ từ 3 → 4 tiếng hoặc ngược lại.

Widget **TotemHotlineCountdown** hiển thị thời gian còn lại đến buổi tiếp theo, tự động xử lý DST, và cung cấp nút gọi trực tiếp.

---

## Owner module

`contact`
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Thông Tin Đường Dây

| Trường | Giá trị |
|---|---|
| Số điện thoại | `+61 2 9698 8866` |
| Múi giờ | `Australia/Sydney` (AEDT/AEST tự động) |
| Ngày mở | Thứ 3, Thứ 4, Thứ 7 |
| Giờ mở (Sydney local) | 17:30 — 18:00 |
| Thời lượng | 30 phút/buổi |

---

## DST Rules (Australia/Sydney)

| Giai đoạn | Tên | UTC offset | Lệch so với VN (UTC+7) |
|---|---|---|---|
| Tháng 10 — Tháng 4 (mùa Hè) | AEDT | UTC+11 | **+4 giờ** |
| Tháng 4 — Tháng 10 (mùa Đông) | AEST | UTC+10 | **+3 giờ** |

> Thư viện bắt buộc: **`date-fns-tz`** — dùng `toZonedTime()` và `fromZonedTime()` với timezone `"Australia/Sydney"`. **Không tự tính offset thủ công.**

---

## Countdown Logic

```
function getNextHotlineOpening(now: Date): {
  openAt: Date,
  closeAt: Date,
  isOpenNow: boolean
}

Steps:
1. Convert now → Sydney local time: zonedNow = toZonedTime(now, "Australia/Sydney")
2. Check if currently open:
   - zonedNow.dayOfWeek ∈ [TUESDAY=2, WEDNESDAY=3, SATURDAY=6]
   - zonedNow.time ∈ [17:30, 18:00)
   → isOpenNow = true
3. Nếu chưa mở: tìm opening slot tiếp theo:
   - Iterate qua các ngày TUESDAY, WEDNESDAY, SATURDAY tới
   - Tìm ngày gần nhất mà (ngày đó @ 17:30 Sydney) > zonedNow
4. Return openAt (UTC), closeAt = openAt + 30 minutes.
```

---

## API Endpoint

```
GET /api/contact/totem-hotline/next-opening
────────────────────────────────────────────
Response:
{
  phone:           "+61296988866",
  telLink:         "tel:+61296988866",
  isOpenNow:       boolean,
  openAt:          ISO8601 UTC string,
  closeAt:         ISO8601 UTC string,
  openAtSydney:    "Thứ 3, 17:30 AEDT" | "Thứ 3, 17:30 AEST",
  openAtVietnam:   "Thứ 3, 21:30" | "Thứ 3, 20:30",
  countdownSeconds: number,
  currentSydneyOffset: "+11:00" | "+10:00",
  currentSydneyTZ: "AEDT" | "AEST"
}
```

**No caching** — DST transitions happen mid-day. Always recompute from `Australia/Sydney` tz.

---

## FE Widget — TotemHotlineCountdown

### Trạng thái: Đang mở

```
┌──────────────────────────────────────────────────────────┐
│  🟢  ĐƯỜNG DÂY ĐỒ ĐẰNG ĐANG MỞ                         │
│                                                          │
│  Đóng sau:  00 : 23 : 41                               │
│             (giờ : phút : giây)                         │
│                                                          │
│  Giờ Sydney: 17:36 AEDT (UTC+11)                       │
│  Giờ VN tương ứng: 21:36                               │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📞  Gọi ngay: +61 2 9698 8866                   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Trạng thái: Chưa mở

```
┌──────────────────────────────────────────────────────────┐
│  📞  Đường Dây Đồ Đằng — Sydney                        │
│                                                          │
│  Mở tiếp theo:  Thứ 3, 17:30 AEDT                      │
│  Giờ Việt Nam:  Thứ 3, 21:30 (giờ mùa Hè Úc)         │
│                                                          │
│  Đếm ngược:  02 : 14 : 33                              │
│              (ngày : giờ : phút)                        │
│                                                          │
│  Lịch tuần này:                                         │
│  • Thứ 3  — 17:30-18:00 AEDT (21:30-22:00 VN)         │
│  • Thứ 4  — 17:30-18:00 AEDT (21:30-22:00 VN)         │
│  • Thứ 7  — 17:30-18:00 AEDT (21:30-22:00 VN)         │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  ℹ️  Úc hiện đang dùng giờ mùa Hè (AEDT = VN + 4h)   │
│                                                          │
│  [📞 Lưu số: +61 2 9698 8866]                          │
└──────────────────────────────────────────────────────────┘
```

### DST Note tự động

Widget tự cập nhật note DST:
- Oct–Apr: `"Úc đang dùng giờ mùa Hè (AEDT = UTC+11 = VN + 4 giờ)"`
- Apr–Oct: `"Úc đang dùng giờ mùa Đông (AEST = UTC+10 = VN + 3 giờ)"`

---

## Push Notification (Phase 2+)

Nếu user opt-in nhận nhắc đường dây Đồ Đằng:

```
Notification 30 phút trước mỗi buổi:
Title: "📞 Đường dây Đồ Đằng mở sau 30 phút"
Body:  "17:30 Sydney (21:30 VN). Chuẩn bị câu hỏi và gọi: +61 2 9698 8866"
```

---

## Notes for AI/codegen

- **Không hardcode offset** (+3 hay +4) — luôn dùng `date-fns-tz` với `"Australia/Sydney"` để tự động handle DST transitions.
- DST Australia bắt đầu Chủ nhật đầu tiên tháng 10 và kết thúc Chủ nhật đầu tiên tháng 4 — nhưng không nên tự tính, hãy để thư viện xử lý.
- `countdownSeconds` trong response nên là khoảng cách từ server `now()` đến `openAt` — FE dùng để render countdown real-time mà không cần poll liên tục.
- FE poll endpoint mỗi 60 giây để cập nhật trạng thái open/closed khi đến giờ mở.
- Nút gọi dùng `<a href="tel:+61296988866">` — không có space trong số điện thoại trong tel: link.

---

## Schema Notes

Không cần model mới. Widget là stateless — chỉ cần endpoint compute dựa trên current time. Lịch mở cố định (Tue/Wed/Sat 17:30–18:00 Sydney) có thể lưu trong `SystemConfig` để admin điều chỉnh nếu giờ thay đổi.

```
Key:     contact.totem_hotline_schedule
Type:    JSON
Default: {
  "phone": "+61296988866",
  "timezone": "Australia/Sydney",
  "openDays": [2, 3, 6],
  "openHour": 17,
  "openMinute": 30,
  "durationMinutes": 30
}
```

---

## Related

- [manage-volunteer-directory.md](./manage-volunteer-directory.md) — Contact directory
- [update-contact-info.md](./update-contact-info.md) — Contact info management
