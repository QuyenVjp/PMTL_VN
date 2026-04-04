# AI Firewall Chống Sai Lệch Giáo Lý — Doctrine Heresy Moderation Firewall

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 585, 672, 673)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Cộng đồng PMTL là không gian Chánh Pháp. Bất kỳ nội dung nào xúi giục sửa đổi kích thước NNN, thay đổi viền đen, dùng đồ kim loại để đốt, hoặc khuyến khích niệm sai giờ phải được phát hiện và xử lý trước khi lan rộng. Hệ thống tự động shadowban nội dung vi phạm và đưa vào hàng đợi Admin duyệt.

---

## Owner module

`engagement` — CommunityModerationService / DoctrineFirewall
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đăng post/comment trong cộng đồng
- `system` — DoctrineFirewall scanner, chạy async sau mỗi content submission
- `admin` — duyệt hàng đợi vi phạm, approve hoặc remove

---

## Trigger

Sau mỗi `POST /api/engagement/community/posts` hoặc `POST /api/engagement/community/comments` — scanner chạy async (không block response).

---

## Doctrine Violation Patterns (hardcoded)

```typescript
interface DoctrineViolationPattern {
  id:       string
  keywords: string[]    // substring match, lowercase, normalized
  severity: 'HIGH' | 'MEDIUM'
  category: string
  reason:   string
}

export const DOCTRINE_VIOLATION_RULES: DoctrineViolationPattern[] = [
  {
    id:       'nnn-size-modification',
    keywords: ['thay đổi kích thước ngôi nhà nhỏ', 'đổi size nnn', 'làm to hơn', 'làm nhỏ hơn', 'a4 thay vì a5'],
    severity: 'HIGH',
    category: 'NNN_TAMPERING',
    reason:   'Kích thước NNN đã được quy định cố định — không được thay đổi',
  },
  {
    id:       'nnn-border-modification',
    keywords: ['bỏ viền đen', 'không cần viền', 'viền màu khác', 'xóa viền'],
    severity: 'HIGH',
    category: 'NNN_TAMPERING',
    reason:   'Viền đen NNN là bắt buộc — không được thay đổi màu hoặc xóa bỏ',
  },
  {
    id:       'metal-container-burn',
    keywords: ['đốt bằng thau', 'đốt bằng chảo', 'đốt bằng nồi', 'đốt thùng kim loại', 'đốt bằng lon'],
    severity: 'HIGH',
    category: 'BURN_PROTOCOL_VIOLATION',
    reason:   'Cấm dùng đồ kim loại để đốt NNN — phải dùng chậu đất hoặc sành',
  },
  {
    id:       'nighttime-vang-sanh-recitation',
    keywords: ['niệm vãng sanh ban đêm', 'đọc vãng sanh lúc tối', 'vãng sanh chú buổi tối', 'niệm vãng sanh 2 giờ sáng', 'niệm vãng sanh khuya'],
    severity: 'HIGH',
    category: 'RECITATION_TIME_VIOLATION',
    reason:   'Vãng Sanh Chú chỉ niệm ban ngày — tuyệt đối không niệm ban đêm',
  },
  {
    id:       'heart-sutra-late-night',
    keywords: ['niệm tâm kinh 2 giờ sáng', 'đọc tâm kinh lúc 2h', 'niệm tâm kinh khuya', 'tâm kinh ban đêm'],
    severity: 'MEDIUM',
    category: 'RECITATION_TIME_VIOLATION',
    reason:   'Tâm Kinh không nên niệm trong yin-time deadzone (2–5 giờ sáng)',
  },
  {
    id:       'nnn-quantity-reduction',
    keywords: ['niệm ít hơn 49', 'giảm số lượng nnn', 'không cần đủ số', 'niệm vài tờ là đủ'],
    severity: 'MEDIUM',
    category: 'QUOTA_TAMPERING',
    reason:   'Số lượng NNN tối thiểu không được giảm tùy tiện',
  },
]
```

---

## Input Contract

Không có user input — scanner chạy async sau content submission.

```typescript
interface ScanContentDto {
  contentId:   string
  contentType: 'POST' | 'COMMENT'
  text:        string
  authorId:    string
}

interface ScanResult {
  violations: DoctrineViolation[]
  action:     'NONE' | 'SHADOWBAN' | 'HARD_REMOVE'
}
```

---

## Write Path

```
--- Async Job: DoctrineFirewall.scan(dto) ---

1. Normalize text: toLowerCase(), remove diacritics for matching
2. For each rule in DOCTRINE_VIOLATION_RULES:
   - Check if any keyword is substring of normalized text
   - If matched: push to violations[]

3. If violations.length > 0:
   a. Update Content: shadowbanned = true (ẩn khỏi feed, chỉ author thấy)
   b. Create ModerationQueue entry:
      {
        contentId, contentType, authorId,
        violations: violations[],
        status: 'PENDING_REVIEW',
        detectedAt: now()
      }
   c. Audit: moderation.doctrine-violation.detected
   d. Notify admin via push/email: new doctrine violation queued

4. If no violations:
   a. Content stays visible
   b. No further action
```

---

## FE Behavior

### Khi content bị shadowban

**Author perspective:** Bài viết vẫn hiển thị bình thường cho chính author — họ không biết bị shadowban. Đây là intentional để tránh vi phạm cố tình edit để bypass.

**Community perspective:** Bài viết không xuất hiện trong feed và search.

### Admin Moderation Queue

```
┌──────────────────────────────────────────────────────────┐
│ ⚠️  Vi Phạm Giáo Lý — Chờ Duyệt                         │
│──────────────────────────────────────────────────────────│
│ Nội dung: "...đốt bằng thau nhôm thì sao..."            │
│ Tác giả:  user_xxx                                       │
│ Phát hiện: 04/04/2026 14:32                             │
│                                                          │
│ Vi phạm phát hiện:                                       │
│  🔴 [HIGH] BURN_PROTOCOL_VIOLATION                      │
│     "Cấm dùng đồ kim loại để đốt NNN"                   │
│                                                          │
│  [✅ Approve — Không vi phạm]  [❌ Xác nhận vi phạm]   │
│  [🚫 Xóa bài viết]             [⚠️ Nhắn tin cảnh báo]   │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model ModerationQueue {
  id            String   @id @default(cuid())
  contentId     String
  contentType   String   // "POST" | "COMMENT"
  authorId      String
  violations    Json     // DoctrineViolation[]
  status        String   @default("PENDING_REVIEW")  // PENDING_REVIEW | APPROVED | CONFIRMED_VIOLATION | REMOVED
  reviewedById  String?
  reviewedAt    DateTime?
  detectedAt    DateTime @default(now())
}

// Add to Post / Comment models:
// shadowbanned Boolean @default(false)
// shadowbannedAt DateTime?
```

---

## Audit

| Action | Trigger |
|---|---|
| `moderation.doctrine-violation.detected` | Scanner phát hiện vi phạm |
| `moderation.doctrine-violation.shadowbanned` | Content bị shadowban |
| `moderation.doctrine-violation.approved` | Admin duyệt — không vi phạm |
| `moderation.doctrine-violation.confirmed` | Admin xác nhận vi phạm |
| `moderation.doctrine-violation.removed` | Admin xóa nội dung |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Scanner fail (nội bộ) | `moderation_scan_error` | 500 (log only, không expose) |

---

## Notes for AI/codegen

- `DOCTRINE_VIOLATION_RULES` là **hardcoded constant** — không phải CMS. Chỉ super-admin developer có thể thêm rule mới.
- Scanner chạy **async** — không block content submission API response. False positive rate được accept ở Phase 1 vì admin review là mandatory trước khi action.
- **Shadowban is NOT hard remove** — admin phải confirm trước khi xóa. Author tiếp tục thấy bài của mình.
- Phase 2+: tích hợp LLM classifier để giảm false positive rate và xử lý paraphrase (ví dụ: "thùng nhôm" thay vì "thau nhôm").
- Meilisearch sync phải **skip shadowbanned content** — không index vào search.

---

## Related

- [burn-container-sanitization-protocol.md](./burn-container-sanitization-protocol.md) — quy tắc vật liệu đốt
- [metal-container-ban.md](./metal-container-ban.md) — cấm kim loại
- [yin-time-anti-spoofing-guard.md](../../content/USE_CASES/yin-time-anti-spoofing-guard.md) — yin-time enforcement
