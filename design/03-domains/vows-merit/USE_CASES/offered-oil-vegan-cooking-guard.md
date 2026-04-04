# Ràng Buộc Dầu Cúng Chỉ Nấu Chay — Offered Oil Vegan-Cooking Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 375)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Nước và trái cây cúng Bồ Tát có thể ăn/uống trực tiếp sau khi hạ xuống. **Dầu thì KHÔNG** — dầu đã cúng dường bắt buộc phải được nấu chín trước khi dùng, và **TUYỆT ĐỐI CẤM** dùng để xào nấu các món ăn mặn (thịt, cá). Chỉ được dùng để nấu các món chay. Vi phạm sẽ chuyển công đức cúng dường thành nghiệp chướng.

---

## Owner module

`vows-merit` — AltarOffering / OilConsumption
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — hạ dầu cúng xuống để sử dụng
- `system` — enforce 2 cam kết trước khi ghi nhận hạ dầu

---

## Trigger

User bấm **[Hạ Dầu / Remove Oil]** hoặc **[Sử Dụng Dầu Cúng]** trên màn hình quản lý bàn thờ, khi `offeringType = OIL` hoặc `FULL_BOTTLE_OIL`.

---

## Business Rules

| Hành động sau khi hạ dầu | Quy tắc |
|---|---|
| Nấu chín, dùng nấu món chay | ✅ ALLOWED |
| Dùng sống (salad dressing, v.v.) | ❌ FORBIDDEN — phải nấu chín |
| Nấu đồ mặn (thịt, cá, hải sản) | ❌ FORBIDDEN — chuyển công đức thành nghiệp |
| Dùng để thắp đèn lại | ✅ ALLOWED |
| Tưới cây | ❌ NOT RECOMMENDED (tương tự nước cúng) |

---

## Input Contract

```
RemoveOilOfferingDto {
  altarItemId:                string
  willCookBeforeConsuming:    boolean   // BẮT BUỘC true
  willOnlyCookVegetarian:     boolean   // BẮT BUỘC true
}
```

---

## Write Path

```
POST /api/vows-merit/altar-offerings/:id/remove-oil
────────────────────────────────────────────────────
1. Load AltarOfferingItem, validate itemType ∈ [OIL, FULL_BOTTLE_OIL].
2. Validate willCookBeforeConsuming = true.
   - Nếu false → HTTP 400:
     {
       error:   "oil_must_be_cooked",
       message: "Dầu cúng Phật bắt buộc phải nấu chín trước khi dùng. Không được dùng sống."
     }
3. Validate willOnlyCookVegetarian = true.
   - Nếu false → HTTP 400:
     {
       error:   "oil_meat_cooking_forbidden",
       message: "Dầu đã cúng dường TUYỆT ĐỐI không được nấu thịt, cá hay đồ mặn. Vi phạm sẽ chuyển công đức thành nghiệp chướng. Chỉ dùng để nấu món chay."
     }
4. Update AltarOfferingItem.status = "REMOVED"
5. Insert OilConsumptionLog { userId, altarItemId, removedAt: now() }
6. Audit: altar.oil-offering.removed
```

---

## FE Behavior

### Modal Cam Kết Hạ Dầu

Hiển thị khi user bấm [Hạ Dầu]:

```
┌──────────────────────────────────────────────────────────┐
│  🕯️  Hạ Dầu Cúng Xuống                                  │
│                                                          │
│  Dầu đã cúng dường Bồ Tát mang năng lượng đặc biệt.   │
│  Cam kết sử dụng đúng cách để giữ nguyên công đức:     │
│                                                          │
│  [_] Tôi sẽ NẤU CHÍN dầu này trước khi dùng           │
│      (không dùng sống — salad, v.v.)                   │
│                                                          │
│  [_] Tôi cam kết CHỈ dùng dầu này nấu MÓN CHAY.      │
│      Tuyệt đối không nấu thịt, cá, hải sản.           │
│                                                          │
│  ⚠️  Dùng nấu đồ mặn sẽ chuyển công đức thành nghiệp │
│      chướng theo giáo lý Pháp Môn Tâm Linh.           │
│                                                          │
│  [Xác Nhận Hạ Dầu]   ← enable khi đủ 2 checkbox       │
└──────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model OilConsumptionLog {
  id                      String   @id @default(cuid())
  userId                  String
  altarItemId             String
  willCookBeforeConsuming Boolean
  willOnlyCookVegetarian  Boolean
  removedAt               DateTime @default(now())

  user                    User     @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.oil-offering.removed` | Hạ dầu thành công với đủ cam kết |
| `altar.oil-offering.meat-cook-rejected` | `willOnlyCookVegetarian = false` |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `willCookBeforeConsuming` = false | `oil_must_be_cooked` | 400 |
| `willOnlyCookVegetarian` = false | `oil_meat_cooking_forbidden` | 400 |
| Item không phải OIL type | `invalid_offering_type` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Chỉ áp dụng cho `itemType ∈ [OIL, FULL_BOTTLE_OIL]` — không áp dụng cho FLOWERS, FRUITS, WATER.
- `willCookBeforeConsuming` và `willOnlyCookVegetarian` phải là server-side validation — không chỉ FE checkbox.

---

## Related

- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Oil type allowed/forbidden khi cúng lên
- [oil-bottle-offering-label-removal.md](./oil-bottle-offering-label-removal.md) — Label removal khi cúng nguyên chai
- [offering-blessing-visualizer.md](../../engagement/USE_CASES/offering-blessing-visualizer.md) — Phước báo dầu (mắt sáng, tai thính)
