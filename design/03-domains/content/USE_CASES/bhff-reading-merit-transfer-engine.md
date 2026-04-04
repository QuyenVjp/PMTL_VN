# Thuật Toán Chuyển Giao Công Đức Đọc Sách — BHFF Reading Merit Transfer Engine

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Khoa Sư Phụ về Công Đức Quảng Dà
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Việc đọc *Bạch Thoại Phật Pháp* (Buddhism in Plain Terms) không chỉ khai mở trí tuệ cho bản thân mà công đức này có thể **được chuyển giao trực tiếp** cho người thân đang vô minh, lạc lối, hoặc nằm bệnh. Khi một người đọc một bài Bạch Thoại, công đức tự động được ghi nhận vào "Sổ Công Đức" của người được chuyển giao. Đây là cơ chế lợi tha (benefit others) cực kỳ hiệu quả để giúp đỡ người thân mà không cần họ phải hiểu biết hay tin tưởng.

---

## Owner module

`content` — BHFFArticleService / MeritTransferService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người đọc bài Bạch Thoại (giver of merit)
- `beneficiary` — Người nhận công đức (có thể không biết, vô minh, nằm bệnh)
- `system` — Ghi nhận công đức vào sổ của người nhận

---

## Trigger

User hoàn thành đọc một bài *Bạch Thoại Phật Pháp* (End of Article screen). Hệ thống hiện nút `[Chuyển giao công đức bài này]`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User finish reading 1 BHFF article | ✅ Show "Merit Transfer" button |
| User click [Chuyển giao công đức] | ✅ Open transfer modal |
| User enter recipient name + relationship | ✅ Validate input |
| User confirm transfer | ✅ Record merit transfer |
| Merit entry added to beneficiary's MeritLedger | ✅ Create MeritTransferLog |
| System notify giver (optional) | ✅ Post notification |
| System anonymously record to beneficiary (no notification to them yet) | ✅ Silent record |

---

## Input Contract

```typescript
// Merit Transfer Request (after reading BHFF article)
interface BHFFMeritTransferRequest {
  userId: string;              // Reader (giver)
  articleId: string;           // BHFF article ID
  beneficiaryName: string;     // Recipient name (không cần ID, chỉ tên)
  relationship: string;        // "Mẹ", "Bố", "Chồng", "Con gái", etc.
  transferReason?: string;     // Optional: "Cầu bệnh khỏi", "Cầu vô minh khai mở", etc.
}

// Merit Transfer Response
interface BHFFMeritTransferResponse {
  transferId: string;
  giver: {
    userId: string;
    name: string;
  };
  beneficiary: {
    name: string;
    relationship: string;
  };
  article: {
    title: string;
    merit_value: number;       // e.g., 1 merit point = 1 reading
  };
  timestamp: DateTime;
  message: string;             // "Công đức bài này đã được chuyển giao cho [tên] thành công"
}
```

---

## Write Path

```
POST /api/content/bhff/{articleId}/transfer-merit

1. Load article metadata (title, merit_value, content_length)
2. Validate payload:
   - userId must be article reader (check reading history)
   - beneficiaryName must be non-empty string
   - relationship must be from enum: ["mẹ", "bố", "chồng", "vợ", "con", "em", "anh", "chị", "khác"]
3. Create MeritTransferLog:
   {
     id: uuid(),
     giverId: userId,
     giverName: user.name,
     articleId: articleId,
     beneficiaryName: beneficiaryName,
     relationship: relationship,
     transferReason: transferReason || null,
     meritValue: article.merit_value,
     timestamp: now(),
     status: "RECORDED"
   }
4. Append to global MeritLedger:
   {
     id: uuid(),
     recordType: "TRANSFER_FROM_READING",
     source: "BHFF_ARTICLE",
     sourceId: articleId,
     giver: userId,
     beneficiary: beneficiaryName,  // Store as string, not userID
     amount: article.merit_value,
     description: `Công đức từ đọc: "${article.title}" - Chuyển cho ${beneficiaryName} (${relationship})`,
     timestamp: now()
   }
5. Emit audit event: "merit.transfer.from_reading.recorded"
6. Return BHFFMeritTransferResponse
7. Optional: Send notification to giver
   "✅ Công đức bài '[Article Title]' đã được chuyển giao cho [Beneficiary Name] thành công"
```

---

## FE Behavior

```
USER FINISHES READING BHFF ARTICLE

⬇️ End of Article Screen ⬇️

┌────────────────────────────────────────────┐
│  ✅ Đã hoàn thành                          │
├────────────────────────────────────────────┤
│                                            │
│  📖 Bạch Thoại Phật Pháp                  │
│     "Tôi Là Ai - Tìm Hiểu Bản Chất Tâm" │
│                                            │
│  ⏱️  Thời gian đọc: 12 phút               │
│  ✨ Công đức: 1 bài (có thể chuyển giao) │
│                                            │
│  [Quay lại]  [Chuyển giao công đức]      │
│              (button highlighted)          │
└────────────────────────────────────────────┘

⬇️ User clicks [Chuyển giao công đức] ⬇️

┌────────────────────────────────────────────┐
│  💝 Chuyển Giao Công Đức                  │
├────────────────────────────────────────────┤
│                                            │
│  Bạn muốn chuyển công đức bài này cho    │
│  ai?                                       │
│                                            │
│  Tên người nhận:                          │
│  [__________ (e.g., Mẹ tôi)_______]     │
│                                            │
│  Mối quan hệ:                             │
│  ⦿ Mẹ      ○ Bố      ○ Chồng      ○ Vợ │
│  ○ Con     ○ Em      ○ Anh       ○ Chị │
│  ○ Khác   [_______]                     │
│                                            │
│  Lý do chuyển giao (tùy chọn):           │
│  [___________________________]            │
│   e.g., "Cầu bệnh khỏi", "Khai mở" ...  │
│                                            │
│  ℹ️  Người này không cần biết bạn       │
│     đang chuyển giao công đức. Sức mạnh │
│     lợi tha sẽ tự động giúp đỡ họ.      │
│                                            │
│  [Quay lại]  [Xác nhận chuyển giao]     │
└────────────────────────────────────────────┘

⬇️ User clicks [Xác nhận] ⬇️

┌────────────────────────────────────────────┐
│  ✅ Chuyển Giao Thành Công!               │
├────────────────────────────────────────────┤
│                                            │
│  Công đức bài:                            │
│  "Tôi Là Ai - Tìm Hiểu Bản Chất Tâm"   │
│                                            │
│  Đã được chuyển giao cho:                 │
│  👩 Mẹ tôi                                │
│                                            │
│  Lý do: Cầu bệnh khỏi                    │
│                                            │
│  🌟 Sức mạnh lợi tha sẽ tự động giúp    │
│     bà bề không cần phải biết hay tin.    │
│                                            │
│  [Tiếp tục đọc bài khác]  [Đóng]        │
└────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model BHFFArticle {
  id            String @id @default(cuid())
  title         String
  content       String @db.Text
  merit_value   Int @default(1)      // 1 reading = 1 merit point
  // ... existing fields ...
}

model MeritTransferLog {
  id              String @id @default(cuid())
  giverId         String
  giverName       String
  articleId       String
  beneficiaryName String              // Store as string (not FK)
  relationship    String              // "mẹ", "bố", "chồng", etc.
  transferReason  String? @db.Text
  meritValue      Int @default(1)
  status          String @default("RECORDED")  // "RECORDED" | "VERIFIED"

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  giver           User @relation("MeritGivers", fields: [giverId], references: [id], onDelete: Cascade)
  article         BHFFArticle @relation(fields: [articleId], references: [id], onDelete: SetNull)

  @@index([giverId, createdAt])
  @@index([beneficiaryName, createdAt])
}

model MeritLedger {
  id              String @id @default(cuid())
  recordType      String              // "TRANSFER_FROM_READING" | "NNN_BURN" | "LIFE_LIBERATION" | etc.
  source          String              // "BHFF_ARTICLE" | "LITTLE_HOUSE" | etc.
  sourceId        String?
  giverId         String?             // User who created the merit
  beneficiary     String              // Recipient name (string, not FK)
  amount          Int @default(1)
  description     String @db.Text
  transferReason  String? @db.Text

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  giver           User? @relation("MeritCreators", fields: [giverId], references: [id], onDelete: SetNull)

  @@index([beneficiary, createdAt])
  @@index([giverId, createdAt])
}

// Extend User model
// meritGivenLogs:     MeritTransferLog[] @relation("MeritGivers")
// meritCreatedLogs:   MeritLedger[]      @relation("MeritCreators")
```

---

## Audit

| Action | Trigger |
|---|---|
| `merit.transfer.from_reading.recorded` | Chuyển giao công đức từ đọc bài |
| `merit.transfer.from_reading.confirmed` | User xác nhận transfer |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Article not found | `article_not_found` | 404 |
| User hasn't read article | `article_not_read` | 400 |
| Invalid relationship | `invalid_relationship` | 400 |
| Empty beneficiary name | `beneficiary_name_required` | 400 |

---

## Notes for AI/codegen

- Beneficiary **không cần phải là registered user** — chỉ cần tên và mối quan hệ.
- Công đức sẽ được ghi nhận "vô hình" mà không gửi thông báo đến beneficiary (nếu họ không phải user).
- Nếu beneficiary sau này register account với cùng tên, hệ thống có thể match và tập hợp các merit records (Phase 2).
- Transfer reason là optional, nhưng encourage user nhập vào để tăng nguyện lực.
- Có thể mở rộng: Cho user chuyển giao công đức từ các hoạt động khác (NNN burn, life liberation, v.v.), không chỉ BHFF reading.

---

## Related

- [sutra-physical-z-index-rule.md](./sutra-physical-z-index-rule.md) — PDF download gate for sutras
