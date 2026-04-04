# Bộ Lọc Chống Lừa Đảo Quyên Góp — Anti-Scam Donation Filter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Bảo vệ đồng tu khỏi lừa đảo tài chính
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Ngăn chặn các bài đăng và bình luận trong cộng đồng có nội dung kêu gọi quyên góp tiền riêng tư hoặc mạo danh tổ chức. Đây là vấn đề nghiêm trọng — đồng tu bị lừa mất tiền dưới danh nghĩa công đức.

Hệ thống thực hiện:
1. **Bank Account Regex Filter** — phát hiện số tài khoản ngân hàng trong nội dung bài đăng/bình luận.
2. **Official Account Whitelist** — hardcode tài khoản ngân hàng chính thức duy nhất.
3. **Auto-hide & Flag** — ẩn nội dung vi phạm, chuyển moderator review.

---

## Owner module

`community` — post/comment content moderation; phối hợp với `moderation` module.

---

## Actors

- `member` — đăng bài/bình luận
- `system` — auto-detect, auto-hide
- `moderator` / `admin` — review queue

---

## Part 1: Bank Account Regex Filter

### Patterns cần detect

```typescript
export const BANK_ACCOUNT_PATTERNS = [
  // Vietnamese bank account formats
  /\b\d{9,19}\b/g,                          // generic: 9–19 digit number
  /\b\d{3,4}[-\s]\d{3,4}[-\s]\d{3,4}\b/g,  // formatted: xxx-xxxx-xxxx
  /STK\s*:?\s*\d{9,19}/gi,                  // explicit "STK: 123456789"
  /số\s+tài\s+khoản\s*:?\s*\d{9,19}/gi,    // "số tài khoản: ..."
  /account\s*:?\s*\d{9,19}/gi,              // English variant
  /BSB\s*:?\s*\d{6}/gi,                     // Australian BSB format
  /\bMB\s*\d{9,16}\b/gi,                    // MB Bank short format
  /\bVCB\s*\d{9,16}\b/gi,                   // Vietcombank short format
  /\bACB\s*\d{9,16}\b/gi,                   // ACB short format
  /\bTP\s*Bank\s*\d{9,16}\b/gi,            // TPBank
]

function containsBankAccount(text: string): boolean {
  return BANK_ACCOUNT_PATTERNS.some(pattern => pattern.test(text))
}
```

### False positive mitigation

Nếu số tài khoản match **chính xác** với tài khoản whitelist chính thức → KHÔNG flag (cho phép chia sẻ thông tin quyên góp chính thức).

```typescript
const OFFICIAL_ACCOUNTS_WHITELIST = new Set([
  "96169422664",  // ABN chính thức (Úc)
  "112879",       // BSB St George Bank (Úc)
])

function isOfficialAccount(extractedNumber: string): boolean {
  return OFFICIAL_ACCOUNTS_WHITELIST.has(extractedNumber.replace(/\D/g, ""))
}
```

---

## Part 2: Official Account Reference (Hardcoded)

Tổ chức chỉ có **một** kênh quyên góp chính thức tại Úc:

```typescript
export const OFFICIAL_DONATION_INFO = {
  organization:  "Guan Yin Citta Dharma Door",
  country:       "Australia",
  bank:          "St George Bank",
  bsb:           "112879",
  accountNumber: "96169422664",
  accountName:   "Guan Yin Citta Dharma Door",
  note:          "Đây là tài khoản duy nhất được Pháp Môn ủy quyền nhận quyên góp tại Úc.",
} as const
```

Thông tin này được **render trong trang chính thức** (không phải từ DB) để không thể bị giả mạo qua CMS.

---

## Part 3: Content Scan & Auto-hide Flow

### Trigger

- `POST /api/community/posts` — scan content trước khi publish.
- `POST /api/community/comments` — scan comment trước khi publish.
- Retroactive scan: cron mỗi 6h scan posts `status = PUBLISHED` và `createdAt < 1h ago` (để bắt delayed bypass).

### Scan logic

```typescript
interface ContentScanResult {
  hasBankAccount:     boolean
  isOfficialAccount:  boolean  // true nếu match whitelist
  extractedNumbers:   string[]
  action:             "ALLOW" | "FLAG_FOR_REVIEW" | "AUTO_HIDE"
}

function scanContent(text: string): ContentScanResult {
  const numbers = extractNumbers(text)   // extract all candidate numbers

  if (numbers.length === 0) {
    return { hasBankAccount: false, isOfficialAccount: false, extractedNumbers: [], action: "ALLOW" }
  }

  const allOfficial = numbers.every(n => isOfficialAccount(n))

  return {
    hasBankAccount:    true,
    isOfficialAccount: allOfficial,
    extractedNumbers:  numbers,
    action:            allOfficial ? "ALLOW" : "AUTO_HIDE",
  }
}
```

### Write path

```
POST /api/community/posts
  1. Save post with status = DRAFT
  2. scanContent(post.content)
  3. If action = AUTO_HIDE:
       → post.status = HIDDEN
       → Create ModerationReport with reason = "SUSPECTED_SCAM_DONATION"
       → Notify moderator queue
       → Return success to user (không thông báo bị ẩn — anti-evasion)
  4. If action = ALLOW:
       → post.status = PUBLISHED
  5. Audit: community.post.scam-scan.result
```

**Không thông báo cho user** rằng bài bị ẩn vì lý do scam — để tránh kẻ xấu tìm cách bypass.

---

## Part 4: Moderator Review Queue

Bài bị auto-hide xuất hiện trong admin moderation queue với tag `SUSPECTED_SCAM`:

```
[Bài viết #12345] — ⚠️ SUSPECTED_SCAM_DONATION
Người đăng: [user]
Nội dung: "...STK: 123456789 ngân hàng..."
Số tài khoản phát hiện: [123456789]
[Phê duyệt — nội dung hợp lệ]  [Xác nhận xóa — vi phạm]  [Cảnh báo user]
```

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Không có lỗi hiển thị (auto-hide im lặng) | — | 200 | Anti-evasion design |
| Content quá dài | `content_too_long` | 422 | Rút ngắn nội dung |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Trigger |
|---|---|
| `community.post.scam-scan.passed` | Scan không phát hiện vấn đề |
| `community.post.scam-scan.auto-hidden` | Bài bị ẩn vì số tài khoản đáng ngờ |
| `community.post.scam-scan.official-allowed` | Số tài khoản chính thức được cho phép |
| `community.moderation.scam-confirmed` | Moderator xác nhận vi phạm |
| `community.moderation.scam-cleared` | Moderator xác nhận hợp lệ |

---

## Notes for AI/codegen

- `OFFICIAL_ACCOUNTS_WHITELIST` và `OFFICIAL_DONATION_INFO` là **hardcoded constants** trong service — không phải DB config. Admin không được thay đổi qua CMS.
- Auto-hide **im lặng** với user là intentional — không return error, return 200 như bình thường.
- Retroactive cron scan cần rate limit để không overload — process max 100 posts/minute.
- `extractNumbers()` phải strip formatting trước khi compare (dấu `-`, space, dấu chấm).
- Pattern `/\b\d{9,19}\b/` có thể match số điện thoại dài — cần context filter (nếu đi kèm từ khóa "tài khoản", "bank", "chuyển khoản", "donation", "quyên góp" thì mới flag mạnh hơn).
- Scan áp dụng cho cả **edit** bài đăng — không chỉ lúc tạo mới.
