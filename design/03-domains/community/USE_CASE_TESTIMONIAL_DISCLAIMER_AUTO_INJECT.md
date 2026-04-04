# Tự Động Chèn Miễn Trừ Trách Nhiệm Trong Chia Sẻ — Testimonial Disclaimer Auto-Inject

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hệ Thống Quản Trị Phụng Sự Viên
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi Phụng sự viên lên sân khấu hoặc viết bài chia sẻ (testimonial) về trải nghiệm sự kiện, bệnh tật, gia đình để độ người, nếu nói sai lý hay sai Pháp, bản thân Phụng sự viên tự gánh toàn bộ nghiệp, không để Sư phụ hoặc người nghe gánh thay. Hệ thống phải tự động chèn (inject) lời xin lỗi và miễn trừ ở cuối bài để bảo vệ giáo lý và cơ sở pháp học. Điều này cũng khuyến khích Phụng sự viên cẩn trọng khi chia sẻ, tránh phỉ báng hay sai lệch Phật pháp.

---

## Owner module

`community` — TestimonialService / PostContentService  
`content` — ContentValidationService  
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `volunteer-author` — Phụng sự viên viết testimonial
- `system` — Validate, inject disclaimer, publish
- `readers` — Độc giả thấy disclaimer ở cuối bài

---

## Trigger

Phụng sự viên submit testimonial (bài chia sẻ):
- `POST /api/community/testimonials/create`
- Content type phải là `TESTIMONY` hoặc `HEALING_STORY` hoặc `LIFE_CHANGE`

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Testimonial submit từ `volunteer` role + content type = TESTIMONY | ✅ Auto-inject disclaimer, publish with disclaimer |
| Testimonial đã có disclaimer text ở cuối | ⚠️ WARNING — do not double-inject; verify & merge |
| Testimonial quá ngắn (< 50 chars) | ⚠️ WARNING — ask user if intentional |
| Testimonial chứa từ khóa cấm (xin tiền, quảng cáo sản phẩm, thuyết pháp sai) | ❌ REJECTED — flag for human review |
| Phụng sự viên tick "I understand disclaimer" checkbox | ✅ ALLOWED to publish |
| Checkbox không tick | ❌ REJECTED — require acknowledgment |

---

## Input Contract

```
POST /api/community/testimonials/create

{
  "authorId": "uuid",
  "authorRole": "VOLUNTEER" | "MEMBER" | "ORGANIZER",
  "contentType": "TESTIMONY" | "HEALING_STORY" | "LIFE_CHANGE" | "GENERAL_POST",
  "title": "string (max 200)",
  "body": "string (required, min 50, max 5000)",
  "coverImage": "url (optional)",
  "tags": ["string"],
  "disclaimerAcknowledge": "boolean (required if authorRole = VOLUNTEER)"
}
```

---

## Write Path

```
1. Query user by authorId; verify role in ["VOLUNTEER", "ORGANIZER"]
   - If not, skip to step 6 (no auto-inject for regular members)
2. Validate DTO:
   - body.trim().length >= 50 → 400 if too short
   - disclaimerAcknowledge === true → 400 if false (for volunteers)
3. Scan body for forbidden keywords:
   - regex: /quyên góp|chuyển khoản|tài khoản riêng|lừa/i
   - If found → return 400 { error: "content_contains_prohibited_terms", flaggedTerms: [...] }
4. Check if body already ends with disclaimer text:
   - If yes → extract original body, do NOT append duplicate
5. Auto-inject disclaimer append:
   - disclaimerText = "Nếu có bất kỳ lời nào không đúng lý không đúng pháp trong lúc chia sẻ, con xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát, các vị Hộ Pháp và Sư Phụ Lư Quân Hoành tha lỗi. Nghiệp chướng của con con tự gánh."
   - finalBody = body + "\n\n---\n\n" + disclaimerText
6. Create Testimonial record:
   {
     authorId, authorRole, contentType, title, body: finalBody,
     originalBodyLength: body.length, disclaimerInjected: true,
     createdAt: now(), status: "PUBLISHED", visibility: "PUBLIC"
   }
7. Emit audit log:
   action: "community.testimonial.published"
   context: { authorId, contentType, disclaimerInjected, originalBodyLength }
8. Return 201 { testimonialId, disclaimer: disclaimerText }
```

---

## FE Behavior

```
┌────────────────────────────────────────────────┐
│  📝 Chia Sẻ Trải Nghiệm Của Bạn               │
├────────────────────────────────────────────────┤
│                                                │
│  Tiêu đề:                                      │
│  [Khỏi bệnh ung thư nhờ Bồ Tát]             │
│                                                │
│  Nội dung:                                     │
│  ┌──────────────────────────────────────────┐ │
│  │ Tôi mắc ung thư năm 2023... sau khi      │ │
│  │ tu tập Pháp Môn, bệnh tình đã cải thiện │ │
│  │ đáng kể... [...]                          │ │
│  │                                           │ │
│  │ [Disclaimer sẽ tự động chèn ở đây]      │ │
│  │ ---                                       │ │
│  │ Nếu có bất kỳ lời nào không đúng lý...  │ │
│  │ con xin Đại Từ Đại Bi Quán Thế Âm Bồ    │ │
│  │ Tát, các vị Hộ Pháp và Sư Phụ Lư Quân    │ │
│  │ Hoành tha lỗi. Nghiệp chướng của con con │ │
│  │ tự gánh.                                 │ │
│  │                                           │ │
│  └──────────────────────────────────────────┘ │
│                                                │
│  ☐ Tôi đã hiểu và chấp nhận lời miễn trừ    │
│    trách nhiệm ở trên. Toàn bộ nội dung      │
│    này được viết dưới sự chịu trách nhiệm    │
│    của tôi.                                   │
│                                                │
│           [Đăng bài]  [Hủy]                   │
│                                                │
└────────────────────────────────────────────────┘

Behavior:
- Disclaimer text is READ-ONLY (can't edit)
- Checkbox enables [Đăng bài] button only when checked
- If original body already has disclaimer → show "Phát hiện disclaimer" warning + ask to confirm
- Post-publish: disclaimer shows in faded text (lighter gray) to distinguish from author's content
```

---

## Schema Notes

```prisma
model CommunityTestimonial {
  id                  String    @id @default(cuid())
  authorId            String
  author              User      @relation("testimonials", fields: [authorId], references: [id])
  
  title               String    // max 200
  body                String    // includes auto-injected disclaimer at end
  originalBodyLength  Int       // length of body BEFORE disclaimer injection (for analytics)
  
  contentType         String    // TESTIMONY | HEALING_STORY | LIFE_CHANGE | GENERAL_POST
  disclaimerInjected  Boolean   @default(true) // flag if auto-injected
  disclaimerText      String    // stored for reference (also in body)
  
  coverImage          String?   // optional image URL
  tags                String[]  // array of tags
  
  status              String    @default("PUBLISHED") // PUBLISHED, DRAFT, ARCHIVED
  visibility          String    @default("PUBLIC")    // PUBLIC, MEMBERS_ONLY, HIDDEN
  
  viewCount           Int       @default(0)
  likeCount           Int       @default(0)
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([authorId])
  @@index([contentType])
  @@index([status])
}

// Migration hint:
// CREATE TABLE IF NOT EXISTS "CommunityTestimonial" (
//   "id" TEXT NOT NULL PRIMARY KEY,
//   "authorId" TEXT NOT NULL,
//   "title" TEXT NOT NULL,
//   "body" TEXT NOT NULL,
//   "originalBodyLength" INTEGER NOT NULL,
//   "contentType" TEXT NOT NULL,
//   "disclaimerInjected" BOOLEAN NOT NULL DEFAULT true,
//   "disclaimerText" TEXT NOT NULL,
//   "coverImage" TEXT,
//   "tags" TEXT NOT NULL DEFAULT '[]',
//   "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
//   "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
//   "viewCount" INTEGER NOT NULL DEFAULT 0,
//   "likeCount" INTEGER NOT NULL DEFAULT 0,
//   "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//   "updatedAt" DATETIME NOT NULL,
//   FOREIGN KEY ("authorId") REFERENCES "User"("id")
// );
```

---

## Audit

| Action | Trigger |
|---|---|
| `community.testimonial.created` | Bài chia sẻ được tạo (disclaimer auto-injected) |
| `community.testimonial.published` | Bài được publish công khai |
| `community.testimonial.flagged` | Nội dung chứa từ cấm → đánh dấu review |
| `community.testimonial.viewed` | Người dùng xem bài (track engagement) |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Author role không phải VOLUNTEER hoặc ORGANIZER (but skip auto-inject for regulars) | `auto_inject_skipped` | 200 |
| Body quá ngắn (< 50 chars) | `content_too_short` | 400 |
| Disclaimer checkbox không tick | `disclaimer_not_acknowledged` | 400 |
| Body chứa từ cấm (fundraise, scam, etc.) | `prohibited_terms_detected` | 400 |
| Failed to parse/validate markdown | `content_parse_error` | 400 |

---

## Notes for AI/codegen

- **Disclaimer text is immutable:** Store full `disclaimerText` in DB; never generate fresh on read.
- **Keyword scanning:** Use regex with case-insensitive flag; maintain blocklist in `enum DisclaimerBlocklistTerm`.
- **FE read-only zone:** Disclaimer section (after `---` separator) should be visually disabled for editing; JS prevents modification.
- **Optional: Disclaimer versioning** — If giáo lý changes in future, store `disclaimerVersion` in record to track which version was used.
- **Analytics:** Track `originalBodyLength` to measure author verbosity; useful for content quality insights.
- **Auto-inject idempotence:** If body already ends with disclaimer text, extract it; don't append duplicate.
- **Edge case:** If volunteer edits testimonial post-publish → re-validate body for prohibited terms; may need human review.

---

## Related

- [USE_CASE_ANTI_COERCION_GUARD.md](../wisdom-qa/USE_CASE_ANTI_COERCION_GUARD.md) — Complementary rule for volunteer conduct
- [USE_CASE_ZERO_MONETIZATION_FIREWALL.md](../events/USE_CASE_ZERO_MONETIZATION_FIREWALL.md) — Forbidden fundraising terms
