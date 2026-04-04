# Giao Thức Làm Ấm Nước Đại Bi — Compassion Water Heating Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 383)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi hạ Nước Đại Bi xuống uống, nếu muốn uống ấm, người tu **CẤM** dùng lò vi sóng (đã biết) và **CẤM đun sôi sùng sục**. Cách duy nhất được phép là "Chưng cách thủy" — ngâm cốc nước Đại Bi vào một bát nước nóng khác để nó ấm dần lên từ từ. Đun sôi sùng sục sẽ phá vỡ kết cấu năng lượng của nước đã được trì chú.

---

## Owner module

`vows-merit` — AltarOffering / CompassionWaterConsumption
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — hạ nước Đại Bi và chuẩn bị uống
- `system` — hiển thị checklist hướng dẫn, enforce acknowledgment trước khi log

---

## Trigger

User bấm **[Hạ Nước Cúng]** hoặc **[Ghi Nhận Uống Nước Đại Bi]** trong flow quản lý bàn thờ.

---

## Business Rules

| Phương pháp | Quy tắc |
|---|---|
| Uống nguội trực tiếp | ✅ ALLOWED |
| Chưng cách thủy (ngâm trong bát nước nóng) | ✅ ALLOWED |
| Lò vi sóng | ❌ FORBIDDEN — phá năng lượng điện từ |
| Đun sôi sùng sục trực tiếp | ❌ FORBIDDEN — phá kết cấu năng lượng nước |

Ngoài ra (quy tắc hiện có, nhắc lại):
- Cấm uống trực tiếp từ cốc cúng — phải rót ra cốc khác.
- Phải nâng cao ngang mày, úp lòng bàn tay (palm down) che miệng cốc, niệm 1 biến Chú Đại Bi trước khi uống.
- Cấm dùng nước cúng để tưới cây.

---

## Input Contract

```
LogCompassionWaterConsumptionDto {
  altarItemId:          string    // FK to AltarOfferingItem (water cup)
  heatingMethod:        "NONE" | "WARM_BATH"   // NONE = uống nguội
  mudraConfirmed:       boolean   // úp lòng bàn tay + niệm 1 biến Đại Bi
  separateCupUsed:      boolean   // rót ra cốc khác, không uống trực tiếp
}
```

---

## Write Path

```
POST /api/vows-merit/altar-offerings/consume-compassion-water
──────────────────────────────────────────────────────────────
1. Validate heatingMethod ∈ ["NONE", "WARM_BATH"].
   - Nếu client gửi "MICROWAVE" hoặc "BOILING" → HTTP 422:
     {
       error:   "forbidden_heating_method",
       message: "Lò vi sóng và đun sôi sùng sục đều phá vỡ năng lượng Nước Đại Bi. Chỉ được chưng cách thủy hoặc uống nguội."
     }
2. Validate mudraConfirmed = true.
3. Validate separateCupUsed = true.
4. Insert CompassionWaterConsumptionLog.
5. Audit: altar.compassion-water.consumed
```

---

## FE Behavior

### Modal Hướng dẫn Hạ Nước Cúng

Hiển thị khi user bấm [Hạ Nước Cúng]:

```
┌──────────────────────────────────────────────────────────┐
│  📿  Hướng Dẫn Hạ Nước Đại Bi                          │
│                                                          │
│  Bước 1 — Rót nước                                     │
│  [x] Rót từ cốc cúng ra một cốc riêng để uống.        │
│      (Không uống trực tiếp từ cốc trên bàn thờ)       │
│                                                          │
│  Bước 2 — Nếu muốn uống ấm                            │
│  [_] Tôi dùng phương pháp Chưng Cách Thủy             │
│      (ngâm cốc vào bát nước nóng để ấm từ từ)         │
│                                                          │
│  ⚠️  TUYỆT ĐỐI KHÔNG:                                  │
│     • Dùng lò vi sóng                                  │
│     • Đun sôi sùng sục trực tiếp                      │
│     → Cả hai đều phá kết cấu năng lượng nước          │
│                                                          │
│  Bước 3 — Trước khi uống                              │
│  [_] Tôi nâng cốc ngang mày, úp lòng bàn tay         │
│      che miệng cốc, niệm 1 biến Chú Đại Bi.          │
│                                                          │
│  [Xác Nhận & Ghi Nhận]   ← enable khi đủ checkbox     │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model CompassionWaterConsumptionLog {
  id              String   @id @default(cuid())
  userId          String
  altarItemId     String?
  heatingMethod   String   @default("NONE")  // "NONE" | "WARM_BATH"
  mudraConfirmed  Boolean
  separateCupUsed Boolean
  consumedAt      DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.compassion-water.consumed` | Ghi nhận uống nước thành công |
| `altar.compassion-water.heating-rejected` | Gửi lên heating method bị cấm |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `heatingMethod` không hợp lệ | `forbidden_heating_method` | 422 |
| `mudraConfirmed` = false | `mudra_required` | 422 |
| `separateCupUsed` = false | `separate_cup_required` | 422 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- `heatingMethod` enum nhỏ — store as String, validate tại service layer.
- Không cần track lịch sử chi tiết per-consumption cho Phase 1 — log đơn giản là đủ.
- Phase 2+: Có thể link `altarItemId` để track vòng đời từng cốc nước cụ thể.

---

## Related

- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Oil type + water constraints (Phase 4)
- [WATER-CONSUMPTION-MUDRA.md](../REFERENCES/WATER-CONSUMPTION-MUDRA.md) — Chi tiết nghi thức mudra
- [CUP-VISUAL-VALIDATION.md](../REFERENCES/CUP-VISUAL-VALIDATION.md) — Quy tắc cốc trắng trơn
