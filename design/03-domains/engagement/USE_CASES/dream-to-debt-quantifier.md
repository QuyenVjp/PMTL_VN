# Định Lượng Nợ Nghiệp Từ Giấc Mơ — Dream-to-Debt Quantifier

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Hướng dẫn giải mộng và Tiểu Phương Tử
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Giấc mơ trong PMTL là tín hiệu từ oan gia trái chủ và vong linh người thân. Mỗi loại giấc mơ có **số lượng NNN (Tiểu Phương Tử) cụ thể** cần niệm để hóa giải. Hệ thống tự động map dream tag → số NNN cần thiết → inject vào `DebtLedger` của user.

---

## Owner module

`engagement` — DreamJournal + DebtLedger
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — ghi lại giấc mơ và tag loại
- `system` — map tag → NNN quantity, inject prescription, hiển thị suggestion

---

## Dream Tag → NNN Mapping Table

| Dream Tag | Mô tả | NNN tối thiểu | Ghi chú |
|---|---|---|---|
| `UNKNOWN_BLACK_CLOTHED` | Người lạ mặc áo đen | **4 tấm** | Kính tặng: Người cần kinh của [Tên user] |
| `DECEASED_FRIEND_OR_RELATIVE` | Người quen / họ hàng đã khuất | **7 tấm** | Kính tặng: [Tên người đã khuất] |
| `REALM_ASCENSION_REQUESTED` | Muốn siêu độ người thân lên cõi cao hơn | **21 tấm** | Kính tặng: [Tên người đã khuất] |

> **Quan trọng:** `REALM_ASCENSION_REQUESTED` không phải dream tag riêng — đây là **upgrade option** khi user đã có tag `DECEASED_FRIEND_OR_RELATIVE`. User chủ động chọn nâng lên 21 tấm từ suggestion banner.

---

## Write Path

```
POST /api/engagement/dream-journals
─────────────────────────────────────
Body: {
  dreamDate:     Date
  dreamContent:  string        // mô tả tự do
  tags:          DreamTag[]    // có thể multi-tag
  beneficiaryNames?: string[]  // tên người thân xuất hiện trong mơ
}

1. Validate schema.
2. Tạo DreamJournal record.
3. Với mỗi tag ∈ tags:
   a. Lookup NNN_PRESCRIPTION_MAP[tag].
   b. Nếu có prescription:
      → Tạo DebtLedgerEntry:
        {
          userId,
          dreamJournalId,
          source:          "DREAM_ANALYSIS",
          dreamTag:        tag,
          recommendedNNN:  quantity,
          offerToTemplate: template,
          beneficiaryName: beneficiaryNames[0] nếu có,
          status:          "PENDING"
        }
4. Return { debtEntries, suggestions }.
```

### NNN Prescription Map

```typescript
const NNN_PRESCRIPTION_MAP: Record<DreamTag, {
  quantity: number,
  offerToTemplate: OfferToTemplate,
  showRealmAscensionSuggestion: boolean
}> = {
  UNKNOWN_BLACK_CLOTHED: {
    quantity: 4,
    offerToTemplate: "KARMIC_CREDITOR_SELF",
    showRealmAscensionSuggestion: false
  },
  DECEASED_FRIEND_OR_RELATIVE: {
    quantity: 7,
    offerToTemplate: "DECEASED_PERSON",
    showRealmAscensionSuggestion: true   // ← hiện suggestion 21 tấm
  }
}
```

---

## Suggestion Banner — Realm Ascension Upgrade

Khi tag = `DECEASED_FRIEND_OR_RELATIVE`, response kèm `suggestionBanner`:

```json
{
  "suggestionBanner": {
    "active": true,
    "type": "REALM_ASCENSION",
    "currentRecommendation": 7,
    "upgradeTo": 21,
    "message": "Hệ thống khuyến nghị bạn nên hoàn thành 21 tấm nếu muốn nâng [Tên người thân] lên cõi cao hơn (Siêu độ lên Realm cao).",
    "upgradeAction": "Chọn 21 tấm",
    "keepAction": "Giữ 7 tấm (tối thiểu)"
  }
}
```

FE render suggestion banner dưới phần prescription:

```
┌──────────────────────────────────────────────────────────┐
│  📋  Đã thêm vào Sổ Nợ: 7 tấm NNN                      │
│  Kính tặng: [Tên người đã khuất]                        │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  💡  Gợi ý nâng cấp:                                    │
│                                                          │
│  Nếu bạn muốn siêu độ [Tên người thân] lên cõi         │
│  cao hơn, hệ thống khuyến nghị hoàn thành               │
│  21 tấm NNN thay vì 7 tấm.                             │
│                                                          │
│  [Nâng lên 21 tấm]     [Giữ 7 tấm]                    │
└──────────────────────────────────────────────────────────┘
```

---

## DebtLedger Schema

```prisma
model DebtLedgerEntry {
  id                 String           @id @default(cuid())
  userId             String
  dreamJournalId     String?          // nullable — có thể từ nguồn khác
  source             DebtSource
  dreamTag           String?
  recommendedNNN     Int
  finalNNN           Int?             // sau khi user confirm / upgrade
  offerToTemplate    OfferToTemplate
  beneficiaryName    String?
  status             DebtEntryStatus  @default(PENDING)
  createdAt          DateTime         @default(now())
  fulfilledAt        DateTime?

  user               User             @relation(fields: [userId], references: [id])
  dreamJournal       DreamJournal?    @relation(fields: [dreamJournalId], references: [id])
}

model DreamJournal {
  id             String          @id @default(cuid())
  userId         String
  dreamDate      DateTime
  dreamContent   String
  tags           String[]        // DreamTag enum values stored as strings
  createdAt      DateTime        @default(now())

  debtEntries    DebtLedgerEntry[]
  user           User            @relation(fields: [userId], references: [id])
}

enum DebtSource {
  DREAM_ANALYSIS
  MANUAL
  ADMIN_PRESCRIBED
}

enum DebtEntryStatus {
  PENDING          // chưa bắt đầu niệm
  IN_PROGRESS      // đang niệm
  FULFILLED        // đã hoàn thành đủ số NNN
}

enum DreamTag {
  UNKNOWN_BLACK_CLOTHED
  DECEASED_FRIEND_OR_RELATIVE
  OTHER
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `dream-journal.created` | User lưu giấc mơ |
| `debt-ledger.nnn-prescribed` | Auto-inject NNN prescription |
| `debt-ledger.realm-ascension-upgraded` | User chọn nâng lên 21 tấm |
| `debt-ledger.realm-ascension-declined` | User giữ 7 tấm |

---

## Notes for AI/codegen

- `tags: String[]` trong Prisma thay vì relation table — đơn giản hơn cho Phase 1 vì tag set nhỏ và không cần query ngược.
- `NNN_PRESCRIPTION_MAP` nên là `SystemConfig` JSON để admin có thể điều chỉnh số lượng NNN theo tag mà không cần deploy lại.
- `finalNNN` được set khi user confirm (7 hoặc 21) — `recommendedNNN` là giá trị ban đầu hệ thống inject, không bao giờ bị ghi đè (audit integrity).
- Phase 2+: thêm more dream tags khi có thêm khai thị từ nguồn PMTL chính thức.

---

## Related

- [little-house-anti-theft-field-lock.md](./little-house-anti-theft-field-lock.md) — offeredBy lock khi niệm NNN
- [little-house-recipient-syntax-validator.md](./little-house-recipient-syntax-validator.md) — Cú pháp Kính tặng
- [manage-ngoi-nha-nho-sheet.md](./manage-ngoi-nha-nho-sheet.md) — Core NNN flow
