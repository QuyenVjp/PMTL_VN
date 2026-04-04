# Thuật Toán Tính Số Nhang Theo Cấu Hình Bàn Thờ — Altar Incense Count Calculator

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 384, 847, 848)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nguyên tắc lý tưởng: mỗi vị Bồ Tát một lư hương riêng, mỗi lư thắp 1 nén nhang mỗi buổi. Tuy nhiên nếu điều kiện không cho phép và chỉ có **1 lư hương chung cho toàn bộ bàn thờ**, bắt buộc phải thắp **3 nén nhang** vào lư chung đó mỗi buổi sáng/tối. Hệ thống tự tính và hiển thị số nhang cần thiết dựa trên cấu hình bàn thờ của user.

---

## Owner module

`vows-merit` — AltarProfile / IncenseSession
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — khai báo cấu hình bàn thờ (số tượng, số lư)
- `system` — tính `requiredIncenseCount` và hiển thị trên màn hình IncenseSession

---

## Business Rules

### Công thức tính

```
if statueCount > 1 AND burnerCount == 1:
  requiredIncenseCount = 3     // lư chung → 3 nén

elif statueCount == burnerCount:
  requiredIncenseCount = statueCount × 1  // mỗi lư 1 nén

elif burnerCount > statueCount:
  requiredIncenseCount = statueCount × 1  // dư lư → vẫn 1 nén/tượng

elif statueCount == 1 AND burnerCount == 1:
  requiredIncenseCount = 1

else:
  requiredIncenseCount = 3  // fallback an toàn
```

| statueCount | burnerCount | requiredIncenseCount |
|---|---|---|
| 1 | 1 | 1 |
| 3 | 3 | 3 (1 mỗi lư) |
| 3 | 1 | **3 (lư chung)** |
| 5 | 1 | **3 (lư chung)** |
| 2 | 2 | 2 |

---

## Input Contract

```
UpdateAltarConfigDto {
  statueCount:  number   // min 1
  burnerCount:  number   // min 1
}
```

---

## Write Path

```
PATCH /api/vows-merit/altar-profile/incense-config
────────────────────────────────────────────────────
Body: { statueCount, burnerCount }

1. Validate statueCount >= 1, burnerCount >= 1.
2. Compute requiredIncenseCount per formula above.
3. Update AltarProfile.statueCount, .burnerCount, .requiredIncenseCount.
4. Audit: altar.incense-config.updated
```

```
GET /api/vows-merit/altar-profile/incense-requirement
───────────────────────────────────────────────────────
Response:
{
  statueCount:           number,
  burnerCount:           number,
  requiredIncenseCount:  number,
  rationale:             string   // localized explanation
}
```

---

## FE Behavior

### Màn hình Cấu hình Bàn Thờ

```
Cấu Hình Lư Hương & Nhang
─────────────────────────────────────────────
Số tượng Bồ Tát trên bàn thờ: [3]
Số lư hương:                   [1]

─────────────────────────────────────────────
📋  Mỗi buổi thắp nhang cần: 3 nén

ℹ️  Bạn có 3 tượng nhưng chỉ 1 lư hương chung.
    Theo giáo lý, bắt buộc thắp 3 nén vào lư
    chung để đủ đại diện cho mỗi vị.
─────────────────────────────────────────────
```

### Trong IncenseSession Init

```
Số nhang cần thắp hôm nay:
┌─────────────────┐
│   3 nén nhang   │  ← computed từ altar config
└─────────────────┘
(3 tượng, 1 lư hương chung)
```

---

## Schema Notes

Bổ sung vào `AltarProfile` (model hiện có):

```prisma
model AltarProfile {
  // ... existing fields ...
  statueCount            Int   @default(1)
  burnerCount            Int   @default(1)
  requiredIncenseCount   Int   @default(1)  // computed, cached
}
```

`requiredIncenseCount` được tính và cache khi user update config — không tính lại mỗi request.

---

## Audit

| Action | Trigger |
|---|---|
| `altar.incense-config.updated` | User cập nhật statueCount hoặc burnerCount |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `statueCount` < 1 | `invalid_body` | 400 |
| `burnerCount` < 1 | `invalid_body` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- `requiredIncenseCount` là computed field — cache vào DB để không phải tính lại mỗi request.
- Fallback = 3 khi formula không cover case lạ (burnerCount > statueCount là dư lư, không ảnh hưởng).
- Phase 2+: nếu có `burnerType` (lư chính vs lư phụ), formula có thể phức tạp hơn.

---

## Related

- [incense-posture-angle-constraint.md](./incense-posture-angle-constraint.md) — Tư thế giữ nhang
- [altar-profile-spatial-validation.md](./altar-profile-spatial-validation.md) — Spatial setup
- [GRAND-INCENSE-PROTOCOL.md](../REFERENCES/GRAND-INCENSE-PROTOCOL.md) — Đại Hương protocol
