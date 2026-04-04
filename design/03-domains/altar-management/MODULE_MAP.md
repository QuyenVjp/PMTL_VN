# altar-management — Module Map

> **Cập nhật:** 2026-04-04
> **Decisions:** [DECISIONS.md](./DECISIONS.md)
> **Contracts:** [CONTRACTS.md](./CONTRACTS.md)

---

## Responsibility

`altar-management` sở hữu tất cả business rules kiểm tra và xác nhận **điều kiện vật lý nghi lễ** tại bàn thờ trước và sau khi thực hiện nghi thức.

---

## Services (Phase 1 — trong EngagementModule)

| Service | Responsibility |
|---|---|
| `AltarValidationService` | Pre-ceremony condition checks (nước, hương, đèn, dụng cụ) |
| `AltarItemProtocolService` | Xử lý đồ thờ hư hỏng, replacement protocol |
| `AltarContentFilterService` | Filter ảnh AI-generated, UUID check cho hiện vật |

---

## Use Cases hiện có

| File | Mô tả |
|---|---|
| [synchronized-incense-insertion.md](./USE_CASES/synchronized-incense-insertion.md) | Quy tắc cắm hương đồng bộ (số lẻ, thứ tự, hướng) |
| [great-compassion-water-anti-boiling-guard.md](./USE_CASES/great-compassion-water-anti-boiling-guard.md) | Cấm nước đang sôi trong bình Đại Bi — phải nguội hoàn toàn |
| [hardware-uuid-prohibition.md](./USE_CASES/hardware-uuid-prohibition.md) | Cấm in UUID/barcode/QR lên đồ thờ cúng |
| [auspicious-beast-ai-filter.md](./USE_CASES/auspicious-beast-ai-filter.md) | Filter ảnh tứ linh AI-generated không đúng tỷ lệ/biểu tượng |
| [sacred-item-damage-protocol.md](./USE_CASES/sacred-item-damage-protocol.md) | Protocol bắt buộc khi bát hương/tượng bị hư hỏng (7 biến Lễ Phật khẩn cấp) |
| [USE_CASE_ATOMIC_FRUIT_PLATE_REPLACEMENT.md](./USE_CASE_ATOMIC_FRUIT_PLATE_REPLACEMENT.md) | Thay trái cây trên đĩa cúng — quy tắc số lượng và loại |
| [USE_CASE_ELECTRIC_LOTUS_LAMP_GUARD.md](./USE_CASE_ELECTRIC_LOTUS_LAMP_GUARD.md) | Đèn sen điện — phân biệt được phép / không được phép |

---

## Inbound interactions

| Caller | Calls | Why |
|---|---|---|
| `engagement` (BurnFlow) | `AltarValidationService.preCheckAltarCondition()` | Kiểm tra bàn thờ trước khi bắt đầu burn Ngôi Nhà Nhỏ |
| `engagement` (DailyPractice) | `AltarValidationService.checkIncenseReady()` | Kiểm tra hương trước khi bắt đầu niệm |
| `vows-merit` (LifeRelease) | `AltarValidationService.checkWaterTemperature()` | Kiểm tra nước Đại Bi trước phóng sinh |

## Outbound interactions

| Calls | Target | Why |
|---|---|---|
| Inject `DailyTask` (KarmaEvent) | `engagement` | Khi đồ thờ hư hỏng → inject 7 biến Lễ Phật khẩn cấp |
| `audit_logs` write | platform | Log tất cả altar damage events |

---

## Phase gating

- Phase 1: `AltarValidationService` sống trong `EngagementModule` — không tách module riêng
- Phase 2+: Tách thành `AltarManagementModule` khi có > 5 controller endpoints hoặc schema riêng
