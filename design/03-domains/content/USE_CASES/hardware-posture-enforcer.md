# Giám Sát Tư Thế Đọc Kinh — Hardware Posture Enforcer

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Kinh Phật không được đọc trong tư thế nằm ngang (thiết bị gần như nằm phẳng). Hệ thống giám sát góc nghiêng thiết bị qua accelerometer: nếu thiết bị gần nằm phẳng (beta < 10°) trong khi E-Reader đang mở, dim màn hình và hiển thị cảnh báo tư thế.

---

## Owner module

`content` — RecitationService / PostureGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — đang đọc kinh, có thể đang nằm
- `system` — detect tư thế qua DeviceOrientationEvent, hiển thị warning

---

## Trigger

Khi E-Reader mở và `deviceorientation` event phát hiện thiết bị gần nằm phẳng (|beta| < 10 AND |gamma| < 30).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Thiết bị thẳng đứng (45-90°) | ✅ Đọc kinh bình thường |
| Thiết bị nghiêng (10-45°) | ✅ Cho phép đọc |
| Thiết bị gần nằm ngang (|beta| < 10°) | ⚠️ Dim màn hình, hiện cảnh báo |
| User xác nhận đã ngồi dậy | ✅ Resume đọc kinh |
| E-Reader không mở | ✅ Không kiểm tra tư thế |

---

## Input Contract

```typescript
// FE-only: DeviceOrientation API
interface DeviceOrientationState {
  beta: number   // X-axis: -180 to 180 (0 = flat, 90 = upright portrait)
  gamma: number  // Y-axis: -90 to 90
}

function isLyingFlat(orientation: DeviceOrientationState): boolean {
  return Math.abs(orientation.beta) < 10 && Math.abs(orientation.gamma) < 30
}

// Permission: DeviceOrientationEvent.requestPermission() on iOS 13+
```

---

## FE Implementation

```typescript
// Mount when E-Reader opens
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (event) => {
    if (isLyingFlat({ beta: event.beta, gamma: event.gamma })) {
      showPostureWarning()  // dim screen + modal
    } else {
      dismissPostureWarning()  // restore screen
    }
  })
}

function showPostureWarning() {
  // Dim scripture content to 20% opacity
  // Show non-dismissable modal (except via "Tôi đã ngồi đúng cách")
}
```

---

## FE Behavior — Warning Modal

```
⚠️ CẢNH BÁO TÔN KÍNH

Kinh Phật không được đọc trong
tư thế nằm ngang.

LUẬT PHÁP MÔN:
─────────────────────────────────────

• CẤM nằm ngang mà đọc Kinh
• CẤM để thiết bị chứa Kinh
  thấp hơn thắt lưng
• CẤM để Kinh dưới chân giường
• CẤM dùng nước bọt lật trang
  (thực tế hay kỹ thuật số)

═════════════════════════════════════

Hành động đúng:

✅ Ngồi dậy, lưng thẳng
✅ Đưa thiết bị lên ngang ngực hoặc cao hơn
✅ Lật trang bằng ngón tay khô

[Tôi đã ngồi đúng cách]
(modal closes, reading resumes)
```

---

## Audit

| Action | Trigger |
|---|---|
| `posture.lying_flat_detected` | |beta| < 10° |
| `posture.warning_shown` | User alerted |
| `posture.correction_acknowledged` | User confirms upright |
| `posture.reading_resumed` | Normal reading restored |

---

## Notes for AI/codegen

- `DeviceOrientationEvent.requestPermission()` cần user gesture trên iOS 13+ — request khi user lần đầu mở E-Reader.
- Nếu device không hỗ trợ orientation API → skip posture guard (graceful degradation).
- Modal chỉ dismiss qua button "Tôi đã ngồi đúng cách" — không dismiss khi user cầm thiết bị thẳng lại (vì could be accidental).
- Đây là UX education, không phải hard block — user có thể dismiss và tiếp tục.

---

## Related

- [ereader-anti-face-down.md](./ereader-anti-face-down.md) — face-down device detection (khác biệt: tư thế úp mặt vs nằm ngang)
- [sutra-physical-z-index-rule.md](./sutra-physical-z-index-rule.md) — physical height rules for scriptures
