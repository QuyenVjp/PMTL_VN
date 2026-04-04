# Chuyển Giao Công Đức "Bạch Thoại Phật Pháp" Theo Hạn Mức — BHFF Specific Quota Transfer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Đọc sách *Bạch Thoại Phật Pháp* sinh ra năng lượng trí tuệ cực lớn. Một người tu có thể phát đại nguyện đọc một số lượng bài nhất định (VD: 500 bài) và hồi hướng công đức cho con cái/người thân để giúp họ khai mở trí tuệ.

---

## Owner module

`content` — BHFFQuotaService / DedicationPledgeEngine

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User opens [Lập Quota Đọc Hồi Hướng] | ✅ Show pledge form |
| Input: số lượng bài (VD: 500) + người nhận | ✅ Create pledge record |
| User reads BHFF article to end | ✅ Unlock transfer button |
| Time spent > 3 min + scroll to end | ✅ Button active |
| Click [Chuyển giao công đức] | ✅ Decrement quota (499/500) |
| Log to MeritLedger | ✅ Audit trail recorded |

---

## Input Contract

```typescript
interface BHFFQuotaPledge {
  userId: string;
  totalArticles: number;        // e.g., 500
  beneficiaryName: string;      // e.g., Con trai
  articlesCompleted: number;    // Auto-tracked
  articlesRemaining: number;    // Auto-calculated
}
```

---

## Progress Tracking

```
BHFF Dedication Progress:

Pledge: 500 articles for "Con trai"

Completed: ████████░░░░░░░░░░░ (125/500)
Progress: 25%

[View articles completed]
[View transfer history]
```

---

## Audit

| Action | Trigger |
|---|---|
| `bhff.quota_pledge_created` | User creates new pledge |
| `bhff.article_completed` | End of article reached |
| `bhff.quota_transferred` | User transfers merit for article |
| `bhff.quota_pledge_completed` | All articles transferred |

---

## Notes

Dedication pledge tracks and automates merit transfer for BHFF reading quota commitments.