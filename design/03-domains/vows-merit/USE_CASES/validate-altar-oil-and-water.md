# Xác Thực Loại Dầu & Quy Tắc Nước Cúng — Altar Oil & Water Validation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — "2.Sách kinh.pdf", Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Định nghĩa 2 nhóm quy tắc cứng cho việc dâng cúng tại bàn thờ:

1. **Oil Type Validation** — Chỉ được dùng dầu thực vật nguyên chất. Cấm dầu có mùi thơm vì uế tạp.
2. **Great Compassion Water Constraints** — Quy tắc hạ nước cúng: không uống trực tiếp, không vi sóng, không tưới cây.

Cả hai đều thuộc domain `vows-merit` (AltarLog / AltarIncenseSession) và phải được enforce ở cả API layer và FE UI.

---

## Owner module

`vows-merit` — [xem CONTRACTS.md](../CONTRACTS.md)

---

## Part A — Oil Type Validation (Logic 1)

### Business Rule

Đèn dầu trên bàn thờ chỉ được dùng dầu thực vật nguyên chất không mùi. Dầu có mùi thơm (mè, đậu phộng, dừa thơm) bị coi là **uế tạp**, làm lấn át mùi trầm hương và thu hút tà khí.

**Danh sách ALLOWED:**
| Enum value | Tên tiếng Việt |
|---|---|
| `OLIVE` | Dầu olive |
| `CORN` | Dầu ngô |
| `CANOLA` | Dầu hạt cải |
| `SOYBEAN` | Dầu đậu nành |
| `SUNFLOWER` | Dầu hướng dương |

**Danh sách FORBIDDEN (reject với warning đỏ):**
| Enum value | Tên tiếng Việt | Lý do |
|---|---|---|
| `SESAME` | Dầu mè | Mùi thơm đặc trưng — uế tạp |
| `PEANUT` | Dầu đậu phộng | Mùi thơm — uế tạp |
| `COCONUT_SCENTED` | Dầu dừa thơm | Mùi thơm — uế tạp |
| `ANIMAL_FAT` | Dầu động vật | Nguồn gốc sát sinh |

### Actors

- `member` — khi log AltarLog với oilType
- `system` — validate và reject/warn

### Trigger

Bất kỳ API call nào có trường `oilType` trong AltarLog payload.

### Input Contract

```
AltarOfferingOilDto {
  oilType: OilTypeEnum  // bắt buộc khi offeringType includes OIL_LAMP
  customOilNote?: string  // tùy chọn, max 200 chars
}
```

### Write Path

1. Parse `oilType` qua Zod Enum: `z.enum(["OLIVE","CORN","CANOLA","SOYBEAN","SUNFLOWER","SESAME","PEANUT","COCONUT_SCENTED","ANIMAL_FAT"])`.
2. Nếu `oilType` thuộc FORBIDDEN list → throw `422 Unprocessable Entity`:
   ```json
   {
     "error": "oil_type_forbidden",
     "message": "Dầu mè/đậu phộng/có mùi thơm bị cấm dùng thắp đèn Phật đài. Vui lòng chọn dầu olive, dầu ngô hoặc dầu hạt cải.",
     "severity": "SPIRITUAL_BLOCK"
   }
   ```
3. Nếu `oilType` hợp lệ → proceed với AltarLog creation.
4. Audit: `altar.offering.oil-type.accepted` hoặc `altar.offering.oil-type.rejected`.

### FE Behavior

- Dropdown render dầu FORBIDDEN với icon `⛔` và tooltip cảnh báo đỏ.
- Không ẩn hoàn toàn (để user biết tại sao không dùng được).
- Nút [Lưu] disabled khi FORBIDDEN oil đang được chọn.

### Errors

| Condition | Code | HTTP |
|---|---|---|
| `oilType` thuộc FORBIDDEN | `oil_type_forbidden` | 422 |
| `oilType` missing khi offeringType = OIL_LAMP | `invalid_body` | 400 |

---

## Part B — Great Compassion Water Constraints (Logic 3)

### Business Rule

Nước cúng Quan Thế Âm Bồ Tát có năng lượng linh thiêng. Các ràng buộc:

1. **Không uống trực tiếp từ cốc cúng** — rót ra cốc khác để uống.
2. **Không đun sôi bằng lò vi sóng** — làm phân tán từ trường linh khí.
3. **Không tưới cây** — nước mang nghiệp của cây hấp thu, không về được người.
4. **Nếu là nước cúng Thái Tuế / Quan Đế / Nam Kinh Bồ Tát (không phải Quán Thế Âm)**: bắt buộc niệm 1 biến Chú Đại Bi trước khi uống.

### Actors

- `member` — trigger khi bấm [Hạ nước cúng]
- `system` — hiển thị mandatory checklist, ghi log

### Trigger

User bấm **[Hạ nước cúng]** trong AltarLog flow.

### Input Contract

```
WaterOfferingTakeDownDto {
  waterType:          "GUAN_YIN" | "THAI_TUE" | "GUAN_DI" | "NAM_KINH" | "OTHER"
  checklistConfirmed: {
    pouredToCup:        boolean  // Đã rót ra cốc khác, không uống trực tiếp
    noMicrowave:        boolean  // Không đun vi sóng
    notForWatering:     boolean  // Không dùng tưới cây
  }
  // Nếu waterType != GUAN_YIN, bắt buộc thêm:
  daiBiRecitedFirst?: boolean   // Đã niệm 1 biến Chú Đại Bi trước khi uống
}
```

### Write Path

1. Validate Zod: tất cả 3 checkboxes trong `checklistConfirmed` phải là `true`.
   - Nếu bất kỳ checkbox nào `false` → `400 BadRequest: "water_checklist_incomplete"`.
2. Nếu `waterType !== "GUAN_YIN"` → validate `daiBiRecitedFirst === true`.
   - Nếu `false` → `400 BadRequest: "dai_bi_required_before_drinking"`.
3. Tạo `AltarLog` record với `action = WATER_TAKEDOWN`.
4. Audit: `altar.water.takedown.confirmed`.

### FE Behavior

Khi user bấm [Hạ nước cúng]:
1. Modal hiện 3 checkbox bắt buộc:
   - `[_] Tôi đã rót ra cốc khác, không uống trực tiếp từ cốc cúng.`
   - `[_] Tôi không đun nước này bằng lò vi sóng.`
   - `[_] Tôi không dùng nước này để tưới cây.`
2. Nếu `waterType !== GUAN_YIN` → hiện thêm:
   - `[_] Tôi đã niệm 1 biến Chú Đại Bi trước khi uống.`
   - Kèm inline text nhỏ: `"Nước cúng các vị Bồ Tát khác (Thái Tuế, Quan Đế...) cần niệm Chú Đại Bi trước khi uống."`
3. Nút [Xác nhận hạ] disabled cho đến khi tất cả checkbox đã tích.

### Errors

| Condition | Code | HTTP |
|---|---|---|
| Checkbox chưa đủ | `water_checklist_incomplete` | 400 |
| `daiBiRecitedFirst` missing/false khi waterType non-GUAN_YIN | `dai_bi_required_before_drinking` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

### Audit

| Action | Trigger |
|---|---|
| `altar.water.takedown.confirmed` | User hoàn thành checklist |
| `altar.water.checklist.rejected` | User cố submit khi chưa đủ checkbox (FE block) |

---

## Schema Notes for AI/codegen

```prisma
enum OilType {
  OLIVE
  CORN
  CANOLA
  SOYBEAN
  SUNFLOWER
  // FORBIDDEN — API reject, FE warn
  SESAME
  PEANUT
  COCONUT_SCENTED
  ANIMAL_FAT
}

enum WaterOfferingSource {
  GUAN_YIN
  THAI_TUE
  GUAN_DI
  NAM_KINH
  OTHER
}
```

- `AltarLog` cần thêm field `oilType?: OilType` và `waterSource?: WaterOfferingSource`.
- Validation logic dầu cần tách thành `OilTypeGuard` injectable để tái sử dụng trong cả admin CMS update flow.
- Checklist confirmation KHÔNG được lưu vào DB dưới dạng chuỗi — lưu boolean flags riêng để có thể query analytics sau.

---

## Related

- [schedule-altar-lamp-reminder.md](./schedule-altar-lamp-reminder.md) — Lamp-Incense sync notification
- [altar-offerings-guide.md](../../content/USE_CASES/altar-offerings-guide.md) — Canonical offering guide content
