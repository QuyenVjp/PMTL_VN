# Giao Thức Khẩn Cấp Khi Vỡ Pháp Khí Bàn Thờ — Sacred Item Damage Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Vô ý làm vỡ/hư hỏng pháp khí bàn thờ (tượng sứ, lư hương, bình cắm nhang...) là tội bất kính nặng. Hệ thống phát hiện khai báo và bắt buộc 7 biến *Lễ Phật Đại Sám Hối Văn* kèm lời khấn xin tha thứ trước khi được tiếp tục tu tập.

---

## Owner module

`altar-management` — AltarService / DamagePenalty
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — vô ý làm hỏng pháp khí
- `system` — phát hiện khai báo, inject 7-recitation cycle bắt buộc

---

## Trigger

Khi user khai báo trong Altar Management: đã làm vỡ/hư hỏng pháp khí bàn thờ.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User khai báo vỡ pháp khí | ✅ Severity assessment |
| Damage type confirmed | ✅ Create repentance task: 7× Lễ Phật |
| Task created | ⚠️ Mark MANDATORY_URGENT |
| Task locked | ❌ User không xóa được |
| User hoàn thành 7 biến | ✅ Requirement satisfied |
| User đọc lời khấn xin lỗi | ✅ Forgiveness sealed |

---

## Input Contract

```typescript
interface AltarDamageReportDto {
  itemsAffected: string[]           // ['佛像陶瓷', '香炉', '供杯', etc.]
  itemDescriptions?: string
  acknowledgedProtocol: boolean     // must = true
}

// Mandatory prescription output
interface DamagePrescription {
  sutraKey: 'le_phat_dai_sam_hoi'
  requiredCount: 7                   // fixed
  isRemovable: false
  urgencyLabel: 'MANDATORY_URGENT'
  samplePledgeText: string
}
```

---

## Write Path

```
POST /api/altar-management/damage-report
1. Validate acknowledgedProtocol = true
2. Validate itemsAffected.length > 0
3. Inject into DailyGoal (locked):
   → sutraKey = le_phat_dai_sam_hoi
   → requiredCount = 7
   → isRemovable = false
   → reason = 'ALTAR_DAMAGE_PROTOCOL'
4. Create KarmaEvent: type = TRANSGRESSION, category = DISRESPECT_ALTAR_ITEM
5. Audit: altar.damage_reported, altar.repentance_task_created
```

---

## FE Behavior — Damage Declaration

```
Altar Management — Báo Cáo Sự Cố

Pháp khí bị ảnh hưởng:
☑️ Tượng Phật gốm/sứ
☑️ Lư hương
☐ Bình cắm nhang
☐ Chén nước cúng
☐ Khác: [______]

[Gửi Báo Cáo]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 BÁO ĐỘNG TÔN KÍNH

Bạn đã vô ý làm vỡ/hư hỏng Pháp khí.
Tội bất kính vô cùng lớn.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Auto-Task Created [MANDATORY 🔒]:

Tụng Lễ Phật Đại Sám Hối Văn: 7 biến

Lời Khấn Mẫu:
"Xin Bồ Tát tha thứ cho con vì đã
vô ý làm hỏng [tên pháp khí]. Con
thành tâm sám hối và hứa không tái phạm."

0 / 7 biến hoàn thành

[Bắt Đầu Niệm Ngay]
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.damage_reported` | User khai báo |
| `altar.item_type_specified` | Items identified |
| `altar.repentance_task_created` | 7-recitation injected |
| `altar.task_marked_mandatory` | Urgent priority set |
| `altar.repentance_completed` | All 7 done |
| `altar.pledge_recited` | Forgiveness sealed |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| acknowledgedProtocol = false | `protocol_acknowledgment_required` | 400 |
| itemsAffected empty | `damage_items_required` | 422 |

---

## Notes for AI/codegen

- Prescription count = **7** (hardcoded) — không configurable.
- Task `isRemovable = false` — enforce tại cả API level (reject DELETE) và UI level (ẩn nút xóa).
- Karma event dùng append-only model (Event Sourcing).

---

## Related

- [sacred-object-damage-protocol.md](../../wisdom-qa/USE_CASES/sacred-object-damage-protocol.md) — wisdom-qa phase 20 damage protocol (general)
- [hardware-uuid-prohibition.md](./hardware-uuid-prohibition.md) — ritual implement assignment
- [auspicious-beast-ai-filter.md](./auspicious-beast-ai-filter.md) — altar item filtering
