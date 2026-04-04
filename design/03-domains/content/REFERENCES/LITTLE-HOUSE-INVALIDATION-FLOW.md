# LITTLE-HOUSE-INVALIDATION-FLOW

## Owner
- `content` (canonical ritual guidance)
- `engagement` (execution flow + tracking)

## Purpose
Xử lý các tình huống user **điền sai thông tin** trên tờ Tiểu Phương Tử (TPT). Đây là edge case nguy hiểm nếu làm sai → phải follow đúng quy trình disposal.

---

## Business Rule: Mistake Handling

### Rule 1 - TUYỆT ĐỐI KHÔNG ĐỐT/XÉ TỜ BỊ LỖI
**Nghiệp vụ:**
- Khi user điền sai thông tin trên tờ TPT (tên sai, địa chỉ sai, v.v.), họ **KHÔNG ĐƯỢC PHÉP** xé hoặc đốt tờ bị sai.
- Tờ TPT đã có năng lượng ngay khi user bắt đầu chấm đỏ → phải xử lý đúng cách.

**Logic App:**
Nếu user bấm nút `[Hủy TPT bị lỗi]` trên App, hệ thống sẽ:
1. Trừ số lượng trong tracker (nếu đã cộng vào).
2. Hiện lên một **Action Plan Modal** với từng bước xử lý chi tiết.

---

## Invalidation Action Plan (6 Bước)

### Bước 1: Chấm lại tờ mới
- User phải lấy một tờ TPT mới và chấm lại các chấm đỏ từ đầu.
- **Không được** tiếp tục dùng tờ cũ.

### Bước 2: Gạch chéo tên
- Dùng bút gạch chéo tên **Kính tặng** (recipient) và **Người tặng** (sender) ở tờ cũ.
- Mục đích: vô hiệu hóa tên, tránh năng lượng gửi sai người.

### Bước 3: Gấp nhỏ
- Gấp nhỏ tờ cũ lại nhiều lần (ít nhất 4 lần).

### Bước 4: Bọc bằng giấy khác
- Lấy một tờ giấy khác (giấy báo, giấy A4 cũ) bọc kín tờ TPT cũ đã gấp.

### Bước 5: Vứt vào thùng rác
- Bỏ vào thùng rác thông thường.
- **⚠️ CẢNH BÁO ĐỎ: Tuyệt đối KHÔNG được xé rách hay đốt tờ bị lỗi.**

### Bước 6: Đọc câu khấn vô hiệu hóa
**Canonical Prayer:**
```
"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
con là [Tên của bạn],
con đã làm sai tờ Tiểu Phương Tử này và
bây giờ nó không còn hiệu lực.
Con xin lỗi vì sự thiếu cẩn thận của con."
```

---

## UX Flow

### Flow: Invalidate Little House
```
User click [Hủy TPT bị lỗi]
  ↓
System hiện InvalidateLittleHouseModal
  ↓ Step 1/6: "Chấm lại tờ mới"
  ↓   → User tick [✓ Đã hoàn thành]
  ↓ Step 2/6: "Gạch chéo tên"
  ↓   → User tick [✓ Đã hoàn thành]
  ↓ Step 3/6: "Gấp nhỏ"
  ↓   → User tick [✓ Đã hoàn thành]
  ↓ Step 4/6: "Bọc bằng giấy khác"
  ↓   → User tick [✓ Đã hoàn thành]
  ↓ Step 5/6: "Vứt vào thùng rác"
  ↓   → ⚠️ Hard warning: "KHÔNG XÉ, KHÔNG ĐỐT"
  ↓   → User tick [✓ Đã hoàn thành]
  ↓ Step 6/6: "Đọc câu khấn"
  ↓   → Show prayer text
  ↓   → User tick [✓ Đã đọc xong]
  ↓
[Hoàn tất] button → Update status = INVALIDATED
  ↓
Save LittleHouseInvalidation record
  ↓
Toast: "Đã hủy tờ TPT bị lỗi. Tờ mới sẽ được theo dõi riêng."
```

---

## Schema Hints

### Table: LittleHouseInvalidation
```prisma
model LittleHouseInvalidation {
  id                    String   @id @default(cuid())
  publicId              String   @unique @map("public_id")
  originalLittleHouseId String   @map("original_little_house_id")
  userId                String   @map("user_id")
  invalidationReason    String   @map("invalidation_reason")  // "wrong_name", "wrong_address", "wrong_count", etc.
  stepsCompleted        Json     @map("steps_completed")      // {step1: true, step2: true, ...}
  prayerRecited         Boolean  @default(false) @map("prayer_recited")
  invalidatedAt         DateTime @map("invalidated_at")
  createdAt             DateTime @default(now()) @map("created_at")

  user User @relation("littleHouseInvalidations", fields: [userId], references: [id])

  @@index([userId])
  @@index([originalLittleHouseId])
  @@map("little_house_invalidations")
}
```

### Extend existing LittleHouse model:
```prisma
model LittleHouse {
  // ... existing fields ...
  invalidatedAt    DateTime? @map("invalidated_at")
  invalidationNote String?   @map("invalidation_note")
}
```

---

## UI Components

### 1. InvalidateLittleHouseModal
**Props:**
- `littleHouseId: string`
- `onComplete: () => void`

**Content:**
```
┌──────────────────────────────────────────────────┐
│  Hủy Tiểu Phương Tử bị lỗi                       │
├──────────────────────────────────────────────────┤
│  ⚠️ Quan trọng: KHÔNG được xé hoặc đốt tờ cũ   │
│                                                  │
│  Bước 1/6: Chấm lại tờ TPT mới                  │
│  [✓] Đã hoàn thành                              │
│                                                  │
│  Bước 2/6: Gạch chéo tên trên tờ cũ             │
│  [ ] Đã hoàn thành                              │
│                                                  │
│  Bước 3/6: Gấp nhỏ tờ cũ nhiều lần              │
│  [ ] Đã hoàn thành                              │
│                                                  │
│  Bước 4/6: Bọc bằng giấy khác                   │
│  [ ] Đã hoàn thành                              │
│                                                  │
│  Bước 5/6: Vứt vào thùng rác                    │
│  🚫 KHÔNG XÉ, KHÔNG ĐỐT                         │
│  [ ] Đã hoàn thành                              │
│                                                  │
│  Bước 6/6: Đọc câu khấn vô hiệu hóa             │
│  "Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát..."    │
│  [ ] Đã đọc xong                                │
│                                                  │
│  [Hủy]                   [Hoàn tất] (disabled)  │
└──────────────────────────────────────────────────┘
```

**Logic:**
- `[Hoàn tất]` button chỉ enabled khi tất cả 6 checkboxes đã tick.
- Khi click `[Hoàn tất]`:
  - Update `littleHouses` table: `invalidatedAt = now()`
  - Create `LittleHouseInvalidation` record
  - Redirect về list hoặc dashboard

---

## References
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-RITUAL-FLOW.md`
- `design/03-domains/content/REFERENCES/LITTLE-HOUSE-SPECIAL-CASES.md`
- `design/03-domains/engagement/USE_CASES/little-house-lifecycle.md`
- External source: Wenda Q&A về xử lý TPT bị lỗi

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 8
