# Nghi Thức Khẩn Cấp Khi Làm Rơi Vỡ Pháp Khí — Sacred Object Damage Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Làm rơi vỡ tượng Phật, ảnh Phật, hoặc pháp khí (破法器) là tội bất kính nặng. Phải **lập tức** tụng Lễ Phật Đại Sám Hối để sám hối. Hệ thống phát hiện khai báo và tự động inject bài tụng vào mục tiêu hàng ngày.

---

## Owner module

`wisdom-qa` — DiagnosisService / DamageProtocol
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người vô tình hoặc cố ý làm hỏng pháp khí
- `system` — phát hiện khai báo, inject khẩn cấp vào daily goals

---

## Trigger

Khi user khai báo trong daily health/practice log: đã làm rơi vỡ tượng/ảnh Phật/pháp khí.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn triệu chứng `[Làm rơi vỡ tượng/ảnh Phật]` | ✅ Trigger emergency protocol |
| Protocol kích hoạt | ❌ Ghi đè mọi chẩn đoán khác |
| Cảnh báo đỏ hiển thị | ✅ Auto-generate prescription: Lễ Phật Đại Sám Hối |
| Prescription bị inject vào daily goals | ✅ Lock bài này, không xóa được |
| User xác nhận đã hiểu | ✅ Log transgression vào karma ledger |

---

## Input Contract

```typescript
interface DamageReportDto {
  incidentType: 'DROPPED_STATUE' | 'BROKEN_IMAGE' | 'DAMAGED_DHARMA_VESSEL'
  itemDescription?: string
  acknowledgedProtocol: boolean
}
```

---

## Write Path

```
POST /api/wisdom-qa/diagnosis/damage-report
1. Validate incidentType ∈ [DROPPED_STATUE, BROKEN_IMAGE, DAMAGED_DHARMA_VESSEL]
2. Validate acknowledgedProtocol = true
3. Inject into DailyGoal:
   → sutraId = LE_PHAT_DAI_SAM_HOI
   → frequency = DAILY
   → locked = true (cannot be removed by user)
   → reason = 'DAMAGE_PROTOCOL'
4. Create KarmaEvent: type = TRANSGRESSION, category = DISRESPECT_DHARMA_VESSEL
5. Return: { prescription, karmaEventId }
```

---

## FE Behavior

```
🚨 CẢNH BÁO KHẨN CẤP

Bạn đã phạm tội bất kính với Pháp Bảo.
Đã làm rơi vỡ / hư hỏng tượng, ảnh Phật.

⛔ LỆNH: Lập Tức Niệm Lễ Phật Đại Sám Hối

Bài tụng: Lễ Phật Đại Sám Hối Văn
Tần suất: Hàng ngày, tối thiểu 1 lần
Thời gian: Cho đến khi cảm thấy được tha thứ

[ ] Tôi đã hiểu và chấp nhận sám hối
[Bắt Đầu Niệm Ngay]  ← disabled until checkbox

---
Daily Goals (auto-injected, locked 🔒):
Lễ Phật Đại Sám Hối Văn  × 1/ngày  [🔒]
```

---

## Schema Notes

```prisma
model KarmaEvent {
  // ... existing fields ...
  category  KarmaEventCategory?
  // Migration: ALTER TABLE "KarmaEvent" ADD COLUMN "category" TEXT
}

enum KarmaEventCategory {
  DISRESPECT_DHARMA_VESSEL
  BROKEN_VOW
  HARM_TO_CREATURES
  // ... other categories
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `object_damage.reported` | User khai báo vỡ pháp khí |
| `emergency_protocol.activated` | Protocol kích hoạt |
| `repentance_prescribed` | Bài tụng inject vào daily goals |
| `transgression.logged` | Karma event ghi nhận |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| acknowledgedProtocol = false | `protocol_acknowledgment_required` | 400 |
| incidentType không hợp lệ | `invalid_damage_incident_type` | 422 |

---

## Notes for AI/codegen

- Bài tụng inject với flag `locked = true` — không cho user xóa khỏi daily goals.
- Karma event dùng **append-only** model (Event Sourcing) — không UPDATE/DELETE.

---

## Related

- [sacred-item-damage-protocol.md](../../altar-management/USE_CASES/sacred-item-damage-protocol.md) — altar-specific damage (Phase 24)
- [prescribe-karmic-remedy.md](./prescribe-karmic-remedy.md) — general remedy prescription
