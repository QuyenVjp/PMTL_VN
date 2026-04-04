# Giao Thức Chuyển Giao Công Đức Sự Kiện — Event Merit Transfer Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hệ Thống Quản Trị Phụng Sự Viên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phụng sự viên (tình nguyện viên) hỗ trợ tổ chức các buổi Pháp hội mang lại công đức vô lượng. Theo giáo lý Pháp Môn Tâm Linh, một phần công đức từ sự phục vụ được phép chuyển giao cho người thân (ví dụ: chữa bệnh, cầu mang thai). Hệ thống phải hỗ trợ tạo lời khấn tiêu chuẩn và theo dõi tỷ lệ chuyển giao, đảm bảo ý chí của Phụng sự viên được ghi nhận và bảo vệ.

---

## Owner module

`vows-merit` — VolunteerMeritTransfer / MeritAllocationService  
`events` — EventDedicationController  
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `volunteer` — Phụng sự viên sau khi sự kiện kết thúc
- `system` — Tạo modal, sinh lời khấn, lưu trữ dedication
- `family-recipient` — Người thân được nhận công đức (nhập tên hoặc chọn từ danh sách gia đình)

---

## Trigger

Sự kiện vừa kết thúc (`event.status = "COMPLETED"`). Hệ thống phát hiện Phụng sự viên là `attendanceRole = "VOLUNTEER"` hoặc `ORGANIZER` (có hoạt động hỗ trợ được log).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Sự kiện kết thúc, Phụng sự viên có ghi nhận hoạt động | ✅ Hiển thị modal "Chuyển giao công đức" |
| Tỷ lệ chuyển giao ∈ [1%, 100%] | ✅ ALLOWED |
| Tỷ lệ < 1% hoặc > 100% | ❌ REJECTED — validation error |
| Người nhận = chính Phụng sự viên | ⚠️ WARNING — tooltip: "Nên chuyển cho người thân, không chính bạn" |
| Người nhận = không xác định (blank) | ❌ REJECTED — yêu cầu nhập hoặc chọn |
| Phụng sự viên từ chối chuyển giao (dismiss modal) | ✅ ALLOWED — không lưu dedication |

---

## Input Contract

```
POST /api/vows-merit/event-dedications

{
  "eventId": "uuid",
  "volunteerId": "uuid",
  "recipientName": "string (max 100, Vietnamese with diacritics)",
  "recipientRelation": "SPOUSE | CHILD | PARENT | SIBLING | RELATIVE | FRIEND",
  "transferPercentage": "integer 1–100",
  "dedicationReason": "HEALTH | FERTILITY | REUNION | GENERAL | OTHER",
  "dedicationNotes": "string (optional, max 500)",
  "prayerTemplateId": "uuid (optional, for future versioning)",
  "confirmCheckbox": "true (required — volunteer confirms understanding)"
}
```

---

## Write Path

```
1. Query event by eventId, verify status = "COMPLETED"
2. Query volunteer attendance record:
   - volunteerAttendance WHERE eventId + volunteerId + role IN ["VOLUNTEER", "ORGANIZER"]
   - If not found → return 404 { error: "volunteer_not_found_for_event" }
3. Validate DTO:
   - transferPercentage ∈ [1, 100] → 400 if out of range
   - recipientName.trim().length > 0 → 400 if empty
   - confirmCheckbox === true → 400 if false
4. Generate prayer using template:
   - prayerText = generateMeritTransferPrayer({
       volunteerId, recipientName, transferPercentage, dedicationReason
     })
   - prayerTemplate: "Con xin chuyển [X]% công đức từ việc hỗ trợ Pháp hội này cho [TÊN], 
     xin Bồ Tát từ bi [LÝ DO ĐẠO]..."
5. Create VolunteerMeritTransfer record:
   {
     eventId, volunteerId, recipientName, recipientRelation,
     transferPercentage, dedicationReason, prayerText,
     createdAt: now(), status: "RECORDED"
   }
6. Emit audit log:
   action: "volunteer.merit-transfer.created"
   context: { eventId, volunteerId, recipientName, transferPercentage, prayerText }
7. Return 201 {
     dedicationId: uuid,
     prayerText: string (for display in modal),
     confirmMessage: "Công đức chuyển giao của bạn đã được Bồ Tát ghi nhận. Mong rằng [TÊN] sớm nhận được phước báu."
   }
```

---

## FE Behavior

```
┌─────────────────────────────────────────────┐
│  ✅ Sự kiện đã kết thúc thành công!          │
├─────────────────────────────────────────────┤
│                                             │
│  💝 Chuyển giao công đức cho gia đình:     │
│  ┌─────────────────────────────────────────┐│
│  │ Người nhận:  [Con gái Lan____________]  ││
│  │ Quan hệ:     [CHILD ▼ ]                 ││
│  │ Lý do:       [FERTILITY ▼ ]             ││
│  │ Tỷ lệ (%):   [━━━━━● ━━━] 50%          ││
│  │ Ghi chú:     [Cầu con sớm mang thai] ││
│  │              (tối đa 500 ký tự)         ││
│  │                                          ││
│  │ ☐ Tôi hiểu rằng công đức này sẽ được   ││
│  │   chuyển cho [Con gái Lan] theo lời     ││
│  │   khấn dưới đây. Nghiệp chướng của Phật ││
│  │   pháp sẽ tự giải.                      ││
│  │                                          ││
│  │ [Lời khấn mẫu sẽ được hiển thị ở đây]   ││
│  │                                          ││
│  │        [Xác nhận]  [Bỏ qua]             ││
│  └─────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘

Button behavior:
- [Xác nhận]: enabled only if checkbox ticked + all fields valid
- [Bỏ qua]: dismiss modal, do NOT save
- recipientName auto-populate from Family contacts (if exists in system)
- transferPercentage slider updates label in real-time: "50%" → "Chuyển 50%"
```

---

## Schema Notes

```prisma
model VolunteerMeritTransfer {
  id                String    @id @default(cuid())
  eventId           String
  event             Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  volunteerId       String
  volunteer         User      @relation("merit-transfers", fields: [volunteerId], references: [id])
  
  recipientName     String    // Name of family member or friend
  recipientRelation String    // SPOUSE | CHILD | PARENT | SIBLING | RELATIVE | FRIEND
  transferPercentage Int     // 1–100
  dedicationReason  String    // HEALTH | FERTILITY | REUNION | GENERAL | OTHER
  dedicationNotes   String?   // optional user notes
  
  prayerText        String    // generated from template
  prayerPayload     Json      // { recipientName, reason, percentage } for audit
  
  status            String    @default("RECORDED") // RECORDED, FULFILLED(future: when recitation confirmed)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([eventId, volunteerId]) // one dedication per volunteer per event
  @@index([volunteerId])
  @@index([eventId])
}

// Migration hint:
// CREATE TABLE IF NOT EXISTS "VolunteerMeritTransfer" (
//   "id" TEXT NOT NULL PRIMARY KEY,
//   "eventId" TEXT NOT NULL,
//   "volunteerId" TEXT NOT NULL,
//   "recipientName" TEXT NOT NULL,
//   "recipientRelation" TEXT NOT NULL,
//   "transferPercentage" INTEGER NOT NULL,
//   "dedicationReason" TEXT NOT NULL,
//   "dedicationNotes" TEXT,
//   "prayerText" TEXT NOT NULL,
//   "prayerPayload" JSON NOT NULL,
//   "status" TEXT NOT NULL DEFAULT 'RECORDED',
//   "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   "updatedAt" DATETIME NOT NULL,
//   FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE,
//   FOREIGN KEY ("volunteerId") REFERENCES "User"("id"),
//   UNIQUE("eventId", "volunteerId")
// );
```

---

## Audit

| Action | Trigger |
|---|---|
| `volunteer.merit-transfer.created` | Phụng sự viên confirm chuyển giao công đức |
| `volunteer.merit-transfer.dismissed` | Phụng sự viên từ chối (dismissed modal) |
| `volunteer.merit-transfer.viewed` | Phụng sự viên xem modal lần đầu |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Event không tìm thấy hoặc chưa kết thúc | `event_not_found_or_incomplete` | 404 |
| Phụng sự viên không có ghi nhận tham gia sự kiện | `volunteer_not_found_for_event` | 404 |
| Tỷ lệ chuyển giao ngoài phạm vi [1, 100] | `transfer_percentage_out_of_range` | 400 |
| Tên người nhận trống | `recipient_name_required` | 400 |
| Checkbox xác nhận không được tick | `confirmation_required` | 400 |
| Volunteer đã có dedication cho sự kiện này | `duplicate_dedication_for_event` | 409 |

---

## Notes for AI/codegen

- **Prayer template generation:** Must use pure function `generateMeritTransferPrayer(dto)` to avoid string concat injection; store result in DB.
- **Slider interaction:** Use 1–100 integer range; smooth real-time label update in FE ("25%" updates live as slider moves).
- **Family recipient lookup:** Check if `recipientName` matches existing `UserProfile.familyMembers` (if feature exists) for autocomplete.
- **Optional audit**: Consider storing `prayerPayload` as JSON for analytics (e.g., trending dedication reasons: FERTILITY vs HEALTH).
- **Future expansion:** Phase 44+ may add "Confirmation of Recitation" step (volunteer records when prayer is actually recited); link via `VolunteerMeritTransfer.id`.
- **Stateless FE:** The modal is post-event, so no cross-tab sync needed; simple client-side confirmation is sufficient.
- **Edge case:** Volunteer might dedicate merit to someone not yet in system (friend outside family). `recipientName` is freeform text, not FK. Acceptable for Phase 43 scope.

---

## Related

- [USE_CASE_EVENT_COMPLETION_NOTIFICATION.md](./USE_CASE_EVENT_COMPLETION_NOTIFICATION.md) — triggered before merit transfer modal
- [USE_CASE_PRAYER_TEMPLATE_SYSTEM.md](../wisdom-qa/USE_CASE_PRAYER_TEMPLATE_SYSTEM.md) — template generation for prayer text
