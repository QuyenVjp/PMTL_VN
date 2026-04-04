# Chia Tỷ Lệ % Công Đức — Merit Percentage Splitter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Công đức từ tình nguyện, đọc kinh, hỗ trợ Pháp hội có thể chuyển giao theo **tỷ lệ % chính xác** (1–100%) cho người thụ hưởng. Hệ thống đảm bảo tính toàn vẹn giao dịch và yêu cầu lời khấn bắt buộc trước khi chuyển.

---

## Owner module

`vows-merit` — MeritService / FractionalTransferEngine
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người chuyển giao công đức
- `system` — tính toán phần trăm, thực thi giao dịch, rollback nếu lỗi

---

## Trigger

Khi user chọn chuyển công đức từ một sự kiện merit cụ thể sang người thụ hưởng.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| User có merit event (volunteer/đọc kinh/hỗ trợ) | ✅ Log vào MeritLedger |
| User khởi tạo transfer | ✅ Hiển thị % input slider (1–100%) |
| % được chọn | ✅ Tính fractional amount real-time |
| User submit transfer | ✅ Yêu cầu đọc lời khấn bắt buộc |
| Lời khấn xác nhận | ✅ Thực thi Prisma transaction |
| Transaction thành công | ✅ Trừ từ user, cộng vào beneficiary |
| Transaction thất bại | ❌ Rollback, hiển thị lỗi |

---

## Input Contract

```typescript
interface MeritFractionalTransferDto {
  fromUserId: string
  toUserId: string
  matureEventId: string      // Source merit event ID
  percentageAmount: number   // 1–100 (integer)
  beneficiaryName: string
  reason: string             // "Mang thai / Bệnh nan y / Tế độ"
  pledgeRecited: boolean     // Phải = true
}
```

---

## Write Path

```
POST /api/vows-merit/merit/fractional-transfer
1. Validate percentageAmount ∈ [1, 100]
2. Load MeritEvent by matureEventId — belongs to fromUserId
3. Validate pledgeRecited = true
4. Calculate transferAmount = (event.totalPoints * percentageAmount) / 100
5. Prisma transaction:
   a. Create MeritTransferRecord (debit fromUser)
   b. Create MeritCreditRecord (credit toUser beneficiary)
6. Commit. On error → rollback, 500
7. Audit both parties
```

---

## FE Behavior

```
Chuyển Giao Công Đức:

Sự kiện: [Trợ duyên Pháp hội — 100 điểm]

Chuyển cho: [Tên người nhận]
Tỷ lệ: ───●─── 50%
Số điểm: 50 công đức

Lý do: [Cầu cơ hội mang thai]

────────────────────────────────────
Hãy đọc lời khấn này:

"Con xin nguyện chuyển 50% công đức từ việc
Trợ duyên Pháp hội cho [Tên người nhận],
cầu xin Bồ Tát phù hộ cho cô ấy..."

[ ] Tôi đã đọc lời khấn

[Hủy]    [Xác Nhận Chuyển]  ← disabled until checkbox
```

---

## Schema Notes

```prisma
model MeritTransferRecord {
  id                String   @id @default(cuid())
  fromUserId        String
  toUserId          String
  sourceEventId     String
  percentageAmount  Int      // 1–100
  transferPoints    Float
  reason            String
  pledgeRecited     Boolean  @default(false)
  executedAt        DateTime @default(now())
  // Migration: CREATE TABLE "MeritTransferRecord" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `merit.fractional_transfer_requested` | User submit % |
| `merit.pledge_recitation_recorded` | Pledge checkbox confirmed |
| `merit.transfer_transaction_executed` | Transaction commit |
| `merit.transfer_ledger_recorded` | Cả 2 bên được log |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| percentageAmount ngoài [1, 100] | `invalid_percentage_amount` | 422 |
| Event không thuộc fromUserId | `merit_event_not_found` | 404 |
| pledgeRecited = false | `pledge_recitation_required` | 400 |
| Transaction rollback | `merit_transfer_failed` | 500 |

---

## Related

- [create-prayer-session-with-merit-transfer.md](./create-prayer-session-with-merit-transfer.md) — prayer session kèm transfer
- [ngu-dai-phap-bao-system.md](./ngu-dai-phap-bao-system.md) — Ngũ Đại Pháp Bảo merit system
