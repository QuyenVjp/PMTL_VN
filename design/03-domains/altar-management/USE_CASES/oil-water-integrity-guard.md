# Dầu & Nước Cúng — Oil & Water Integrity Guard

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Quy tắc cúng dầu & nước trên bàn thờ
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Định nghĩa 2 nhóm quy tắc cứng cho việc dâng cúng dầu & nước tại bàn thờ:

1. **Water Integrity Constraints** — Cốc cúng phải trơn không in, không uống trực tiếp, không hâm nóng bằng vi sóng, không tưới cây.
2. **Oil Type & Consumption Validation** — Chỉ dùng dầu từ whitelist (OLIVE, CANOLA, CORN, LOTUS), cấm dầu thơm, bắt buộc nấu chín trước khi ăn.

Cả hai đều thuộc domain `altar-management` (OilWaterIntegrityValidator service) và phải được enforce ở cả API layer và FE UI.

---

## Owner module

`altar-management` — [xem CONTRACTS.md](../CONTRACTS.md)

Service: `OilWaterIntegrityValidator` (injectable guard)

---

## Part A — Water Offering Integrity (Logic 1A)

### Business Rule

Nước cúng Quan Thế Âm Bồ Tát có năng lượng linh thiêng. Bắt buộc kiểm tra trước khi log:

1. **Cốc phải trơn (no sacred images)** — Không được in Kinh Văn, không in hình Phật, không in hình động vật, không in bất kỳ chữ nào.
2. **Không uống trực tiếp từ cốc cúng** — Phải rót ra cốc khác để uống.
3. **Cấm hâm nóng bằng lò vi sóng hoặc đun sôi trực tiếp** — Chỉ được ngâm vào bát nước nóng (water bath method / ngâm vào nước nóng).
4. **Cấm tưới cây** — Nước mang nghiệp của cây hấp thu, không về được người.

### Actors

- `member` — khi log offering với type = WATER
- `system` — validate container description, reject/warn khi vi phạm

### Trigger

User POST `/api/altar-management/offerings/log-water-or-oil` với `type: "WATER"`

### Input Contract

```
LogOfferingDto {
  type: "WATER" | "OIL"  // bắt buộc
  containerDescription?: string  // nếu type = WATER
  oilType?: OilTypeEnum  // nếu type = OIL
  heatingMethod?: "WATER_BATH" | "DIRECT_BOIL" | "MICROWAVE"  // nếu type = WATER
  // Checkbox xác nhận:
  waterContainerAgreement?: boolean  // user check mandatory checkbox
}
```

### Write Path

1. Parse `type` → if `type === "WATER"`:
2. Validate mandatory checkbox `waterContainerAgreement === true`:
   - Nếu `false` → throw `400 BadRequest`:
     ```json
     {
       "error": "water_commitment_unchecked",
       "message": "Bạn phải xác nhận cam kết về cốc nước trước khi log.",
       "severity": "VALIDATION_REQUIRED"
     }
     ```
3. Parse `heatingMethod` via Zod enum → if not in `["WATER_BATH", "DIRECT_BOIL", "MICROWAVE"]`:
   - throw `400 BadRequest: "invalid_heating_method"`
4. If `heatingMethod === "DIRECT_BOIL"` or `heatingMethod === "MICROWAVE"`:
   - **Hard block** 400 `water_improper_heating`:
     ```json
     {
       "error": "water_improper_heating",
       "message": "Nước cúng CẤM đun sôi trực tiếp hoặc dùng lò vi sóng. Chỉ hâm nóng bằng cách ngâm vào nước nóng.",
       "severity": "SPIRITUAL_BLOCK"
     }
     ```
5. Audit log:
   - `altar.water-offering.logged` (success)
   - `altar.water-offering.container-validated` (passed validation)
   - `altar.water-offering.heating-method-validated` (passed heating check)

### FE Behavior

When user logs water offering:

1. Show mandatory checkbox (must be checked before submit):
   ```
   [x] Tôi cam kết ly nước là ly trơn, không in Kinh văn/động vật.
       Tôi sẽ không uống trực tiếp từ ly, không dùng tưới cây,
       và chỉ hâm nóng bằng cách đun cách thủy.
   ```

2. Render heating method selector (radio or dropdown):
   - ⭕ Đun cách thủy (ngâm vào nước nóng)
   - ⭕ Để ấm tự nhiên
   - ⛔ Đun sôi trực tiếp → **RED disable** with icon
   - ⛔ Lò vi sóng (microwave) → **RED disable** with icon

3. Forbidden methods show inline warning:
   > "CẤM: Cách này phân tán năng lượng nước cúng"

4. Submit button disabled until checkbox checked + valid heating method selected.

### Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| Checkbox không tích | `water_commitment_unchecked` | 400 | Phải xác nhận cam kết |
| Heating method is DIRECT_BOIL or MICROWAVE | `water_improper_heating` | 400 | CẤM đun sôi/vi sóng |
| Invalid heating method enum | `invalid_heating_method` | 400 | Phương pháp hâm nóng không hợp lệ |
| Unauthorized | `unauthorized` | 401 | Chưa đăng nhập |

---

## Part B — Oil Offering Type & Consumption Validation (Logic 1B)

### Business Rule

Dầu dâng cúng trên bàn thờ chỉ được dùng dầu thực vật nguyên chất. Danh sách whitelist:

**Danh sách ALLOWED (Whitelist):**

| Enum value | Tên tiếng Việt | Ghi chú |
|---|---|---|
| `OLIVE` | Dầu olive | Tinh khiết |
| `CANOLA` | Dầu hạt cải | Tinh khiết |
| `CORN` | Dầu ngô | Tinh khiết |
| `LOTUS` | Dầu sen | Tinh khiết, linh thiêng |

**Danh sách FORBIDDEN (Hard block 400):**

| Enum value | Tên tiếng Việt | Lý do |
|---|---|---|
| `SESAME` | Dầu mè | Mùi thơm đặc trưng — uế tạp |
| `PEANUT` | Dầu đậu phộng | Mùi thơm — uế tạp |
| `SOYBEAN` | Dầu đậu nành | Mùi thơm — uế tạp |
| (others) | — | Không trong whitelist |

### Consumption Rule

Dầu cúng **bắt buộc nấu chín** trước khi ăn. Tuyệt đối cấm dùng để xào nấu món mặn (thịt/cá) vì làm mất năng lượng.

### Actors

- `member` — khi log offering với type = OIL
- `system` — validate oilType, reject forbidden types, warn on consumption

### Trigger

User POST `/api/altar-management/offerings/log-water-or-oil` với `type: "OIL"`

### Input Contract

```
LogOfferingDto {
  type: "OIL"
  oilType: OilTypeEnum  // bắt buộc
  heatingMethod?: ignored  // N/A cho oil
  containerDescription?: string
}
```

### Write Path

1. Parse `type` → if `type === "OIL"`:
2. Parse `oilType` via Zod enum against ALLOWED list:
   - If `oilType` not in `["OLIVE","CANOLA","CORN","LOTUS"]` → throw `400 BadRequest`:
     ```json
     {
       "error": "forbidden_oil_type",
       "message": "Dầu này bị cấm dâng cúng. Chỉ dùng dầu olive, dầu hạt cải, dầu ngô hoặc dầu sen.",
       "severity": "SPIRITUAL_BLOCK",
       "forbiddenType": "SESAME"  // or actual type
     }
     ```
3. If `oilType` valid → create OfferingLog record.
4. Audit:
   - `altar.oil-offering.logged` (success)
   - `altar.oil-offering.forbidden-type-blocked` (if rejected)

### FE Behavior — Oil Type Selection

1. Dropdown render ALLOWED oils with checkmark icon.
2. Render FORBIDDEN oils with ⛔ icon, tooltip:
   > "Dầu này bị cấm dâng cúng vì có mùi thơm"

3. Không ẩn hoàn toàn (để user biết tại sao không dùng được).
4. Submit button disabled when forbidden oil selected.

### FE Behavior — Oil Consumption Warning

When user indicates they will consume the oil (separate flow, e.g., "Consume Offering"):

1. Show **modal with red background** (not dismissible):
   ```
   ⚠️ CẢNH BÁO: Dầu này bắt buộc phải nấu chín
   và TUYỆT ĐỐI KHÔNG dùng để xào nấu
   món mặn (thịt/cá)!

   [Tôi hiểu] [Hủy]
   ```

2. If user clicks [Tôi hiểu] → allow consumption log.
3. If [Hủy] → close modal, no action.

### Errors

| Condition | Code | HTTP | Message |
|---|---|---|---|
| `oilType` not in whitelist (SESAME, PEANUT, SOYBEAN, etc.) | `forbidden_oil_type` | 400 | Dầu bị cấm dâng cúng |
| `oilType` missing | `invalid_body` | 400 | Loại dầu bắt buộc |
| Unauthorized | `unauthorized` | 401 | Chưa đăng nhập |

---

## Schema & Data Model

### Prisma Schema (to be added)

```prisma
enum OilType {
  OLIVE
  CANOLA
  CORN
  LOTUS
  // FORBIDDEN — API reject, FE warn
  SESAME
  PEANUT
  SOYBEAN
}

enum HeatingMethod {
  WATER_BATH      // ngâm vào nước nóng (ALLOWED)
  AMBIENT         // để ấm tự nhiên (ALLOWED)
  DIRECT_BOIL     // đun sôi trực tiếp (FORBIDDEN)
  MICROWAVE       // lò vi sóng (FORBIDDEN)
}

model OfferingLog {
  id                    String    @id @default(cuid())
  userId                String
  user                  User      @relation(fields: [userId], references: [id])

  // Type discriminator
  type                  String    // "WATER" | "OIL"

  // Water-specific
  containerHasSacredImages Boolean?
  heatingMethod         HeatingMethod?
  waterContainerAgreement Boolean?

  // Oil-specific
  oilType               OilType?

  // Common
  containerDescription  String?   @db.VarChar(500)
  loggedAt              DateTime  @default(now())

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@index([type])
}

// Audit log table (existing)
model AuditLog {
  // ... existing fields ...
  // Events to log:
  // "altar.water-offering.logged"
  // "altar.water-offering.container-validated"
  // "altar.water-offering.heating-method-validated"
  // "altar.oil-offering.logged"
  // "altar.oil-offering.forbidden-type-blocked"
}
```

### DTO (Backend)

```typescript
// apps/api/src/altar-management/dtos/log-offering.dto.ts

import { z } from 'zod';

const OilTypeSchema = z.enum([
  'OLIVE',
  'CANOLA',
  'CORN',
  'LOTUS',
  'SESAME',
  'PEANUT',
  'SOYBEAN',
]);

const HeatingMethodSchema = z.enum([
  'WATER_BATH',
  'AMBIENT',
  'DIRECT_BOIL',
  'MICROWAVE',
]);

export const LogOfferingDtoSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('WATER'),
    containerDescription: z.string().max(500).optional(),
    heatingMethod: HeatingMethodSchema,
    waterContainerAgreement: z.boolean().refine(val => val === true, {
      message: 'Bạn phải xác nhận cam kết về cốc nước',
    }),
  }),
  z.object({
    type: z.literal('OIL'),
    oilType: OilTypeSchema,
    containerDescription: z.string().max(500).optional(),
  }),
]);

export type LogOfferingDto = z.infer<typeof LogOfferingDtoSchema>;
```

---

## Service Implementation Notes

### OilWaterIntegrityValidator (injectable service)

```typescript
// apps/api/src/altar-management/services/oil-water-integrity-validator.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { AuditLogService } from '@shared/audit-log';

const ALLOWED_OIL_TYPES = ['OLIVE', 'CANOLA', 'CORN', 'LOTUS'];
const FORBIDDEN_HEATING_METHODS = ['DIRECT_BOIL', 'MICROWAVE'];

@Injectable()
export class OilWaterIntegrityValidator {
  constructor(private auditLog: AuditLogService) {}

  async validateWaterOffering(
    userId: string,
    dto: LogOfferingDto,
  ): Promise<void> {
    if (dto.type !== 'WATER') return;

    // Checkpoint 1: Mandatory agreement checkbox
    if (!dto.waterContainerAgreement) {
      throw new BadRequestException({
        error: 'water_commitment_unchecked',
        message: 'Bạn phải xác nhận cam kết về cốc nước trước khi log.',
        severity: 'VALIDATION_REQUIRED',
      });
    }

    // Checkpoint 2: Heating method validation
    if (FORBIDDEN_HEATING_METHODS.includes(dto.heatingMethod)) {
      await this.auditLog.log({
        userId,
        action: 'altar.water-offering.heating-method-blocked',
        details: { heatingMethod: dto.heatingMethod },
      });
      throw new BadRequestException({
        error: 'water_improper_heating',
        message:
          'Nước cúng CẤM đun sôi trực tiếp hoặc dùng lò vi sóng. Chỉ hâm nóng bằng cách ngâm vào nước nóng.',
        severity: 'SPIRITUAL_BLOCK',
      });
    }

    // Audit: passed validation
    await this.auditLog.log({
      userId,
      action: 'altar.water-offering.container-validated',
    });
    await this.auditLog.log({
      userId,
      action: 'altar.water-offering.heating-method-validated',
      details: { heatingMethod: dto.heatingMethod },
    });
  }

  async validateOilOffering(
    userId: string,
    dto: LogOfferingDto,
  ): Promise<void> {
    if (dto.type !== 'OIL') return;

    // Checkpoint 1: Oil type whitelist
    if (!ALLOWED_OIL_TYPES.includes(dto.oilType)) {
      await this.auditLog.log({
        userId,
        action: 'altar.oil-offering.forbidden-type-blocked',
        details: { oilType: dto.oilType },
      });
      throw new BadRequestException({
        error: 'forbidden_oil_type',
        message:
          'Dầu này bị cấm dâng cúng. Chỉ dùng dầu olive, dầu hạt cải, dầu ngô hoặc dầu sen.',
        severity: 'SPIRITUAL_BLOCK',
        forbiddenType: dto.oilType,
      });
    }

    // Audit: passed validation
    await this.auditLog.log({
      userId,
      action: 'altar.oil-offering.logged',
      details: { oilType: dto.oilType },
    });
  }
}
```

---

## Audit Events

| Event | Trigger | Payload |
|---|---|---|
| `altar.water-offering.logged` | User successfully logs water | `{ userId, heatingMethod }` |
| `altar.water-offering.container-validated` | Container passes validation | `{ userId }` |
| `altar.water-offering.heating-method-validated` | Heating method passes validation | `{ userId, heatingMethod }` |
| `altar.oil-offering.logged` | User successfully logs oil | `{ userId, oilType }` |
| `altar.oil-offering.forbidden-type-blocked` | Forbidden oil type rejected | `{ userId, oilType }` |

---

## API Endpoint

**POST** `/api/altar-management/offerings/log-water-or-oil`

### Request

```json
{
  "type": "WATER",
  "heatingMethod": "WATER_BATH",
  "containerDescription": "Cốc sứ trắng trơn",
  "waterContainerAgreement": true
}
```

or

```json
{
  "type": "OIL",
  "oilType": "OLIVE",
  "containerDescription": "Dầu olive đắp cao"
}
```

### Response (Success 201)

```json
{
  "success": true,
  "data": {
    "id": "offering_xyz",
    "type": "WATER",
    "heatingMethod": "WATER_BATH",
    "loggedAt": "2026-04-04T10:30:00Z"
  }
}
```

### Response (Error 400)

```json
{
  "success": false,
  "error": "forbidden_oil_type",
  "message": "Dầu này bị cấm dâng cúng...",
  "severity": "SPIRITUAL_BLOCK"
}
```

---

## Related

- [validate-altar-oil-and-water.md](../../vows-merit/USE_CASES/validate-altar-oil-and-water.md) — Extended oil type rules
- [great-compassion-water-rules.md](../../content/USE_CASES/great-compassion-water-rules.md) — Content guidance on water offerings
- [altar-offerings-guide.md](../../content/USE_CASES/altar-offerings-guide.md) — Canonical offering guide
- [CONTRACTS.md](../CONTRACTS.md) — Domain contract for altar-management

---

## Test Coverage Checklist

- [ ] Water offering: all heating methods (WATER_BATH, AMBIENT, DIRECT_BOIL, MICROWAVE)
- [ ] Water offering: missing checkbox agreement → 400
- [ ] Water offering: forbidden heating method → 400
- [ ] Oil offering: all oil types (whitelist + forbidden)
- [ ] Oil offering: forbidden oil type → 400
- [ ] Audit logs created correctly
- [ ] FE: Water checkbox renders and disables submit until checked
- [ ] FE: Heating method radio buttons render with forbidden methods disabled + red
- [ ] FE: Oil type dropdown shows forbidden items with ⛔ icon
- [ ] FE: Consumption warning modal shows + dismissible
