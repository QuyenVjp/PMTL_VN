# USE CASE: Fruit Plate Mathematical Integrity

**Module:** `altar-management` — `FruitPlateValidator`, `FruitPlateOddLayerValidator`
**Phase:** 41 - Logic 2: Odd-Layer Fruit Matrix
**Source:** Buddhism in Plain Terms, Ngôn Luận Thực Hành Cúng Dường, Huyền Học Số Học Bàn Thờ

---

## 📋 Tóm Tắt Nghiệp Vụ

Khi cúng dường trái cây trên bàn thờ, không chỉ loại trái cây mà còn **số lượng, cách xếp tầng** đều có ý nghĩa karmnic quan trọng. Hệ thống này thực thi quy luật **toán học tâm linh** để đảm bảo tính thanh tịnh của cúng phẩm.

---

## PART A: Single Fruit Type Rule (Cơ Bản)

### Quy Tắc A: Đơn Loại Trái Cây

**BẮT BUỘC:** Mỗi đĩa cúng **CHỈ được chứa MỘT LOẠI** trái cây.

**Lý do:** Trộn nhiều loại trái cây tạo ra "xáo trộn năng lượng" (energy confusion), làm giảm hiệu quả cúng dường.

### AC A1: Validate Single Fruit Type
**GIVEN** user tạo fruit plate
**WHEN** họ submit request tạo plate với `fruitType`
**THEN**
- Validate: `fruitType` phải là enum hợp lệ
- Enum values: `APPLE`, `ORANGE`, `PEAR`, `LYCHEE`, `MANGO`, `LONGAN`, `DRAGON_FRUIT`, etc.
- Error nếu empty: `400 Bad Request` → `missing_fruit_type`

### AC A2: Forbidden Fruits Blacklist
**GIVEN** user chọn loại trái cây
**WHEN** họ submit plate creation
**THEN**
- **Cấm cúng (Forbidden):**
  - ❌ **Chuối** (Banana) — hình dáng liên kết đến hoại ma
  - ❌ **Đào** (Peach) — năng lượng kích động, không tĩnh tâm
- Hard block: Return `400 Bad Request`
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Chuối và đào không được phép cúng dường trên bàn thờ.",
    "code": "forbidden_fruit_type",
    "forbiddenFruits": ["BANANA", "PEACH"]
  }
  ```

---

## PART B: Atomic Replacement & Plate Integrity (Nguyên Tử)

### Quy Tắc B: Thay Toàn Bộ Đĩa

**BẮT BUỘC:** Khi trái cây hỏng, **TUYỆT ĐỐI KHÔNG ĐƯỢC** thay từng quả. Phải thay mới **TOÀN BỘ** cả 1 đĩa.

**Lý do:** Mỗi đĩa là một "đơn vị năng lượng nguyên tử" (atomic energy unit). Khi 1 quả hỏng, năng lượng của cả đĩa đã bị nhiễm.

### AC B1: Hide Partial Removal Controls
**GIVEN** user mở giao diện quản lý fruit plate
**WHEN** họ xem object `FruitPlate`
**THEN**
- **Ẩn/vô hiệu hóa hoàn toàn** các nút:
  - `[-] Giảm số lượng quả` (disabled)
  - `[Chỉnh sửa từng quả]` (hidden)
  - Slider điều chỉnh số lượng (disabled)

### AC B2: Force Atomic Replacement Only
**GIVEN** user muốn cập nhật fruit plate
**WHEN** họ tương tác với component
**THEN**
- Chỉ hiển thị **DUY NHẤT MỘT NÚT**:
  ```
  [🔄 Dọn Sạch & Thay Đĩa Mới / Clear & Replace All]
  ```

### AC B3: Prevent Partial Update API
**GIVEN** client cố gắng gửi request PATCH/UPDATE với partial fruit changes
**WHEN** API nhận request
**THEN**
- Backend guard phát hiện violation
- Trả về `400 Bad Request`:
  ```json
  {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "Không được phép thay đổi từng phần trái cây trong đĩa cúng. Bắt buộc phải thay mới toàn bộ đĩa để đảm bảo tính toàn vẹn năng lượng.",
    "code": "ATOMIC_REPLACEMENT_REQUIRED",
    "allowedActions": ["REPLACE_ENTIRE_PLATE"]
  }
  ```

### AC B4: Atomic Transaction In Database
**GIVEN** user xác nhận thay đĩa
**WHEN** hệ thống thực hiện update
**THEN**
- Thực hiện **atomic transaction**:
  1. DELETE old `FruitPlate` record
  2. INSERT new `FruitPlate` record với `replacedAt`, `previousPlateId` (for audit trail)

---

## PART C: Odd-Layer Fruit Matrix (Tầng Lẻ) ⭐ NEW

### Quy Tắc C: Số Lượng Trái Cây Ở MỖI TẦNG Phải Là Số Lẻ

**BẮT BUỘC:** Khi xếp trái cây thành nhiều tầng, **MỖI TẦNG phải có số lượng LẺ** (1, 3, 5, 7, 9, ...).

**Lý do:** Số lẻ tượng trưng cho sự "không hoàn chỉnh" (incompleteness), mở ra cơ hội cho sự can thiệp từ tâm linh. Số chẵn là "hoàn chỉnh" → chặn năng lượng tâm linh.

**Ví dụ Hợp Lệ:**
- Tầng dưới: 3 quả, Tầng trên: 1 quả ✅ (3 lẻ, 1 lẻ)
- Tầng 1: 5 quả, Tầng 2: 3 quả, Tầng 3: 1 quả ✅ (5, 3, 1 đều lẻ)

**Ví dụ VI PHẠM:**
- Tầng dưới: 4 quả, Tầng trên: 2 quả ❌ (4 chẵn, 2 chẵn)
- Tầng 1: 6 quả, Tầng 2: 3 quả ❌ (6 chẵn)

### AC C1: Validate Odd Count Per Layer
**GIVEN** user tạo hoặc sửa fruit plate với nhiều tầng
**WHEN** họ submit request với `layers: number[]` (array of fruit counts per layer)
**THEN**
- Backend validation: `layers.every(count => count % 2 === 1)` must be **TRUE**
- Nếu **BẤT KỲ TẦNG NÀO** có số chẵn:
  - Return `422 Unprocessable Entity`:
  ```json
  {
    "statusCode": 422,
    "error": "Unprocessable Entity",
    "message": "Luật cúng dường: Số lượng trái cây ở MỖI TẦNG phải là số lẻ (Ví dụ: tầng dưới 3 quả, tầng trên 1 quả)!",
    "code": "even_fruit_count_per_layer",
    "invalidLayers": [
      {
        "layerIndex": 0,
        "receivedCount": 4,
        "issue": "Even number detected"
      },
      {
        "layerIndex": 2,
        "receivedCount": 6,
        "issue": "Even number detected"
      }
    ],
    "allowedPattern": "Each layer must contain odd number: 1, 3, 5, 7, 9, ..."
  }
  ```

### AC C2: UI Layer Count Input Validation
**GIVEN** user xây dựng fruit plate trên UI
**WHEN** họ nhập số lượng quả cho mỗi tầng
**THEN**
- Real-time validation:
  - Nếu number là chẵn → Show red error:
    ```
    ⚠️ Tầng này phải có số lẻ quả (1, 3, 5, 7, ...)
    ```
  - Input field turns **RED**
  - Submit button **DISABLED** cho đến khi tất cả layers valid

### AC C3: DTO & Schema Updates
**GIVEN** API receives create/update request
**WHEN** processing `CreateFruitPlateDto`
**THEN**
- DTO structure:
  ```typescript
  export class CreateFruitPlateDto {
    fruitType: FruitEnum;     // e.g., "APPLE", "ORANGE"
    layers: number[];          // e.g., [3, 1] or [5, 3, 1]

    @Validate(OddLayerCountValidator)
    validateLayers() {
      // Ensures each element in layers is odd
    }
  }
  ```

- Prisma Schema:
  ```prisma
  model FruitPlate {
    id              String   @id @default(cuid())
    altarId         String

    // Fruit composition
    fruitType       String   // FruitEnum stored as string
    layerCounts     Int[]    // Array of counts per layer (e.g., [3, 1, 5])

    // Plate integrity tracking
    isAllLayed      Boolean  @default(false)  // All layers properly set
    lastReplacedAt  DateTime @default(now())
    replacedAt      DateTime @default(now())
    isActive        Boolean  @default(true)

    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt

    // Relations & audit
    altar           Altar    @relation(fields: [altarId], references: [id])
    previousPlateId String?  // Atomic replacement tracking

    @@index([altarId, isActive])
    @@index([replacedAt])
  }
  ```

### AC C4: Audit Trail Entries
**GIVEN** user tạo/sửa fruit plate
**WHEN** validation passes hoặc fails
**THEN**
- Log audit entries:
  - ✅ **Pass:** `altar.fruit-plate.odd-layer-validated`
    ```
    {
      "action": "altar.fruit-plate.odd-layer-validated",
      "plateId": "plate_xyz",
      "fruitType": "APPLE",
      "layers": [3, 1],
      "timestamp": "2026-04-04T10:30:00Z"
    }
    ```
  - ❌ **Fail (even count):** `altar.fruit-plate.even-layer-count-blocked`
    ```
    {
      "action": "altar.fruit-plate.even-layer-count-blocked",
      "altarId": "altar_abc",
      "attemptedLayers": [4, 2],
      "rejectionReason": "Layer 0 has even count: 4",
      "timestamp": "2026-04-04T10:35:00Z"
    }
    ```
  - ❌ **Fail (forbidden fruit):** `altar.fruit-plate.forbidden-fruit-rejected`
    ```
    {
      "action": "altar.fruit-plate.forbidden-fruit-rejected",
      "altarId": "altar_abc",
      "attemptedFruit": "BANANA",
      "rejectionReason": "Banana not allowed for offering",
      "timestamp": "2026-04-04T10:40:00Z"
    }
    ```

### AC C5: Replacement Rule UI Messaging
**GIVEN** user tries to edit individual fruits on a plate
**WHEN** system blocks the action
**THEN**
- Display message:
  ```
  ℹ️  Để cập nhật đĩa cúng, bạn phải sử dụng:
  [🔄 Thay Toàn Bộ Đĩa Mới] (Clear and Replace All)

  Lý do: Không được trộn quả cũ và quả mới trên cùng 1 đĩa.
  ```

---

## 🔧 Technical Implementation

### Backend Validator (NestJS)

**File:** `apps/api/src/altar-management/validators/odd-layer-count.validator.ts`

```typescript
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'oddLayerCount', async: false })
export class OddLayerCountValidator implements ValidatorConstraintInterface {
  validate(layers: number[], args: ValidationArguments) {
    if (!Array.isArray(layers)) return false;
    return layers.every(count => count % 2 === 1);
  }

  defaultMessage(args: ValidationArguments) {
    const layers = args.value as number[];
    const evenLayers = layers
      .map((count, idx) => ({ idx, count }))
      .filter(({ count }) => count % 2 === 0);

    return `Luật cúng dường: Mỗi tầng phải có số lẻ quả. Tầng vi phạm: ${evenLayers.map(l => `Tầng ${l.idx} (${l.count})`).join(', ')}`;
  }
}
```

### API Endpoint

**Endpoint:** `POST /api/altar-management/fruit-plates/create`

**Request:**
```json
{
  "altarId": "altar_abc123",
  "fruitType": "APPLE",
  "layers": [3, 1]
}
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "id": "plate_xyz789",
    "altarId": "altar_abc123",
    "fruitType": "APPLE",
    "layerCounts": [3, 1],
    "isAllLayed": true,
    "lastReplacedAt": "2026-04-04T10:30:00Z",
    "createdAt": "2026-04-04T10:30:00Z"
  },
  "message": "Đĩa cúng được tạo thành công. Số lượng trái cây hợp lệ."
}
```

**Error Response (422 - Even Layer Count):**
```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Luật cúng dường: Số lượng trái cây ở MỖI TẦNG phải là số lẻ (Ví dụ: tầng dưới 3 quả, tầng trên 1 quả)!",
  "code": "even_fruit_count_per_layer",
  "invalidLayers": [
    {
      "layerIndex": 0,
      "receivedCount": 4,
      "issue": "Even number detected"
    }
  ],
  "allowedPattern": "Each layer: 1, 3, 5, 7, 9, ..."
}
```

**Error Response (400 - Forbidden Fruit):**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Chuối và đào không được phép cúng dường trên bàn thờ.",
  "code": "forbidden_fruit_type",
  "forbiddenFruits": ["BANANA", "PEACH"]
}
```

### Frontend Component

**File:** `apps/web/src/features/altar/components/FruitPlateBuilder.tsx`

```typescript
export function FruitPlateBuilder() {
  const [layers, setLayers] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleLayerChange = (index: number, count: number) => {
    const newLayers = [...layers];
    newLayers[index] = count;
    setLayers(newLayers);

    // Real-time validation
    const newErrors = { ...errors };
    if (count % 2 === 0) {
      newErrors[index] = `Tầng này phải có số lẻ quả (1, 3, 5, 7, ...)`;
    } else {
      delete newErrors[index];
    }
    setErrors(newErrors);
  };

  const isValid = layers.length > 0 && Object.keys(errors).length === 0;

  return (
    <div className="fruit-plate-builder">
      {layers.map((count, idx) => (
        <div key={idx} className={errors[idx] ? 'error' : ''}>
          <label>Tầng {idx + 1}</label>
          <input
            type="number"
            value={count}
            onChange={(e) => handleLayerChange(idx, parseInt(e.target.value))}
            placeholder="1, 3, 5, 7, ..."
          />
          {errors[idx] && <span className="error-msg">{errors[idx]}</span>}
        </div>
      ))}

      <button onClick={() => setLayers([...layers, 1])}>
        + Thêm tầng mới
      </button>

      <button disabled={!isValid} onClick={handleSubmit}>
        Tạo đĩa cúng
      </button>
    </div>
  );
}
```

---

## 📚 References

- **Giáo lý gốc:** Hướng dẫn Ngôi Nhà Nhỏ - Chương về vật phẩm cúng dường
- **Huyền học số học:** Ý nghĩa của số lẻ trong tu tập
- **Q&A Thực Hành:** Nguyên tắc xếp tầng cúng phẩm
- **Phase 41 Logic 2:** Odd-Layer Fruit Matrix Enhancement

---

## 🏷️ Tags

`#phase-41` `#logic-2` `#altar-management` `#fruit-plate` `#odd-layer-validation` `#mathematical-integrity` `#offering-rules` `#karma-precision`
