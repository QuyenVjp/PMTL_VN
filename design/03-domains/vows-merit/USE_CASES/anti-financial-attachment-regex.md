# Bộ Lọc Dính Mắc Tài Chính — Anti-Financial Attachment Regex

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nhắc đến số tiền đã bỏ ra khi phóng sinh tạo ra "dính mắc" (chấp niệm tài chính), làm rò rỉ và thiêu hủy toàn bộ công đức. Hệ thống chặn từ khóa tiền tệ trong nhật ký phóng sinh và giáo dục user về sự buông xả.

---

## Owner module

`vows-merit` — LifeLiberationService / AttachmentFilter
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — viết nhật ký phóng sinh
- `system` — scan regex, block form submit nếu phát hiện

---

## Trigger

Khi user submit nhật ký phóng sinh có chứa từ khóa tiền tệ.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User điền nhật ký phóng sinh | ✅ Hiển thị notes input |
| User gõ từ khóa tiền tệ | ❌ Block form submission |
| Regex match tìm thấy | ✅ Hiển thị cảnh báo cụ thể |
| User xóa từ khóa | ✅ Form enabled lại |

---

## Forbidden Patterns

```typescript
const FINANCIAL_ATTACHMENT_REGEX = [
  /\d+\s*(k|ngàn|triệu|tỷ|đồng|vnd)/gi,   // "500k đồng"
  /\$\s*\d+/gi,                             // "$50"
  /usd\s*\d+/gi,                            // "USD 100"
  /(spend|spent|cost|pay|mua|tốn)\s*\d+/gi // "tốn 500"
]

// Keywords soft-block (tooltip only):
const FINANCIAL_KEYWORDS = [
  'vnđ', 'vnd', 'đồng', 'tiền', 'giá', 'bao nhiêu', 'cost', 'euro', 'usd'
]
```

---

## Input Contract

```typescript
interface LifeReleaseJournalDto {
  releaseId: string
  notes: string   // Phải pass regex validation
  // ... other fields
}
```

---

## Write Path

```
POST /api/vows-merit/life-release/journal
1. Run FINANCIAL_ATTACHMENT_REGEX against notes field
2. If match found:
   → return 400 { code: 'financial_attachment_detected', matchedPattern: string }
3. If clean:
   → Persist journal entry
```

---

## FE Behavior

```
Nhật Ký Phóng Sinh:

Ghi chú:
["Hôm nay mua hết 500k tiền cá..."]
          ↑
❌ CẤM KỴ: DÍNH MẮC TÀI CHÍNH

Tuyệt đối không ghi số tiền bỏ ra.

Lý do: Nghĩ đến tiền = "dính mắc",
       làm rò rỉ và thiêu rụi
       toàn bộ công đức phóng sinh.

[Xóa Thông Tin Tiền Bạc]

─────────────────────────────────
✅ Thay bằng: "Hôm nay phóng sinh
100 con cá chép tại Sông Sài Gòn"
```

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Regex match tiền tệ trong notes | `financial_attachment_detected` | 400 |

---

## Related

- [log-life-release.md](./log-life-release.md) — logging flow
- [ecological-speech-to-text-guard.md](./ecological-speech-to-text-guard.md) — ecological pledge
