# Máy Tính Nợ Nhân Vật Lạ Mặt Mặc Đen — Black-Dressed Stranger Debt Calculator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Giải Pháp Karmic Debt từ Giấc Mơ
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi user ghi chép giấc mơ với sự xuất hiện của "Nhân vật lạ mặt mặc quần áo đen" (black-dressed stranger), hệ thống tự động phát hiện và tính toán lời khuyên cầu xin dung thứ nợ tiền kiếp. Mỗi nhân vật lạ mặt lạ mặt này đại diện cho một "khoản nợ" karmic cần được thanh toán bằng niệm NNN.

Quy tắc: **4 tờ NNN × số nhân vật lạ mặt = tổng NNN cần đốt**

Không thực thi (advisory only) — hệ thống không chặn user, chỉ đề xuất và ghi nhận.

---

## Owner module

`wisdom-qa` — DreamDebtEngine / DreamAnalysisService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — User ghi chép phân tích giấc mơ với chi tiết nhân vật
- `system` — Phát hiện black stranger entity, tính toán NNN recommendation, ghi audit

---

## Triggers

1. User POST /api/wisdom-qa/dreams/analyze với DreamAnalysisDto.blackStrangerCount > 0
2. DreamAnalysisService xử lý DTO, đếm nhân vật lạ mặt mặc đen
3. Auto-calculate recommendedNNNCount = blackStrangerCount × 4

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| blackStrangerCount = 0 | ✅ No recommendation |
| blackStrangerCount ≥ 1 | ✅ Trigger calculation |
| recommendedNNNCount = count × 4 | ✅ Multiply by fixed multiplier |
| User can choose to act or ignore | ✅ Advisory only, no enforcement |
| Calculation stored in DreamAnalysis record | ✅ Audit trail |

---

## Input Contract

```typescript
// Dream analysis submission
interface DreamAnalysisDto {
  userId: string
  dreamDate: Date
  description: string
  blackStrangerCount: number  // 0 or more
  entities?: string[]         // optional entity tags
}

// Stored in database
interface DreamAnalysis {
  id: string
  userId: string
  dreamDate: Date
  description: string
  blackStrangerCount: Int @default(0)
  recommendedNNNCount: Int @default(0)  // Auto-calculated
  createdAt: DateTime
  updatedAt: DateTime
}

function calculateRecommendedNNN(blackStrangerCount: number): number {
  return blackStrangerCount * 4
}
```

---

## Write Path

```
POST /api/wisdom-qa/dreams/analyze

1. Validate DreamAnalysisDto
2. Extract blackStrangerCount from DTO
3. Calculate: recommendedNNNCount = blackStrangerCount × 4
4. Save DreamAnalysis {
     blackStrangerCount,
     recommendedNNNCount
   }
5. Audit: dream.black-stranger-detected (if count > 0)
6. Audit: dream.nnn-recommendation-computed
7. Return { blackStrangerCount, recommendedNNNCount, message }
```

---

## FE Behavior

```
User submits dream analysis with 2 black-dressed strangers:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PHÂN TÍCH GIẤC MƠ — KHÁM PHÁ NỢ KIẾP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌙 Giấc Mơ: [ngày]

Nhân vật lạ mặt mặc đen: 2 người ✅

⚡ CÁC NHÂN VẬT LẠ MẶT ĐÃ PHÁT HIỆN:

  Số lượng: 2 nhân vật
  × 4 tờ NNN/người
  ────────────────────
  = 8 tờ NNN cần đốt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 LỜI KHUYÊN CÓ SỨC MẠNH:

Bạn nên niệm 8 tờ Ngôi Nhà Nhỏ để xin dung
thứ nợ tiền kiếp với các nhân vật lạ mặt này.

⚠️ Đây là khuyến cáo. Bạn có thể chọn thực
hiện hoặc không. Hệ thống sẽ ghi nhận.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Hiểu Rồi]  [Bắt Đầu Đốt NNN]
```

---

## FE Display — Calculation Breakdown

```
📊 TÍNH TOÁN NỢ KIẾP TỪ GIẤC MƠ

────────────────────────────────
Nhân vật lạ mặt mặc đen:  2 người
Mỗi người:               4 tờ NNN
────────────────────────────────
Tổng cộng:               8 tờ NNN
────────────────────────────────

✅ Ghi nhận thành công.
💡 Bạn có thể đốt NNN để xin dung thứ.
```

---

## Schema Notes

```prisma
model DreamAnalysis {
  id                  String    @id @default(cuid())
  userId              String
  dreamDate           DateTime
  description         String    @db.Text
  blackStrangerCount  Int       @default(0)
  recommendedNNNCount Int       @default(0)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([userId, dreamDate])
  // Migration: CREATE TABLE "DreamAnalysis" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `dream.black-stranger-detected` | blackStrangerCount > 0 |
| `dream.nnn-recommendation-computed` | recommendedNNNCount calculated |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Invalid blackStrangerCount (negative) | `invalid_count` | 400 |
| Missing required field (description) | `validation_error` | 400 |
| Database save fails | `dream_save_failed` | 500 |

---

## Related

- [heavy-karma-activation-nnn-commitment-gate.md](./heavy-karma-activation-nnn-commitment-gate.md) — NNN commitment enforcement
- [recitation-economy-segregation.md](./recitation-economy-segregation.md) — daily recitation vs NNN counter segregation
- [non-fungible-repentance-rule.md](./non-fungible-repentance-rule.md) — repentance multiplier logic
