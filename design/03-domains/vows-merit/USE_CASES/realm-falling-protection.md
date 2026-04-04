# Hàng Rào Chống "Rớt Cõi" Khi Bị Trộn Vàng Mã — Realm Falling Protection

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Đốt NNN cho người mới mất là để tạo năng lượng đẩy họ lên các cõi cao. Nhưng nếu người nhà đốt kèm Vàng mã, vong linh sẽ bị nổi lòng tham, sà xuống nhặt và bị rớt thẳng xuống Địa Phủ.

---

## Owner module

`vows-merit` / `engagement` — DeceasedLiberationService / RealmFallingProtector

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User opens [Đốt NNN siêu độ người quá cố] | ✅ Ask: "Có đốt vàng mã không?" |
| Answer = Có | ⚠️ Activate Emergency Override |
| Answer = Không | ✅ Normal flow |
| Emergency Override active | ✅ Increase NNN target |
| Show blocking chant | ✅ Lock completion until recited |

---

## Emergency Override Flow

```
Step 1: Warning
"Nguy hiểm! Việc đốt vàng mã sẽ kích
 hoạt lòng tham khiến vong linh bị
 đọa xuống cõi thấp."

Step 2: Auto-increase target
"Tăng target NNN lên để 'áp đảo' số vàng mã"

Step 3: Blocking chant
"Xin Quán Thế Âm Bồ Tát phù hộ cho
 [Tên người mất] được lên cõi trên,
 tuyệt đối đừng tham luyến những đồng
 tiền giá trị thấp ở nhân gian."

[ ] Tôi đã khấn câu này (lip recitation required)

[Hoàn thành] (disabled until checked)
```

---

## Audit

| Action | Trigger |
|---|---|
| `deceased_liberation.gold_paper_detected` | User answers "Có" to gold paper |
| `protection.emergency_override_activated` | Override mode on |
| `protection.blocking_chant_recited` | User confirmed chant |
| `deceased_liberation.realm_protected` | Liberation finalized |

---

## Notes

Hard protection against karmic downfall through greed-activation when mixed offerings present.