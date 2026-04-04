# Chắn Che Khi Chia Sẻ Kinh Nghiệm — Testimonial Sharing Shield

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Qui tắc chứng thực lời chia sẻ tại Pháp hội
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi member đăng ký chia sẻ kinh nghiệm tu hành (testimony/Testimonial) tại Pháp hội, hệ thống **tự động chèn hai lời khấn bảo vệ bắt buộc** trước và sau khi thành viên diễn giải:

1. **Lời mở đầu (Opening Prayer):** Cảm tạ Bồ Tát Quán Thế Âm, Sư Phụ, và xin phước lành.
2. **Lời kết thúc (Closing Prayer):** Xin lỗi cho những sai lầm hay sai lệch, gánh chịu nghiệp chướng cá nhân, không để Sư Phụ gánh.

Hai lời khấn này **không thể bỏ qua hoặc xóa** — user phải recite hoàn tất, hệ thống xác nhận, rồi mới có thể kết thúc phiên chia sẻ.

---

## Owner module

`engagement` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khởi động quá trình đăng ký chia sẻ kinh nghiệm
- `system` — chèn lời khấn bảo vệ, theo dõi quá trình recitation

---

## Trigger

User POST `/api/engagement/testimonials/register-speaker` với intent đăng ký thành speaker tại Pháp hội.

---

## Preconditions

- Có session hợp lệ và member đã verify email.
- Event phải tồn tại và đang trong status `OPEN_FOR_REGISTRATION` hoặc `SPEAKER_FINAL_CALL`.
- Member chưa đăng ký làm speaker tại event này trước đó.
- Member đã hoàn thành profile và có `displayName`.

---

## Input contract

```
RegisterTestimonyDto {
  speakerId:          string    // userId hoặc publicId của member đăng ký
  eventId:            string    // publicId của event/Pháp hội
  testimonialContent: string    // nội dung kinh nghiệm từ user (max 2000 chars)
}
```

---

## Read set

- session + actor role
- `User` record của speaker (verify exist, status not banned)
- `Event` record (verify exist, status = OPEN_FOR_REGISTRATION hoặc SPEAKER_FINAL_CALL)
- Danh sách speaker hiện tại của event (kiểm tra duplicate)

---

## Write path — Testimony Registration with Prayer Injection

### Step 1: Input Validation

1. Load `User` theo `speakerId`, verify member tồn tại và không bị ban.
2. Load `Event` theo `eventId`, verify status cho phép đăng ký speaker.
3. Verify `testimonialContent` không trống và < 2000 characters.
4. Verify member chưa là speaker của event này trước đó.
5. Nếu validation fail → trả về `400` với error code `invalid_registration_input` hoặc `duplicate_speaker_registration`.

### Step 2: Prayer Injection (Automatic)

6. Tạo **opening prayer template** — **bắt buộc, không thể xóa**:
   ```
   Xin cảm tạ Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
   cảm tạ Sư Phụ [Sư Phụ's name từ config],
   cảm tạ Hộ Pháp [Hộ Pháp's name từ config],
   cảm tạ tất cả các vị Bồ Tát đã chứng minh quá trình tu hành của con.
   Hôm nay con xin chia sẻ kinh nghiệm tu hành để giúp các anh chị em Phật tử,
   xin các Bồ Tát từ bi che chở cho lời chia sẻ của con đạt được công đức.
   Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát.
   ```

7. Tạo **closing prayer template** — **bắt buộc, không thể bỏ qua**:
   ```
   Nếu có bất kỳ lời nào không đúng lý không đúng pháp trong lúc chia sẻ,
   xin các Bồ Tát, Hộ Pháp [Hộ Pháp's name] và Sư Phụ [Sư Phụ's name] tha lỗi cho con.
   Nghiệp chướng của con, con tự gánh, không để Sư Phụ gánh.
   Con xin toàn bộ công đức chia sẻ này được chứng minh bởi các Bồ Tát,
   để giúp các anh chị em Phật tử tiến bộ trên con đường tu hành Phật pháp.
   Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát.
   ```

8. Create `TestimonialSession` record:
   ```
   {
     sessionId:                  uuid,
     speakerId:                  (from input),
     eventId:                    (from input),
     openingPrayer:              (injected text),
     testimonialContent:         (from input),
     closingPrayer:              (injected text),
     openingPrayerRecitedAt:     null,    // timestamp khi speaker finish reciting
     closingPrayerRecitedAt:     null,    // timestamp khi speaker finish reciting
     status:                     "AWAITING_OPENING_PRAYER",
     createdAt:                  now(),
     updatedAt:                  now()
   }
   ```

### Step 3: Teleprompter Mode Display

9. Return response với full session detail (include injected prayers):
   ```
   {
     sessionId: "...",
     status: "AWAITING_OPENING_PRAYER",
     openingPrayer: "...",
     testimonialContent: "...",
     closingPrayer: "...",
     ui: {
       teleprompterMode: true,
       showPrayerInMutedColor: true,
       fontSizeReducedBy: "20%"
     }
   }
   ```
   Các lời khấn được hiển thị **màu xám mờ (muted)** và **font nhỏ hơn 20%** để phân biệt với content chính.

10. Frontend render **Teleprompter Component**:
    - Display opening prayer (muted color, small font).
    - Display testimonial content (normal weight).
    - Display closing prayer (muted color, small font).
    - **Nút [Bỏ qua]** bị **ẩn hoàn toàn** — không thể skip.
    - Nút [Đã đọc xong] kích hoạt sau khi speaker click "Mark as Recited".

### Step 4: Opening Prayer Confirmation

11. Frontend track khi user click "[Đã đọc lời mở đầu]":
    - POST `/api/engagement/testimonials/{sessionId}/confirm-opening-prayer`
    - Update `TestimonialSession.openingPrayerRecitedAt = now()`
    - Transition status → `"IN_TESTIMONY_DELIVERY"`
    - Audit `engagement.testimony.opening-prayer-injected`.

### Step 5: Testimony Delivery (Untouched)

12. Speaker đọc lời chia sẻ kinh nghiệm (testimonialContent không thể chỉnh sửa).
    - Frontend may render progress indicator (timer optional).

### Step 6: Closing Prayer Confirmation (MANDATORY)

13. Khi speaker ready kết thúc:
    - POST `/api/engagement/testimonials/{sessionId}/confirm-closing-prayer`
    - Verify `openingPrayerRecitedAt` đã được set.
    - Update `TestimonialSession.closingPrayerRecitedAt = now()`
    - Transition status → `"COMPLETED"`
    - Audit `engagement.testimony.closing-prayer-injected`.

14. **Nếu user bấm [Kết thúc] mà chưa confirm closing prayer**:
    - Trả về `400 closing_prayer_required` với message:
      *"Bạn chưa đọc lời kết thúc khấn cầu bảo vệ. Vui lòng đọc lời kết thúc trước khi kết thúc buổi chia sẻ."*
    - Không cho phép finalize session.

### Step 7: Session Completion

15. Khi cả hai lời khấn đã confirm:
    - Update `status = "COMPLETED"`
    - Record `completedAt = now()`
    - Audit `engagement.testimony.completed`.
    - Return success response với xác nhận + option điều chỉnh speaker tại event.

---

## Teleprompter UI Spec

- **Opening Prayer block:**
  - Color: `#999999` (muted gray)
  - Font size: `-20%` từ body text
  - Opacity: `0.7`
  - Label: "Lời khấn mở đầu (bắt buộc)" — không dismissible

- **Testimonial Content block:**
  - Color: `#333333` (normal)
  - Font size: `1em`
  - Opacity: `1.0`
  - Label: "Lời chia sẻ kinh nghiệm của bạn"
  - Read-only (không edit)

- **Closing Prayer block:**
  - Giống opening prayer spec.
  - Label: "Lời khấn kết thúc (bắt buộc)" — không dismissible

- **Action buttons:**
  - "[Đã đọc xong lời mở đầu]" — enable ngay lập tức
  - "[Đã đọc xong lời kết thúc]" — enable sau khi opening prayer confirm
  - "Nút [Bỏ qua]" — **KHÔNG TỒN TẠI**

---

## Async side-effects

- Outbox event `engagement.testimony.completed` → notify event organizers + `vows-merit` log contribution.
- Optional Phase 2: Speaker participation metrics tracked (thống kê chia sẻ).

---

## Success result

- `TestimonialSession` status = `"COMPLETED"` với cả `openingPrayerRecitedAt` và `closingPrayerRecitedAt` đã set.
- Member nhận xác nhận "Chia sẻ kinh nghiệm hoàn tất. Cảm tạ bạn đã giúp các anh chị em tu hành."
- Session được ghi vào audit trail.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| User chưa login | `unauthorized` | 401 | — |
| Event không tồn tại | `event_not_found` | 404 | — |
| Event không accept speaker registration | `event_registration_closed` | 403 | Chờ sự kiện tiếp theo |
| User đã là speaker của event này | `duplicate_speaker_registration` | 400 | Chọn event khác |
| testimonialContent trống hoặc > 2000 chars | `invalid_registration_input` | 400 | Điều chỉnh nội dung |
| Cố gắng finalize mà chưa recite closing prayer | `closing_prayer_required` | 400 | Đọc lời kết thúc |
| Session không tồn tại | `session_not_found` | 404 | — |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `engagement.testimony.session-created` | speakerId | Đăng ký speaker thành công |
| `engagement.testimony.opening-prayer-injected` | speakerId | Confirm opening prayer recited |
| `engagement.testimony.closing-prayer-injected` | speakerId | Confirm closing prayer recited |
| `engagement.testimony.completed` | speakerId | Session finalized |

---

## Rate-limit requirement

- Max 5 testimony registrations per member per event — prevent spam.
- No additional rate limit on prayer confirmation — once registered, user must complete.

---

## Outbox event

- Event type: `engagement.testimony.completed`
- Subscriber: event organizers, `vows-merit` (merit logging)
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu session bị kẹt ở `"IN_TESTIMONY_DELIVERY"` quá 4 giờ → admin có thể force-complete hoặc reset.
- Nếu app crash sau khi opening prayer confirm → session state restore từ DB, user tiếp tục.

---

## Notes for AI/codegen

- **Opening + Closing prayers là mandatory injection** — không thể xóa, skip, hoặc edit bởi user. Đây là qui tắc pháp môn cứng.
- Teleprompter mode **phải che dấu prayers nhằm thị giác** (muted color + smaller font) — nhưng chúng vẫn **phải được recite hoàn toàn**.
- `TestimonialSession` tách biệt với `Event.speakers` — session là tracking live activity, event speakers list là confirmed list.
- Prayer text templates nên được lưu trong config/Content CMS, không hardcode trong service.
- `speakerId`, `eventId` phải validate existency trước khi tạo session.
- Audit trail phải record cả `openingPrayerRecitedAt` và `closingPrayerRecitedAt` timestamps.
- Frontend không render "skip" button, "edit prayer" option, hoặc "remove prayer" context menu — hệ thống bảo vệ prayers khỏi user tampering.
