# Hướng Đặt Bàn Thờ Theo Bán Cầu & Giới Hạn Bàn Thờ Kỹ Thuật Số — Altar Hemisphere Orientation & Digital Altar Restrictions

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc lập Phật đài quốc tế
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Hỗ trợ đồng tu ở nước ngoài (Úc, châu Âu, Mỹ...) xác định hướng đặt bàn thờ đúng theo vị trí địa lý thực tế, và định nghĩa những gì **không** được coi là bàn thờ kỹ thuật số hợp lệ.

---

## Owner module

`content` — canonical guide, BeginnerGuide category `ALTAR_PLACEMENT`.

---

## Actors

- `member` — người thiết lập hoặc di chuyển bàn thờ
- `system` — gợi ý hướng dựa trên geolocation, hiển thị cảnh báo bàn thờ kỹ thuật số

---

## Part 1: Hemisphere-Based Altar Orientation

### Business rule

Hướng đặt bàn thờ được xác định theo bán cầu địa lý:

| Bán cầu | Hướng ưu tiên | Lý do |
|---------|-------------|-------|
| Bắc Bán Cầu (VN, TQ, EU, US...) | Mặt Phật hướng **Nam** (nhìn về phía Nam) | Truyền thống châu Á — Phật quay mặt về phía ánh sáng |
| Nam Bán Cầu (Úc, NZ, Nam Mỹ...) | Mặt Phật hướng **Bắc** | Ánh sáng tự nhiên đến từ hướng Bắc |
| Vùng xích đạo (Singapore, Indonesia...) | Hướng **Đông** hoặc **Nam** | Linh hoạt — ưu tiên phòng sạch, thoáng |

Đây là **advisory** — không phải hard block. Thực tế nhà ở giới hạn — hệ thống gợi ý, không bắt buộc.

### Geolocation Detection

```typescript
interface LocationContext {
  latitude:   number    // từ Geolocation API hoặc IP lookup
  longitude:  number
  hemisphere: "NORTH" | "SOUTH" | "EQUATORIAL"  // |lat| < 10° = EQUATORIAL
  country:    string
}

function detectHemisphere(lat: number): "NORTH" | "SOUTH" | "EQUATORIAL" {
  if (Math.abs(lat) < 10) return "EQUATORIAL"
  return lat > 0 ? "NORTH" : "SOUTH"
}

function getAltarOrientationAdvice(hemisphere: string): OrientationAdvice {
  const map = {
    NORTH:      { recommended: "SOUTH", label: "Mặt Phật quay về hướng Nam" },
    SOUTH:      { recommended: "NORTH", label: "Mặt Phật quay về hướng Bắc" },
    EQUATORIAL: { recommended: "EAST",  label: "Mặt Phật quay về hướng Đông hoặc Nam" },
  }
  return map[hemisphere]
}
```

### FE Behavior

Khi user truy cập guide "Lập Phật Đài" hoặc form AltarLog setup:

1. Hệ thống request Geolocation API (với user permission).
2. Nếu được cấp phép → hiển thị:
   ```
   📍 Vị trí của bạn: Úc (Nam Bán Cầu)
   Khuyến nghị: Đặt bàn thờ để mặt Phật quay về hướng BẮC.
   ```
3. Nếu không được cấp phép → hiển thị selector thủ công:
   ```
   Bạn đang ở bán cầu nào?
   ○ Bắc Bán Cầu (Việt Nam, Trung Quốc, châu Âu, Mỹ...)
   ○ Nam Bán Cầu (Úc, New Zealand, Nam Phi...)
   ○ Vùng xích đạo (Singapore, Indonesia, Malaysia...)
   ```
4. Hiển thị diagram hướng đặt bàn thờ.

### E-Reader Waist/Armpit Rule (addendum)

Kinh văn điện tử (ebook reader, tablet) khi mang theo người:
- **Phải giữ ngang thắt lưng hoặc cao hơn** — không được để dưới thắt lưng, không mang vào túi quần.
- Đặt trong túi áo ngực hoặc ba lô đeo trên vai là đúng chuẩn.
- FE hiển thị tip này trong onboarding hướng dẫn sử dụng kinh điện tử.

---

## Part 2: Digital Altar Restrictions

### Business rule

Bàn thờ kỹ thuật số (màn hình điện thoại/máy tính) **KHÔNG thay thế** được bàn thờ vật lý. Tuy nhiên, có các ngoại lệ được chấp nhận:

| Tình huống | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Không gian thuê, không được đặt bàn thờ | ✅ Tạm chấp nhận | Dùng ảnh in trên giấy + cốc nước thanh tịnh |
| Du lịch ngắn hạn (<2 tuần) | ✅ Chấp nhận | Tâm Hương + ảnh in nhỏ mang theo |
| Hương trầm kỹ thuật số trên màn hình | ❌ KHÔNG hợp lệ | Không có khói thực = không có công đức hương |
| Nến điện / nến app | ❌ KHÔNG hợp lệ | Tương tự — không có lửa thực |
| Niệm kinh qua loa bluetooth (chưa khai quang) | ⚠️ ADVISORY | Loa phải sạch, không để âm nhạc thế tục |

### Restrictions Enforced in UI

Trong phần "Thắp hương" của AltarLog:

```
Bạn đang sử dụng:
○ Hương thật (trầm hương, hương trúc...)    ← chấp nhận
○ Đèn điện / nến điện                        ← hiển thị cảnh báo đỏ
○ Tâm Hương (không có bàn thờ)               ← luồng Tâm Hương riêng
```

Nếu user chọn "Đèn điện / nến điện":

```
⚠️ Cảnh báo: Hương điện và nến điện không tạo công đức cúng dường thực sự.
   Nếu bạn không thể dùng hương/nến thật, vui lòng thực hành Tâm Hương.
   [Chuyển sang Tâm Hương] [Tôi hiểu, vẫn ghi nhận]
```

Không hard block — chỉ cảnh báo mạnh.

---

## Content Structure (CMS)

Nội dung này fit vào `BeginnerGuide.category = "ALTAR_PLACEMENT"` với subcategory:

```typescript
enum AltarPlacementSubcategory {
  HEMISPHERE_ORIENTATION   = "HEMISPHERE_ORIENTATION",
  DIGITAL_RESTRICTIONS     = "DIGITAL_RESTRICTIONS",
  EREADER_CARRY_RULES      = "EREADER_CARRY_RULES",
}
```

---

## Notes for AI/codegen

- Geolocation API call phải có graceful fallback (manual selector) — không được throw error nếu user từ chối.
- `detectHemisphere()` là pure function hardcoded — không gọi external geocoding API cho logic này.
- `EQUATORIAL` threshold `|lat| < 10°` là heuristic — có thể cần điều chỉnh theo phản hồi cộng đồng.
- Digital altar restrictions là **advisory content** — lưu vào `BeginnerGuide` thông thường, không phải service logic.
- E-reader waist rule liên quan đến `ereader-anti-face-down.md` — tham chiếu chéo trong content.
