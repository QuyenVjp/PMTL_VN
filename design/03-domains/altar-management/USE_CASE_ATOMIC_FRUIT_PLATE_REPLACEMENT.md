# USE CASE: Atomic Fruit Plate Replacement
**Module:** `altar-management`  
**Phase:** 25 - Micro-Normalization & Specific Karma Measurement  
**Source:** Buddhism in Plain Terms, Hướng dẫn Ngôi Nhà Nhỏ, Q&A Huyền học

---

## 📋 Tóm Tắt Nghiệp Vụ

Khi trái cây cúng trên đĩa bị hỏng, **TUYỆT ĐỐI KHÔNG ĐƯỢC**:
- ❌ Nhặt vài quả hỏng ra
- ❌ Chêm quả mới vào
- ❌ Trộn chung quả cũ với quả mới

**Quy tắc bắt buộc:** Phải thay mới **TOÀN BỘ** cả 1 đĩa.

**Lý do:** Mỗi đĩa cúng dường là một "đơn vị năng lượng nguyên tử" (atomic energy unit). Khi 1 quả hỏng, năng lượng của cả đĩa đã bị nhiễm. Việc thay từng quả sẽ tạo ra năng lượng lộn xộn, không thanh tịnh.

---

## 🎯 Acceptance Criteria

### AC1: Hide Partial Removal Controls
**GIVEN** user mở giao diện `AltarInventory`  
**WHEN** họ xem object `FruitPlate`  
**THEN** 
- **Ẩn/vô hiệu hóa hoàn toàn** các nút:
  - `[-] Giảm số lượng quả` (disabled)
  - `[Chỉnh sửa từng quả]` (hidden)
  - Slider điều chỉnh số lượng (disabled)

### AC2: Force Atomic Replacement Only
**GIVEN** user muốn cập nhật trái cây  
**WHEN** họ tương tác với `FruitPlate` component  
**THEN** 
- Chỉ hiển thị **DUY NHẤT MỘT NÚT**:
  ```
  [🔄 Dọn Sạch & Thay Đĩa Mới]
  (Clear & Replace Entire Plate)
  ```

### AC3: Clear Before Add Workflow
**GIVEN** user bấm nút `[Dọn Sạch & Thay Đĩa Mới]`  
**WHEN** modal confirmation mở ra  
**THEN** 
- Hiển thị xác nhận:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🍎 THAY ĐĨA TRÁI CÂY MỚI
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  Hành động này sẽ:
  ✅ Dọn sạch toàn bộ đĩa hiện tại
  ✅ Cho phép bạn chuẩn bị đĩa mới hoàn toàn
  
  ℹ️  Lưu ý: Không được trộn quả cũ với quả mới
  
  [Hủy]  [Xác Nhận Thay Đĩa]
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

### AC4: Atomic Transaction In Database
**GIVEN** user xác nhận thay đĩa  
**WHEN** hệ thống thực hiện update  
**THEN** 
- Thực hiện **atomic transaction**:
  1. DELETE old `FruitPlate` record
  2. INSERT new `FruitPlate` record với:
     - `replacedAt: <timestamp>`
     - `isNewPlate: true`
     - `previousPlateId: <old_plate_id>` (for audit trail)

### AC5: Prevent Partial Update API
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

### AC6: Audit Trail For Plate History
**GIVEN** user đã thay đĩa nhiều lần  
**WHEN** admin xem lịch sử bàn thờ  
**THEN** 
- Hiển thị timeline:
  ```
  📅 04/04/2026 11:00 - Thay đĩa mới (5 quả cam)
  📅 02/04/2026 14:30 - Thay đĩa mới (3 quả táo, 2 quả lê)
  📅 30/03/2026 09:00 - Thay đĩa mới (4 quả thanh long)
  ```

---

## 🔧 Technical Notes

### Database Schema
```prisma
model FruitPlate {
  id              String   @id @default(cuid())
  altarId         String
  createdAt       DateTime @default(now())
  replacedAt      DateTime @default(now())
  isActive        Boolean  @default(true)
  
  // Atomic replacement tracking
  isNewPlate      Boolean  @default(true)
  previousPlateId String?
  
  // Fruit composition (stored as snapshot)
  fruitTypes      Json     // Array of {type, quantity, condition}
  
  altar Altar @relation(fields: [altarId], references: [id])
  
  @@index([altarId, isActive])
  @@index([replacedAt])
}
```

### API Endpoint Design
```typescript
// ❌ NOT ALLOWED:
// PATCH /altar/fruit-plate/:id
// PUT /altar/fruit-plate/:id/fruits

// ✅ ONLY ALLOWED:
// POST /altar/fruit-plate/replace
//   Body: { altarId, newFruitComposition }
//   Behavior: Delete old, create new in single transaction
```

### Validation Guard (NestJS)
```typescript
// Guard: AtomicFruitPlateGuard
// Location: apps/api/src/altar-management/guards/

@Injectable()
export class AtomicFruitPlateGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route.path;
    
    // Block any PATCH/PUT to fruit-plate
    if ((method === 'PATCH' || method === 'PUT') && path.includes('fruit-plate')) {
      throw new BadRequestException({
        message: "Không được phép thay đổi từng phần trái cây trong đĩa cúng. Bắt buộc phải thay mới toàn bộ đĩa.",
        code: "ATOMIC_REPLACEMENT_REQUIRED"
      });
    }
    
    return true;
  }
}
```

### Frontend Component
```typescript
// Location: apps/web/src/features/altar/components/FruitPlateManager.tsx

export function FruitPlateManager() {
  return (
    <div className="fruit-plate-manager">
      {/* Hide all partial editing controls */}
      
      {/* Show only atomic replacement button */}
      <Button 
        variant="primary"
        icon={<RefreshIcon />}
        onClick={handleReplaceEntirePlate}
      >
        Dọn Sạch & Thay Đĩa Mới
      </Button>
      
      {/* Current plate display (read-only) */}
      <FruitPlateDisplay plate={currentPlate} readonly />
    </div>
  );
}
```

---

## 📚 References

- **Giáo lý gốc:** Hướng dẫn Ngôi Nhà Nhỏ - Chương về vật phẩm cúng dường
- **Q&A Huyền học:** Nguyên tắc thay thế cúng phẩm
- **Hướng dẫn thực hành:** Bảo toàn năng lượng thanh tịnh trên bàn thờ

---

## 🏷️ Tags
`#phase-25` `#altar-management` `#fruit-plate` `#atomic-replacement` `#energy-integrity` `#offering-rules`
