# Rào Chắn Tuổi Dưới 5 Cho Chuyển Công Đức — Under-Five Merit Transfer Gate

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Bảo Vệ Trẻ Em)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Chuyển công đức cho người thân, đặc biệt là trẻ em dưới 5 tuổi, cần được bảo vệ đặc biệt. Trẻ em dưới 5 tuổi chưa có khả năng tự thân tu tập hay hiểu rõ ý nghĩa công đức, do đó việc chuyển công đức cho nhân dân này có thể dẫn đến lạm dụng hoặc mục đích không phù hợp. Rule này là HARD BLOCK — không cho phép chuyển công đức trực tiếp cho bất kỳ người thụ hưởng nào dưới 5 tuổi, nhằm bảo vệ quyền lợi của trẻ em.

---

## Owner module

`vows-merit` — MeritTransferAgeGate
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người tạo merit transfer đến người thụ hưởng
- `system` — kiểm tra độ tuổi của beneficiary, block cứng nếu < 5 tuổi

---

## Trigger

Khi user gọi `POST /api/vows-merit/merit-transfer` để tạo một merit transfer entry đến người thụ hưởng (beneficiary).

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `beneficiary.age >= 5` | ✅ ALLOWED — tạo merit transfer bình thường |
| `beneficiary.age < 5` | 🚫 BLOCKED — trả về 400 + error code |
| Không có `beneficiaryAge` trong DTO | 🚫 BLOCKED — trả về 400 validation error |

---

## Input Contract

```typescript
interface CreateMeritTransferDto {
  userId: string
  beneficiaryId: string
  beneficiaryAge: number  // REQUIRED — tuổi của người thụ hưởng
  meritAmount: number
  meritSource: 'VOWS' | 'RECITATION' | 'CHARITY' | string
  reason?: string
  transferDate?: Date
}

interface BeneficiaryAgeContext {
  beneficiaryId: string
  beneficiaryAge: number
  userId: string
}

interface MeritTransferError {
  success: false
  error: {
    code: 'merit_transfer_age_gate_violation'
    message: 'Không thể chuyển công đức cho người dưới 5 tuổi. Vui lòng kiểm tra lại tuổi của người thụ hưởng.'
    severity: 'ERROR'
    statusCode: 400
  }
}
```

---

## Write Path

```
POST /api/vows-merit/merit-transfer

1. Validate MeritTransferDto:
   a. beneficiaryAge REQUIRED (not null, not undefined)
   b. beneficiaryAge must be a valid number >= 0
2. Load beneficiary data (cross-check if needed)
3. Check: beneficiaryAge < 5
   a. If TRUE:
      - Return 400 with error code 'merit_transfer_age_gate_violation'
      - Audit: vow.merit-transfer.age-gate-blocked
      - Do NOT create record
   b. If FALSE (age >= 5):
      - Create MeritTransfer record
      - Return 201 + transfer confirmation
```

---

## FE Behavior

```
┌──────────────────────────────────────────────────────┐
│ Tạo Chuyển Công Đức                                 │
│──────────────────────────────────────────────────────│
│                                                     │
│ Người Thụ Hưởng:  [_____________________]          │
│ Tuổi:             [___] năm                         │
│ Mục Đích:         [_____________________]          │
│                                                     │
│ [Hủy]  [Tạo Chuyển]                                 │
└──────────────────────────────────────────────────────┘

On Age Validation Error:
┌──────────────────────────────────────────────────────┐
│ ❌ Lỗi                                               │
│──────────────────────────────────────────────────────│
│                                                     │
│ Không thể chuyển công đức cho người dưới 5 tuổi.   │
│ Vui lòng kiểm tra lại tuổi của người thụ hưởng.    │
│                                                     │
│ [Quay Lại]                                          │
└──────────────────────────────────────────────────────┘
```

- FE MUST render age input field with type="number" and validation
- On submission, if `beneficiaryAge < 5` → show error modal with message
- Block the request at API level with 400
- RED error message (not yellow warning)
- Do NOT allow form submission if age < 5

---

## Schema Notes

```prisma
model MeritTransfer {
  id              String   @id @default(cuid())
  userId          String
  beneficiaryId   String?
  beneficiaryAge  Int      // REQUIRED — age of beneficiary at time of transfer
  meritAmount     Float
  meritSource     String   // 'VOWS' | 'RECITATION' | 'CHARITY' etc.
  reason          String?
  transferDate    DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([beneficiaryId])
  @@index([transferDate])
}

// Migration:
// ALTER TABLE "MeritTransfer" ADD COLUMN "beneficiaryAge" INTEGER NOT NULL DEFAULT 0;
// UPDATE "MeritTransfer" SET "beneficiaryAge" = 0 WHERE "beneficiaryAge" IS NULL;  // backfill
// CREATE INDEX "MeritTransfer_beneficiaryAge_idx" ON "MeritTransfer"("beneficiaryAge");
```

---

## Audit

| Action | Trigger |
|---|---|
| `vow.merit-transfer.age-gate-blocked` | Attempt to create transfer con beneficiaryAge < 5 |
| `vow.merit-transfer.created` | Successful merit transfer creation (age >= 5) |

---

## Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| `beneficiaryAge < 5` | `merit_transfer_age_gate_violation` | 400 | "Không thể chuyển công đức cho người dưới 5 tuổi. Vui lòng kiểm tra lại tuổi của người thụ hưởng." |
| `beneficiaryAge` missing in DTO | `merit_transfer_validation_error` | 400 | "Tuổi của người thụ hưởng là bắt buộc." |
| `beneficiaryAge` invalid type | `merit_transfer_validation_error` | 400 | "Tuổi phải là một số nguyên hợp lệ." |

---

## Validation Rules (Zod)

```typescript
import { z } from 'zod'

export const CreateMeritTransferDtoSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  beneficiaryId: z.string().min(1, 'Beneficiary ID required'),
  beneficiaryAge: z
    .number()
    .int('Age must be an integer')
    .min(0, 'Age cannot be negative')
    .refine(age => age >= 5, {
      message: 'Không thể chuyển công đức cho người dưới 5 tuổi.',
      path: ['beneficiaryAge'],
    }),
  meritAmount: z.number().min(0.01, 'Merit amount must be positive'),
  meritSource: z
    .enum(['VOWS', 'RECITATION', 'CHARITY'])
    .default('VOWS'),
  reason: z.string().optional(),
  transferDate: z.date().optional().default(() => new Date()),
})

export type CreateMeritTransferDto = z.infer<
  typeof CreateMeritTransferDtoSchema
>
```

---

## Notes for AI/codegen

- Rule này là HARD BLOCK — không bao giờ cho phép age < 5
- `beneficiaryAge` là REQUIRED field trong DTO — không thể null/undefined
- Validation MUST happen at DTO level (Zod schema) và service level (double-check)
- Error code `merit_transfer_age_gate_violation` phải được định nghĩa tại `@pmtl/shared/errors`
- Audit log action `vow.merit-transfer.age-gate-blocked` MUST trigger before any error response
- Phase 2+: Có thể mở rộng rule cho các nhóm tuổi khác (e.g., tuổi vị thành niên 5-18)
- Ngưỡng 5 tuổi là mốc pháp lý/tâm linh — có thể config thành `MERIT_TRANSFER_MIN_AGE` nếu cần thay đổi

---

## Related

- [create-prayer-session-with-merit-transfer.md](./create-prayer-session-with-merit-transfer.md) — merit transfer creation flow (parent flow)
- [merit-percentage-splitter.md](./merit-percentage-splitter.md) — merit distribution logic (related)
