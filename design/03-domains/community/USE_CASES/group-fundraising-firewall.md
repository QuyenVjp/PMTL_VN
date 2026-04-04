# Tường Lửa Quyên Góp Cộng Đồng Nghiêm Ngặt — Strict Group Fundraising Firewall

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Bảo vệ cộng đồng khỏi quyên góp cá nhân tư túi
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngăn chặn hoàn toàn các bài đăng/bình luận trong cộng đồng tuyên dương quyên góp tiền cá nhân hoặc mạo danh chính thức. **Phase 42 Logic 2** áp dụng **tường lửa nghiêm ngặt hơn** so với anti-scam filter:

1. **Keyword Scan + Account Detection** — phát hiện cụm từ quyên góp (gom tiền, quỹ nhóm, chuyển khoản) + số tài khoản cá nhân.
2. **Hardcoded Whitelist** — chỉ **một** tài khoản chính thức được phép: St George Bank 112879, 432033033 hoặc 432919934.
3. **Hard Block 400** — từ chối ngay lập tức với error `personal_fundraising_forbidden`.
4. **Localized Message + Official Link** — gửi message tiếng Việt chính xác + link chính thức kêu gọi đủn tiền đúng cách.

---

## Owner module

`community` — GroupFundraisingFirewall, phối hợp với `moderation` module.

---

## Actors

- `member` — đăng bài/bình luận trong cộng đồng
- `system` — regex scan + account whitelist check
- `admin` — manage official accounts (hardcoded, không thay đổi được qua UI)

---

## Trigger

- `POST /api/community/posts/create` — scan `content` trước khi lưu.
- Mỗi bài đăng được kiểm tra **trước** khi save vào database.

---

## Part 1: Fundraising Keyword Patterns

### Vietnamese Fundraising Keywords

Scan cho những cụm từ sau (case-insensitive, có dấu và không dấu):

```typescript
export const FUNDRAISING_KEYWORDS = [
  "gom tiền",      // collect money
  "quỹ nhóm",      // group fund
  "quỹ từ thiện",  // charity fund (when paired with personal account)
  "quyên góp",     // donate
  "chuyển khoản",  // transfer
  "chuyển tiền",   // transfer money
  "ủng hộ tiền",   // financial support
  "sẻ chia tiền",  // share money
  "tích góp",      // save up (for donation)
  "công đức",      // merit (when paired with money transfer)
] as const

// Normalize text: remove diacritics, lowercase
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove diacritics
}

function hasFundraisingKeyword(text: string): boolean {
  const normalized = normalizeText(text)
  return FUNDRAISING_KEYWORDS.some(kw => normalized.includes(kw))
}
```

### Personal Bank Account Patterns

Phát hiện số tài khoản ngân hàng **không** nằm trong whitelist chính thức:

```typescript
export const PERSONAL_ACCOUNT_PATTERNS = [
  // Vietnamese account formats
  /\b\d{9,19}\b/g,                          // generic: 9–19 digit number
  /\b\d{3,4}[-\s]\d{3,4}[-\s]\d{3,4}\b/g,  // formatted: xxx-xxxx-xxxx
  /STK\s*:?\s*\d{9,19}/gi,                  // "STK: 123456789"
  /số\s+tài\s+khoản\s*:?\s*\d{9,19}/gi,    // "số tài khoản: ..."
  /account\s*:?\s*\d{9,19}/gi,              // English variant
  /\bMB\s*\d{9,16}\b/gi,                    // MB Bank short
  /\bVCB\s*\d{9,16}\b/gi,                   // Vietcombank
  /\bACB\s*\d{9,16}\b/gi,                   // ACB
  /\bTPB\s*\d{9,16}\b/gi,                   // TPBank
  /\bVPB\s*\d{9,16}\b/gi,                   // VPBank
  /\bVIB\s*\d{9,16}\b/gi,                   // VIB
]

function extractAccountNumbers(text: string): string[] {
  const numbers: string[] = []
  PERSONAL_ACCOUNT_PATTERNS.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      // Normalize: remove non-digits
      const clean = match[0].replace(/\D/g, "")
      if (clean.length >= 9) {
        numbers.push(clean)
      }
    }
  })
  return [...new Set(numbers)]  // deduplicate
}
```

---

## Part 2: Official Account Whitelist (Hardcoded)

**Chỉ một tài khoản chính thức duy nhất được phép chia sẻ:**

```typescript
export const OFFICIAL_FUNDRAISING_ACCOUNT = {
  organization:   "Guan Yin Citta Dharma Door / Tổ Chức Từ Thiện Truyền Thông Đông Phương",
  country:        "Australia",
  bank:           "St George Bank",
  bsb:            "112879",
  accountNumbers: ["432033033", "432919934"],  // two valid official numbers
  accountName:    "Guan Yin Citta Dharma Door",
  officialWebsite: "https://www.facebook.com/guanyincittadharmaroom",  // or canonical charity link
  note:           "Đây là tài khoản duy nhất được Pháp Môn ủy quyền nhận quyên góp tại Úc.",
} as const

function isOfficialAccount(accountNumber: string): boolean {
  const clean = accountNumber.replace(/\D/g, "")
  return OFFICIAL_FUNDRAISING_ACCOUNT.accountNumbers.includes(clean)
}
```

**Không thể cập nhật qua CMS** — hardcoded trong service code.

---

## Part 3: Content Scan & Validation Logic

### Scan Result Type

```typescript
interface GroupFundraisingScanResult {
  hasFundraisingKeyword: boolean
  extractedAccounts:     string[]
  containsPersonalAcct:  boolean     // true nếu có account KHÔNG trong whitelist
  action:                "ALLOW" | "BLOCK"
  blockReason?:          string      // if action = BLOCK
}

function scanGroupFundraisingContent(content: string): GroupFundraisingScanResult {
  const hasKeyword = hasFundraisingKeyword(content)
  const accounts = extractAccountNumbers(content)

  // If no fundraising keyword, allow
  if (!hasKeyword) {
    return {
      hasFundraisingKeyword: false,
      extractedAccounts:     accounts,
      containsPersonalAcct:  false,
      action:                "ALLOW",
    }
  }

  // Has fundraising keyword — check accounts
  const personalAccounts = accounts.filter(acc => !isOfficialAccount(acc))

  // If keyword + personal account → BLOCK
  if (personalAccounts.length > 0) {
    return {
      hasFundraisingKeyword: true,
      extractedAccounts:     accounts,
      containsPersonalAcct:  true,
      action:                "BLOCK",
      blockReason:           `Detected fundraising keywords + non-official accounts: ${personalAccounts.join(", ")}`,
    }
  }

  // Keyword but only official accounts → ALLOW
  return {
    hasFundraisingKeyword: true,
    extractedAccounts:     accounts,
    containsPersonalAcct:  false,
    action:                "ALLOW",
  }
}
```

---

## Part 4: Request/Response DTO

### CreatePostDto (Input)

```typescript
interface CreatePostDto {
  content:       string
  postType?:     "GENERAL" | "FUNDRAISING"  // optional hint
  attachments?:  AttachmentInput[]
}
```

**Note:** `postType` là optional hint từ client; **server luôn scan content** bất kể hint.

### CreatePostResponse (Success)

```typescript
interface CreatePostResponse {
  ok:             true
  post: {
    id:           string
    publicId:     string
    content:      string
    isFundraisingPost: boolean
    approvedByAdmin?: boolean
    createdAt:    ISO8601
    status:       "PUBLISHED" | "PENDING"
  }
}
```

### CreatePostErrorResponse (Blocked)

```typescript
interface CreatePostErrorResponse {
  ok:        false
  error:     "personal_fundraising_forbidden"
  statusCode: 400
  message:   "Theo quy định của Pháp Môn, nghiêm cấm cá nhân tự ý quyên góp tịnh tài. Mọi sự ủng hộ in sách phải được chuyển thẳng đến ST GEORGE BANK của Tổ chức Từ thiện Truyền thông Đông Phương. Vui lòng bấm vào Link chính thức!"
  officialLink: string  // link to official charity donation page
}
```

---

## Part 5: Write Path (Block & Error Handling)

```
POST /api/community/posts/create
  Payload: CreatePostDto

  1. Validate content length, format (Zod schema)

  2. scanGroupFundraisingContent(content)

  3. If action = BLOCK:
       → Log audit: community.fundraising.personal-account-detected
       → Do NOT save post to database
       → Return 400 error with message + official link
       → Notify admin/moderation queue (async, fire-and-forget)

  4. If action = ALLOW:
       → Save post with:
            status = PUBLISHED (or PENDING per visibility rules)
            isFundraisingPost = hasFundraisingKeyword
            approvedByAdmin = (if user is admin/editor)
       → Log audit: community.fundraising.post-blocked (if keyword detected + official)
       → Log audit: community.fundraising.official-link-provided (if we return message)
       → Return 200 with CreatePostResponse
```

---

## Part 6: Database Schema Extension

Mở rộng `Post` schema trong Prisma:

```prisma
model Post {
  id                    String   @id @default(cuid())
  publicId              String   @unique
  communityId           String
  authorId              String
  content               String   @db.Text

  // Phase 42 Logic 2 fields
  isFundraisingPost     Boolean  @default(false)    // scanned keyword found
  approvedByAdmin       Boolean? @default(null)     // null = not by admin, true = approved, false = rejected

  status                String   @default("PUBLISHED")  // PUBLISHED, PENDING, HIDDEN
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  community             Community @relation(fields: [communityId], references: [id])
  author                User      @relation(fields: [authorId], references: [id])

  @@index([communityId])
  @@index([authorId])
  @@index([isFundraisingPost])
}
```

---

## Part 7: Audit Events

Log these audit events via structured pino logger:

| Action | Trigger | Payload |
|---|---|---|
| `community.fundraising.personal-account-detected` | Request contains fundraising keyword + personal account | `{ postId?, content preview, accounts: [...]}`  |
| `community.fundraising.post-blocked` | Post submission rejected | `{ userId, accountsDetected: [...], timestamp }` |
| `community.fundraising.official-link-provided` | Error response sent to user | `{ userId, attemptedAt, officialLink }` |

```typescript
// Example structured audit
logger.warn(
  {
    event: "community.fundraising.personal-account-detected",
    userId: req.user.id,
    content: content.substring(0, 100),
    accountsFound: personalAccounts,
  },
  "Blocked post with personal fundraising request"
)
```

---

## Error Handling

| Condition | Error code | HTTP | Message | User Action |
|---|---|---|---|---|
| Content has fundraising keyword + personal account | `personal_fundraising_forbidden` | 400 | Vietnamese disclaimer + official link | Use official account only |
| Content invalid/missing | `invalid_content` | 422 | Schema validation error | Fix input |
| Unauthorized | `unauthorized` | 401 | Must be logged in | Log in |

---

## Errors Detail

### 400 personal_fundraising_forbidden

**Tiếng Việt message:**

```
Theo quy định của Pháp Môn, nghiêm cấm cá nhân tự ý quyên góp tịnh tài.
Mọi sự ủng hộ in sách phải được chuyển thẳng đến ST GEORGE BANK
của Tổ chức Từ thiện Truyền thông Đông Phương.
Vui lòng bấm vào Link chính thức!

[Link chính thức: {officialLink}]
```

**Response JSON:**

```json
{
  "ok": false,
  "error": "personal_fundraising_forbidden",
  "statusCode": 400,
  "message": "Theo quy định của Pháp Môn...",
  "officialLink": "https://guanyincittadharmaroom.com/donate"
}
```

---

## Testing

### Unit Tests

```typescript
describe("groupFundraisingFirewall", () => {
  it("should BLOCK: fundraising keyword + personal account", () => {
    const content = "Xin mọi người gom tiền vào STK: 123456789 ngân hàng Vietcombank"
    const result = scanGroupFundraisingContent(content)
    expect(result.action).toBe("BLOCK")
    expect(result.containsPersonalAcct).toBe(true)
  })

  it("should ALLOW: fundraising keyword + official account", () => {
    const content = "Quỹ từ thiện chuyển tiền vào 432033033 St George Bank"
    const result = scanGroupFundraisingContent(content)
    expect(result.action).toBe("ALLOW")
    expect(result.containsPersonalAcct).toBe(false)
  })

  it("should ALLOW: no fundraising keyword", () => {
    const content = "Con muốn chia sẻ công đức tu tập"
    const result = scanGroupFundraisingContent(content)
    expect(result.action).toBe("ALLOW")
  })

  it("should extract account numbers correctly", () => {
    const content = "STK: 432033033 hoặc 432919934"
    const accounts = extractAccountNumbers(content)
    expect(accounts).toContain("432033033")
    expect(accounts).toContain("432919934")
  })
})
```

### Integration Tests

```typescript
describe("POST /api/community/posts/create", () => {
  it("should return 400 with personal_fundraising_forbidden", async () => {
    const response = await request(app)
      .post("/api/community/posts/create")
      .send({
        content: "Xin gom tiền vào tài khoản ngân hàng 987654321"
      })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe("personal_fundraising_forbidden")
    expect(response.body.officialLink).toBeDefined()
  })

  it("should return 200 with official account link", async () => {
    const response = await request(app)
      .post("/api/community/posts/create")
      .send({
        content: "Mọi người chuyển tiền vào 432033033 St George Bank"
      })

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.post.isFundraisingPost).toBe(true)
  })
})
```

---

## Notes for AI/codegen

- `OFFICIAL_FUNDRAISING_ACCOUNT` và `FUNDRAISING_KEYWORDS` là **hardcoded constants** — không được phép thay đổi qua CMS hoặc config.
- **Ngăn chặn hoàn toàn** (hard block 400) — không có auto-hide hoặc moderator review queue. User biết ngay tại sao bài không được đăng.
- Message phải **tiếng Việt chính xác** với dấu và from official Pháp Môn.
- Scan áp dụng cho mọi **POST** request tạo post mới, cũng như **PATCH** edit bài.
- `isFundraisingPost` boolean flag dùng để:
  1. Tìm kiếm/filter bài có liên quan quyên góp trong admin console.
  2. Hiển thị note khác nhau nếu cần (frontend decision).
  3. Audit trail — để biết hệ thống từng phát hiện fundraising keyword.
- Không cần email notification hay SMS — error trả về ngay tại client.
- Anti-evasion: Nếu user thay dấu, cách chữ, hoặc viết tắt — text normalization (remove diacritics) sẽ bắt.
- Account number extraction phải `deduplicate` (Set) — để tránh log duplicate trong audit.
- `officialLink` nên trỏ đến trang chính thức từ thiện có form donate hoặc qr code chính thức.

---

## Integration with Moderation Module

Mặc dù Logic 2 **block ngay lập tức**, vẫn cần async notification để admin biết:

```typescript
// Fire-and-forget notification
queueModerationAlert({
  type:          "PERSONAL_FUNDRAISING_ATTEMPTED",
  userId:        req.user.id,
  content:       req.body.content,
  accountsDetected: personalAccounts,
  timestamp:     new Date(),
})
```

Admin có thể:
1. Xem danh sách các lần user vi phạm.
2. Cảnh báo user lần thứ hai.
3. Suspend user nếu lặp lại.

---

## Comparison with anti-scam-donation-filter.md

| Feature | anti-scam | fundraising-firewall |
|---|---|---|
| Trigger | Any bank account in post | Fundraising keyword + personal account |
| Action | Auto-hide (silent) | Hard block (400 error) |
| User feedback | None (anti-evasion) | Full message + official link |
| Scope | Post + comment | Post (Phase 42) |
| Whitelist | ABN + BSB | Official account only |
| Moderator review | Yes (queue) | No (instant reject) |
| Message language | None | Vietnamese official |

