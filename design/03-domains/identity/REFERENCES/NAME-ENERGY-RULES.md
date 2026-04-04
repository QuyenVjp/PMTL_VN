# NAME-ENERGY-RULES

## Owner
- `identity` (name management + sacred forms)
- Cross-reference: `content` (spiritual application guidance)

## Purpose
Quy tắc năng lượng cho **Đơn Đổi Tên** (Name Change Application) và **Đơn Xin Tên Thật** (True Name Application) trong PMTL.

---

## Business Rule 1: 100-Day Energy Delay

### Rule - Name Change Effectiveness Period
**Nghiệp vụ:**
Theo giáo lý PMTL, khi đổi tên (thông qua Đơn Đổi Tên và đốt đơn), tên mới cần **100 ngày** để:
1. Năng lượng tên mới được ghi nhận ở cõi trên.
2. Tên cũ dần mất tác dụng.
3. Vận khí mới bắt đầu ảnh hưởng.

**Logic App:**
- Track `NameChangeApplication` với `applicationDate`.
- Tính `effectiveDate = applicationDate + 100 days`.
- Hiển thị progress bar: "Đã qua X/100 ngày".

---

## Business Rule 2: Name Energy Activation Requirements

### Rule - Phải được gọi bằng tên mới
**Nghiệp vụ:**
Trong thời gian 100 ngày, user **PHẢI được người khác gọi bằng tên mới thật nhiều**.

**Lý do:**
- Tên mới cần được "kích hoạt" bởi âm thanh từ người khác.
- Càng nhiều người gọi tên mới, năng lượng tên càng mạnh.

**Hướng dẫn cho user:**
- Thông báo cho gia đình, bạn bè về tên mới.
- Cập nhật tên trên giấy tờ (nếu có thể).
- Yêu cầu mọi người gọi tên mới thường xuyên.

---

## Business Rule 3: True Name Application (Trường hợp đặc biệt)

### Rule - Đơn Xin Tên Thật (cho người không biết tên gốc)
**Nghiệp vụ:**
Nếu user không biết tên gốc của mình (ví dụ: là con nuôi, bị thất lạc, không biết cha mẹ đẻ), hệ thống cung cấp một form đặc biệt là `TrueNameApplication` (thay vì `NameChangeApplication`).

**Khác biệt:**
| NameChangeApplication | TrueNameApplication |
|-----------------------|---------------------|
| User biết tên cũ → đổi sang tên mới | User KHÔNG biết tên thật → xin tên mới |
| Cần điền: Tên cũ + Tên mới | Chỉ điền: Tên mới (tên thật mong muốn) |
| 100 ngày chuyển đổi | 100 ngày kích hoạt |

---

## Business Rule 4: Name Effectiveness Validation Checklist

### Rule - 5 Criteria Self-Assessment
**Nghiệp vụ:**
UI cung cấp một checklist để user tự đánh giá xem tên mới đã "linh" (effective) chưa:

| # | Tiêu chí | Giải thích |
|---|----------|------------|
| 1 | Cảm thấy vui vẻ, nhẹ nhõm hơn | Tâm trạng tích cực sau khi đổi tên |
| 2 | Đã niệm nhiều Tâm Kinh với tên mới | Niệm kinh để kết nối với tên |
| 3 | Tên không trùng người có trường năng lượng quá gần | Tránh trùng tên người xung khắc |
| 4 | Đã được gọi bằng tên mới thường xuyên | Âm thanh kích hoạt năng lượng |
| 5 | Khi đốt TPT với tên mới, triệu chứng giảm | Ác mộng/mệt mỏi giảm bớt |

**Scoring:**
- 5/5: Tên đã linh ✅
- 3-4/5: Tiếp tục thực hành 🔄
- 0-2/5: Cần review hoặc đổi tên khác ⚠️

---

## UX Flow

### Flow 1: Name Change Application
```
User click [Đơn Đổi Tên]
  ↓
Show NameChangeApplicationForm
  ↓ Input: Tên hiện tại
  ↓ Input: Tên mới mong muốn
  ↓ Input: Lý do đổi tên (optional)
  ↓
[Tải PDF Đơn Đổi Tên]
  ↓
Instructions:
  1. In đơn
  2. Điền thông tin
  3. Đọc lời khấn
  4. Đốt đơn (MUST_BURN)
  5. Bắt đầu đếm 100 ngày
  ↓
[Xác nhận đã đốt đơn]
  ↓
Save NameChangeApplication with applicationDate = today
  ↓
Show: "100-day tracker started"
```

### Flow 2: True Name Application (Orphan/Adoptee)
```
User select [Không biết tên gốc]
  ↓
Show TrueNameApplicationForm
  ↓ Input: Tên mới (tên thật mong muốn)
  ↓ Input: Hoàn cảnh (con nuôi, không biết cha mẹ, v.v.)
  ↓
[Tải PDF Đơn Xin Tên Thật]
  ↓
Instructions:
  1. In đơn
  2. Điền thông tin
  3. Đọc lời khấn đặc biệt (cho trường hợp xin tên thật)
  4. Đốt đơn
  5. Bắt đầu đếm 100 ngày
```

### Flow 3: Track 100-Day Progress
```
Dashboard shows:
  ┌───────────────────────────────────────┐
  │  📅 Tiến trình đổi tên                │
  ├───────────────────────────────────────┤
  │  Tên mới: Nguyễn Văn An              │
  │  Ngày bắt đầu: 01/01/2026            │
  │                                       │
  │  Đã qua: 45/100 ngày                 │
  │  [▓▓▓▓▓░░░░░] 45%                    │
  │                                       │
  │  Ngày có hiệu lực: 10/04/2026        │
  │                                       │
  │  [Checklist linh nghiệm]             │
  └───────────────────────────────────────┘
```

### Flow 4: Effectiveness Checklist
```
User click [Checklist linh nghiệm]
  ↓
Show NameEffectivenessChecklist
  ↓
  [ ] 1. Cảm thấy vui vẻ, nhẹ nhõm hơn
  [✓] 2. Đã niệm nhiều Tâm Kinh với tên mới
  [ ] 3. Tên không trùng người có trường năng lượng quá gần
  [✓] 4. Đã được gọi bằng tên mới thường xuyên
  [ ] 5. Khi đốt TPT với tên mới, các triệu chứng giảm bớt
  ↓
Score: 2/5 → "Tiếp tục thực hành"
```

---

## Schema Hints

### Table: NameChangeApplication
```prisma
model NameChangeApplication {
  id                String    @id @default(cuid())
  publicId          String    @unique @map("public_id")
  userId            String    @map("user_id")
  oldName           String    @map("old_name")
  newName           String    @map("new_name")
  reason            String?   // lý do đổi tên
  applicationDate   DateTime  @map("application_date")
  effectiveDate     DateTime  @map("effective_date")  // applicationDate + 100 days
  documentBurned    Boolean   @default(false) @map("document_burned")
  burnedAt          DateTime? @map("burned_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  user User @relation("nameChangeApplications", fields: [userId], references: [id])
  checklist NameEffectivenessChecklist?

  @@index([userId])
  @@map("name_change_applications")
}
```

### Table: TrueNameApplication
```prisma
model TrueNameApplication {
  id                String    @id @default(cuid())
  publicId          String    @unique @map("public_id")
  userId            String    @map("user_id")
  newName           String    @map("new_name")  // tên thật mong muốn
  circumstance      String    // "adoptee", "orphan", "unknown_parents", etc.
  applicationDate   DateTime  @map("application_date")
  effectiveDate     DateTime  @map("effective_date")
  documentBurned    Boolean   @default(false) @map("document_burned")
  burnedAt          DateTime? @map("burned_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  user User @relation("trueNameApplications", fields: [userId], references: [id])
  checklist NameEffectivenessChecklist?

  @@index([userId])
  @@map("true_name_applications")
}
```

### Table: NameEffectivenessChecklist
```prisma
model NameEffectivenessChecklist {
  id                        String    @id @default(cuid())
  publicId                  String    @unique @map("public_id")
  nameChangeApplicationId   String?   @unique @map("name_change_application_id")
  trueNameApplicationId     String?   @unique @map("true_name_application_id")
  criterion1Feeling         Boolean   @default(false) @map("criterion1_feeling")
  criterion2Recitation      Boolean   @default(false) @map("criterion2_recitation")
  criterion3NoClash         Boolean   @default(false) @map("criterion3_no_clash")
  criterion4FrequentlyCalled Boolean  @default(false) @map("criterion4_frequently_called")
  criterion5SymptomReduced  Boolean   @default(false) @map("criterion5_symptom_reduced")
  totalScore                Int       @default(0) @map("total_score")  // 0-5
  lastUpdatedAt             DateTime  @updatedAt @map("last_updated_at")
  createdAt                 DateTime  @default(now()) @map("created_at")

  nameChangeApp NameChangeApplication? @relation(fields: [nameChangeApplicationId], references: [id])
  trueNameApp   TrueNameApplication?   @relation(fields: [trueNameApplicationId], references: [id])

  @@map("name_effectiveness_checklists")
}
```

---

## UI Components

### 1. NameChangeApplicationForm
```
┌────────────────────────────────────────────┐
│  📝 Đơn Đổi Tên                           │
├────────────────────────────────────────────┤
│                                            │
│  Tên hiện tại:                            │
│  [Nguyễn Văn Bình____________]            │
│                                            │
│  Tên mới mong muốn:                       │
│  [Nguyễn Văn An______________]            │
│                                            │
│  Lý do đổi tên (tùy chọn):                │
│  [Tên cũ xung khắc, muốn đổi vận...]      │
│                                            │
│  [Hủy]              [Tải PDF Đơn Đổi Tên] │
└────────────────────────────────────────────┘
```

### 2. TrueNameApplicationForm
```
┌────────────────────────────────────────────┐
│  📝 Đơn Xin Tên Thật                      │
├────────────────────────────────────────────┤
│                                            │
│  ⚠️ Dành cho người không biết tên gốc    │
│                                            │
│  Tên thật mong muốn:                      │
│  [Trần Minh Quang____________]            │
│                                            │
│  Hoàn cảnh:                               │
│  [Dropdown: Con nuôi, Mồ côi, Không biết  │
│             cha mẹ, Khác...]              │
│                                            │
│  [Hủy]         [Tải PDF Đơn Xin Tên Thật] │
└────────────────────────────────────────────┘
```

### 3. NameEnergyDelayProgress (100-day tracker)
```
┌────────────────────────────────────────────┐
│  ⏳ Tiến trình năng lượng tên mới         │
├────────────────────────────────────────────┤
│  Tên mới: Nguyễn Văn An                   │
│  Bắt đầu: 01/01/2026                      │
│                                            │
│  Đã qua: 45/100 ngày (45%)                │
│  ▓▓▓▓▓░░░░░                               │
│                                            │
│  Ngày có hiệu lực đầy đủ: 10/04/2026      │
│                                            │
│  💡 Trong 100 ngày, hãy:                  │
│  • Yêu cầu mọi người gọi tên mới          │
│  • Niệm Tâm Kinh với tên mới              │
│  • Đốt TPT với tên mới                    │
│                                            │
│  [Xem checklist linh nghiệm]              │
└────────────────────────────────────────────┘
```

### 4. NameEffectivenessChecklist
```
┌────────────────────────────────────────────┐
│  ✅ Checklist linh nghiệm tên mới         │
├────────────────────────────────────────────┤
│                                            │
│  [✓] 1. Cảm thấy vui vẻ, nhẹ nhõm hơn    │
│  [✓] 2. Đã niệm nhiều Tâm Kinh            │
│  [ ] 3. Tên không trùng người xung khắc   │
│  [✓] 4. Được gọi tên mới thường xuyên     │
│  [ ] 5. Triệu chứng giảm khi đốt TPT      │
│                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Điểm: 3/5 → Tiếp tục thực hành 🔄        │
│                                            │
│  [Lưu]                         [Đóng]     │
└────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/content/USE_CASES/spiritual-applications.md`
- External source: Master Lu teachings về đổi tên, năng lượng tên
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 12
