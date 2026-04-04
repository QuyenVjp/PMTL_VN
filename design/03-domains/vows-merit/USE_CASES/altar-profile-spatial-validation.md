# Xác Thực Không Gian Lập Bàn Thờ — Altar Spatial Hazard Validation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Introduction to Guan Yin Citta
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi user lập hồ sơ bàn thờ (AltarProfile), 3 điều kiện không gian **cấm tuyệt đối** phải được xác nhận trước khi lưu:

| # | Điều cấm | Lý do |
|---|---|---|
| 1 | Đối diện thẳng với bếp | Khói bếp + hơi dầu mỡ xông vào bàn thờ, bất kính và uế tạp |
| 2 | Có gương xung quanh phản chiếu vào bàn thờ | Gương phản chiếu tượng Phật gây loạn năng lượng, thu hút tà khí |
| 3 | Đặt trên ban công cơi nới / phần nhô ra ngoài tòa nhà | Không vững chắc về mặt phong thủy, không ổn định năng lượng |

---

## Owner module

`vows-merit` — AltarProfile
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — tạo hoặc cập nhật hồ sơ bàn thờ
- `system` — enforce 3 spatial booleans, block nếu chưa xác nhận

---

## Trigger

User bấm **[Lưu thông tin bàn thờ]** khi tạo hoặc cập nhật `AltarProfile`.

---

## Input Contract

```
AltarProfileCreateDto {
  // ... các trường vị trí, tên bàn thờ, etc. ...

  // Spatial safety checklist — TẤT CẢ phải là true mới được lưu
  spatialChecks: {
    notFacingKitchen:           boolean   // Không đối diện bếp
    noMirrorsAround:            boolean   // Không có gương phản chiếu xung quanh
    notOnOverhangingBalcony:    boolean   // Không đặt trên ban công cơi nới/lơ lửng
  }
}
```

---

## Write Path

```
POST /api/vows-merit/altar-profiles
────────────────────────────────────
1. Parse và validate Zod schema.
2. Kiểm tra spatialChecks:
   const failed = Object.entries(spatialChecks).filter(([_, v]) => v !== true)

   Nếu failed.length > 0:
     throw 422 UnprocessableEntity {
       error: "spatial_hazard_not_cleared",
       violations: failed.map(([key]) => SPATIAL_VIOLATION_MESSAGES[key]),
       message: "Bàn thờ chưa đáp ứng điều kiện không gian an toàn. Vui lòng kiểm tra lại vị trí."
     }
3. Lưu AltarProfile với spatialConfirmedAt = now().
4. Audit: altar.profile.spatial-checks.confirmed.
```

### Violation Messages Map

```typescript
const SPATIAL_VIOLATION_MESSAGES = {
  notFacingKitchen:        "Bàn thờ đang đối diện bếp — phải di chuyển sang hướng khác.",
  noMirrorsAround:         "Có gương phản chiếu vào bàn thờ — phải dời gương hoặc che lại.",
  notOnOverhangingBalcony: "Bàn thờ đặt trên ban công cơi nới — phải chuyển vào trong nhà.",
}
```

---

## FE Behavior

### Checklist UI khi tạo AltarProfile

```
┌──────────────────────────────────────────────────────┐
│  ✅ Xác nhận Điều kiện Không gian Bàn Thờ            │
│  (Bắt buộc tích đủ 3 mục mới được lưu)              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  [_] Bàn thờ KHÔNG đối diện thẳng với bếp.         │
│      💡 Khói bếp và dầu mỡ sẽ uế tạp bàn thờ.      │
│                                                      │
│  [_] KHÔNG có gương nào phản chiếu vào bàn thờ.    │
│      💡 Gương phản chiếu tượng Phật thu hút tà khí. │
│                                                      │
│  [_] Bàn thờ KHÔNG đặt trên ban công cơi nới        │
│      hay phần nhô ra ngoài tòa nhà.                 │
│      💡 Cần vị trí vững chắc, ổn định.              │
│                                                      │
│  [Lưu bàn thờ] ← disabled cho đến khi tích đủ 3    │
└──────────────────────────────────────────────────────┘
```

- Mỗi checkbox có tooltip/accordion giải thích ngắn lý do.
- Nút [Lưu bàn thờ] disabled cho đến khi cả 3 checkbox đều tích.
- Nếu API vẫn từ chối (edge case): hiện error banner liệt kê từng vi phạm.

### Khi chỉnh sửa AltarProfile hiện có

- Nếu user di chuyển bàn thờ sang vị trí mới → hiện lại đầy đủ checklist 3 mục.
- Re-confirm required: `spatialConfirmedAt` sẽ được cập nhật.

---

## Schema Notes

```prisma
model AltarProfile {
  id                         String    @id @default(cuid())
  userId                     String    @unique
  name                       String?
  hasAltar                   Boolean   @default(true)

  // Spatial safety confirmation
  notFacingKitchen           Boolean   @default(false)
  noMirrorsAround            Boolean   @default(false)
  notOnOverhangingBalcony    Boolean   @default(false)
  spatialConfirmedAt         DateTime?

  createdAt                  DateTime  @default(now())
  updatedAt                  DateTime  @updatedAt

  user                       User      @relation(fields: [userId], references: [id])
}
```

- `spatialConfirmedAt` bằng null nghĩa là profile chưa pass spatial check — không được dùng để thắp hương thật.
- 3 boolean lưu riêng (không dùng JSON) để có thể query analytics: "bao nhiêu % user có bàn thờ đối diện bếp ban đầu".

---

## Audit

| Action | Trigger |
|---|---|
| `altar.profile.spatial-checks.confirmed` | User lưu profile với tất cả checks = true |
| `altar.profile.spatial-checks.failed` | API reject do spatial violation |
| `altar.profile.spatial-checks.reconfirmed` | User update vị trí, re-confirm lại |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Bất kỳ spatial check nào = false | `spatial_hazard_not_cleared` | 422 |
| Body thiếu `spatialChecks` | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Related

- [altar-fruit-atomic-replacement.md](./altar-fruit-atomic-replacement.md) — Quy tắc thay đồ cúng
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Oil & water validation
- [altar-offerings-guide.md](../../content/USE_CASES/altar-offerings-guide.md) — Canonical placement guide content
