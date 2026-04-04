# Cấm Đun Sôi Nước Đại Bi — Great Compassion Water Anti-Boiling Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Nước Đại Bi (Great Compassion water) dùng để tẩy rửa tâm linh. Đó là nước thiêng liêng mang năng lượng từ chú Đại Bi. **Tuyệt đối cấm đun sôi sùng sục hay làm nóng quá mực**. Chỉ được dùng ở nhiệt độ bình thường.

---

## Owner module

`altar-management` — WaterConsecrationService / TemperatureGuard

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User logs Great Compassion water usage | ✅ Show usage guidelines |
| Guidance: Do not boil or heat | ✅ Display prominent warning |
| User confirms water at normal temperature | ✅ Log usage, record timestamp |
| System detects boiling/heating attempt | ❌ Block usage, show warning |
| User acknowledges restriction | ✅ Complete usage entry |

---

## FE Behavior

```
Sử Dụng Nước Đại Bi:

⚠️ CẢNH BÁO QUAN TRỌNG

Nước Đại Bi là nước thiêng liêng.
Tuyệt đối KHÔNG được đun sôi
hoặc làm nóng quá mức.

Chỉ dùng ở nhiệt độ bình thường
để bảo vệ năng lượng tẩy rửa
của nước thiêng liêng.

[ ] Tôi cam kết dùng nước Đại Bi
    ở nhiệt độ bình thường, không
    đun sôi hay làm nóng.

[Hoàn thành]
```

---

## Audit

| Action | Trigger |
|---|---|
| `water.great_compassion_usage_initiated` | User starts logging usage |
| `water.temperature_warning_shown` | Safety guidelines displayed |
| `water.normal_temperature_confirmed` | User acknowledges restriction |
| `water.boiling_restriction_logged` | Usage recorded with constraint |

---

## Notes

Temperature preservation maintains the spiritual potency of Great Compassion water.
