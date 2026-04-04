# Giới Hạn Tùy Chỉnh Sửa Lỗi Trên Tiểu Phương Tử — No-Inline-Edit Correction Limit

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Luật Viết NNN Chuẩn Mực
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Tiểu Phương Tử (NNN) là séc của cõi âm, không thể có sự tẩy xóa hay sửa đổi tùy tiện. Nếu viết sai tên hoặc sai ngày trên một tờ NNN, **tuyệt đối KHÔNG được dùng bút xóa, gạch xóa rồi viết đè lên trên tờ đó**. Phải lấy 1 tờ NNN mới, chấm lại y nguyên số lượng chấm đỏ, viết lại thông tin đúng. Tờ cũ phải gạch chéo tên, gấp nhỏ, bọc giấy vứt đi để tránh ô uế.

Hệ thống phải khóa cứng tính năng "Sửa (Edit)" văn bản sau khi tờ NNN đã được tạo, và hướng dẫn user quy trình huỷ + tạo mới.

---

## Owner module

`engagement` — LittleHouseService / NNNRecitationService
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người dùng đang niệm NNN, phát hiện lỗi viết
- `system` — Khóa edit, hướng dẫn quy trình tạo tờ mới

---

## Trigger

User mở card `[Tiểu Phương Tử Đang Niệm]` với status `IN_PROGRESS` hoặc `COMPLETED`, cố gắng bấm nút `[Sửa]` để chỉnh sửa tên hoặc thông tin.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Tờ NNN có status `DRAFT` (chưa bắt đầu niệm) | ✅ Allow inline edit (text fields editable) |
| Tờ NNN có status `IN_PROGRESS` hoặc `COMPLETED` | ❌ BLOCK inline edit (all text fields disabled) |
| User báo "Lỡ điền sai tên/ngày" | ⚠️ Show [Huỷ tờ này & Chuyển sang tờ mới] button |
| User click [Huỷ] | ✅ Copy đỏ count → Create new NNN record |
| Tờ cũ mark as `INVALIDATED` | ✅ Add instruction: "Gạch chéo tên, gấp nhỏ bọc giấy vứt" |
| User ghi danh sách action vào Invalidation Log | ✅ Audit trail for spiritual integrity |

---

## Input Contract

```typescript
// NNN Edit Request (blocked)
interface NNNEditRequest {
  nnnId: string;
  field: "beneficiaryName" | "recitationDate" | "note";
  value: string;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED";  // Status check
}

// NNN Invalidation Request (create new)
interface NNNInvalidationRequest {
  nnnId: string;              // Old tờ NNN
  reason: "NAME_ERROR" | "DATE_ERROR" | "OTHER";
  action: "CREATE_NEW";       // Always create new
  preserveRedDotCount: boolean;  // Copy chấm đỏ to new
}

// NNN Invalidation Response
interface NNNInvalidationResponse {
  oldNNNId: string;
  newNNNId: string;
  copiedRedDotCount: number;
  instruction: string;        // "Gạch chéo tên, gấp nhỏ bọc giấy vứt"
  message: string;            // "Tờ cũ đã được đánh dấu là INVALIDATED..."
}
```

---

## Write Path

```
PUT /api/engagement/little-houses/{nnnId}

1. Load NNN record
2. Check status:
   a. If status === "DRAFT":
      → Allow edit: Update field(s) in payload
      → Return success
      → Emit "nnn.draft_edited"
   b. If status === "IN_PROGRESS" OR "COMPLETED":
      → Reject edit with 400 { error: "nnn_cannot_edit_after_start" }
      → Return helpful message: "Tờ NNN này không thể sửa.
                                  Vui lòng bấm [Huỷ & Tạo Tờ Mới]"
      → Return button hint: { actionButton: "INVALIDATE_AND_CREATE_NEW" }

---

POST /api/engagement/little-houses/{nnnId}/invalidate-and-create-new

1. Load old NNN (must be IN_PROGRESS or COMPLETED)
2. Extract redDotCount from old NNN
3. Create new NNN record:
   {
     id: uuid(),
     userId: userId,
     redDotCount: old.redDotCount,  // COPY chấm đỏ
     status: "DRAFT",                 // Reset to draft
     createdAt: now(),
     linkedToInvalidated: oldNNNId    // Reference to old record
   }
4. Update old NNN:
   {
     status: "INVALIDATED",
     invalidatedReason: payload.reason,
     invalidatedAt: now(),
     replacedBy: newNNNId,
     instruction: "Gạch chéo tên, gấp nhỏ bọc giấy vứt"
   }
5. Create InvalidationLog entry (audit):
   {
     id: uuid(),
     oldNNNId: oldNNNId,
     newNNNId: newNNNId,
     reason: reason,
     redDotCountPreserved: redDotCount,
     timestamp: now()
   }
6. Emit audit: "nnn.invalidated_and_replaced"
7. Return NNNInvalidationResponse
```

---

## FE Behavior

```
USER OPENS NNN CARD (IN_PROGRESS or COMPLETED)

┌────────────────────────────────────────────┐
│  📝 Tiểu Phương Tử Đang Niệm               │
├────────────────────────────────────────────┤
│  Người Tặng: [Mẹ tôi] (DISABLED)         │
│  Ngày Bắt Đầu: [2026-04-01] (DISABLED)   │
│  Số Chấm Đỏ: 108 (DISABLED)              │
│                                            │
│  Tiến độ: ████░░░░░░ (8/27 tuần)        │
│  Lần niệm cuối: 2026-04-03                │
│                                            │
│  ⚠️  ĐÃ KHÓA CHỈNH SỬA                   │
│  (Không thể sửa sau khi bắt đầu niệm)    │
│                                            │
│  [Quay lại]  [Huỷ & Tạo Tờ Mới]        │
└────────────────────────────────────────────┘

⬇️ User clicks [Huỷ & Tạo Tờ Mới] ⬇️

┌────────────────────────────────────────────┐
│  ⚠️  THAY ĐỔI TỜNG NNN                   │
├────────────────────────────────────────────┤
│                                            │
│  Bạn muốn huỷ tờ hiện tại và tạo tờ     │
│  mới không?                               │
│                                            │
│  Lý do huỷ:                              │
│  ◉ Viết sai tên                          │
│  ○ Viết sai ngày                         │
│  ○ Khác (vui lòng ghi)                   │
│                                            │
│  ℹ️  Số chấm đỏ (108) sẽ được copy sang  │
│     tờ mới. Tờ cũ sẽ được đánh dấu      │
│     INVALIDATED.                          │
│                                            │
│  [Huỷ] [Xác nhận & Tạo Tờ Mới]          │
└────────────────────────────────────────────┘

⬇️ After confirmation ⬇️

┌────────────────────────────────────────────┐
│  ✅ Tờ Mới Đã Được Tạo!                  │
├────────────────────────────────────────────┤
│                                            │
│  Tờ cũ (ID: nnn_xxxx):                   │
│  • Status: INVALIDATED                    │
│  • Hành động bắt buộc:                   │
│    → Gạch chéo tên trên tờ cũ             │
│    → Gấp nhỏ                              │
│    → Bọc giấy và vứt đi                   │
│                                            │
│  Tờ mới (ID: nnn_yyyy):                  │
│  • Chấm đỏ: 108 (copied)                 │
│  • Status: DRAFT (sẵn sàng niệm)          │
│  • Bạn có thể điền tên và ngày đúng      │
│                                            │
│  [Quay lại Tờ Mới]  [Xem Tờ Cũ]         │
└────────────────────────────────────────────┘

⬇️ If user clicks [Xem Tờ Cũ] ⬇️

┌────────────────────────────────────────────┐
│  ⚠️  TIỂU PHƯƠNG TỬ INVALIDATED          │
├────────────────────────────────────────────┤
│                                            │
│  Tờ này đã bị huỷ và được thay thế      │
│  bằng tờ mới (nnn_yyyy).                 │
│                                            │
│  Nguyên nhân: Viết sai tên                │
│  Thời điểm: 2026-04-03 14:25             │
│                                            │
│  📋 HƯỚNG DẪN XỬ LÝ TỜ CŨ:              │
│  1. Gạch chéo tên trên tờ cũ (X X X)    │
│  2. Gấp nhỏ                              │
│  3. Bọc bằng giấy rách                   │
│  4. Vứt vào thùng rác                    │
│                                            │
│  🚫 TUYỆT ĐỐI KHÔNG được:                │
│  • Để tờ cũ xung quanh bàn thờ          │
│  • Giữ làm kỷ niệm                       │
│  • Đốt tờ cũ (chỉ đốt tờ mới sau khi   │
│    hoàn thành)                           │
│                                            │
│  [Quay lại]                              │
└────────────────────────────────────────────┘
```

---

## Schema Notes

```prisma
model LittleHouse {
  id                    String @id @default(cuid())
  userId                String
  beneficiaryName       String
  recitationDate        DateTime?
  redDotCount           Int @default(108)
  status                String @default("DRAFT")
              // "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "INVALIDATED"

  // Invalidation fields
  invalidatedReason     String?           // "NAME_ERROR" | "DATE_ERROR" | "OTHER"
  invalidatedAt         DateTime?
  replacedBy            String?           // Reference to new NNN ID
  invalidationInstruction String?         // "Gạch chéo, gấp, bọc, vứt"
  linkedToInvalidated   String?           // Reverse link to old record

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user                  User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([status, invalidatedAt])
}

model InvalidationLog {
  id                    String @id @default(cuid())
  oldNNNId              String
  newNNNId              String
  reason                String
  redDotCountPreserved  Int
  createdAt             DateTime @default(now())

  @@index([oldNNNId, newNNNId])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `nnn.draft_edited` | User chỉnh sửa tờ ở trạng thái DRAFT |
| `nnn.edit_blocked` | User cố sửa tờ IN_PROGRESS/COMPLETED (blocked) |
| `nnn.invalidated_and_replaced` | User confirm huỷ tờ cũ + tạo tờ mới |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| Cannot edit after start | nnn_cannot_edit_after_start | 400 |
| NNN not found | nnn_not_found | 404 |
| Invalid invalidation reason | invalid_invalidation_reason | 400 |

---

## Notes for AI/codegen

- Edit lock là hard block — không exception nào.
- Chỉ cho phép edit khi status = "DRAFT".
- Huỷ & tạo mới là **atomic operation** — phải copy chấm đỏ đúng.
- Tờ cũ không bao giờ bị xóa, chỉ mark INVALIDATED để audit trail.
- Instruction để vứt tờ cũ phải hiển thị prominently.
- Tương lai: Có thể thêm reminder notifications để user nhớ vứt tờ cũ trong vòng 24h.

---

## Related

- [little-house-chanter-identity-lock.md](./little-house-chanter-identity-lock.md) — Tác quyền người đốt
