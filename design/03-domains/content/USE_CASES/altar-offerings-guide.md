# Cẩm Nang Lập Phật Đài và Dâng Cúng — Altar & Offerings Guide

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required
> **Cập nhật:** 2026-04-04

---

## 1. Overview

Hệ thống Web cần một chuyên mục chi tiết hỗ trợ đồng tu mới thiết lập và duy trì bàn thờ tại gia theo đúng chuẩn. Đây là nội dung **Content-owned** — canonical guide, không phải user state.

---

## 2. Quy Tắc Vị Trí Phật Đài (Placement Rules)

### Vị trí CẤM đặt bàn thờ:
- Đối diện bếp (khói bếp xông vào bàn thờ)
- Gần nhà vệ sinh
- Trong phòng ngủ vợ chồng
- Trên các thiết bị điện tử (tủ lạnh, TV, máy giặt)
- Ban công cơi nới / không vững chắc
- Dưới xà ngang / dầm nhà
- Đối diện cửa nhà vệ sinh

### Vị trí KHUYẾN NGHỊ:
- Phòng khách, hướng ra cửa chính
- Vị trí cao, sạch sẽ, thoáng đãng
- Nền tường sạch, không có hình ảnh/poster phía sau
- Tách biệt với khu vực sinh hoạt ồn ào

### Admin CMS Fields:
- `ruleKey`: placement rule identifier
- `severity`: "mandatory" | "recommended" | "advisory"
- `canonicalWording`: Lời khai thị chính thức
- `shortReason`: Lý do ngắn gọn
- `sourceReference`: Trích nguồn

---

## 3. Quy Tắc Dâng Cúng (Offering Rules)

### Nước Đại Bi (Great Compassion Water)
- Dùng cốc sứ/thủy tinh **MỚI** (không dùng cốc đã qua sử dụng)
- Đặt trước tượng Phật/Bồ Tát trong khi niệm Chú Đại Bi
- **KHÔNG** uống trực tiếp từ cốc cúng — rót ra cốc khác để uống
- Nước cúng nên thay hàng ngày

#### Ràng buộc bổ sung khi hạ nước cúng (enforce tại backend + FE)

| Quy tắc | Severity |
|---|---|
| Không uống trực tiếp từ cốc cúng — rót ra cốc khác | MANDATORY |
| Không đun sôi bằng lò vi sóng | MANDATORY |
| Không dùng tưới cây | MANDATORY |
| Nếu nước cúng Thái Tuế / Quan Đế / Nam Kinh Bồ Tát: niệm 1 biến Chú Đại Bi trước khi uống | MANDATORY |

Khi user bấm **[Hạ nước cúng]**, FE hiển thị modal 3–4 checkbox bắt buộc (tất cả phải tích mới cho submit).
API validate `checklistConfirmed` + `daiBiRecitedFirst` (nếu `waterType ≠ GUAN_YIN`).
Chi tiết enforcement: [validate-altar-oil-and-water.md](../../vows-merit/USE_CASES/validate-altar-oil-and-water.md)

### Dầu Thực Vật (Vegetable Oil Lamp)
- Tác dụng: sáng mắt, khai mở trí tuệ
- Dùng dầu thực vật sạch (dầu olive, dầu đậu nành)
- **KHÔNG** dùng dầu động vật
- Dầu cúng xong: **phải nấu chín** mới được ăn, không ăn sống

#### Enum API — OilType Validation (enforce tại backend)

| Enum | Tên | Trạng thái |
|---|---|---|
| `OLIVE` | Dầu olive | ✅ ALLOWED |
| `CORN` | Dầu ngô | ✅ ALLOWED |
| `CANOLA` | Dầu hạt cải | ✅ ALLOWED |
| `SOYBEAN` | Dầu đậu nành | ✅ ALLOWED |
| `SUNFLOWER` | Dầu hướng dương | ✅ ALLOWED |
| `SESAME` | Dầu mè | ❌ FORBIDDEN — mùi thơm, uế tạp |
| `PEANUT` | Dầu đậu phộng | ❌ FORBIDDEN — mùi thơm, uế tạp |
| `COCONUT_SCENTED` | Dầu dừa thơm | ❌ FORBIDDEN — mùi thơm, uế tạp |
| `ANIMAL_FAT` | Dầu động vật | ❌ FORBIDDEN — nguồn gốc sát sinh |

API reject `FORBIDDEN` với HTTP 422 + `severity: "SPIRITUAL_BLOCK"`.
Chi tiết enforcement: [validate-altar-oil-and-water.md](../../vows-merit/USE_CASES/validate-altar-oil-and-water.md)

### Hoa Quả (Fruit Offerings)
- Chỉ dùng quả có mùi thơm (táo, cam, quýt, xoài, nho)
- **KHÔNG** dùng quả có gai (sầu riêng), quả thối/hỏng
- Số lượng tầng xếp quả: **số LẺ** (1, 3, 5 quả mỗi đĩa)
- Số lượng đĩa: không giới hạn nhưng nên đối xứng

### Hương (Incense)
- Thắp hương mỗi sáng và tối (nếu có bàn thờ)
- Không có bàn thờ: dùng **Tâm Hương** (quán tưởng thắp hương trong đầu)
- Hương tàn: chờ tắt hẳn, thu dọn gọn gàng

---

## 4. Content Structure

### Guide Categories (map to BeginnerGuide.category)
Altar content fits naturally into existing BeginnerGuide model:

| Category Key | Nội dung |
|-------------|---------|
| `ALTAR_SETUP` | Hướng dẫn lập Phật đài từ đầu |
| `ALTAR_PLACEMENT` | Quy tắc vị trí chi tiết |
| `ALTAR_OFFERINGS` | Quy tắc dâng cúng từng loại |
| `ALTAR_MAINTENANCE` | Bảo quản, vệ sinh, di chuyển bàn thờ |
| `HEART_INCENSE` | Hướng dẫn Tâm Hương cho người không có bàn thờ |

### Relation to Existing Models
- `AltarLog` (Engagement) — tracks user's altar actions (INCENSE, MAINTENANCE, MOVE, HEART_INCENSE)
- `BeginnerGuide` (Content) — canonical guide content
- No new model needed — content fits existing architecture

---

## 5. Admin Features

### Guide CMS
- Tạo/sửa bài hướng dẫn cho từng category
- Kèm ảnh minh họa (MediaAsset reference)
- Phân loại severity cho từng quy tắc
- Multi-language support (Vietnamese primary, Chinese reference)

### Checklist Builder
- Admin tạo checklist items cho từng loại hành động
- Map to `AltarLog.checklistStateJson` schema
- VD: Checklist "Lập bàn thờ mới" = 8 items

---

## 6. Module Ownership

| Concern | Owner |
|---------|-------|
| Canonical placement/offering rules | Content (BeginnerGuide) |
| User altar action logs | Engagement (AltarLog) |
| Checklist definitions | Content |
| Checklist state per user | Engagement |
| Media assets (photos) | Content / Media |
