# Giao Thức Cấm Nhìn Chằm Chằm Xuống Nước — No-Water-Staring Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi đang kết nối năng lượng Kinh và nhìn chằm chằm xuống mặt nước trong lúc phóng sinh, user có thể thu hút vong linh/thủy quái từ dưới nước kéo trường khí. User phải ngẩng đầu lên trời khi tụng niệm tại địa điểm nước. Hệ thống phát hiện user đang ở gần nước (qua GPS) và đang tụng niệm, chuyển màn hình thành chế độ hướng dẫn ngẩng đầu.

---

## Owner module

`vows-merit` — LifeLiberationService / MentalFocusGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang thực hiện phóng sinh tại ao/hồ/sông
- `system` — phát hiện gần nước + đang đếm, kích hoạt màn hình hướng dẫn

---

## Trigger

Khi `environment.location.nearWater = true` AND counter đang active (user đang tụng niệm).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User tại địa điểm nước (GPS verified) | ✅ Set waterProximityFlag = true |
| Counter active + nearWater | ✅ Kích hoạt màn hình cảnh báo |
| Màn hình cảnh báo hiển thị | ✅ Blur camera view, enlarge guidance text |
| User tụng xong, rời xa nước | ✅ Màn hình về bình thường |
| Không có GPS permission | ✅ Graceful degrade, không block |

---

## Input Contract

```typescript
// FE-only: location detection
interface WaterProximityState {
  nearWater: boolean       // từ GPS/địa điểm được chọn thủ công
  distanceToWaterMeters: number
  isReciting: boolean
}

function shouldActivateWaterGuard(state: WaterProximityState): boolean {
  return state.nearWater && state.isReciting
}
```

---

## FE Implementation

```typescript
// When at water location + actively reciting
if (environment.location.nearWater && counter.isReciting) {
  screen.setMode('WATER_GUARD_ACTIVE')
  // Blur/hide camera view
  // Show large guidance text
  // Dim bottom counter UI, keep counter button accessible
}

// When no longer near water or recitation stopped
if (!environment.location.nearWater || !counter.isReciting) {
  screen.setMode('NORMAL')
}
```

---

## FE Behavior — Water Guard Screen

```
═══════════════════════════════════════════

  🙏 HÃY NGẨNG ĐẦU LÊN TRỜI 🙏

═══════════════════════════════════════════

CẤM NHÌN CHẰM CHẰM XUỐNG MẶT NƯỚC

════════════════════════════════════════════

Lý do:
─────────────────────────────────────────
Khi bạn đang kết nối năng lượng Kinh
và nhìn chằm chằm xuống nước, bạn có
thể thu hút vong linh/thủy quái từ
dưới nước kéo trường khí của bạn.

════════════════════════════════════════════

✅ Hành động đúng:
   Ngẩng đầu lên trời
   Nhìn vào mây, ánh sáng Mặt trời
   Cảm nhận năng lượng từ trên cao

════════════════════════════════════════════

Lần niệm: [████░░░░░░] 34/49

[+ 1 Niệm]
```

---

## Audit

| Action | Trigger |
|---|---|
| `water.proximity_detected` | User at lake/river GPS zone |
| `water.staring_guard_active` | Recitation started at water |
| `water.screen_guidance_shown` | Upward guidance displayed |
| `water.guard_deactivated` | User leaves water area |

---

## Notes for AI/codegen

- Detect "gần nước" qua: (1) GPS proximity đến body of water; (2) user chọn địa điểm "Ao/Hồ/Sông/Biển" thủ công.
- Screen không block counter button — user vẫn đếm được, chỉ là guidance overlay.
- Camera view bị blur (không ẩn hoàn toàn) để user vẫn thấy môi trường xung quanh nhưng không tập trung vào mặt nước.
- Graceful degradation: nếu không có GPS permission → skip guard, không block.

---

## Related

- [log-life-release.md](./log-life-release.md) — life release base flow
- [ecological-liability-exemption-prayer.md](./ecological-liability-exemption-prayer.md) — exemption prayer
- [proxy-liberation-karma-shield.md](../../engagement/USE_CASES/proxy-liberation-karma-shield.md) — proxy release rules
