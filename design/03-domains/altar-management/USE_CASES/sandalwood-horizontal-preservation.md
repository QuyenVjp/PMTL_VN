# Bảo Quản Gỗ Đàn Hương Nằm Ngang — Sandalwood Horizontal Preservation Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 389, 390, 852)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trong nghi thức Đại Hương vào mùng 1 và ngày 15 âm lịch, sau khi tắt lửa gỗ đàn hương bằng cách phẩy tay (TUYỆT ĐỐI không dùng miệng thổi), phần gỗ còn dư chưa cháy hết phải được đặt NẰM NGANG trong lư hương để bảo quản và tái sử dụng cho lần sau. Hệ thống enforce bước này như một checklist bắt buộc cuối nghi thức — không thể hoàn tất log nếu chưa xác nhận.

---

## Owner module

`altar-management` — IncenseService / SandalwoodChecklist
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thực hiện nghi thức Đại Hương, xác nhận checklist bảo quản gỗ
- `system` — chặn hoàn tất log nghi thức nếu `horizontalStorageConfirmed = false`

---

## Trigger

Khi user kết thúc bước "Tắt Lửa Đàn Hương" trong ritual log của ngày mùng 1 hoặc ngày 15 âm lịch.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Nghi thức là mùng 1 / ngày 15 và có gỗ đàn hương | ✅ Hiển thị checklist bảo quản bắt buộc |
| `horizontalStorageConfirmed = false` | ❌ 400 `sandalwood_horizontal_storage_required` — không thể complete log |
| `horizontalStorageConfirmed = true` | ✅ Log nghi thức được phép kết thúc |
| User dùng miệng thổi tắt lửa (khai báo) | ⚠️ Warning mềm — ghi nhận, không block nghi thức |
| Không có gỗ đàn hương trong lần này | ✅ Checklist bảo quản được bỏ qua (N/A) |

Phương pháp tắt lửa đúng chuẩn:
- ✅ Phẩy tay nhẹ nhàng để dập lửa
- ✅ Dùng quạt giấy/quạt nhỏ
- ❌ TUYỆT ĐỐI KHÔNG dùng miệng thổi (phạm kính)

---

## Input Contract

```typescript
interface LogSandalwoodRitualDto {
  altarProfileId: string
  ritualDate: string                  // ISO 8601 date (mùng 1 hoặc ngày 15 âl)
  hasSandalwood: boolean              // có dùng gỗ đàn hương không
  extinguishMethod: ExtinguishMethod  // phương pháp tắt lửa
  horizontalStorageConfirmed: boolean // xác nhận đặt nằm ngang
  remainingWoodNote?: string          // ghi chú về lượng gỗ còn dư
}

enum ExtinguishMethod {
  HAND_FAN    = 'HAND_FAN',    // phẩy tay
  PAPER_FAN   = 'PAPER_FAN',   // quạt giấy
  MOUTH_BLOWN = 'MOUTH_BLOWN', // miệng thổi — trigger advisory warning
  OTHER       = 'OTHER',
}
```

---

## Write Path

```
POST /api/altar-management/incense/sandalwood-ritual-log
1. Validate altarProfileId exists, belongs to user
2. If hasSandalwood = false:
   → Save log, skip storage checklist
   → Audit: altar.sandalwood-ritual.completed (no_wood)
   → Return 200

3. If hasSandalwood = true:
   a. If extinguishMethod = MOUTH_BLOWN:
      → Add warnings[]: "Phẩy tay hoặc dùng quạt để tắt lửa — không dùng miệng thổi vì phạm kính."
      → Still allow proceeding (soft advisory)
      → Audit: altar.sandalwood-ritual.mouth-blown-warning

   b. If horizontalStorageConfirmed = false:
      → Throw 400 sandalwood_horizontal_storage_required

   c. If horizontalStorageConfirmed = true:
      → Save ritual log
      → Audit: altar.sandalwood-ritual.horizontal-storage-confirmed
      → Audit: altar.sandalwood-ritual.completed
      → Return 200
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NGHI THỨC ĐẠI HƯƠNG — BƯỚC CUỐI
  Bảo Quản Gỗ Đàn Hương Sau Nghi Lễ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CHECKLIST BẮT BUỘC (không thể bỏ qua)

Bước 1 — Cách Tắt Lửa:
  ○ Tôi đã phẩy tay nhẹ nhàng để tắt lửa
  ○ Tôi đã dùng quạt giấy/quạt nhỏ để tắt
  ○ Tôi đã dùng miệng thổi (không khuyến nghị)
    ⚠️ Cảnh báo: Dùng miệng thổi vào pháp khí
       là phạm kính. Vui lòng dùng cách khác
       cho các lần sau.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bước 2 — Bảo Quản Gỗ Đàn Hương Còn Dư:

  ┌─────────────────────────────────────────┐
  │                                         │
  │  ┌─── Lư Hương ───────────────────────┐ │
  │  │                                    │ │
  │  │   [  gỗ đàn hương nằm ngang ════]  │ │
  │  │                                    │ │
  │  └────────────────────────────────────┘ │
  │                                         │
  │  ✅ ĐẶT NẰM NGANG trong lư hương       │
  │  ❌ KHÔNG đặt đứng                     │
  │  ❌ KHÔNG vứt bỏ — tái sử dụng lần sau │
  │                                         │
  └─────────────────────────────────────────┘

  [ ] Tôi đã phẩy tay tắt lửa và ĐẶT NẰM NGANG
      phần gỗ đàn hương còn dư vào lư hương để
      bảo quản cho lần sau.
      ← BẮT BUỘC tick trước khi hoàn tất

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Hoàn Tất Nghi Thức Đại Hương]
← disabled (màu xám) nếu chưa tick checkbox
← enabled  (màu xanh) khi đã tick

Nếu bấm khi chưa tick:
  ┌─────────────────────────────────────────┐
  │ ❌ Chưa xác nhận bảo quản gỗ đàn hương │
  │  Vui lòng tick xác nhận đã đặt gỗ nằm │
  │  ngang trong lư hương trước khi hoàn   │
  │  tất nghi thức.                         │
  └─────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Schema Notes

```prisma
model SandalwoodRitualLog {
  id                         String    @id @default(cuid())
  altarProfileId             String
  userId                     String
  ritualDate                 DateTime
  hasSandalwood              Boolean
  extinguishMethod           String?   // ExtinguishMethod enum value
  horizontalStorageConfirmed Boolean   @default(false)
  remainingWoodNote          String?
  completedAt                DateTime?
  createdAt                  DateTime  @default(now())

  altarProfile AltarProfile @relation(fields: [altarProfileId], references: [id])
  user         User         @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.sandalwood-ritual.completed` | Log nghi thức đã hoàn tất thành công |
| `altar.sandalwood-ritual.horizontal-storage-confirmed` | User xác nhận đặt gỗ nằm ngang |
| `altar.sandalwood-ritual.mouth-blown-warning` | User khai báo dùng miệng thổi tắt lửa |

---

## Errors

| Điều kiện | Mã lỗi | HTTP | Phục hồi |
|---|---|---|---|
| `horizontalStorageConfirmed = false` khi có gỗ | `sandalwood_horizontal_storage_required` | 400 | Tick xác nhận bảo quản gỗ nằm ngang |
| `altarProfileId` không tồn tại | `altar_profile_not_found` | 404 | Kiểm tra lại hồ sơ bàn thờ |
| Thiếu trường bắt buộc | `validation_error` | 400 | Bổ sung đầy đủ thông tin |
| Chưa đăng nhập | `unauthorized` | 401 | — |

---

## Notes for AI/codegen

- Checklist bảo quản chỉ xuất hiện khi `hasSandalwood = true` — không hiển thị nếu không dùng gỗ đàn hương.
- `MOUTH_BLOWN` là **soft warning** (200 + `warnings[]`), không phải hard block — ghi nhận để nhắc nhở lần sau.
- `horizontalStorageConfirmed` là **hard block** (400) — bắt buộc trước khi complete ritual log.
- Nghi thức Đại Hương chỉ áp dụng vào mùng 1 và ngày 15 âm lịch — cần logic calendar để detect.

---

## Related

- [hierarchical-prostration-sequence.md](./hierarchical-prostration-sequence.md) — trình tự bái lạy
- [auspicious-beast-ai-filter.md](./auspicious-beast-ai-filter.md) — altar item validation
- [sacred-item-damage-protocol.md](./sacred-item-damage-protocol.md) — xử lý pháp khí hư hỏng
