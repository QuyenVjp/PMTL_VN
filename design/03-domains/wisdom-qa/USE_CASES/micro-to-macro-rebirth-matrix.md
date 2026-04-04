# Ma Trận Định Mức Chú Vãng Sanh cho Sinh vật — Micro-to-Macro Rebirth Matrix

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source
> **Cập nhật:** 2026-04-04

---

## Purpose

Vô tình hoặc cố ý giết hại các loài vật khác nhau (kiến, muỗi, chuột, gà, lợn, gia súc...), mỗi loài có mức độ karma khác nhau. Người tu **tuyệt đối không được niệm thiếu** số lượng chú Vãng Sanh tương ứng. Hệ thống tự động phát hiện loài vật bị hại và yêu cầu niệm đủ số chú.

---

## Owner module

`wisdom-qa`, `life-liberation` — RebirthMatrixService / SpeciesQuotaEngine

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User logs accidental/intentional harm to animal | ✅ Detect species type |
| Species identified (ant, mosquito, mouse, etc.) | ✅ Look up karma coefficient |
| Coefficient loaded (e.g., ant=1, cow=108) | ✅ Calculate required recitation quota |
| User begins recitation | ✅ Track Rebirth Mantra count |
| Quota reached | ✅ Release lock, allow completion |
| Quota NOT met | ❌ Block session end, show remaining |

---

## Species Karma Matrix

```typescript
interface SpeciesQuotaMap {
  ant: 1;              // 1x Rebirth Mantra
  mosquito: 1;         // 1x Rebirth Mantra
  fly: 1;              // 1x Rebirth Mantra
  mouse: 7;            // 7x Rebirth Mantra
  bird: 21;            // 21x Rebirth Mantra
  chicken: 27;         // 27x Rebirth Mantra
  duck: 27;            // 27x Rebirth Mantra
  fish: 49;            // 49x Rebirth Mantra
  pig: 49;             // 49x Rebirth Mantra
  cow: 108;            // 108x Rebirth Mantra
  horse: 108;          // 108x Rebirth Mantra
}
```

---

## FE Behavior

```
Báo Cáo Tâm Sự Hậu Quả:

Động vật bị hại: [Chọn loài vật]

Sau khi chọn "Lợn":

Ma Trận Định Mức: Lợn
━━━━━━━━━━━━━━━━━━━━━━

Yêu cầu: 49x Chú Vãng Sanh

Đã niệm: 0/49

[Bắt đầu Niệm]

---

Progress:
████░░░░░░░░░░░░░░░░ (15/49)

[Tiếp tục] [Tạm dừng]
```

---

## Audit

| Action | Trigger |
|---|---|
| `rebirth.animal_harm_logged` | User reports harm to species |
| `rebirth.species_identified` | Animal type confirmed |
| `rebirth.quota_calculated` | Karma coefficient applied |
| `rebirth.quota_incomplete` | Recitation count below threshold |
| `rebirth.quota_met` | Sufficient mantras recited |
| `rebirth.liberation_completed` | Full matrix quota satisfied |

---

## Notes

Species-specific quotas prevent incomplete karmic resolution and ensure animals reach appropriate rebirth realms.
