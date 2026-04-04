# Giao Thức Thanh Tẩy Đĩa Sứ Sau Đốt NNN — Burn Container Sanitization Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Chiếc đĩa sứ sau khi hóa NNN sẽ dính tro tàn (năng lượng cõi âm). Bắt buộc:
1. Đặt đĩa đúng vị trí sau đốt (không trên bàn thờ, không xuống nền)
2. Rửa sạch ngay lập tức để loại bỏ âm khí trước khi cất

Không được cất đĩa khi còn dính tro vì sẽ rước linh tính tà ác vào nhà.

---

## Owner module

`engagement` — LittleHouseService / ContainerSanitizer
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — thực hiện post-burn checklist
- `system` — trigger checklist sau burn session, chặn session complete nếu chưa xong

---

## Trigger

Khi burn session chuyển sang `BURN_COMPLETED`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Burn session kết thúc | ✅ Trigger post-burn checklist |
| Item 1 (position) chưa checked | ❌ Session ở CHECKLIST_PENDING |
| Item 2 (sanitization) chưa checked | ❌ Session ở CHECKLIST_PENDING |
| Cả hai items checked | ✅ Session → SANITIZATION_COMPLETE |
| User đóng app khi chưa xong | ⚠️ Reminder hiển thị khi mở lại |

---

## Input Contract

```typescript
interface PostBurnChecklistDto {
  sessionId: string
  positionConfirmed: boolean     // Step 1: vị trí đĩa đúng
  sanitizationCommitted: boolean // Step 2: cam kết rửa ngay
}

enum PostBurnStatus {
  BURN_COMPLETED         = 'BURN_COMPLETED',
  CHECKLIST_PENDING      = 'CHECKLIST_PENDING',
  SANITIZATION_COMPLETE  = 'SANITIZATION_COMPLETE'
}

interface PostBurnSession {
  littleHouseId: string
  burnedAt: DateTime
  status: PostBurnStatus
  positionConfirmed: boolean
  sanitizationCommitted: boolean
  completedAt?: DateTime
}
```

---

## Write Path

```
POST /api/engagement/little-house/post-burn-checklist
1. Validate sessionId exists, status ∈ [BURN_COMPLETED, CHECKLIST_PENDING]
2. Update positionConfirmed, sanitizationCommitted
3. If both true:
   → status = SANITIZATION_COMPLETE
   → completedAt = now()
   → Audit: burn.session_finalized
4. If partial:
   → status = CHECKLIST_PENDING
   → Audit: burn.checklist_partial
```

---

## FE Behavior

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ✅ ĐỐT NNN XONG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧼 DANH SÁCH SAU ĐỐT (Post-Burn Checklist)

[ ] Bước 1: Vị trí Đĩa Sứ
    ✓ Đặt trên ghế nhỏ/tấm gỗ cách mặt đất
    ✓ KHÔNG đặt trên bàn thờ Phật
    ✓ KHÔNG đặt trực tiếp xuống nền nhà

[ ] Bước 2: Tẩy Rửa Ngay Lập Tức
    ✓ Mang đĩa đi rửa sạch bằng nước NGAY
    ✓ Loại bỏ hoàn toàn tro đen dính trên đĩa
    ✓ KHÔNG cất đi khi còn dính tro
      (dính tro = rước âm khí vào nhà)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lý do tẩy rửa:
Đĩa sứ sau khi hóa NNN dính tro tàn
(năng lượng cõi âm). Bắt buộc rửa sạch
trước khi cất để tái sử dụng.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Xác Nhận Danh Sách]
(button enabled only when BOTH items checked)
```

---

## Schema Notes

```prisma
// Thêm vào BurnSession
model BurnSession {
  // ... existing fields ...
  postBurnStatus        String    @default("PENDING")
  positionConfirmed     Boolean   @default(false)
  sanitizationCommitted Boolean   @default(false)
  postBurnCompletedAt   DateTime?
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `burn.post_checklist_shown` | Checklist displayed |
| `burn.position_confirmed` | User checks item 1 |
| `burn.sanitization_committed` | User checks item 2 |
| `burn.session_finalized` | Both items checked |
| `burn.checklist_partial` | Only one item checked |

---

## Notes for AI/codegen

- Post-burn checklist là **required step** — session không kết thúc nếu chưa xong.
- Button "Xác Nhận Danh Sách" chỉ enable khi CẢ HAI checked.
- Nếu user đóng app trước khi xong: session ở CHECKLIST_PENDING, nhắc lại khi mở app tiếp.

---

## Related

- [burn-container-altitude-constraint.md](./burn-container-altitude-constraint.md) — height restriction
- [metal-container-ban.md](./metal-container-ban.md) — ceramic-only requirement
- [little-house-ash-disposal.md](./little-house-ash-disposal.md) — ash handling after burn
