# Cảnh Báo Xung Đột Vàng Mã Khi Đốt Tiểu Phương Tử — Joss Paper Clash Warning

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi đốt Tiểu Phương Tử (Little House) cho **người quá cố**, tuyệt đối **không được đốt kèm vàng mã truyền thống** (tiền âm phủ, đồ mã). Đốt vàng mã kèm sẽ khiến vong linh nổi lòng tham nhặt tiền lẻ và bị đọa rớt từ cõi trên xuống lại cõi âm — mất đi công đức tích lũy.

Quy tắc này phải xuất hiện ở **3 điểm tiếp xúc** trong hệ thống:
1. Hướng dẫn trong `content` (BeginnerGuide / Q&A)
2. Cảnh báo inline trong `vows-merit` khi user log Little House cho người quá cố
3. Auto-inject trong `wisdom-qa` khi AI/hệ thống trả lời câu hỏi liên quan đến người quá cố

---

## Owner module

`wisdom-qa` (Q&A auto-inject rule)
Phối hợp: `content` (canonical guide) + `vows-merit` (inline warning tại điểm đốt)

---

## Actors

- `member` — đang xem hướng dẫn hoặc hỏi về người quá cố / đốt Tiểu Phương Tử
- `system` — detect context và inject cảnh báo

---

## Part A — Q&A Rule Injection (wisdom-qa)

### Trigger Keywords / Context

Hệ thống phải inject cảnh báo vàng mã khi câu hỏi hoặc nội dung Q&A liên quan đến **bất kỳ** trong các context sau:

| Context keyword | Ví dụ câu hỏi |
|---|---|
| Người quá cố / 亡人 | "Đốt Tiểu Phương Tử cho ba mất năm ngoái..." |
| Cúng vong / thờ vong | "Cúng giỗ có cần đốt vàng mã không?" |
| Siêu độ / giải oan | "Niệm kinh siêu độ cho ông bà..." |
| Ngôi Nhà Nhỏ + người mất | "Tiểu Phương Tử cho người đã khuất" |
| Đốt đồ mã / đốt tiền âm | "Đốt áo quần giấy cho người mất có được không?" |

### Injected Warning Block

Khi context match, hệ thống **append** vào cuối câu trả lời (hoặc hiển thị dưới dạng aside):

```
⚠️ LƯU Ý QUAN TRỌNG — Vàng Mã & Tiểu Phương Tử:

Tuyệt đối KHÔNG đốt vàng mã truyền thống (tiền âm phủ, đồ mã bằng giấy)
kèm theo Tiểu Phương Tử khi cúng cho người quá cố.

Lý do: Vàng mã kích thích lòng tham của vong linh. Vong linh sẽ bị cuốn vào
việc nhặt tiền lẻ và bị đọa rớt từ cõi tốt xuống cõi thấp hơn — mất đi
toàn bộ công đức mà Tiểu Phương Tử mang lại.

Chỉ đốt: Tiểu Phương Tử + (nếu cần) Kinh Văn Tự Tu đi kèm.
Không đốt: Tiền âm phủ, áo quần giấy, nhà lầu xe hơi giấy.
```

### SystemConfig Entry

```
Key:     wisdom-qa.joss-paper-clash-warning
Type:    MARKDOWN_TEXT
Scope:   Injected when deceased-person context detected
Default: [warning text above]
Editable by: super-admin only
```

---

## Part B — Inline Warning in Little House Flow (vows-merit)

### Trigger

Khi user tạo `LittleHouse` record với:
- `recipientType = "DECEASED"` hoặc `recipientType = "ANCESTOR"`

### Inline Warning (Response Payload)

API response khi tạo Little House cho người quá cố phải include:

```json
{
  "jossParperWarning": {
    "active": true,
    "severity": "CRITICAL",
    "title": "Không đốt vàng mã kèm Tiểu Phương Tử",
    "body": "Tuyệt đối không đốt tiền âm phủ hoặc đồ mã truyền thống cùng lúc với Tiểu Phương Tử. Vàng mã làm vong linh bị đọa xuống cõi thấp và mất công đức.",
    "allowedItems": ["Tiểu Phương Tử", "Kinh Văn Tự Tu (nếu có)"],
    "forbiddenItems": ["Tiền âm phủ", "Áo quần giấy", "Nhà lầu xe hơi giấy", "Đồ mã bất kỳ"]
  }
}
```

FE render warning này dưới dạng **collapsible banner vàng** trên màn hình xác nhận đốt.

---

## Part C — Canonical Guide Content (content)

### BeginnerGuide Entry

Cần tạo hoặc cập nhật một `BeginnerGuide` với:

```
category:  LITTLE_HOUSE hoặc RITUAL_RULES
slug:      "khong-dot-vang-ma-kem-tieu-phuong-tu"
title:     "Tại sao không được đốt vàng mã kèm Tiểu Phương Tử?"
severity:  "mandatory" (critical rule, not advisory)
```

Nội dung guide bao gồm:
1. Giải thích cơ chế tâm linh (vong linh + lòng tham + đọa lạc)
2. Danh sách ĐƯỢC đốt kèm
3. Danh sách KHÔNG được đốt kèm
4. Câu hỏi thường gặp ("Đốt áo quần cho người mất có được không?")

---

## Detection Logic (wisdom-qa service)

```
function hasDeceasedPersonContext(qaContent: string): boolean {
  const DECEASED_KEYWORDS = [
    "người quá cố", "người mất", "người đã khuất", "亡人",
    "vong linh", "siêu độ", "cúng giỗ", "đám giỗ",
    "vàng mã", "đốt vàng", "tiền âm", "đồ mã",
    "người thân đã mất", "ba/mẹ/ông/bà mất"
  ];
  return DECEASED_KEYWORDS.some(kw => qaContent.toLowerCase().includes(kw));
}
```

- Kiểm tra trên cả `question` và `answer` content.
- Nếu match → append warning block vào answer trước khi return.
- Audit: `wisdom-qa.joss-paper-warning.injected`.

---

## Audit

| Action | Module | Trigger |
|---|---|---|
| `wisdom-qa.joss-paper-warning.injected` | wisdom-qa | Context match trong Q&A |
| `little-house.joss-paper-warning.shown` | vows-merit | LittleHouse cho người quá cố |
| `little-house.joss-paper-warning.acknowledged` | vows-merit | User xác nhận đã đọc |

---

## Notes for AI/codegen

- Keyword matching ở Phase 1 nên là simple string search trên danh sách từ khóa cứng, không NLP.
- Phase 2+: tích hợp semantic search để detect context chính xác hơn (khi `wisdom-qa` có vector search).
- Warning text phải lấy từ `SystemConfig` — không hardcode trong service để admin có thể cập nhật wording.
- `recipientType` trong `LittleHouse` cần thêm `DECEASED` và `ANCESTOR` vào enum nếu chưa có.
- Warning phải hiển thị trên cả app (inline) và admin CMS (khi admin xem record Little House).

---

## Schema Notes

```prisma
// Bổ sung vào LittleHouseRecipientType nếu chưa có:
enum LittleHouseRecipientType {
  SELF
  LIVING_OTHER
  DECEASED       // ← cần thêm nếu chưa có
  ANCESTOR       // ← cần thêm nếu chưa có
  KARMIC_CREDITOR
}
```

---

## Related

- [manage-ngoi-nha-nho-sheet.md](../../engagement/USE_CASES/manage-ngoi-nha-nho-sheet.md) — Little House core flow
- [validate-burn-conditions.md](../../engagement/USE_CASES/validate-little-house-burn-conditions.md) — Burn validation
- [ngu-dai-phap-bao-system.md](../../vows-merit/USE_CASES/ngu-dai-phap-bao-system.md) — Ngũ Đại Pháp Bảo overview
