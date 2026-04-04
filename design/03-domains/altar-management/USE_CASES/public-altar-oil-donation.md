# Quy Cách Cúng Dầu Tại Đạo Tràng Công Cộng — Public Altar Oil Donation

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Lợi lạc gia đình từ dầu cúng
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tại Guan Yin Tang và các đạo tràng công cộng, dầu cúng đèn Phật có những loại phù hợp và những loại tuyệt đối không được dùng. Sau khi cúng tại đạo tràng, user có thể mang phần dầu còn lại về nhà để nấu các món ăn CHAY. Hệ thống hướng dẫn chi tiết loại dầu, quản lý cam kết chỉ dùng vào nấu ăn chay, và lưu audit.

---

## Owner module

`altar-management` — PublicAltarOilDonation
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — cúng dầu tại đạo tràng công cộng, mang phần dầu còn lại về nhà
- `system` — validate loại dầu, kiểm tra cam kết nấu ăn chay, lưu log donation

---

## Trigger

User thực hiện POST /api/altar-management/public-altar/donate-oil tại Guan Yin Tang hoặc đạo tràng công cộng.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User chọn loại dầu được phép | ✅ OLIVE, CANOLA, CORN, LOTUS — approved |
| User chọn loại dầu cấm | ❌ 400 `forbidden_oil_type` — SESAME, PEANUT, SOYBEAN |
| User cam kết nấu ăn CHAY | ✅ Checkbox xác nhận bắt buộc |
| User không xác nhận cam kết | ❌ 400 `cooking_commitment_required` |
| User cúng thành công + cam kết | ✅ Lưu OilDonationLog + Audit |
| User mang phần dầu về nhà | ✅ Thêm flag `remainderTakenHome = true` |
| Lần sau user cố nấu đồ mặn dầu này | ⚠️ Audit `altar.public.home-cooking-violation` (không block, nhưng track) |

Loại dầu được phép cúng:
- **OLIVE** — dầu olive
- **CANOLA** — dầu cải
- **CORN** — dầu ngô
- **LOTUS** — dầu sen

Loại dầu tuyệt đối không được phép cúng:
- **SESAME** — dầu mè
- **PEANUT** — dầu lạc
- **SOYBEAN** — dầu đậu nành

Lời khuyên (Advisory):

> Lợi lạc: Sau khi châm dầu vào đèn Phật tại Đạo tràng, hãy mang phần dầu còn lại về nhà để nấu các món ăn **CHAY**. Tuyệt đối **KHÔNG** nấu đồ **MẶN**. Việc này sẽ giúp gia đình bạn được sáng mắt và khai mở trí tuệ!

Checkbox bắt buộc:

```
[x] Tôi cam kết chỉ dùng dầu còn lại để nấu các món ăn CHAY,
    không nấu đồ MẶN
```

---

## Input Contract

```typescript
interface DonateOilDto {
  locationId: string                        // Guan Yin Tang ID or community altar ID
  oilType: 'OLIVE' | 'CANOLA' | 'CORN' | 'LOTUS'
  quantity: number                          // in ml or liters
  vegetarianCookingCommitment: boolean      // must = true
}

interface OilDonationResponse {
  donationId: string
  oilType: string
  quantity: number
  donatedAt: string                         // ISO 8601
  remainderTakenHome: boolean
  commitmentText: string
  advisoryText: string
}
```

---

## Write Path

```
POST /api/altar-management/public-altar/donate-oil
1. Validate locationId exists (altar/temple)
2. Validate oilType ∈ {OLIVE, CANOLA, CORN, LOTUS}
   → If not: throw 400 forbidden_oil_type
3. Validate vegetarianCookingCommitment === true
   → If false: throw 400 cooking_commitment_required
4. Validate quantity > 0 and reasonable (<50 liters)
5. Create OilDonationLog:
   → donorId = user.id
   → oilType = oilType
   → quantity = quantity
   → remainderTakenHome = true (default, user can consume)
   → homeUsageCommitmentAt = now()
6. Audit: altar.public.oil-donated
7. Audit: altar.public.home-cooking-commitment-confirmed
8. Return OilDonationResponse with advisoryText
```

---

## FE Behavior — Oil Donation Workflow

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CỬI DẦU TẠI ĐẠO TRÀNG CÔNG CỘNG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Chọn loại dầu để cúng:

  ○ Dầu Olive
  ○ Dầu Cải (Canola)
  ○ Dầu Ngô (Corn)
  ○ Dầu Sen (Lotus)

❌ Không được dùng loại dầu này:
  • Dầu Mè (Sesame)
  • Dầu Lạc (Peanut)
  • Dầu Đậu Nành (Soybean)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nhập số lượng dầu (ml):

  [____________________]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📢 LỢI LẠC TỪ DẦU CỬI:

  Lợi lạc: Sau khi châm dầu vào đèn Phật tại Đạo tràng,
  hãy mang phần dầu còn lại về nhà để nấu các món ăn
  CHAY. Tuyệt đối KHÔNG nấu đồ MẶN. Việc này sẽ giúp
  gia đình bạn được sáng mắt và khai mở trí tuệ!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cam kết sử dụng:

  [x] Tôi cam kết chỉ dùng dầu còn lại để nấu các món ăn
      CHAY, không nấu đồ MẶN.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Cúng Dầu Ngay]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ HOÀN THÀNH CỬI DẦU

Cảm ơn bạn đã cúng dầu tại Đạo tràng.

Loại dầu: Dầu Olive
Số lượng: 500 ml
Thời gian: 2026-04-04 07:30 AM

Bạn đã cam kết sử dụng phần dầu còn lại
để nấu các món ăn CHAY cho gia đình.

🙏 Cầu nguyện gia đình bạn sáng mắt,
khai mở trí tuệ, và gặt hái lợi lạc.

[Quay lại]
```

---

## Schema Notes

```prisma
model OilDonationLog {
  id                             String    @id @default(cuid())
  donorId                        String
  locationId                     String    // altar/temple location
  oilType                        String    // OLIVE | CANOLA | CORN | LOTUS
  quantity                       Float     // in ml
  remainderTakenHome             Boolean   @default(true)
  homeUsageCommitmentAt          DateTime
  createdAt                      DateTime  @default(now())
  updatedAt                      DateTime  @updatedAt

  user                           User      @relation(fields: [donorId], references: [id])
  altarLocation                  AltarProfile @relation(fields: [locationId], references: [id])

  @@index([donorId])
  @@index([locationId])
  @@index([createdAt])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.public.oil-donated` | User cúng dầu thành công |
| `altar.public.home-cooking-commitment-confirmed` | User xác nhận cam kết nấu ăn chay |
| `altar.public.home-cooking-violation` | (Optional) Track nếu user sau này nấu đồ mặn với dầu này |

---

## Errors

| Điều kiện | Mã lỗi | HTTP |
|---|---|---|
| oilType ∉ {OLIVE, CANOLA, CORN, LOTUS} | `forbidden_oil_type` | 400 |
| vegetarianCookingCommitment ≠ true | `cooking_commitment_required` | 400 |
| locationId không tồn tại | `location_not_found` | 404 |
| quantity ≤ 0 hoặc > 50 liters | `invalid_oil_quantity` | 400 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Danh sách 4 loại dầu được phép là **constant** — không lấy từ database.
- Danh sách 3 loại dầu cấm là **constant** — không lấy từ database.
- `vegetarianCookingCommitment` phải bằng `true` trước khi cho phép cúng — đây là **hard constraint**.
- `remainderTakenHome` mặc định `true` vì user có quyền mang phần dầu về nhà.
- Advisory text là **hardcoded Vietnamese** — không dịch, không thay đổi.
- Checkbox text phải **match exactly** như trong spec để đảm bảo user hiểu rõ cam kết.
- Không cần tracking chi tiết việc user nấu ăn mặn hay chay sau này (ngoài audit log optional).

---

## Related

- [hierarchical-prostration-sequence.md](./hierarchical-prostration-sequence.md) — altar ritual sequence
- [sacred-item-damage-protocol.md](./sacred-item-damage-protocol.md) — altar item protection
- [validate-altar-oil-and-water.md](../../vows-merit/USE_CASES/validate-altar-oil-and-water.md) — general oil/water validation
