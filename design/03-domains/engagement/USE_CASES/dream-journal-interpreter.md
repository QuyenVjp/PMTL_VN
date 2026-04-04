# Nhật Ký Giấc Mơ & Tự Động Giải Mã Nghiệp — Dream Journal & Karmic Debt Interpreter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Ý nghĩa giấc mơ theo Pháp Môn
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Cho phép user ghi lại giấc mơ và nhận gợi ý tự động về:
1. **Karmic Debt Signal** — một số hình ảnh trong mơ là dấu hiệu oan gia trái chủ → tự động add vào `KarmicDebtLedger`.
2. **Practice Warning** — một số hình ảnh báo hiệu lỗi trong tu hành → nhắc nhở.
3. **Good Outcome Signal** — một số hình ảnh xác nhận tiến triển tích cực.

---

## Owner module

`engagement` — DreamJournal entity, gắn với KarmicDebtLedger (vows-merit).

---

## Actors

- `member` — ghi nhật ký giấc mơ
- `system` — DreamInterpreterService, tự động phân tích và gợi ý

---

## DreamInterpreterService — Keyword Matrix (hardcoded)

```typescript
export type DreamSignalType =
  | "KARMIC_DEBT"        // oan gia trái chủ xuất hiện → add LH to ledger
  | "PRACTICE_WARNING"   // lỗi tu tập → nhắc nhở
  | "GOOD_OUTCOME"       // tiến triển tốt → thông báo tích cực
  | "NEUTRAL"

interface DreamPattern {
  keywords:             string[]                    // từ khóa nhận diện trong mô tả
  signalType:           DreamSignalType
  lhDebt?:              number                      // số Ngôi Nhà Nhỏ cần làm thêm (chỉ khi KARMIC_DEBT)
  urgency?:             "HIGH" | "CRITICAL"         // CRITICAL = RED ALERT banner, ưu tiên lên đầu
  message:              string                      // thông điệp hiển thị cho user
  actionHint?:          string                      // gợi ý hành động cụ thể
  childProtectionAlert?: string                     // cảnh báo bảo vệ con cháu (CRITICAL only)
}

export const DREAM_INTERPRETATION_RULES: DreamPattern[] = [
  {
    keywords:   ["người mặc áo đen", "người đen", "bóng đen", "người lạ mặc đen"],
    signalType: "KARMIC_DEBT",
    lhDebt:     4,
    message:    "Người mặc áo đen trong mơ thường là dấu hiệu oan gia trái chủ đang đến gần.",
    actionHint: "Nên làm thêm 4 tờ Ngôi Nhà Nhỏ để hóa giải.",
  },
  {
    keywords:   ["người thân đã mất", "ông bà", "bố mẹ đã mất", "cố nội", "cố ngoại"],
    signalType: "KARMIC_DEBT",
    lhDebt:     7,
    message:    "Người thân đã khuất xuất hiện trong mơ thường cần được siêu độ thêm.",
    actionHint: "Nên làm thêm 7 tờ Ngôi Nhà Nhỏ và phóng sinh hồi hướng cho các Ngài.",
  },
  {
    keywords:             ["rụng răng dưới", "mất răng dưới", "gãy răng dưới"],
    signalType:           "PRACTICE_WARNING",
    urgency:              "CRITICAL",
    message:              "Mơ rụng răng hàm DƯỚI là tín hiệu cực kỳ nguy hiểm — oan gia trái chủ đang ảnh hưởng trực tiếp đến con cháu trong gia đình.",
    actionHint:           "Niệm Chú Giải Kết ít nhất 21 biến mỗi ngày trong 7 ngày liên tiếp. Kiểm điểm lỗi lầm gần đây.",
    childProtectionAlert: "Khẩn cấp: Làm ngay ít nhất 7 tờ NNN hồi hướng cho con/cháu trong gia đình. Niệm Chú Giải Kết 21 biến/ngày trong 7 ngày liên tiếp để bảo vệ thế hệ sau.",
  },
  {
    keywords:   ["quả thối", "trái cây thối", "hoa quả hỏng", "cúng quả thối"],
    signalType: "PRACTICE_WARNING",
    message:    "Hoa quả hỏng trong mơ báo hiệu có lỗi trong nghi thức dâng cúng.",
    actionHint: "Kiểm tra lại hoa quả trên bàn thờ — thay quả tươi và xem lại nghi thức.",
  },
  {
    keywords:   ["em bé vui vẻ", "em bé cười", "trẻ sơ sinh khỏe mạnh rời đi"],
    signalType: "GOOD_OUTCOME",
    message:    "Em bé vui vẻ rời đi trong mơ là dấu hiệu tốt — oan gia trái chủ đã được siêu thoát.",
    actionHint: "Tiếp tục duy trì tu tập — kết quả đang hiển thị.",
  },
]
```

---

## Dream Journal Entry

### Input

```typescript
interface DreamJournalInput {
  userId:       string
  dreamDate:    Date
  description:  string    // mô tả giấc mơ, max 2000 chars
  mood:         "PEACEFUL" | "ANXIOUS" | "CONFUSED" | "JOYFUL" | "FEARFUL"
}
```

### DreamInterpreterService.analyze()

```typescript
function analyzeDream(description: string): DreamAnalysisResult {
  const matches: MatchedPattern[] = []
  const lowerDesc = description.toLowerCase()

  for (const rule of DREAM_INTERPRETATION_RULES) {
    const matched = rule.keywords.some(kw => lowerDesc.includes(kw.toLowerCase()))
    if (matched) {
      matches.push({ rule, confidence: "HIGH" })
    }
  }

  return {
    matches,
    totalLhDebtSuggested: matches
      .filter(m => m.rule.signalType === "KARMIC_DEBT")
      .reduce((sum, m) => sum + (m.rule.lhDebt ?? 0), 0),
  }
}
```

---

## Write Path

```
POST /api/engagement/dream-journal
  1. Save DreamJournalEntry
  2. analyzeDream(description)
  3. For each KARMIC_DEBT match:
       → Create KarmicDebtSuggestion (NOT auto-add — requires user confirm)
  4. For each PRACTICE_WARNING match:
       → Create PracticeWarning notification
  5. For each GOOD_OUTCOME match:
       → Create PositiveSignal notification
  6. Return { entry, suggestions, warnings, positiveSignals }
```

**Quan trọng:** `KarmicDebtSuggestion` KHÔNG tự động thêm vào `KarmicDebtLedger`. User phải **xác nhận** trước khi nợ được ghi nhận.

---

## FE Behavior

Sau khi user lưu giấc mơ:

**UI Rule:** Matches có `urgency = "CRITICAL"` được render với banner đỏ (`bg-red-700`) và đẩy lên **đầu danh sách** trước tất cả matches khác.

```
📿 Phân Tích Giấc Mơ

Chúng tôi phát hiện một số dấu hiệu trong giấc mơ của bạn:

┌──────────────────────────────────────────────────────────────┐
│ 🚨  CẢNH BÁO KHẨN CẤP — BẢO VỆ CON CHÁU                   │ ← bg-red-700 text-white
│──────────────────────────────────────────────────────────────│
│ Rụng Răng Hàm Dưới — Oan gia trái chủ ảnh hưởng con cháu   │
│                                                              │
│ Hành động khẩn ngay hôm nay:                               │
│ • Làm ngay ≥7 tờ NNN hồi hướng cho con/cháu trong gia đình │
│ • Niệm Chú Giải Kết 21 biến/ngày × 7 ngày liên tiếp        │
└──────────────────────────────────────────────────────────────┘
   [+ Tạo 7 NNN bảo vệ con cháu ngay]     [Đã hiểu]

⚠️ Người mặc áo đen — Dấu hiệu oan gia trái chủ
   "Nên làm thêm 4 tờ Ngôi Nhà Nhỏ để hóa giải."
   [+ Thêm 4 tờ vào kế hoạch]  [Bỏ qua]

✅ Em bé vui vẻ rời đi — Dấu hiệu tốt
   "Oan gia trái chủ có thể đã được siêu thoát."
```

---

## Entities

```
DreamJournalEntry {
  id          String   @id
  userId      String
  dreamDate   Date
  description String
  mood        String
  createdAt   DateTime

  suggestions DreamKarmicSuggestion[]
}

DreamKarmicSuggestion {
  id          String   @id
  entryId     String
  ruleKey     String   // key từ DREAM_INTERPRETATION_RULES
  lhDebt      Int?
  signalType  String
  message     String
  confirmed   Boolean  @default(false)
  confirmedAt DateTime?
}
```

---

## Errors

| Condition | Error code | HTTP | Recovery |
|---|---|---|---|
| Description quá dài | `description_too_long` | 422 | Tối đa 2000 ký tự |
| DreamDate trong tương lai | `invalid_date` | 400 | Dùng ngày hôm nay |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Audit

| Action | Trigger |
|---|---|
| `engagement.dream.logged` | Ghi nhật ký giấc mơ |
| `engagement.dream.karmic-suggestion-shown` | Gợi ý LH hiển thị |
| `engagement.dream.karmic-suggestion-confirmed` | User xác nhận thêm LH |
| `engagement.dream.practice-warning-shown` | Cảnh báo tu tập hiển thị |

---

## Notes for AI/codegen

- `DREAM_INTERPRETATION_RULES` là **hardcoded constant** — không phải CMS. Chỉ super-admin developer có thể thêm rule.
- Keyword matching là **substring** (không phải exact match) để bắt được biến thể tiếng Việt tự nhiên.
- **User phải confirm** trước khi LH được thêm vào KarmicDebtLedger — không auto-add.
- `DreamJournalEntry` là private data — không chia sẻ với admin trừ khi user báo cáo lỗi.
- Confidence field hiện tại hardcode là "HIGH" — có thể mở rộng sau với NLP scoring nếu cần.
- Matches có `urgency = "CRITICAL"` phải được **sort lên đầu** response array trước khi trả về FE — server-side sort, không để FE tự sort.
- `childProtectionAlert` chỉ render khi `urgency = "CRITICAL"` — dùng banner `bg-red-700`, không dùng yellow/orange.
