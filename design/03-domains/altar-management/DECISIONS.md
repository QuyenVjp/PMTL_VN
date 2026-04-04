# altar-management — Domain Decisions

> **Owner:** `engagement` team (altar sub-domain)
> **Cập nhật:** 2026-04-04

---

## Phạm vi (Scope)

Domain `altar-management` sở hữu các business rules liên quan đến **vật lý nghi lễ** tại bàn thờ:

- Kiểm tra và xác nhận điều kiện vật lý bàn thờ trước khi thực hiện nghi thức
- Quản lý trạng thái đồ thờ cúng (hương, đèn, bình hoa, bình nước, đĩa trái cây)
- Protocol xử lý khi đồ thờ bị hư hỏng (bát hương vỡ, tượng nứt...)
- Validation vật liệu dụng cụ (kim loại vs gốm, đèn điện vs đèn dầu)
- Filter nội dung AI-generated không phù hợp tâm linh

---

## Ranh giới (Boundary)

| Concern | Owner |
|---|---|
| Hướng dẫn viết bài về bàn thờ | `02-content` |
| Phóng sinh, nguyện, công đức | `09-vows-merit` |
| Đốt Ngôi Nhà Nhỏ (vật lý burn flow) | `04-engagement` |
| Lịch cúng giỗ, ngày âm | `07-calendar` |
| **Kiểm tra điều kiện bàn thờ trước nghi thức** | ✅ `altar-management` |
| **Xử lý đồ thờ hư hỏng** | ✅ `altar-management` |
| **Validation dụng cụ vật lý (material, UUID, size)** | ✅ `altar-management` |

---

## Quyết định kiến trúc

### D1: altar-management là subdomain của engagement (không phải top-level module)

`altar-management` không có NestJS module riêng ở Phase 1. Logic được implement trong `EngagementModule` dưới service `AltarValidationService`. Chỉ tách module khi có > 5 controller endpoints độc lập.

### D2: Không có schema riêng ở Phase 1

Altar-management không có tables riêng ở Phase 1. Trạng thái bàn thờ được tracked qua:
- `practice_logs` (engagement) cho ceremony logs
- `audit_logs` (platform) cho altar damage events

Khi altar-management cần persistent state riêng (altar profile, item inventory), phải tạo `SCHEMA_PLAN.dbml` và cập nhật `PRISMA_SCHEMA_PLAN.md`.

### D3: Validation là pre-condition, không phải blocking gate với penalty

Các altar checks (kim loại, nước sôi, độ cao...) chỉ **warn và block** user tiếp tục — không tạo debt hay penalty tasks. Penalty logic thuộc `wisdom-qa` (karmic radar) và `vows-merit`.

### D4: Không dùng external APIs ở Phase 1

DeviceOrientation API (FE-only) là ngoại lệ được phép — xem `DECISIONS.md` section 11. GPS, Weather, Celestial APIs đều deferred.

---

## Anti-goals

- Không ôm logic tâm linh chuyên sâu (đó là `wisdom-qa`)
- Không tự phát sinh task niệm kinh (đó là `engagement` DailyTask)
- Không lưu altar state phức tạp trước khi có use case đo được
