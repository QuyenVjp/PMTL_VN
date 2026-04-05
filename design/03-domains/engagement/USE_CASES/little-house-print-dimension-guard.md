# Định Dạng Cứng Kích Thước In Ngôi Nhà Nhỏ — Strict CSS Print Dimension Guard
> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Phase 47)
> **Trạng thái:** Hard constraint enforcement
> **Cập nhật:** 2026-04-06

## Purpose
Ngôi Nhà Nhỏ không phải in sao cũng được. Kích thước viền đen bên ngoài **PHẢI LÀ 9.1cm x 13.95cm**, sai số tối đa **5mm**. Giấy màu vàng chanh. Không được thay đổi trật tự sắp chữ.

## Owner module
`engagement` — PDF generation & print validation

## Actors
- User (in tờ sớ)
- Browser/Print API (CSS media query)
- System (PDF export)

## Trigger
User bấm `[Xuất PDF]` hoặc `[In Ngôi Nhà Nhỏ]`

## Business Rules

| Rule | Detail |
|------|--------|
| Outer Border | 9.1cm × 13.95cm (±5mm tolerance) |
| Paper Color | Vàng chanh / vàng tương tự |
| Print Scale | **100% (Actual Size)** — KHÔNG "Scale to Fit" |
| Typography | KHÔNG thay đổi trật tự chữ, KHÔNG gấp nếp |
| Watermark | Phải hiển thị cảnh báo in lên mỗi trang |

## Input Contract

```typescript
interface LittleHousePrintDto {
  recipientName: string;
  beneficiaryType: "PERSONAL_DEBT" | "MISCARRIAGE" | "DECEASED" | "FAMILY_RELATIVE";
  pdfFormat: "A4" | "A5"?;  // mặc định A5
  scaleMode: "ACTUAL_SIZE" | "FIT_PAGE"?;  // mặc định ACTUAL_SIZE
}

interface PrintDimensionValidationDto {
  measuredWidth_mm: number;
  measuredHeight_mm: number;
  scaleFactor: number;
}

interface PrintValidationResponseDto {
  isValid: boolean;
  deviationMm?: number;
  feedback: string;
}
```

## Write Path

```
POST /engagement/little-house/export-pdf
  Input: LittleHousePrintDto

  1. Generate PDF với @page { size: 91mm 139.5mm; margin: 0; }
  2. Set font-weight, letter-spacing KHÔNG ĐỔI (immutable typography)
  3. Inject SVG watermark: "CẢNH BÁO MÁY IN: In ở 100% (Actual Size), TUYỆT ĐỐI KHÔNG 'Scale to Fit'"
  4. Return PDF file với content-disposition: attachment
  5. Log audit: INSERT INTO PrintExportAudit (userId, littleHouseId, timestamp)
```

## FE Behavior

```
[Xuất PDF Ngôi Nhà Nhỏ]
  ↓
[Modal cảnh báo]:
┌─────────────────────────────────────────┐
│ ⚠️ CẢNH BÁO MÁY IN                      │
│                                         │
│ Vui lòng in ở TỶ LỆ 100% (Actual Size) │
│                                         │
│ ❌ TUYỆT ĐỐI KHÔNG chọn "Scale to Fit"│
│                                         │
│ Viền đen (ruler) phải đo chính xác:    │
│ • Chiều ngang: 9.1cm                   │
│ • Chiều cao: 13.95cm                   │
│ • Sai số tối đa: ±5mm                  │
│                                         │
│ [Tôi đã hiểu ✓] [Hủy]                  │
└─────────────────────────────────────────┘
  ↓ Click [Tôi đã hiểu] ↓
[PDF Download]
```

## Schema Notes

```prisma
model PrintExportAudit {
  id              String   @id @default(cuid())
  userId          String
  littleHouseId   String
  exportedAt      DateTime @default(now())
  pdfPageCount    Int
}
```

## Audit
Mỗi lần export PDF đều log filename, timestamp, user ID

## Error Codes

| Code | Message |
|------|---------|
| PRINT_SCALE_INVALID | Bạn chọn "Scale to Fit". Vui lòng chọn 100% (Actual Size). |
| PRINT_DIMENSION_FAIL | Không thể xuất PDF. Vui lòng thử lại. |

## Notes
- CSS @page khóa kích thước, browser không thể override
- User VẪN PHẢI lựa chọn 100% scale trên máy in (hệ thống không điều khiển được)
- Watermark cảnh báo là để nhắc nhở khi in

## Related
- `engagement/validate-little-house-burn-conditions.md` — burn validation
- `engagement/little-house-recipient-syntax-validator.md` — name validation
