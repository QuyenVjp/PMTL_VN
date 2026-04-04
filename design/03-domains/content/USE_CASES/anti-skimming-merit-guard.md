# Chống Đọc Lướt Mất Công Đức — Anti-Skimming Merit Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Đọc lướt bài BHFF mà không thấm nhuần nội dung không tạo ra công đức. Hệ thống tính toán `estimatedReadTime` dựa trên độ dài bài viết, và chỉ bật nút "Chuyển Giao Công Đức" khi user đã đọc tối thiểu 30% thời gian ước tính.

---

## Owner module

`content` — BHFFService / ReadingTimeValidator
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đọc bài BHFF, muốn transfer công đức
- `system` — theo dõi thời gian đọc, khóa/mở nút transfer

---

## Trigger

Khi user cuộn đến cuối bài BHFF và cố nhấn nút "Chuyển Giao Công Đức".

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Bài viết tải xong | ✅ Ghi nhận `articleOpenedAt` timestamp |
| User cuộn đến cuối | ⏱️ Kiểm tra elapsed time |
| elapsed < 30% estimatedReadTime | ❌ Disable nút transfer, hiện tooltip |
| elapsed ≥ 30% estimatedReadTime | ✅ Enable nút transfer |
| User cuộn lên xuống nhiều lần | ✅ Timer chạy liên tục từ lúc mở |
| Article đã đọc trước đó (readCount ≥ 1) | ✅ 30% vẫn áp dụng mỗi lần |

---

## Input Contract

```typescript
// FE-only state (no API required for time check)
interface ArticleReadingState {
  articleId: string
  openedAt: Date
  estimatedReadTimeMinutes: number
  scrolledToBottom: boolean
  elapsedMinutes: number
  readingProgress: number  // 0.0 - 1.0 (elapsedTime / estimatedTime)
}

function isTransferAllowed(state: ArticleReadingState): boolean {
  return state.readingProgress >= 0.3
}

// Server-side: calculate estimated time before serving article
function calculateEstimatedReadTime(content: string): number {
  const wordCount = content.split(/\s+/).length
  const avgWordsPerMinute = 200
  const reflectionBuffer = 1.2  // 20% buffer for Buddhist text
  return Math.ceil((wordCount / avgWordsPerMinute) * reflectionBuffer)
}
```

---

## Write Path

```
// FE-only time validation — no server roundtrip for guard itself
// Timer starts at article open; check at scroll-to-bottom event

GET /api/content/bhff/:articleId
→ Returns: { ...article, estimatedReadTimeMinutes: number }

POST /api/content/bhff/:articleId/transfer-merit
1. FE validates: elapsedMinutes >= estimatedReadTimeMinutes * 0.3
2. If not: button disabled (FE blocks submission)
3. Server-side: log merit transfer event
4. Audit: bhff.merit_transfer_allowed
```

---

## FE Behavior

```
Bài Viết: [Tôi Bị Trầm Cảm Vì Công Việc]

Thời gian ước tính: 8 phút
Bạn đã đọc: 1 phút 30 giây (18%)

Progress: ██░░░░░░░░░░░░░░░░ 18%

─────────────────────────────────────

[Chuyển Giao Công Đức] (DISABLED)

⚠️ Bạn đã cuộn quá nhanh!

Trí tuệ Phật pháp cần sự thẩm thấu.
Hãy đọc thêm một chút để thực sự
giác ngộ nội dung.

Cần đọc tối thiểu: 2 phút 24 giây nữa
(30% của 8 phút = 2:24 phút)

─────────────────────────────────────

(Sau khi đọc đủ 30%:)

Bạn đã đọc: 2 phút 30 giây (31%) ✅

[Chuyển Giao Công Đức] (ENABLED)
```

---

## Audit

| Action | Trigger |
|---|---|
| `bhff.article_opened` | User opens article |
| `bhff.reading_too_fast` | Scrolled to bottom < 30% elapsed |
| `bhff.transfer_button_locked` | Time threshold not met |
| `bhff.reading_sufficient` | ≥ 30% time elapsed |
| `bhff.merit_transfer_allowed` | Transfer button enabled + used |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Transfer attempted without sufficient read time | `insufficient_reading_time` | 400 (if server validates) |

---

## Notes for AI/codegen

- Timer dựa trên `Date.now()` tại thời điểm mở bài — không reset khi user scroll lên.
- `estimatedReadTimeMinutes` được server tính và trả về trong article API response.
- Nút disabled hoàn toàn (`disabled` attribute) — không chỉ visually grayed out.
- Không block scroll — chỉ block transfer button.

---

## Related

- [re-reading-depth-tracker.md](./re-reading-depth-tracker.md) — depth badge system
- [bhff-reading-merit-transfer-engine.md](./bhff-reading-merit-transfer-engine.md) — merit transfer flow
- [bhff-quota-transfer-engine.md](./bhff-quota-transfer-engine.md) — quota system
