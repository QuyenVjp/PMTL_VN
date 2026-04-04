# Nhắc Tắt Đèn Dầu Trước Khi Hương Tàn — Schedule Altar Lamp Reminder

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc dầu đèn
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hệ thống bắt đầu đếm ngược khi user khai báo **đã thắp hương** trước Phật đài.
Trước khi hương ước tính tàn ~5 phút, bắn push notification nhắc nhở:
*"Hương sắp tàn, hãy dùng nắp đậy tắt đèn dầu. Tuyệt đối không dùng miệng thổi."*

Quy tắc: đèn dầu không được cháy sau khi hương đã tàn hết (tránh thu hút vong linh).

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)
Notification dispatch thực tế qua `notification` module.

---

## Actors

- `member` — khai báo bắt đầu dâng hương
- `system` — lên lịch job và bắn notification

---

## Trigger

User bấm **[Bắt đầu dâng hương]** trong màn hình altar companion (AltarLog flow).

---

## Preconditions

- Có session hợp lệ.
- User đã cấp quyền push notification (`pushSubscription` tồn tại).
- User đã chọn loại hương hoặc thời gian ước tính.
- User không ở trong mode Tâm Hương (không có bàn thờ thật — loại này không cần đèn dầu thật).

---

## Input contract

```
{
  incenseType:      "STANDARD" | "SHORT" | "LONG" | "CUSTOM"
  customBurnMinutes?: number    // bắt buộc nếu incenseType = CUSTOM
  altarSessionNote?:  string
}
```

**Burn time lookup (hardcoded defaults — admin có thể cấu hình):**

| incenseType | Burn time mặc định | Cảnh báo lúc |
|---|---|---|
| `STANDARD` | 45 phút | 40 phút sau |
| `SHORT` | 20 phút | 15 phút sau |
| `LONG` | 90 phút | 85 phút sau |
| `CUSTOM` | `customBurnMinutes` | `customBurnMinutes - 5` phút |

---

## Read set

- session + actor role
- `PushSubscription` record của user
- `AltarLog` hiện có (để gắn session context)
- `IncenseBurnConfig` (CMS-managed burn time defaults)

---

## Write path

1. Validate input — Zod: `incenseType` required; nếu `CUSTOM` thì `customBurnMinutes` phải có và trong khoảng `[5, 240]`.
2. Xác định `alertDelayMinutes`:
   ```
   if incenseType === "CUSTOM":
     alertDelayMinutes = customBurnMinutes - 5
   else:
     alertDelayMinutes = lookup(incenseType).burnMinutes - 5
   ```
3. Tạo `AltarIncenseSession`:
   ```
   {
     userId, incenseType, startedAt: now(),
     estimatedBurnMinutes, alertScheduledAt: now() + alertDelayMinutes,
     status: "BURNING"
   }
   ```
4. Enqueue `ScheduledNotificationJob` với `scheduledAt = now() + alertDelayMinutes minutes`:
   ```
   {
     userId,
     sessionId: altarIncenseSession.id,
     title:   "Nhắc nhở Phật đài",
     body:    "Hương sắp tàn. Hãy dùng nắp đậy tắt đèn dầu. Tuyệt đối không dùng miệng thổi.",
     type:    "ALTAR_LAMP_REMINDER",
     deepLink: "/phat-nguyen/phat-dai"
   }
   ```
5. Return `{ sessionId, alertScheduledAt }`.

### When notification fires (system job)

6. Job runner kiểm tra `AltarIncenseSession.status`:
   - Nếu `BURNING`: dispatch push notification qua `notification` module.
   - Nếu `COMPLETED` hoặc `CANCELLED`: skip (user đã tắt thủ công).
7. Audit `altar.lamp-reminder.dispatched`.

### User extinguishes lamp early

8. User bấm **[Đã tắt đèn dầu]** → cập nhật `AltarIncenseSession.status = COMPLETED`, hủy job pending.
9. Audit `altar.lamp-reminder.cancelled-by-user`.

---

## Async side-effects

- `notification` module nhận job và thực hiện Web Push.
- **Phase 2+:** Nếu user không confirm tắt trong 15 phút sau khi notification bắn → escalate thành in-app persistent banner.

---

## Success result

- User nhận push notification trước khi hương tàn 5 phút.
- `AltarIncenseSession` record lưu lại lịch sử để admin theo dõi engagement.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| `customBurnMinutes` < 5 hoặc > 240 | `invalid_body` | 400 | Nhập lại |
| Không có `PushSubscription` | `precondition_failed` | 422 | Hiển thị hướng dẫn bật thông báo |
| Đang có session `BURNING` khác | `conflict` | 409 | Hỏi user có muốn hủy session cũ không |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `altar.incense-session.start` | actorUserId | User bấm [Bắt đầu dâng hương] |
| `altar.lamp-reminder.dispatched` | system | Job runner bắn notification |
| `altar.lamp-reminder.cancelled-by-user` | actorUserId | User bấm [Đã tắt đèn dầu] sớm |
| `altar.incense-session.expired` | system | Session quá 4 giờ không kết thúc |

---

## Rate-limit requirement

- Scope: per-account
- Limit: 10 sessions per day (đủ cho sáng + tối nhiều ngày liên tiếp)

---

## Outbox event

- Event type: `altar.incense-session.started`
- Subscriber: `notification` (scheduled job runner)
- Mode: sync-inline enqueue (Phase 1)

---

## Recovery path

- Nếu job runner crash trước khi fire: replay từ `AltarIncenseSession` records với `status = BURNING` và `alertScheduledAt < now()`.
- Recovery query: `SELECT * FROM AltarIncenseSession WHERE status = 'BURNING' AND alertScheduledAt < NOW()`.

---

## Notes for AI/codegen

- `AltarIncenseSession` là entity mới trong `vows-merit` domain. Không tái dùng `AltarLog` vì lifecycle khác nhau.
- Burn time defaults nên là config trong DB (`IncenseBurnConfig`) không phải constant trong code — admin cần chỉnh được.
- Notification body phải include câu "Tuyệt đối không dùng miệng thổi" — đây là quy tắc cứng từ pháp môn.
- Khi user đang ở `hasAltar = false` (Tâm Hương mode) → không render nút [Bắt đầu dâng hương] thật, không tạo session này.
- Job scheduling dùng `BullMQ` hoặc `@nestjs/schedule` delayed job — không dùng `setTimeout` trong-process.
