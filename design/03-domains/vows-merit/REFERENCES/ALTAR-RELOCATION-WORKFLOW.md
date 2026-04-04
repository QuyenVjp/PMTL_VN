# ALTAR-RELOCATION-WORKFLOW

## Owner
- `vows-merit` (altar maintenance domain)
- Reference: `content` (ritual guidance)

## Purpose
Quy trình chuẩn khi **chuyển bàn thờ sang nhà mới** hoặc **di chuyển Phật đài** trong cùng một nhà.

---

## Business Rule: Altar Relocation

### Rule - 4-Step Mandatory Workflow
**Nghiệp vụ:**
Khi user chọn `[Chuyển bàn thờ sang nhà mới]`, UI sinh ra Task list với 4 bước bắt buộc:

---

## 4-Step Relocation Checklist

### Bước 1: Đốt nén hương cuối ở nhà cũ
**Chi tiết:**
- Thắp 1 nén hương cuối cùng ở bàn thờ nhà cũ.
- Đợi nến cháy hết hoàn toàn trước khi thỉnh tượng xuống.
- **Mục đích:** Thông báo với Bồ Tát rằng sắp di chuyển.

**Timing:**
- Nên làm vào buổi sáng hoặc trưa (tránh tối muộn).

---

### Bước 2: Thỉnh tượng xuống, bọc bằng vải đỏ
**Chi tiết:**
- Rửa tay sạch trước khi thỉnh tượng Bồ Tát xuống.
- Bọc tượng bằng **vải đỏ** (hoặc vải sạch màu tươi sáng).
- Đặt tượng vào hộp/túi cẩn thận, tránh va đập.

**Lưu ý:**
- Tượng Bồ Tát phải được đặt ở vị trí cao, tôn kính trong suốt quá trình di chuyển.
- Không để tượng dưới ghế ngồi hoặc nơi thấp.

---

### Bước 3: Đến nhà mới - Setup bàn thờ đầu tiên
**Chi tiết:**
- **QUAN TRỌNG:** Khi đến nhà mới, phải setup bàn thờ và đặt tượng Bồ Tát lên **ĐẦU TIÊN** trước khi dọn đồ đạc khác.
- Chọn vị trí bàn thờ phù hợp (tránh đối diện cửa WC, tránh dưới cầu thang, v.v.).
- Lau sạch bàn thờ, trải khăn/vải sạch.
- Đặt tượng Bồ Tát lên vị trí trung tâm.

**Nguyên tắc:**
- Bồ Tát phải "về nhà" đầu tiên → đây là ngôi nhà của Ngài trước tiên.

---

### Bước 4: Thắp hương, niệm kinh, đọc lời khấn
**Chi tiết:**
- Thắp 3 nén hương.
- Niệm:
  - **7 biến Đại Bi Chú** (大悲咒)
  - **7 biến Tâm Kinh** (心經)
- Đọc lời khấn:

**Canonical Prayer (Lời khấn chuyển nhà):**
```
"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,

Con là [Tên của bạn],
hôm nay con đã chuyển bàn thờ từ [Địa chỉ cũ] sang [Địa chỉ mới].
Con xin kính thỉnh Bồ Tát tiếp tục gia hộ cho gia đình con tại ngôi nhà mới này.

Con xin cầu nguyện cho gia đình con được bình an, hòa hợp, sức khỏe dồi dào.

Con xin cảm ơn Bồ Tát đã từ bi gia hộ.
Con xin kính lễ Bồ Tát.

Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát. (3 lần)"
```

---

## UX Flow

### Flow: Relocation Wizard (Stepper UI)
```
User click [Chuyển bàn thờ]
  ↓
Show RelocationWorkflowStepper (4 steps)
  ↓
Step 1/4: "Đốt nén hương cuối ở nhà cũ"
  ↓   → Instruction card
  ↓   → [✓ Hoàn thành] checkbox
  ↓
Step 2/4: "Thỉnh tượng xuống, bọc vải đỏ"
  ↓   → Instruction card
  ↓   → [✓ Hoàn thành]
  ↓
Step 3/4: "Đến nhà mới - Setup bàn thờ đầu tiên"
  ↓   → ⚠️ Warning: "Phải setup bàn thờ TRƯỚC KHI dọn đồ khác"
  ↓   → [✓ Hoàn thành]
  ↓
Step 4/4: "Thắp hương, niệm kinh, đọc lời khấn"
  ↓   → Show prayer text
  ↓   → Recitation guide: 7x Đại Bi Chú, 7x Tâm Kinh
  ↓   → [✓ Đã hoàn thành]
  ↓
Show banner: ✅ "Không cần làm lễ khai quang lại"
  ↓
[Hoàn tất] → Save AltarLog with actionType = RELOCATION
```

---

## Post-Relocation Banner

### "No Khai Quang Needed" Banner
**Content:**
```
┌────────────────────────────────────────────────┐
│  ✅ Hoàn tất chuyển bàn thờ                   │
├────────────────────────────────────────────────┤
│                                                │
│  Lưu ý: KHÔNG CẦN làm lễ khai quang lại       │
│  cho tượng Bồ Tát khi sang nhà mới.           │
│                                                │
│  Bồ Tát đã ngự ở đó rồi, chỉ cần thắp hương   │
│  và niệm kinh như thường lệ.                  │
│                                                │
└────────────────────────────────────────────────┘
```

**Rationale:**
- Nhiều user lo lắng có cần làm lễ khai quang lại không.
- PMTL giáo lý: **KHÔNG CẦN** vì Bồ Tát đã ngự tại tượng rồi, chỉ thay đổi vị trí thôi.

---

## Schema Hints

### Extend AltarActionType enum:
```prisma
enum AltarActionType {
  INCENSE
  MAINTENANCE
  MOVE            // existing: di chuyển trong nhà
  RELOCATION      // NEW: chuyển nhà hoàn toàn
  HEART_INCENSE
  TRAVEL_MODE_START
  TRAVEL_MODE_END
}
```

### New model: AltarRelocation
```prisma
model AltarRelocation {
  id                String   @id @default(cuid())
  publicId          String   @unique @map("public_id")
  userId            String   @map("user_id")
  oldAddress        String   @map("old_address")
  newAddress        String   @map("new_address")
  relocationDate    DateTime @map("relocation_date")
  step1Completed    Boolean  @default(false) @map("step1_completed")
  step2Completed    Boolean  @default(false) @map("step2_completed")
  step3Completed    Boolean  @default(false) @map("step3_completed")
  step4Completed    Boolean  @default(false) @map("step4_completed")
  prayerRecited     Boolean  @default(false) @map("prayer_recited")
  completedAt       DateTime? @map("completed_at")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  user User @relation("altarRelocations", fields: [userId], references: [id])

  @@index([userId])
  @@map("altar_relocations")
}
```

---

## UI Components

### 1. RelocationWorkflowStepper
**Props:**
- `relocationId: string`
- `onComplete: () => void`

**Content:**
```
┌───────────────────────────────────────────────────┐
│  Chuyển bàn thờ - 4 bước bắt buộc                │
├───────────────────────────────────────────────────┤
│                                                   │
│  ●━━○━━○━━○  (Step 1/4)                         │
│                                                   │
│  📍 Bước 1: Đốt nén hương cuối ở nhà cũ          │
│                                                   │
│  • Thắp 1 nén hương cuối cùng                    │
│  • Đợi cháy hết hoàn toàn                        │
│  • Thời gian: Buổi sáng hoặc trưa               │
│                                                   │
│  [✓] Đã hoàn thành                               │
│                                                   │
│  [Tiếp theo] →                                   │
└───────────────────────────────────────────────────┘
```

(Tương tự cho Step 2, 3, 4)

### 2. NoKhaiQuangNeededBanner
```
┌────────────────────────────────────────────────┐
│  ✨ Lưu ý quan trọng                          │
├────────────────────────────────────────────────┤
│  KHÔNG CẦN làm lễ khai quang lại cho tượng    │
│  Bồ Tát khi chuyển sang nhà mới.              │
│                                                │
│  Bồ Tát đã ngự tại tượng rồi!                 │
└────────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`
- `design/03-domains/vows-merit/REFERENCES/ALTAR-MAINTENANCE-CHECKLIST.md`
- `design/03-domains/vows-merit/REFERENCES/HEART-INCENSE-GUIDE.md`
- External source: Wenda Q&A về chuyển nhà, di chuyển Phật đài
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 9
