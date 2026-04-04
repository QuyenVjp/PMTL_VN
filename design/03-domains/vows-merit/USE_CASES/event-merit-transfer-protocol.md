# Giao Công Đức Từ Pháp Hội — Event Merit Transfer Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Qui tắc chuyển giao công đức từ phục vụ Pháp hội
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi một member hoàn tất phục vụ tại Pháp hội (event) và nhận được merit badge, hệ thống **nhắc nhở member có muốn chuyển giao công đức** hỗ trợ Pháp hội này tới người thân hoặc cần cầu khác không.

Member có 3 lựa chọn:
1. **Giữ toàn bộ công đức** cho bản thân.
2. **Chuyển giao một phần (%)** tới một người thụ hưởng cụ thể.
3. **Chia công đức** giữa nhiều người thụ hưởng với các % khác nhau.

Hệ thống **tự động sinh câu khấn cầu** từ template, record vào vows-merit ledger, và audit toàn bộ quá trình.

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — volunteer hoàn tất phục vụ event, nhận merit badge
- `system` — hiển thị modal, sinh prayer, record transfer vào ledger

---

## Trigger

Event transitions to `COMPLETED` status (hoặc trước khi event officially end), hệ thống check danh sách volunteer đã mark "done". Khi volunteer mark "done", trigger modal:

POST `/api/vows-merit/event-merit/transfer-option` (hoặc trigger via event completion flow).

---

## Preconditions

- Member có session hợp lệ.
- Event phải ở status `COMPLETED` hoặc `CONCLUDED`.
- Member phải là **confirmed volunteer** của event với status `COMPLETED` hoặc `ATTENDED`.
- Member chưa quyết định transfer merit cho event này trước đó (1 transfer per event per volunteer).

---

## Input contract

```
TransferEventMeritDto {
  volunteerId:  string                        // userId hoặc publicId
  eventId:      string                        // publicId của event
  transfers: [
    {
      recipientName:  string                  // tên người thụ hưởng (max 100 chars)
      percentage:     number                  // 0-100
      purpose:        string                  // mục đích chuyên giao (max 200 chars, e.g. "sớm bình phục", "thả sanh")
    }
  ]                                           // empty array nếu "Keep all merit"
}
```

Special case: `transfers = []` means member chọn keep all merit (no transfer).

---

## Read set

- session + actor role
- `User` record của volunteer
- `Event` record (verify status = COMPLETED hoặc CONCLUDED)
- `EventVolunteer` record (verify member confirmed + status COMPLETED hoặc ATTENDED)
- Config: prayer templates từ Content CMS

---

## Write path — Merit Transfer Modal and Protocol

### Step 1: Event Completion Trigger

1. Khi event transitions to `COMPLETED` hoặc volunteer manually mark "Done phục vụ":
   - Load volunteer's `EventVolunteer` record.
   - Check nếu member chưa có `EventMeritTransfer` record cho event này.
   - Nếu chưa có → trigger Step 2 (show modal). Nếu đã có → skip.

### Step 2: Modal Display (Frontend)

2. Render **Event Merit Transfer Modal** với 3 options:

   **Option A: Keep All Merit (Default selected)**
   ```
   [ ] Tôi giữ toàn bộ công đức từ việc phục vụ Pháp hội này
   Text: "100% công đức sẽ được ghi tên bạn. Đây là sự lựa chọn mặc định."
   ```

   **Option B: Transfer Single Recipient**
   ```
   [ ] Tôi muốn chuyển giao công đức tới người thân / mục đích khác
   Input fields:
     - Tên người thụ hưởng: ________________ (required if selected, max 100 chars)
     - % công đức: [slider 1-99] (required, must be < 100)
     - Mục đích chuyên giao: ________________ (optional, max 200 chars, e.g. "sớm bình phục", "thả sanh")
     - Preview button: "[Xem câu khấn tự động]"
   ```

   **Option C: Split Among Multiple Recipients**
   ```
   [ ] Tôi muốn chia công đức cho nhiều người
   Repeatable fields:
     - [+ Add recipient]
     - For each: Name / % / Purpose (same format as Option B)
     - Validation: Sum of % ≤ 100 (remainder = member keeps)
     - Preview button: "[Xem câu khấn tự động]"
   ```

3. **All options show:**
   - Event name + date as context.
   - Warning banner: "Quyết định này sẽ được ghi nhận và không thể thay đổi sau khi submit."

### Step 3: Prayer Generation (Preview)

4. Khi user nhập thông tin + click "[Xem câu khấn tự động]":
   - Generate prayer từ template:
   ```
   Nếu member chọn transfer 50% tới "Mẹ Tôi" với purpose "sớm bình phục":

   "Con xin chuyển giao 50% công đức từ việc phục vụ hỗ trợ Pháp hội [Event Name]
   cho Mẹ Tôi, xin các Bồ Tát từ bi che chở cho Mẹ Tôi sớm bình phục khỏe mạnh.
   50% công đức còn lại con giữ lại để tiếp tục tu hành.
   Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát."

   Nếu member split: "Mẹ Tôi 40%, Cha Tôi 30%, Thả Sanh 20%":

   "Con xin chuyển giao 40% công đức từ việc phục vụ hỗ trợ Pháp hội [Event Name]
   cho Mẹ Tôi, xin các Bồ Tát từ bi sớm bình phục Mẹ Tôi.
   Con xin chuyển giao 30% công đức cho Cha Tôi, xin các Bồ Tát từ bi sớm bình phục Cha Tôi.
   Con xin chuyển giao 20% công đức cho việc thả sanh các sinh vật.
   10% công đức còn lại con giữ lại để tu hành.
   Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát. Nam Mô Quán Thế Âm Bồ Tát."
   ```
   - Display generated prayer in **preview box** (can copy to clipboard).
   - User can revise recipient names / % / purpose and re-generate.

### Step 4: Input Validation

5. Before submission, validate:
   - Recipient names không trống, < 100 chars each.
   - % values: each 1-99, sum ≤ 100.
   - Purpose (optional): < 200 chars.
   - Error code: `invalid_transfer_percentage` (400) if sum > 100 or invalid format.

### Step 5: Database Write

6. POST `/api/vows-merit/event-merit/transfer-option`:
   ```
   Create EventMeritTransfer record:
   {
     transferId:              uuid,
     volunteerId:             (from input),
     eventId:                 (from input),
     volunteerDecision:       "KEEP_ALL" | "SINGLE" | "SPLIT",
     transfers: [
       {
         recipientName:       (from input),
         percentage:          (from input),
         purpose:             (from input),
         dedicationPrayerId:  (generated in Step 3)
       }
     ],
     dedicationPrayerGenerated: (full prayer text),
     meritBadgeAwarded:       true,
     createdAt:               now(),
     submittedAt:             now()
   }
   ```

7. Insert into `vows_merit_ledger` (audit trail):
   ```
   {
     entryType:       "EVENT_MERIT_TRANSFER",
     volunteerId:     (from input),
     eventId:         (from input),
     meritAmount:     (event merit badge value, default 1 unit),
     transferDetails: (JSON of transfers array),
     timestamp:       now()
   }
   ```

8. Audit `vows-merit.event-merit.transfer-initiated` + `vows-merit.event-merit.transferred-to-recipients`.

### Step 6: Confirmation + Recovery

9. Return success response:
   ```
   {
     transferId: "...",
     message: "Công đức đã được ghi nhận. Xin cảm tạ bạn đã phục vụ Pháp hội!",
     dedicationPrayer: "...",
     meritBadgeStatus: "AWARDED"
   }
   ```

10. Member receive email/in-app notification:
    - Subject: "Công đức từ Pháp hội [Event] đã được ghi nhận"
    - Body: Include generated prayer + confirmation of recipients.

---

## Modal Flow Diagram

```
Show Modal
  ├─ Option A: Keep All [selected by default]
  ├─ Option B: Transfer to 1 recipient
  │   └─ Name / % / Purpose inputs + [Preview Prayer]
  └─ Option C: Split to Multiple
      └─ [+Add Recipient] × N + [Preview Prayer]

[Preview Prayer] → Show generated prayer in preview box
[Submit] → Validate % sum ≤ 100 → Write to DB → Confirm
```

---

## Async side-effects

- **Phase 1+:** Email notification to volunteer with prayer transcript.
- **Phase 2+:** Outbox event `vows-merit.event-merit.transferred` → notify recipients via email (if contact available) or admin log.
- Merit ledger entry visible in member's "Merit History" dashboard.
- Event merit stats (% of volunteers who transferred merit) tracked for analytics.

---

## Success result

- `EventMeritTransfer` record created with full transfer details + generated prayer.
- Entry added to `vows_merit_ledger` for audit trail.
- Member receives confirmation notification.
- Merit badge awarded and recorded.

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| User chưa login | `unauthorized` | 401 | — |
| Event không tồn tại | `event_not_found` | 404 | — |
| Event không completed | `event_not_completed` | 403 | Chờ event conclude |
| Member không phải volunteer của event | `not_event_volunteer` | 403 | — |
| Member đã quyết định transfer trước đó | `transfer_already_submitted` | 409 | Cannot re-submit |
| % sum > 100 | `invalid_transfer_percentage` | 400 | Điều chỉnh % |
| Recipient name trống hoặc > 100 chars | `invalid_recipient_name` | 400 | Fix recipient info |
| Purpose > 200 chars | `invalid_purpose_length` | 400 | Shorten purpose |

---

## Audit

| Action | Actor | Trigger |
|---|---|---|
| `vows-merit.event-merit.transfer-initiated` | volunteerId | Submit transfer form |
| `vows-merit.event-merit.transferred-to-recipients` | volunteerId | Transfer finalized & recorded |
| `vows-merit.merit-badge.awarded-to-volunteer` | systemId | Event completion triggers badge |

---

## Rate-limit requirement

- No rate limit on transfer submission (once per event per volunteer).
- Email notification batched: send within 5 minutes of event completion.

---

## Outbox event

- Event type: `vows-merit.event-merit.transferred`
- Subscribers: event organizers, `identity` (if sending recipient notification), analytics
- Mode: sync-inline (Phase 1), outbox-required (Phase 2+)

---

## Recovery path

- Nếu modal dismiss hoặc user navigate away trước khi submit:
  - Modal persist next time they open event detail page (not forced, but available).
  - After 7 days: dismiss option becomes available, default to "Keep All".
- Nếu submission fail (network error): retry with same `transferId` (idempotent).
- Admin can view all transfer history per volunteer per event, cannot override.

---

## Notes for AI/codegen

- **Prayer generation must be automatic** — user không thể manually edit generated prayer template. Phải follow structure: "[% cho recipient] + [mục đích] + [phần còn lại]" + 3× Nam Mô.
- Prayer template parameters (recipient name, %, purpose) phải sanitize trước khi embed vào prayer text — prevent injection.
- `recipientName` không cần validate tồn tại trong user DB — có thể là "Thả Sanh", "Công đức chung", tên người quá cố, v.v.
- `transfers = []` explicitly means "Keep All" — không null, không missing.
- `EventMeritTransfer` là immutable sau khi submit — audit trail complete, không thể update/delete.
- Ledger entry format phải consistent với vows_merit_ledger schema (xem `vows-merit` CONTRACTS.md).
- Modal should display **after event concludes** — không interrupt volunteer ngay trong event.
- Email notification templates nên lấy từ Content CMS, không hardcode.
- % values in transfers array must sum to ≤ 100 (remainder automatically member keeps, không cần explicit entry).
