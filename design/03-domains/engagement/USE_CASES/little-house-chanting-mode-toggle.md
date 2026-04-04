# Công Tắc Chế Độ Trì Tụng Linh Hoạt / Bọc Năng Lượng — Chanting Mode Toggle

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 58, 59, 295, 296)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phương pháp "Lấy Chú Đại Bi bọc các kinh khác" (Strict Mode: 9-3-3-3-9) không phải là bắt buộc duy nhất. Khi thời gian hoặc địa điểm bị hạn chế, user được phép tụng theo **Chế độ Linh Hoạt** — niệm hết tất cả biến của một kinh rồi mới sang kinh khác. Điều quan trọng nhất vẫn là số lượng và sự thành tâm, không phải thứ tự cứng.

---

## Owner module

`engagement` — LittleHouse / NNNChantingTracker
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — chọn chế độ trì tụng phù hợp với hoàn cảnh
- `system` — apply chanting UX tương ứng với mode đã chọn

---

## Business Rules

| Chế độ | Trình tự | Khi nào dùng |
|---|---|---|
| **Strict Mode** (Bọc Năng Lượng) | 9 Đại Bi → 3 Vãng Sinh → 3 Tâm Kinh → 3 Vãng Sinh → 9 Đại Bi | Khi có đủ thời gian, điều kiện lý tưởng |
| **Flexible Mode** (Linh Hoạt) | Tự do — niệm hết 1 kinh rồi sang kinh khác | Khi thời gian/địa điểm hạn chế |

Cả hai mode đều hợp lệ về mặt năng lượng — không có mode nào "sai".

---

## Input Contract

```
SetChantingModeDto {
  sheetId:      string
  chantingMode: "STRICT" | "FLEXIBLE"
}
```

`chantingMode` là **session preference** — lưu vào `LittleHouseChantingSession`, không ảnh hưởng đến sheet completion logic.

---

## Write Path

```
PATCH /api/engagement/little-house-sheets/:id/chanting-mode
──────────────────────────────────────────────────────────────
Body: { chantingMode: "STRICT" | "FLEXIBLE" }

1. Validate chantingMode ∈ ["STRICT", "FLEXIBLE"].
2. Update LittleHouseChantingSession.chantingMode.
3. Return { chantingMode, sessionId }
   → FE re-renders chanting UI dựa trên mode mới.
```

---

## FE Behavior

### Toggle trong E-Reader NNN

```
Chế Độ Trì Tụng:
┌─────────────────────────────────────────────────────┐
│  [🔒 Bọc Năng Lượng]     [🔓 Linh Hoạt]            │
│   Strict Mode              Flexible Mode             │
└─────────────────────────────────────────────────────┘
```

### Strict Mode UI

Nhang hiển thị trình tự cố định, block nếu user tap sai thứ tự:

```
Trình tự bắt buộc:
① Chú Đại Bi    ×9  [████████░░] 8/9
② Vãng Sinh Chú ×3  [ locked ]
③ Tâm Kinh      ×3  [ locked ]
④ Vãng Sinh Chú ×3  [ locked ]
⑤ Chú Đại Bi    ×9  [ locked ]

⚠️  Hoàn thành theo thứ tự. Không được bỏ qua bước.
```

### Flexible Mode UI

Tất cả vòng tròn đều unlocked, user tap tự do:

```
Tự do chọn thứ tự niệm:
○ Chú Đại Bi    [12/21]  ← tap để cộng
○ Vãng Sinh Chú [ 7/21]  ← tap để cộng
○ Tâm Kinh      [ 0/7 ]  ← tap để cộng

ℹ️  Chế độ Linh Hoạt: Niệm hết từng loại kinh theo
    hoàn cảnh. Số lượng và thành tâm là quan trọng nhất.
```

### Tooltip giải thích khi user chuyển mode

**Khi chuyển sang Flexible:**
```
ℹ️  Chế độ Linh Hoạt phù hợp khi thời gian hoặc
    địa điểm bị hạn chế. Cả hai chế độ đều hợp lệ
    — điều quan trọng nhất là số lượng và thành tâm.
```

**Khi chuyển sang Strict:**
```
ℹ️  Chế độ Bọc Năng Lượng (9-3-3-3-9) là phương pháp
    lý tưởng khi có đủ thời gian. Chú Đại Bi bọc bên
    ngoài tạo trường năng lượng bảo vệ tốt hơn.
```

---

## Schema Notes

```prisma
model LittleHouseChantingSession {
  id            String   @id @default(cuid())
  userId        String
  sheetId       String
  chantingMode  String   @default("FLEXIBLE")  // "STRICT" | "FLEXIBLE"
  startedAt     DateTime @default(now())
  completedAt   DateTime?

  user          User              @relation(fields: [userId], references: [id])
  sheet         LittleHouseSheet  @relation(fields: [sheetId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `little-house.chanting-mode.set` | User chọn mode |

Payload: `{ chantingMode, sheetId }` — analytics xem bao nhiêu % user dùng Strict vs Flexible.

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `chantingMode` không phải STRICT/FLEXIBLE | `invalid_body` | 400 |
| Sheet không thuộc về user | `forbidden` | 403 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Notes for AI/codegen

- Strict Mode UI: disable tap trên các vòng tròn chưa đến lượt — dùng `isLocked: boolean` per circle.
- Flexible Mode UI: tất cả circles enabled — tap bất kỳ để increment count.
- Completion condition giống nhau cho cả 2 mode: tổng số biến đạt target.
- Default = FLEXIBLE để giảm barrier cho người mới. User có thể switch sang STRICT khi đã quen.

---

## Related

- [little-house-anti-theft-field-lock.md](./little-house-anti-theft-field-lock.md) — offeredBy lock
- [manage-ngoi-nha-nho-sheet.md](./manage-ngoi-nha-nho-sheet.md) — Core NNN flow
- [recitation-error-buffer.md](../../vows-merit/USE_CASES/recitation-error-buffer.md) — Bổ Khuyết Chân Ngôn sau tụng
