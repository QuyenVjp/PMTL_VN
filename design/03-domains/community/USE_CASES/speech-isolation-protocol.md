# Quy Tắc Cô Lập Khẩu Nghiệp — Speech Isolation Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Bảo vệ người khác khỏi việc tạo khẩu nghiệp phỉ báng Phật pháp
> **Trạng thái:** Phase 42 Logic 4
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi member mời khách không phải tín đồ (non-believer/skeptic) tham dự sự kiện tâm linh trong cộng đồng, hệ thống yêu cầu mandatory protective commitment:

1. **Cam kết bảo vệ:** Member phải xác nhận sẽ không tranh cãi hay cưỡng ép người khác
2. **Tránh khẩu nghiệp:** Bảo vệ khách khỏi việc tạo phỉ báng Phật pháp qua tranh luận
3. **Hard block:** Nếu không xác nhận → reject với 400 `commitment_required`
4. **Advisory khuyến nghị:** Gợi ý niệm Tâm Kinh 7 biến/ngày để xin Bồ Tát mở trí tuệ cho khách

---

## Owner module

`community` — EventInvitation / EventManagement
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — mời khách tham dự sự kiện tâm linh
- `non-believer/skeptic` — người khách không phải tín đồ hoặc có phản đối
- `system` — validate commitment checkbox, enforce hard block, log audit trail

---

## Trigger

User gọi `POST /api/events/invite-guest` với:
- `guestId` = khác với member
- `eventId` = sự kiện tâm linh (detect qua event type hoặc event owner affiliation)

---

## Business Rule

| Điều kiện | Hành động |
|---|---|
| `isolationCommitmentAccepted == true` | ✅ Tạo EventInvitation, gửi invite |
| `isolationCommitmentAccepted == false` OR unchecked | ❌ Block với 400 `commitment_required` |

**Hard block — không thể bypass hoặc "nhắc sau".**

Mandatory checkbox trước khi gửi invite:
```
[x] Tôi cam kết chỉ mời những người tùy duyên.
    Tôi tuyệt đối sẽ không tranh cãi hay cưỡng ép người
    đang phản đối để tránh làm họ tạo khẩu nghiệp phỉ báng
    Phật pháp.
```

Advisory recommendation (shown if checkbox checked):
```
💡 Khuyến nghị: Bạn có thể niệm Tâm Kinh 7 biến/ngày
   để xin Bồ Tát mở trí tuệ cho họ.
```

---

## Write Path

```
POST /api/events/invite-guest
──────────────────────────────
Body: {
  guestId:                      string      // guest user ID
  eventId:                      string      // event ID
  isolationCommitmentAccepted:  boolean     // checkbox state (REQUIRED)
}

1. Validate all fields present:
   - guestId not empty → 400 "missing_guest_id"
   - eventId not empty → 400 "missing_event_id"
   - isolationCommitmentAccepted present → 400 "missing_commitment_field"

2. Verify isolationCommitmentAccepted == true:
   if (isolationCommitmentAccepted !== true) {
     return {
       statusCode: 400,
       error: "commitment_required",
       message: "Phải xác nhận cam kết bảo vệ khẩu nghiệp trước khi mời khách.",
       displayMessage: "Bạn phải xác nhận checkbox cam kết trước khi gửi lời mời."
     }
   }

3. Check guest is not already invited to this event:
   if (existingInvitation) {
     return 409 "guest_already_invited"
   }

4. Create EventInvitation:
   {
     id:                        uuid(),
     eventId,
     guestId,
     invitedByMemberId:         currentUser.id,
     isolationCommitmentAt:     now(),
     recommendedHeartSutraCount: 7,
     status:                    "pending",  // pending → accepted → attended
     createdAt:                 now()
   }

5. Send invite notification to guest (via notification service).

6. Return {
     invitationId: uuid,
     status: "pending",
     message: "Lời mời đã được gửi.",
     advisoryMessage: "Bạn có thể niệm Tâm Kinh 7 biến/ngày để xin Bồ Tát mở trí tuệ cho họ."
   }
```

---

## Frontend UX

**Invite Modal / Form:**

```tsx
<form onSubmit={handleInviteGuest}>
  <h2>Mời khách tham dự sự kiện</h2>

  <select name="guestId" required>
    <option>Chọn khách mời...</option>
    {availableGuests.map(g => (
      <option key={g.id} value={g.id}>{g.name}</option>
    ))}
  </select>

  <div className="commitment-checkbox-group">
    <label>
      <input
        type="checkbox"
        name="isolationCommitmentAccepted"
        onChange={(e) => setCommitmentAccepted(e.target.checked)}
        required
      />
      <span>
        Tôi cam kết chỉ mời những người tùy duyên.
        Tôi tuyệt đối sẽ không tranh cãi hay cưỡng ép người đang phản đối
        để tránh làm họ tạo khẩu nghiệp phỉ báng Phật pháp.
      </span>
    </label>
  </div>

  {/* Advisory shown only if checkbox is checked */}
  {commitmentAccepted && (
    <div className="advisory-box">
      <p>💡 Khuyến nghị: Bạn có thể niệm Tâm Kinh 7 biến/ngày để xin Bồ Tát mở trí tuệ cho họ.</p>
    </div>
  )}

  {/* Submit button disabled until checkbox checked */}
  <button type="submit" disabled={!commitmentAccepted}>
    Gửi lời mời
  </button>
</form>

/* Error handling */
if (error?.code === "commitment_required") {
  showError("Phải xác nhận checkbox cam kết trước khi gửi lời mời.");
}
```

---

## Schema Notes

```prisma
model EventInvitation {
  id                            String    @id @default(cuid())
  eventId                       String
  guestId                       String
  invitedByMemberId             String

  isolationCommitmentAt         DateTime  // timestamp of checkbox confirmation
  recommendedHeartSutraCount    Int       @default(7)

  status                        String    @default("pending")  // pending | accepted | attended | declined
  respondedAt                   DateTime?

  createdAt                     DateTime  @default(now())
  updatedAt                     DateTime  @updatedAt

  event                         Event     @relation(fields: [eventId], references: [id])
  guest                         User      @relation("EventInvitationGuest", fields: [guestId], references: [id])
  invitedByMember               User      @relation("EventInvitationInviter", fields: [invitedByMemberId], references: [id])

  @@unique([eventId, guestId])  // prevent duplicate invites
  @@index([eventId])
  @@index([guestId])
  @@index([invitedByMemberId])
  @@index([status])
}

// Add to User model if needed for tracking invitations sent:
model User {
  // ... existing ...
  invitationsSent       EventInvitation[] @relation("EventInvitationInviter")
  invitationsReceived   EventInvitation[] @relation("EventInvitationGuest")
}
```

---

## Scope

| Scenario | Applies? |
|---|---|
| Member mời khách tham dự sự kiện tâm linh | ✅ YES |
| Member mời khách tham dự sự kiện xã hội bình thường | ❌ NO |
| Member thêm bạn vào group chat | ❌ NO |
| Admin phân quyền thành viên | ❌ NO |

Phân biệt qua `event.type = "spiritual"` hoặc `event.owner.affiliation = "spiritual-community"`.

---

## Commitment Validation Rules

**Must pass ALL checks:**

1. ✅ Checkbox `isolationCommitmentAccepted` = `true` (not just present, must be truthy)
2. ✅ Checkbox cannot be pre-filled or defaulted — must be manually checked by user
3. ✅ Form cannot submit if unchecked (button disabled)
4. ✅ If user tries to bypass via API, 400 rejection + audit log

**No workarounds:**
- ❌ Cannot "Nhắc sau" (remind later)
- ❌ Cannot skip checkbox
- ❌ Cannot pre-authorize via group/event settings

---

## Audit

| Action | Trigger |
|---|---|
| `community.invitation.speech-isolation-commitment-shown` | Invite form rendered with checkbox visible |
| `community.invitation.speech-isolation-commitment-confirmed` | User checks checkbox |
| `community.invitation.sent-safely` | API POST succeeds after commitment verified |
| `community.invitation.commitment-rejected` | User unchecks or form submitted without checked |
| `community.invitation.blocked-no-commitment` | API call blocked with 400 `commitment_required` |

Log full context: `{ invitedByMemberId, guestId, eventId, commitmentValue, timestamp }`.

---

## Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| `isolationCommitmentAccepted != true` | `commitment_required` | 400 | Phải xác nhận cam kết trước khi gửi lời mời |
| Missing `guestId` | `missing_guest_id` | 400 | Guest ID is required |
| Missing `eventId` | `missing_event_id` | 400 | Event ID is required |
| Missing commitment field | `missing_commitment_field` | 400 | Commitment field is required |
| `guestId` already invited | `guest_already_invited` | 409 | Khách này đã được mời sự kiện này rồi |
| `eventId` not found | `event_not_found` | 404 | Event không tồn tại |
| `guestId` not found | `guest_not_found` | 404 | Khách không tồn tại |
| Chưa đăng nhập | `unauthorized` | 401 | Phải đăng nhập để mời khách |

---

## Notes for AI/codegen

- **Hard block = immutable:** Cannot be overridden by user or admin override. This is a design principle.
- **Checkbox state:** Store `isolationCommitmentAt: DateTime` in EventInvitation to prove member confirmed at specific time.
- **Advisory copy:** "Niệm Tâm Kinh 7 biến/ngày" is a suggestion, not a requirement. Show only after commitment confirmed.
- **Event type detection:** Use `event.spiritualContext: boolean` or `event.category: "meditation" | "dharma-study" | "life-release"` to determine if commitment gate applies.
- **Phase 1:** Simple checkbox gate. Phase 2+: Additional guardrails like pre-event orientation for skeptics, moderation on Q&A, etc.
- **Guest notification:** When invited, guest receives message showing member's name & event details, but does NOT see the commitment checkbox (that's internal member protection).

---

## Related

- [testimonial-karmic-disclaimer.md](./testimonial-karmic-disclaimer.md) — Disclaimer for testimonial sharing
- [anti-scam-donation-filter.md](./anti-scam-donation-filter.md) — Trust/verification protocol
