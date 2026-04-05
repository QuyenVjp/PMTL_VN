# Bảo Quản Phần Gỗ Dư Đại Hương — Sandalwood Residue Storage Tracker

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 919, 920)
> **Trạng thái:** Verified source — inventory + reuse tracking
> **Cập nhật:** 2026-04-04

---

## Purpose

Sau khi làm lễ xong, phần gỗ đàn hương đã tắt và chưa cháy hết có thể được cắm dọc (cắm dựng thẳng) vào trong lư hương Phật hoặc đặt nằm ngang để bảo quản. Phần gỗ còn lại này **không bị lãng phí** mà được tái sử dụng cho những lần thắp Đại Hương tiếp theo. Hệ thống cần track inventory, reuse count, và disposal (khi gỗ cháy hết hoàn toàn).

---

## Owner module

`altar-management` — AltarService / SandalwoodInventoryService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — cắm/lấy gỗ dư từ lư hương
- `system` — track inventory, predict lifespan, suggest disposal

---

## Trigger

1. Sau mỗi buổi đốt Đại Hương (tạo residue)
2. User chuẩn bị buổi thắp Đại Hương tiếp theo (tái sử dụng)
3. Khi gỗ dư cháy hết hoàn toàn (disposal)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Sau buổi đốt, còn gỗ dư | ✅ Log SandalwoodPiece record, store in altar |
| Gỗ dư được dùng lại | ✅ Increment reuse_count, update last_burned_at |
| Gỗ dư <5mm (quá ngắn) | ⚠️ Warning: suggest disposal |
| Gỗ dư cháy hết hoàn toàn | ✅ Mark status=DISPOSED, cleanup |

---

## Input Contract

```typescript
interface SandalwoodPieceDto {
  altarId: string
  lengthMm: number              // Estimated remaining length in mm
  createdFrom: 'RAW_STICK' | 'REPURPOSED'
  sourceSessionId: string       // Which burn session created this piece
}

interface ReusePieceDto {
  pieceId: string
  reuseAtSessionId: string
  lengthAfterBurn: number       // mm remaining after reuse
}

interface DisposePieceDto {
  pieceId: string
  disposalReason: 'FULLY_BURNED' | 'DAMAGED' | 'LOST'
}
```

---

## Write Path

```
--- After Grand Incense Burn Session ---
POST /api/altar-management/sandalwood/store-residue

1. Session completes (grand-incense state machine)
2. FE calls storage endpoint with estimated remaining length:
   {
     "lengthMm": 45,
     "sourceSessionId": "session-xyz"
   }

3. Create SandalwoodPiece:
   {
     id: cuid(),
     altarId: user.altarId,
     lengthMm: 45,
     createdFromSessionId: "session-xyz",
     createdAt: now(),
     reuseCount: 0,
     status: "IN_STORAGE",
     storageLocation: "IN_INCENSE_HOLDER"  // or VERTICAL_STAND
   }

4. Audit: altar.sandalwood.piece_created

--- User Reuses Piece (Next Auspicious Day) ---
POST /api/altar-management/sandalwood/:pieceId/reuse

1. Load piece from storage
2. Check piece.status === 'IN_STORAGE' (if DISPOSED, return 400)
3. If piece.lengthMm < 5:
   → Warn: "Phần gỗ này quá ngắn, khuyến nghị xử lý bỏ đi"
   → But allow reuse if user confirms
4. Burn completes, FE submits new length:
   {
     "lengthAfterBurn": 15
   }

5. Update piece:
   - lengthMm = 15
   - reuseCount += 1
   - lastBurnedAt = now()
   - Audit: altar.sandalwood.piece_reused

--- Full Disposal ---
POST /api/altar-management/sandalwood/:pieceId/dispose

1. Load piece
2. If piece.status !== 'IN_STORAGE':
   → 400 error
3. Update piece.status = 'DISPOSED'
4. Set disposalReason
5. Audit: altar.sandalwood.piece_disposed

```

---

## FE Behavior

### Storage Confirmation After Burn

```
┌────────────────────────────────────────────────────────┐
│ 🪵 Bảo Quản Phần Gỗ Dư Đại Hương                      │
│────────────────────────────────────────────────────────│
│ Bạn còn lại một phần gỗ đàn hương.                     │
│                                                        │
│ Phần gỗ này có thể được cắm vào lư hương để tái       │
│ sử dụng cho những lần thắp Đại Hương tiếp theo.       │
│                                                        │
│ Ước lượng chiều dài gỗ dư (mm): [_____]               │
│                                                        │
│ Nơi bảo quản:                                          │
│ ⭕ Cắm dọc trong lư hương (Vertical stand)            │
│ ⭕ Đặt nằm ngang trong lư hương (Horizontal)          │
│                                                        │
│           [Lưu Bảo Quản]                              │
└────────────────────────────────────────────────────────┘
```

### Inventory Dashboard

```
┌────────────────────────────────────────────────────────┐
│ 🏺 Kho Gỗ Đàn Hương                                    │
│────────────────────────────────────────────────────────│
│                                                        │
│ Phần 1: 45mm (Đã dùng lại 2 lần)                      │
│ └─ Tạo ngày: 2026-03-15                              │
│ └─ Lần cuối dùng: 2026-03-29                         │
│ └─ [Dùng lại]  [Xử lý bỏ đi]                         │
│                                                        │
│ Phần 2: 12mm ⚠️ (Quá ngắn)                            │
│ └─ Tạo ngày: 2026-03-22                              │
│ └─ Khuyến nghị: Xử lý bỏ đi                          │
│ └─ [Xử Lý Bỏ Đi]                                      │
│                                                        │
│ Tổng cộng: 2 phần gỗ đang lưu giữ                     │
└────────────────────────────────────────────────────────┘
```

### Reuse Confirmation

```
┌────────────────────────────────────────────────────────┐
│ 🪵 Tái Sử Dụng Phần Gỗ Dư                              │
│────────────────────────────────────────────────────────│
│ Chiều dài gỗ trước: 45mm                              │
│                                                        │
│ Hôm nay bạn dùng phần gỗ này để thắp Đại Hương.      │
│ Sau khi đốt, chiều dài gỗ còn lại:                   │
│                                                        │
│ Ước lượng chiều dài (mm): [_____]                     │
│                                                        │
│           [Lưu Lại]   [Xử Lý Bỏ Đi]                   │
└────────────────────────────────────────────────────────┘
```

### Disposal Confirmation

```
┌────────────────────────────────────────────────────────┐
│ ♻️  Xử Lý Bỏ Đi Phần Gỗ                                │
│────────────────────────────────────────────────────────│
│ Bạn chắc chắn muốn bỏ đi phần gỗ này không?          │
│ (Chiều dài: 5mm)                                      │
│                                                        │
│ Lý do:                                                 │
│ ⭕ Gỗ cháy hết hoàn toàn                               │
│ ⭕ Gỗ bị hư hỏng / mất                                 │
│ ⭕ Khác (ghi chú)                                      │
│                                                        │
│          [Hủy]   [Xác Nhận Bỏ Đi]                     │
└────────────────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model SandalwoodPiece {
  id                    String   @id @default(cuid())
  altarId               String
  userId                String
  lengthMm              Int      // Current length estimation
  createdFromSessionId  String   // Which burn session
  reuseCount            Int      @default(0)
  status                String   @default("IN_STORAGE")  // IN_STORAGE | DISPOSED
  storageLocation       String?  // VERTICAL | HORIZONTAL
  lastBurnedAt          DateTime?
  disposalReason        String?  // FULLY_BURNED | DAMAGED | LOST
  createdAt             DateTime @default(now())
  disposedAt            DateTime?

  @@index([userId, status])
  @@index([altarId, status])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.sandalwood.piece_created` | Phần gỗ dư được lưu |
| `altar.sandalwood.piece_reused` | Phần gỗ được dùng lại |
| `altar.sandalwood.piece_disposed` | Phần gỗ được xử lý bỏ đi |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Piece not in storage | `piece_not_available` | 400 |
| Invalid disposal reason | `invalid_disposal_reason` | 400 |

---

## Notes for AI/codegen

- lengthMm là ước lượng từ user (FE), không đo lường chính xác
- reuseCount hữu ích để track "gỗ lâu năm" vs "mới" cho analytics
- Suggest disposal khi < 5mm (quá ngắn để châm lửa an toàn)
- storageLocation là metadata (không enforce), chỉ để user nhớ
- Disposal là soft delete, keep audit trail

---

## Related

- [grand-incense-state-machine.md](./grand-incense-state-machine.md) — Main 6-step ritual
- [pressed-sandalwood-incense-alternative-procedure.md](./pressed-sandalwood-incense-alternative-procedure.md) — Alternative pressed incense
- [anti-mouth-blowing-detection-guard.md](./anti-mouth-blowing-detection-guard.md) — Camera enforcement
