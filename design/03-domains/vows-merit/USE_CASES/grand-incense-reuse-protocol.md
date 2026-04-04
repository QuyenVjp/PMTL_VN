# Giao Thức Tái Sử Dụng Đại Hương — Grand Incense (Sandalwood) Reuse Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 387)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khác với nhang thường cháy hết thành tro, Đại Hương (gỗ đàn hương / sandalwood) khi cúng vào mùng 1/15 chỉ cháy một lúc rồi tắt. Mẩu gỗ thừa còn lại **KHÔNG ĐƯỢC VỨT ĐI** — phải đặt nằm ngang (horizontally) trong lư hương để bảo quản và dùng lại cho các lần tiếp theo.

---

## Owner module

`vows-merit` — AltarOffering / GrandIncenseSession
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — hoàn thành buổi dâng Đại Hương
- `system` — hiển thị hướng dẫn bảo quản sau khi session kết thúc

---

## Trigger

User bấm **[Kết thúc buổi Dâng Đại Hương]** hoặc log hoàn thành `GrandIncenseSession`.

---

## Business Rules

| Trạng thái mẩu gỗ còn lại | Quy tắc |
|---|---|
| Đặt nằm ngang trong lư hương | ✅ CORRECT — bảo quản để dùng tiếp |
| Vứt vào thùng rác | ❌ FORBIDDEN — lãng phí Pháp bảo |
| Để đứng trong lư hương | ❌ INCORRECT — phải nằm ngang |
| Đặt ra ngoài lư hương | ❌ INCORRECT — phải trong lư hương |

---

## Write Path

```
POST /api/vows-merit/grand-incense/complete-session
────────────────────────────────────────────────────
Body: {
  sessionId:             string
  remainingPieceStored:  boolean   // user xác nhận đã cất đúng cách
}

1. Nếu remainingPieceStored = false:
   → Vẫn ALLOW hoàn thành session (không block).
   → Ghi flag remainingPieceDisposed = true để analytics.
   → Log audit: altar.grand-incense.piece-disposed-warning
2. Nếu remainingPieceStored = true:
   → Log audit: altar.grand-incense.session-completed
3. Update GrandIncenseSession.status = COMPLETED.
```

**Lưu ý:** Không block hoàn thành session nếu user không xác nhận — đây là hướng dẫn, không phải hard gate. Chỉ track để analytics.

---

## FE Behavior

### Post-Action Alert sau khi kết thúc session

Hiển thị ngay sau khi user bấm [Kết thúc]:

```
┌──────────────────────────────────────────────────────────┐
│  ✅  Đã hoàn thành buổi Dâng Đại Hương                  │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  📌  Bảo quản mẩu gỗ đàn hương còn lại                 │
│                                                          │
│  Đại Hương (gỗ đàn hương) cháy một lúc rồi tắt là     │
│  bình thường. Mẩu gỗ thừa vẫn còn đầy đủ năng lượng.  │
│                                                          │
│  Hãy đặt mẩu gỗ NẰM NGANG trong lư hương để          │
│  bảo quản. Dùng lại cho các lần dâng tiếp theo.       │
│                                                          │
│  ⚠️  TUYỆT ĐỐI KHÔNG VỨT ĐI.                          │
│                                                          │
│  [Đã cất đúng cách]     [Nhắc tôi sau]                │
└──────────────────────────────────────────────────────────┘
```

Nút **[Nhắc tôi sau]** → dismiss modal nhưng hiện reminder banner nhỏ ở góc màn hình trong 10 phút.

---

## Schema Notes

```prisma
model GrandIncenseSession {
  id                      String    @id @default(cuid())
  userId                  String
  sessionDate             DateTime
  status                  String    @default("ACTIVE")  // "ACTIVE" | "COMPLETED"
  remainingPieceStored    Boolean?  // null = chưa confirm; true = đã cất; false = không cất
  remainingPieceDisposed  Boolean   @default(false)     // analytics: user bỏ đi
  completedAt             DateTime?

  user                    User      @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `altar.grand-incense.session-completed` | Session hoàn thành, mẩu gỗ đã cất |
| `altar.grand-incense.piece-disposed-warning` | User xác nhận đã vứt mẩu gỗ đi |

---

## Notes for AI/codegen

- Không hard-block nếu `remainingPieceStored = false` — tránh friction cho người mới. Chỉ ghi analytics.
- `GrandIncenseSession` là model mới — chưa có trong schema.
- Mùng 1/15 âm lịch là trigger chính — calendar module có thể inject reminder.

---

## Related

- [GRAND-INCENSE-PROTOCOL.md](../REFERENCES/GRAND-INCENSE-PROTOCOL.md) — Full sandalwood protocol reference
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Oil type constraints
- [altar-profile-spatial-validation.md](./altar-profile-spatial-validation.md) — Spatial setup validation
