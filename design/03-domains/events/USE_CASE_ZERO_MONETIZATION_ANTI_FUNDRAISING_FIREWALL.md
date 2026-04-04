# Rào Chắn Phi Lợi Nhuận & Chống Quyên Góp Cá Nhân — Zero-Monetization & Anti-Fundraising Firewall

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hệ Thống Quản Trị Phụng Sự Viên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Pháp Môn hoạt động hoàn toàn miễn phí. Mọi sách Kinh, đĩa CD, giấy in Ngôi Nhà Nhỏ, thực phẩm chay, thức uống tại các Pháp hội đều chỉ được **phát tặng miễn phí, tuyệt đối không được bán**. Phụng sự viên **tuyệt đối cấm** đứng ra thu tiền quyên góp vào tài khoản cá nhân hoặc người khác ngoài kênh chính thức. Mọi khoản trợ ấn Kinh sách (book printing fund, event support) phải được chuyển trực tiếp vào tài khoản ngân hàng chính thức của Tổ chức Từ thiện (ví dụ: St. George Bank, PMTL Charities). Hệ thống phải có cơ chế phát hiện và chặn tự động các vi phạm fundraising riêng lẻ.

---

## Owner module

`events` — EventPricingService / DharmaGoodsDistributionService  
`contact` — VolunteerFundrasingBlocker  
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `volunteer` — Phụng sự viên, phải tuân thủ zero-price policy
- `member` — Thành viên tìm kiếm sách Kinh, đĩa CD (expected free)
- `system` — AI text filter, price enforcement, transaction monitor
- `secretariat-finance` — Ban tài chính, quản lý tài khoản chính thức

---

## Trigger

- Volunteer create event with pricing > 0
- Volunteer post link to personal bank account (for fundraising)
- Member attempt to "buy" dharma good from unauthorized source
- AI detect buzzwords in chat/forum: "quyên góp", "chuyển khoản cá nhân", "tài khoản riêng"

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Event/resource price = 0 VND (free) | ✅ ALLOWED — publish |
| Event/resource price > 0 VND | ❌ REJECTED — 400 error + notify Secretariat |
| Dharma good (book, CD, NNN paper) price = 0 VND | ✅ ALLOWED — unlimited distribution |
| Dharma good price > 0 VND | ❌ REJECTED — auto-set to 0, notify admin |
| Volunteer post personal bank account + fundraising buzzwords | ❌ AUTO-BAN + flagged for review |
| Volunteer share payment link (personal PayPal, Stripe, etc.) | ❌ AUTO-DELETE post + warning |
| Volunteer mention official donation account (pre-approved list) | ✅ ALLOWED — verified link only |
| Multiple violations by same volunteer | ⚠️ WARNING → ❌ role downgrade (VOLUNTEER → MEMBER) |

---

## Input Contract

```
POST /api/events/create-or-update
{
  "eventId": "uuid (optional, for updates)",
  "organizerId": "uuid",
  "title": "string",
  "description": "string",
  "dharmaGoods": [
    {
      "goodId": "uuid",
      "name": "string",
      "quantity": integer,
      "pricePerUnit": "must be 0 (decimal/int)"
    }
  ],
  "price": "must be 0" // total event price
}

POST /api/contact/volunteer-message
{
  "volunteerId": "uuid",
  "channelId": "uuid (forum, chat room, etc.)",
  "content": "string",
  "messageType": "TEXT" | "LINK" | "FILE"
}

GET /api/contact/official-donation-accounts
{
  // Returns pre-approved list of official donation accounts
}
```

---

## Write Path

### Path A: Event/Resource Price Enforcement
```
1. Query eventId; verify organizerRole = "VOLUNTEER" or "ORGANIZER"
2. Validate DTO:
   - price === 0 → 400 error if price > 0:
     { error: "zero_monetization_violation", message: "Pháp Môn hoạt động hoàn toàn miễn phí." }
   - dharmaGoods[i].pricePerUnit === 0 → 400 if > 0
3. If price was > 0 → auto-sanitize to 0, log audit action
4. If dharmaGoods had prices → auto-sanitize all to 0
5. Create Event record with price: 0
6. Emit audit log:
   action: "event.monetization.blocked"
   context: { organizerId, originalPrice, sanitizedPrice: 0 }
7. Return 201 { eventId, message: "Sự kiện lập thành công. Tất cả tài liệu được phát tặng miễn phí." }
```

### Path B: Volunteer Message Content Scan (AI Filter)
```
1. Query volunteerId; verify role = "VOLUNTEER"
2. Query pre-approved donation accounts (whitelist) from SecretariatDirective or DonationAccount table
3. Scan content for prohibited buzzwords:
   - regex patterns: /quyên góp riêng|chuyển khoản cá nhân|tài khoản ngân hàng của tôi|số tài khoản/i
   - payment platform links: /paypal\.com|stripe\.com|momo\.vn(?!.*official)|gcash/i (exclude official partners)
4. If prohibited found:
   - Log violation: ComplianceViolationReport { volunteerId, violationType: "PERSONAL_FUNDRAISING" }
   - Return 400 { error: "personal_fundraising_prohibited", flaggedTerms: [...] }
   - If repeat offense (>= 3x in 30 days) → auto-downgrade role to MEMBER
5. If content links to pre-approved donation account → ALLOWED, log as "compliant_fundraising"
6. Publish message to channel
7. Emit audit log: action: "volunteer.message.fundraising.scanned"
```

### Path C: Report Approved Donation Accounts
```
1. Query DonationAccount WHERE status = "ACTIVE" AND secretariatApproved = true
2. Return 200 {
     accounts: [
       {
         organizationName: "PMTL Charities Australia",
         accountNumber: "XXXX-XXXX-XXXX",
         bankName: "St. George Bank",
         region: "Australia",
         purpose: "Printing Sutras, Events Support",
         bsbCode: "112-879" (if applicable)
       },
       ...
     ],
     message: "Hãy chuyển quyên góp chỉ vào các tài khoản chính thức được phê duyệt ở trên."
   }
```

---

## FE Behavior

### Volunteer Creating Event (Price Block)
```
┌─────────────────────────────────────────────┐
│  📅 Tạo Pháp Hội                            │
├─────────────────────────────────────────────┤
│                                             │
│  Tên sự kiện:                               │
│  [Ngôi Nhà Nhỏ Sharing Day]                 │
│                                             │
│  Giá vé:                                    │
│  [0 VND ◄─ LOCKED (Pháp Môn miễn phí)]     │
│                                             │
│  Tài liệu phát tặng:                        │
│  ☑ Sách Kinh (miễn phí)                    │
│  ☑ Đĩa CD (miễn phí)                       │
│  ☑ Giấy NNN (miễn phí)                     │
│                                             │
│  ℹ️  Lưu ý: Tất cả tài liệu PHẢI miễn      │
│     phí. Nếu vi phạm quy định này,          │
│     tài khoản sẽ bị khóa.                   │
│                                             │
│            [Tạo sự kiện]                    │
│                                             │
└─────────────────────────────────────────────┘

Price field is READ-ONLY, locked at 0 VND.
All dharma goods auto-set to free.
```

### Chat/Forum Content Filter
```
Volunteer types in chat:
"Các bạn muốn donate cho sách Kinh, 
 vui lòng chuyển khoản vào tài khoản cá nhân của tôi: [XXXX]"

System detects: ❌
┌─────────────────────────────────────────────┐
│  ⚠️  Lỗi: Quyên Góp Cá Nhân Bị Cấm          │
├─────────────────────────────────────────────┤
│                                             │
│  Pháp Môn hoạt động hoàn toàn miễn phí.    │
│  Bạn KHÔNG ĐƯỢC:                            │
│  ❌ Yêu cầu quyên góp vào tài khoản cá nhân │
│  ❌ Chia sẻ số tài khoản riêng               │
│  ❌ Bán bất kỳ tài liệu Phật pháp nào       │
│                                             │
│  Nếu cần quyên góp chính thức:              │
│  👉 [Xem tài khoản được phê duyệt]          │
│                                             │
│  Lần vi phạm thứ 1/3. Thêm 2 lần nữa        │
│  sẽ bị hạ quyền.                            │
│                                             │
│            [Tôi đã hiểu]                    │
│                                             │
└─────────────────────────────────────────────┘
```

### Approved Donation Account Directory
```
┌─────────────────────────────────────────────┐
│  💰 Tài Khoản Quyên Góp Chính Thức          │
├─────────────────────────────────────────────┤
│                                             │
│  🇦🇺 PMTL Charities Australia              │
│  Bank: St. George Bank                      │
│  Account: XXXX-XXXX-XXXX                   │
│  BSB: 112-879                               │
│  Purpose: In sách, tổ chức sự kiện         │
│  ✓ Verified by Secretariat                 │
│                                             │
│  🇻🇳 Hiệp hội Từ thiện PMTL Vietnam       │
│  Bank: Vietcombank                          │
│  Account: 1234567890                        │
│  Purpose: Hỗ trợ người nghèo, in sách      │
│  ✓ Verified by Secretariat                 │
│                                             │
│  🇮🇹 PMTL Charity Milan                    │
│  Bank: Intesa Sanpaolo                      │
│  Account: IT60X0542811101000000123456       │
│  Purpose: Pháp hội Ý, hỗ trợ tình nguyện    │
│  ✓ Verified by Secretariat                 │
│                                             │
│  ℹ️  Chỉ quyên góp vào các tài khoản        │
│     được Secretariat phê duyệt ở trên.      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model Event {
  // ... existing fields ...
  price           Decimal   @default(0) // ALWAYS 0
  
  @@check(price = 0) // DB-level constraint
}

model DharmaGood {
  id              String    @id @default(cuid())
  name            String
  description     String?
  pricePerUnit    Decimal   @default(0) // ALWAYS 0
  quantity        Int       // unlimited: -1, or specific number
  
  status          String    @default("AVAILABLE")
  createdAt       DateTime  @default(now())
  
  @@check(pricePerUnit = 0) // DB-level constraint
}

model DonationAccount {
  id              String    @id @default(cuid())
  organizationName String
  accountNumber   String
  bankName        String
  region          String    // AUSTRALIA | VIETNAM | ITALY | USA
  bsbCode         String?
  purpose         String
  
  secretariatApproved Boolean @default(false)
  approvedBy      String?
  approvedAt      DateTime?
  
  status          String    @default("ACTIVE") // ACTIVE, ARCHIVED
  
  @@unique([region, accountNumber])
}

model VolunteerFundraisingViolation {
  id              String    @id @default(cuid())
  volunteerId     String
  volunteer       User      @relation("fundraising-violations", fields: [volunteerId], references: [id])
  
  violationType   String    // PERSONAL_FUNDRAISING | PAID_EVENT | PAID_DHARMA_GOOD
  flaggedContent  String    // quote of violation
  channelId       String?   // where violation occurred (forum, chat, etc.)
  
  detectedAt      DateTime  @default(now())
  status          String    @default("PENDING") // PENDING, CONFIRMED, RESOLVED
  
  @@index([volunteerId])
  @@index([status])
}

// Migration hints:
// ALTER TABLE "Event" ADD CONSTRAINT "check_price_zero" CHECK ("price" = 0);
// ALTER TABLE "DharmaGood" ADD CONSTRAINT "check_good_price_zero" CHECK ("pricePerUnit" = 0);
// CREATE INDEX idx_volunteer_violations ON "VolunteerFundraisingViolation"("volunteerId", "detectedAt");
```

---

## Audit

| Action | Trigger |
|---|---|
| `event.price.blocked` | Event created with price > 0 → auto-set to 0 |
| `dharma-good.price.sanitized` | Dharma good priced > 0 → auto-set to 0 |
| `volunteer.fundraising.violation.detected` | AI filter detects personal fundraising attempt |
| `volunteer.fundraising.violation.confirmed` | Secretariat reviews + confirms |
| `volunteer.role.downgraded` | 3+ fundraising violations in 30 days → demote VOLUNTEER → MEMBER |
| `volunteer.message.fundraising.blocked` | Post containing personal bank account deleted |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Event price > 0 | `zero_monetization_violation` | 400 |
| Dharma good price > 0 | `dharma_good_pricing_violation` | 400 |
| Volunteer post personal fundraising link | `personal_fundraising_prohibited` | 400 |
| Volunteer message contains buzzwords | `prohibited_fundraising_language` | 400 |
| Post deleted due to payment link | `fundraising_content_removed` | 410 |
| Volunteer role downgraded (too many violations) | `volunteer_role_downgraded_for_violations` | 403 |

---

## Notes for AI/codegen

- **Price enforcement:** Use DB-level `CHECK` constraints to prevent data layer bypass.
- **AI filter buzzwords:** Maintain dynamic regex list in `FundraisingBlocklist` enum; update quarterly based on new evasion attempts.
- **Whitelist pre-approved:** Store official donation accounts in `DonationAccount` table; only URLs from this list allowed in volunteer content.
- **Violation scoring:** Track violation count per volunteer per 30-day window; auto-downgrade on 3+ violations.
- **False positive handling:** If AI blocks legitimate message, volunteer can appeal to Secretariat (add flag: `appealable: true`).
- **International accounts:** Support multiple currencies (AUD, VND, EUR, USD); conversion hints stored with DonationAccount.
- **Edge case:** If volunteer is genuinely asking members for permission to fundraise (e.g., for venue rental), must go through Secretariat approval process first (separate workflow).
- **Transparency:** All violations logged with content snapshot for audit trail.

---

## Related

- [USE_CASE_TESTIMONIAL_DISCLAIMER_AUTO_INJECT.md](../community/USE_CASE_TESTIMONIAL_DISCLAIMER_AUTO_INJECT.md) — Content validation for volunteers
- [USE_CASE_CENTRALIZED_SECRETARIAT_DIRECTIVES.md](../contact/USE_CASE_CENTRALIZED_SECRETARIAT_DIRECTIVES.md) — Official communication channels
- [USE_CASE_VOLUNTEER_COMPLIANCE_REPORT.md](./USE_CASE_VOLUNTEER_COMPLIANCE_REPORT.md) — Violation tracking
