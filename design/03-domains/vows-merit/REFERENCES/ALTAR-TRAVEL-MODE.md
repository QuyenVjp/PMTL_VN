# ALTAR-TRAVEL-MODE

## Owner
- `vows-merit` (altar maintenance domain)

## Purpose
Chế độ **đi công tác / đi xa** (Travel Mode) cho người tu không ở nhà nhưng vẫn muốn duy trì thực hành.

---

## Business Rule: Travel Mode

### Rule - Tâm Hương Fallback when Away from Home
**Nghiệp vụ:**
- Khi user bật `[Travel Mode]`, hệ thống hướng dẫn cách duy trì thực hành khi không có bàn thờ vật lý.
- Cho phép user thắp **Tâm Hương** (心香 - Heart Incense) thay vì thắp hương thật.

---

## Travel Mode Setup Checklist

### Trước khi đi (Pre-Travel Checklist)

#### 1. Thay nước, hoa quả
- Thay nước cúng mới, sạch.
- Thay hoa quả tươi (nếu có).
- **Lưu ý:** Để nguyên trên bàn thờ, **KHÔNG CẦN** trùm màn hoặc che đậy.

#### 2. Thông báo với Bồ Tát
**Lời khấn đi xa:**
```
"Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,

Con là [Tên của bạn],
con sắp đi xa từ ngày [ngày bắt đầu] đến ngày [ngày về].
Con xin kính thỉnh Bồ Tát tiếp tục gia hộ cho gia đình con và ngôi nhà này.

Khi đi xa, con sẽ thắp tâm hương và niệm kinh mỗi ngày.

Con xin kính lễ Bồ Tát.
Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát. (3 lần)"
```

#### 3. Chụp ảnh bàn thờ (Optional but Recommended)
**Hướng dẫn:**
- Chụp một bức ảnh bàn thờ (lưu ý: chụp lúc **KHÔNG thắp hương**).
- Lưu ảnh vào điện thoại hoặc in ra.
- Bọc ảnh in bằng vải đỏ nếu mang theo.

**Mục đích:**
- Khi đi xa, có thể mang ảnh ra, đặt ở nơi sạch sẽ, thắp Tâm Hương trước ảnh.

---

## During Travel (Khi đi xa)

### 1. Thắp Tâm Hương (Heart Incense)
**Nghiệp vụ:**
- **Tâm Hương** = thắp hương trong lòng, không thắp hương thật.
- Dùng khi:
  - Đang ở nơi không có bàn thờ (khách sạn, công ty, v.v.).
  - Không tiện thắp hương vật lý (cấm lửa, phòng có khói báo cháy, v.v.).

**Cách thắp Tâm Hương:**
1. Tìm nơi sạch, yên tĩnh (góc phòng, ban công, v.v.).
2. Rửa tay sạch.
3. Mang ảnh bàn thờ ra (nếu có) hoặc hướng về hướng nhà.
4. Tưởng tượng mình đang thắp 3 nén hương trước bàn thờ.
5. Niệm trong lòng:
   ```
   "Namo Đại Từ Đại Bi Quán Thế Âm Bồ Tát,
   con xin kính thỉnh Bồ Tát,
   con đang thắp tâm hương kính lễ Ngài."
   ```
6. Niệm kinh như thường lệ (Đại Bi Chú, Tâm Kinh, v.v.).

---

### 2. Công khóa tối giản (Busy Mode + Travel Mode)
**Nghiệp vụ:**
- Khi đi công tác, user có thể bật cả `Travel Mode` lẫn `Busy Mode`.
- Cho phép niệm công khóa tối giản:
  - 3x Đại Bi Chú (thay vì 7x)
  - 1x Tâm Kinh (thay vì 3x)
  - Tâm Hương thay vì hương thật

---

## UX Flow

### Flow: Activate Travel Mode
```
User click [Bật chế độ đi xa]
  ↓
Show TravelModeSetupModal
  ↓ Tab 1: "Trước khi đi"
  ↓   → Checklist: Thay nước, thay hoa quả
  ↓   → Lời khấn đi xa (copy-paste enabled)
  ↓   → [✓ Đã hoàn thành]
  ↓ Tab 2: "Chuẩn bị ảnh bàn thờ (tùy chọn)"
  ↓   → Hướng dẫn chụp ảnh
  ↓   → Upload ảnh lên app (optional)
  ↓   → [Bỏ qua] hoặc [Đã chụp]
  ↓ Tab 3: "Khi đi xa"
  ↓   → Hướng dẫn thắp Tâm Hương
  ↓   → Công khóa tối giản
  ↓
[Bật Travel Mode] → Save AltarTravelMode record
  ↓
Dashboard shows: 🧳 "Chế độ đi xa đang bật"
  ↓
[Tắt Travel Mode] khi về nhà
```

---

## Schema Hints

### New model: AltarTravelMode
```prisma
model AltarTravelMode {
  id              String    @id @default(cuid())
  publicId        String    @unique @map("public_id")
  userId          String    @map("user_id")
  startDate       DateTime  @map("start_date")
  endDate         DateTime? @map("end_date")
  destination     String?   // Optional: nơi đến
  altarPhotoUrl   String?   @map("altar_photo_url")  // Optional: ảnh bàn thờ
  prayerRecited   Boolean   @default(false) @map("prayer_recited")
  active          Boolean   @default(true)
  deactivatedAt   DateTime? @map("deactivated_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user User @relation("altarTravelModes", fields: [userId], references: [id])

  @@index([userId])
  @@index([active])
  @@map("altar_travel_modes")
}
```

---

## UI Components

### 1. TravelModeToggle (Dashboard Widget)
```
┌────────────────────────────────────────────┐
│  🧳 Chế độ đi xa                          │
├────────────────────────────────────────────┤
│                                            │
│  Sắp đi công tác hoặc đi xa?              │
│  Bật chế độ này để duy trì tu tập.        │
│                                            │
│  [Bật chế độ đi xa]                       │
│                                            │
└────────────────────────────────────────────┘
```

**When Active:**
```
┌────────────────────────────────────────────┐
│  🧳 Chế độ đi xa (đang bật)               │
├────────────────────────────────────────────┤
│  Từ: 10/04/2026                           │
│  Đến: 15/04/2026                          │
│                                            │
│  💡 Nhớ thắp Tâm Hương mỗi ngày           │
│                                            │
│  [Xem hướng dẫn]  [Tắt chế độ]            │
└────────────────────────────────────────────┘
```

### 2. AltarPhotoGuide
```
┌────────────────────────────────────────────┐
│  📸 Chuẩn bị ảnh bàn thờ                  │
├────────────────────────────────────────────┤
│                                            │
│  1. Chụp ảnh bàn thờ lúc KHÔNG thắp hương │
│  2. Lưu ảnh vào điện thoại                │
│  3. (Tùy chọn) In ra, bọc vải đỏ mang theo│
│                                            │
│  Khi đi xa, đặt ảnh ở nơi sạch, thắp     │
│  Tâm Hương trước ảnh.                     │
│                                            │
│  [Upload ảnh] (Optional)                  │
│                                            │
└────────────────────────────────────────────┘
```

### 3. HeartIncenseGuideCard
```
┌────────────────────────────────────────────┐
│  🙏 Hướng dẫn thắp Tâm Hương              │
├────────────────────────────────────────────┤
│                                            │
│  1. Tìm nơi sạch, yên tĩnh                │
│  2. Rửa tay sạch                          │
│  3. Hướng về nhà (hoặc đặt ảnh bàn thờ)  │
│  4. Tưởng tượng thắp 3 nén hương          │
│  5. Niệm: "Namo Đại Từ Đại Bi..."        │
│  6. Niệm kinh như thường lệ               │
│                                            │
│  [Xem lời khấn đầy đủ]                    │
│                                            │
└────────────────────────────────────────────┘
```

---

## References
- `design/03-domains/vows-merit/REFERENCES/PHAT-DAI-BAO-DUONG.md`
- `design/03-domains/vows-merit/REFERENCES/HEART-INCENSE-GUIDE.md`
- `design/03-domains/content/REFERENCES/DAILY-GONGKE-STEPS.md`
- `design/03-domains/content/REFERENCES/ELDERLY-GONGKE.md` (busy mode)
- External source: Wenda Q&A về tâm hương, đi công tác
- `design/05-references/external-research/XLFM_RITUAL_SOURCE_INDEX.md`

---

## Version History
- 2026-04-04: Initial creation from BRD Phase 2 Module 9
