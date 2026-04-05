# Tuân Thủ Sự Chỉ Đạo Của Ban Thư Ký Tập Trung — Centralized Secretariat Directives

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hệ Thống Quản Trị Phụng Sự Viên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phụng sự viên phải tuân thủ triệt để sự chỉ đạo của Ban Thư Ký (Secretariat), sử dụng các thông tin chuẩn chính thức khi hướng dẫn hoặc tuyên truyền. Các đường dây hotline trực, hướng dẫn độ người, lịch trình sự kiện, và tài liệu giáo lý đều phải được lấy từ một nguồn tập trung để tránh nhầm lẫn, sai lệch, hoặc sự kiện được tổ chức riêng lẻ mà không được phê duyệt chính thức. Hệ thống phải cung cấp "Single Source of Truth" cho tất cả Phụng sự viên.

---

## Owner module

`contact` — SecretariatDirectiveService / VolunteerHotlineService  
`identity` — VolunteerRoleManagement  
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `secretariat-admin` — Ban Thư Ký, người publish directives
- `volunteer` — Phụng sự viên, người nhận chỉ đạo
- `system` — Phát hành, theo dõi tuân thủ
- `member` — Thành viên cần thông tin chính thức

---

## Trigger

- Secretariat publish directive (guideline mới, hotline hours, official statement)
- Volunteer attempt to share information outside official channel
- Member ask for official guidance (không biết nguồn chính thức)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Secretariat publish directive (new guideline, hotline update, statement) | ✅ BROADCAST to all volunteers + notify via push |
| Volunteer share information matching official directive | ✅ ALLOWED — tracked as "compliant" |
| Volunteer share information **contradicting** official directive | ❌ FLAGGED — auto-alert Secretariat, hide from public |
| Volunteer attempt to broadcast information without Secretariat approval | ⚠️ WARNING — require review before visibility |
| Member ask "Số hotline chính thức là gì?" | ✅ Return official Secretariat contact from DB |
| Multiple conflicting hotline numbers in circulation | ❌ REJECTED — sanitize public channels, post SINGLE number only |
| Volunteer offline (not accessing app) but need to answer member question | ⚠️ WARNING — suggest member use public hotline channel |

---

## Input Contract

```
POST /api/contact/secretariat-directives/publish (admin only)
{
  "secretariatAdminId": "uuid",
  "title": "string (max 200)",
  "content": "string (max 10000)",
  "directiveType": "HOTLINE_UPDATE" | "GUIDELINE" | "EVENT_APPROVAL" | "PROTOCOL" | "STATEMENT",
  "effectiveDate": "ISO 8601 date",
  "expiryDate": "ISO 8601 date (optional)",
  "targetAudience": "VOLUNTEERS" | "MEMBERS" | "ALL",
  "priority": "CRITICAL" | "HIGH" | "NORMAL",
  "attachments": ["url"] (optional)
}

GET /api/contact/official-hotline
{
  "region": "VIETNAM" | "AUSTRALIA" | "ITALY" | "USA" | ... (optional)
}

POST /api/contact/secretariat-directives/report-violation
{
  "volunteerId": "uuid",
  "violationType": "OUTDATED_INFO" | "CONTRADICTORY_GUIDANCE" | "UNAPPROVED_EVENT" | "WRONG_HOTLINE",
  "details": "string",
  "evidenceUrl": "url (optional screenshot/recording)"
}
```

---

## Write Path

### Path A: Publish Directive (Admin)
```
1. Query secretariatAdminId; verify role = "SECRETARIAT_ADMIN" or "ORGANIZER"
2. Validate DTO:
   - title.length > 0 && < 200 → 400 if invalid
   - effectiveDate <= now() → 400 if in past
   - expiryDate > effectiveDate (if provided) → 400 if invalid
3. Create SecretariatDirective record:
   {
     adminId, title, content, directiveType, targetAudience,
     priority, effectiveDate, expiryDate, status: "PUBLISHED",
     publishedAt: now()
   }
4. Generate notification payload:
   - titleForNotif = `[${directiveType}] ${title}`
   - Query users by targetAudience (VOLUNTEERS or MEMBERS or ALL)
5. Emit push notifications:
   - action: "secretariat.directive.published"
   - badge: "New Official Directive"
6. Post to "Official Announcements" channel (pinned, read-only)
7. Return 201 { directiveId, notificationsSent: count }
```

### Path B: Get Official Hotline
```
1. Query most recent SecretariatDirective WHERE directiveType = "HOTLINE_UPDATE" AND status = "PUBLISHED" AND expiryDate > now()
2. If multiple regions → filter by region param
3. Extract hotlineNumber from directive content (parse structured field)
4. Return 200 {
     hotlineNumber: "+61-...",
     hoursOfOperation: "Mon-Fri 9-18 Sydney time",
     languages: ["Vietnamese", "English", "Mandarin"],
     region: "AUSTRALIA",
     lastUpdated: ISO date,
     directiveId: uuid
   }
```

### Path C: Report Compliance Violation
```
1. Query volunteerId; verify reporter has standing (can report)
2. Validate DTO:
   - violationType in enum
   - details.length > 0
3. Create ComplianceViolationReport record:
   {
     volunteerId, reportedBy, violationType, details,
     status: "PENDING_REVIEW", createdAt: now()
   }
4. Notify Secretariat (high priority if violationType = "CONTRADICTORY_GUIDANCE")
5. If violationType = "CONTRADICTORY_GUIDANCE" → immediately hide volunteer's conflicting post
6. Return 201 { reportId, nextSteps: "Secretariat akan review dalam 24 jam" }
```

---

## FE Behavior

### For Volunteers: Directive Board
```
┌──────────────────────────────────────────────┐
│  📢 Chỉ Dẫn Chính Thức Từ Ban Thư Ký         │
├──────────────────────────────────────────────┤
│                                              │
│  [CRITICAL] ⚠️ Cập nhật Hotline Milan       │
│  Số hotline chính thức ở Milan đã thay đổi  │
│  từ +39-XXX sang +39-YYY. Vui lòng cập nhật │
│  danh sách liên hệ cá nhân ngay.            │
│  Có hiệu lực từ: 2026-04-05                 │
│  [Xem chi tiết]                             │
│                                              │
│  [HIGH] 📋 Quy Trình Hướng Dẫn Độ Người    │
│  Hướng dẫn mới từ Sư Phụ: Khi độ người mới, │
│  phải dùng tài liệu từ link chính thức [...]  │
│  Cấm dùng tài liệu tự viết hoặc in lậu.     │
│  Có hiệu lực từ: 2026-04-01                 │
│  [Xem chi tiết]                             │
│                                              │
└──────────────────────────────────────────────┘

Each directive is PINNED, READ-ONLY, timestamped.
Volunteer clicks [Xác nhận đã đọc] to log acknowledgment.
```

### For Members: Official Hotline Lookup
```
┌──────────────────────────────────────────────┐
│  📞 Số Hotline Chính Thức                    │
├──────────────────────────────────────────────┤
│                                              │
│  Việt Nam:                                   │
│  ☎️  +84-28-XXXX-YYYY (TP.HCM)              │
│  ⏰  Mở cửa: T2-T6, 8:00-17:00               │
│                                              │
│  Úc:                                         │
│  ☎️  +61-2-XXXX-ZZZZ (Sydney)               │
│  ⏰  Mở cửa: T2-T6, 9:00-18:00 (Sydney time)│
│                                              │
│  Ý:                                          │
│  ☎️  +39-02-XXXX-WWWW (Milan)               │
│  ⏰  Mở cửa: T2-T6, 15:00-22:00 (Milan time)│
│                                              │
│  ℹ️  Cập nhật lần cuối: 2026-04-04          │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model SecretariatDirective {
  id              String    @id @default(cuid())
  adminId         String
  admin           User      @relation("directives-published", fields: [adminId], references: [id])
  
  title           String    // max 200
  content         String    // max 10000
  directiveType   String    // HOTLINE_UPDATE | GUIDELINE | EVENT_APPROVAL | PROTOCOL | STATEMENT
  targetAudience  String    // VOLUNTEERS | MEMBERS | ALL
  priority        String    // CRITICAL | HIGH | NORMAL
  
  effectiveDate   DateTime
  expiryDate      DateTime?  // null = no expiry
  status          String    @default("PUBLISHED") // PUBLISHED, ARCHIVED, RETRACTED
  
  hotlineData     Json?     // { number, region, hoursOfOperation } if directiveType = "HOTLINE_UPDATE"
  
  publishedAt     DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  acknowledgments ComplianceAcknowledgment[] // volunteer read receipts
  
  @@index([status])
  @@index([directiveType])
  @@index([effectiveDate])
}

model ComplianceAcknowledgment {
  id              String    @id @default(cuid())
  directiveId     String
  directive       SecretariatDirective @relation(fields: [directiveId], references: [id], onDelete: Cascade)
  
  volunteerId     String
  volunteer       User      @relation("directive-acks", fields: [volunteerId], references: [id])
  
  acknowledgedAt  DateTime
  
  @@unique([directiveId, volunteerId])
  @@index([volunteerId])
}

model ComplianceViolationReport {
  id              String    @id @default(cuid())
  volunteerId     String
  volunteer       User      @relation("violations-reported", fields: [volunteerId], references: [id])
  
  reportedBy      String
  reporter        User      @relation("violations-filed", fields: [reportedBy], references: [id])
  
  violationType   String    // OUTDATED_INFO | CONTRADICTORY_GUIDANCE | UNAPPROVED_EVENT | WRONG_HOTLINE
  details         String
  evidenceUrl     String?
  
  status          String    @default("PENDING_REVIEW") // PENDING_REVIEW, CONFIRMED, RESOLVED, DISMISSED
  reviewedBy      String?   // Secretariat reviewer
  reviewedAt      DateTime?
  
  createdAt       DateTime  @default(now())
  
  @@index([volunteerId])
  @@index([status])
}

// Migration hints:
// CREATE TABLE IF NOT EXISTS "SecretariatDirective" (
//   "id" TEXT NOT NULL PRIMARY KEY,
//   "adminId" TEXT NOT NULL,
//   "title" TEXT NOT NULL,
//   "content" TEXT NOT NULL,
//   "directiveType" TEXT NOT NULL,
//   "targetAudience" TEXT NOT NULL,
//   "priority" TEXT NOT NULL,
//   "effectiveDate" DATETIME NOT NULL,
//   "expiryDate" DATETIME,
//   "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
//   "hotlineData" JSON,
//   "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   "updatedAt" DATETIME NOT NULL,
//   FOREIGN KEY ("adminId") REFERENCES "User"("id")
// );
```

---

## Audit

| Action | Trigger |
|---|---|
| `secretariat.directive.published` | Admin publish directive |
| `secretariat.directive.acknowledged` | Volunteer read + confirm directive |
| `compliance.violation.reported` | Volunteer/member report non-compliance |
| `compliance.violation.confirmed` | Secretariat confirms violation |
| `volunteer.content.hidden` | Conflicting post auto-hidden |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Admin role not SECRETARIAT_ADMIN | `unauthorized_directive_publish` | 403 |
| Directive title or content empty | `directive_content_required` | 400 |
| Effective date in past | `invalid_effective_date` | 400 |
| Expiry date before effective date | `invalid_expiry_date` | 400 |
| Hotline number format invalid | `invalid_hotline_format` | 400 |
| No active directive for region | `no_hotline_found` | 404 |
| Violation report missing required fields | `violation_report_incomplete` | 400 |

---

## Notes for AI/codegen

- **Single Source of Truth:** All official info flows through SecretariatDirective table; no hardcoded values in code.
- **Hotline versioning:** Each new hotline update creates fresh record; old ones auto-expire or manually archived.
- **Directive expiry:** Cron job daily checks `expiryDate`; auto-archive expired directives.
- **Volunteer acknowledgment tracking:** Secretariat can see who read which directive (for compliance audits).
- **Conflict resolution:** If volunteer posts contradictory info → auto-flag + notify Secretariat → may hide post until resolved.
- **Multi-language support:** Consider storing hotlineData in multiple languages (Vietnamese, English, Mandarin, Italian).
- **Push notification strategy:** CRITICAL directives get instant push + in-app banner; NORMAL directives appear in feed only.
- **Edge case:** Volunteer offline when directive published → directive should appear in feed when they re-open app.

---

## Related

- [USE_CASE_VOLUNTEER_ROLE_MANAGEMENT.md](../identity/USE_CASE_VOLUNTEER_ROLE_MANAGEMENT.md) — Volunteer role lifecycle
- [USE_CASE_TESTIMONIAL_DISCLAIMER_AUTO_INJECT.md](../community/USE_CASE_TESTIMONIAL_DISCLAIMER_AUTO_INJECT.md) — Post validation for compliance
- [USE_CASE_HOTLINE_SCHEDULING_PROTOCOL.md](./USE_CASE_HOTLINE_SCHEDULING_PROTOCOL.md) — Hotline operation timing
