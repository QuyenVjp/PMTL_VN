# Giao Thức Bù Lấp Rò Rỉ Năng Lượng Đọc Thuộc — Memory Recitation Error Buffer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Việc nhép miệng đọc thuộc lòng (ghi nhớ từng chữ từ sutra/mantra) rất khác với đọc từ sách. Nếu lỡ bỏ sót dù chỉ một từ hoặc nói sai, năng lượng sẽ bị rò rỉ ra ngoài. Hệ thống phải tự động phát hiện những lỗi đọc nhỏ và buộc người tu phải niệm thêm "Chú Cứu Cánh" (completion mantra) để bù lấp năng lượng.

---

## Owner module

`content`, `calendar` — MemoryRecitationService / EnergyLeakageBuffer

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User logs memory-based recitation | ✅ Enter verification mode |
| User submits recitation text | ✅ Compare against canonical text |
| Perfect match (100%) | ✅ Accept as-is, full energy credited |
| Minor error detected (1-2 words off) | ⚠️ Show error, require buffer mantra |
| Major error detected (>3 words off) | ❌ Reject, require re-do entire passage |
| Buffer mantra (Chú Cứu Cánh) recited | ✅ Seal energy leakage, accept session |

---

## Error Detection

```typescript
interface MemoryRecitationValidation {
  canonical: string;           // Official text
  submitted: string;           // User's recitation
  wordCount: number;
  errorCount: number;          // Words omitted/changed
  errorPercentage: number;     // (errorCount / wordCount) * 100

  // Thresholds
  PERFECT: 0;
  MINOR_ERROR: 1-2 words;      // Allow with buffer
  MAJOR_ERROR: 3+ words;       // Require redo
}
```

---

## FE Behavior

```
Niệm Sutra Từ Thuộc Lòng:

[Paste or type your recitation]

[Kiểm Tra] (check against canonical)

---

❌ LỖI PHÁT HIỆN: 1 từ thiếu

Dòng: "Cảm ơn Phật bảo vệ tôi từ..."
Thiếu: "luôn luôn"

Năng Lượng Bị Rò Rỉ Nhỏ

━━━━━━━━━━━━━━━━━━━━━━━━

💡 BỮC LẤP NĂNG LƯỢNG:

Hãy niệm 1x Chú Cứu Cánh:

"Ôm Ba Ba Ba Ba Ba Ba Ba..."

[ ] Tôi đã niệm Chú Cứu Cánh

[Hoàn Thành & Ghi Nhận]
```

---

## Buffer Mantra (Chú Cứu Cánh)

```
Minor error (1-2 words): 1x recitation of completion mantra
Major error (3+ words): Full passage redo required + 3x buffer mantras
```

---

## Audit

| Action | Trigger |
|---|---|
| `recitation.memory_mode_initiated` | User starts memory-based recitation |
| `recitation.text_submitted` | User submits recitation for verification |
| `recitation.perfect_match` | 100% canonical match |
| `recitation.minor_error_detected` | 1-2 words omitted/changed |
| `recitation.major_error_detected` | 3+ words omitted/changed |
| `recitation.buffer_mantra_required` | Energy leakage sealing needed |
| `recitation.buffer_mantra_completed` | Completion mantra recited |
| `recitation.energy_leakage_sealed` | Session accepted with buffer |

---

## Notes

Error buffering prevents silent energy dissipation during memory recitation practice. Small imperfections require intentional completion mantras to maintain energetic integrity.
