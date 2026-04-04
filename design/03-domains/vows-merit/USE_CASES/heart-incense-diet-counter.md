# Bộ Đếm Tịnh Khẩu Nghiệp Chân Ngôn Theo Chế Độ Ăn — Heart Incense Diet-Based Counter

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Nghi thức Thắp Tâm Hương
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Trước khi thắp Tâm Hương (nghi thức cho người không có bàn thờ thật), người tu phải niệm
**Tịnh Khẩu Nghiệp Chân Ngôn** để thanh tịnh khẩu nghiệp. Số biến niệm **phụ thuộc vào chế độ ăn**:

| Điều kiện | Số biến bắt buộc |
|---|---|
| `user.isVegetarian === true` | **7 biến** |
| `user.isVegetarian === false` | **13 biến** |

Hệ thống phải **đọc trạng thái `isVegetarian` từ User Profile** và enforce đúng định mức trước khi cho phép bước sang nghi thức chính.

---

## Owner module

`vows-merit` (HeartIncenseSession flow)
Phối hợp: `identity` (User Profile — `isVegetarian` field)

---

## Actors

- `member` — đang thực hiện nghi thức Tâm Hương
- `system` — đọc profile, inject quota, block progression

---

## Trigger

User bấm **[Bắt đầu Thắp Tâm Hương]** trong luồng HeartIncenseSession.

---

## Preconditions

- Session hợp lệ.
- `user.hasAltar === false` (chỉ áp dụng cho Tâm Hương — người không có bàn thờ thật).
- `user.isVegetarian` đã được set trong Profile (nếu chưa set → redirect user đến Profile để cập nhật).

---

## Business Rule

### Tịnh Khẩu Nghiệp Chân Ngôn Quota

```
function getTinhKhauQuota(isVegetarian: boolean): number {
  return isVegetarian ? 7 : 13;
}
```

**Không được phép:**
- Cho phép bấm Next khi chưa đủ số biến.
- Để user tự nhập số biến — phải là counter có nút [+1] với limit cứng.
- Dùng cùng quota cho tất cả user.

**Trường hợp đặc biệt:**
- Nếu `isVegetarian` chưa được set → hiện dialog: *"Hãy cập nhật thông tin chế độ ăn trong Hồ sơ của bạn để hệ thống tính đúng số biến Tịnh Khẩu."*
- Redirect đến Settings → Profile → Diet Preference, rồi quay lại.

---

## Input Contract

```
HeartIncenseSesionStartDto {
  // isVegetarian được đọc từ User.profile, không nhận từ request
  // để tránh user tự báo sai
}
```

`isVegetarian` phải lấy từ server-side user record — **không tin client claim**.

---

## Write Path

```
POST /api/vows-merit/heart-incense-sessions
────────────────────────────────────────────
1. Resolve user từ session.
2. Load user.profile.isVegetarian:
   - Nếu null/undefined: throw 422 {
       error: "diet_preference_not_set",
       message: "Hãy cập nhật chế độ ăn trong Hồ sơ trước khi thắp Tâm Hương."
     }
3. Tính tinhKhauQuota = user.profile.isVegetarian ? 7 : 13.
4. Tạo HeartIncenseSession:
   {
     userId,
     status: "TINH_KHAU_PENDING",
     tinhKhauQuota,
     tinhKhauCount: 0,
     startedAt: now()
   }
5. Return { sessionId, tinhKhauQuota, currentCount: 0 }.
```

```
POST /api/vows-merit/heart-incense-sessions/:id/tinh-khau-increment
────────────────────────────────────────────────────────────────────
1. Validate session status = TINH_KHAU_PENDING.
2. Increment tinhKhauCount += 1.
3. Nếu tinhKhauCount >= tinhKhauQuota:
   - Set status = TINH_KHAU_COMPLETE.
   - Return { complete: true, message: "Đủ [quota] biến. Bắt đầu nghi thức Tâm Hương." }
4. Else: return { complete: false, remaining: quota - count }.
```

```
POST /api/vows-merit/heart-incense-sessions/:id/proceed
────────────────────────────────────────────────────────
1. Validate status = TINH_KHAU_COMPLETE.
2. Set status = ACTIVE.
3. Proceed với nghi thức chính.
```

---

## FE Behavior

### Màn hình Tịnh Khẩu:

```
┌─────────────────────────────────────────────────────┐
│  Bước 1: Tịnh Khẩu Nghiệp Chân Ngôn               │
│                                                     │
│  [Người ăn chay: 7 biến / Chưa ăn chay: 13 biến]  │
│                                                     │
│  Bạn cần niệm: [13] biến                           │
│                                                     │
│         ┌──────────────────────┐                   │
│         │        8 / 13        │  ← progress       │
│         └──────────────────────┘                   │
│                                                     │
│  Tịnh Khẩu Nghiệp Chân Ngôn:                       │
│  "Ngu pó sa pa ha..."                              │
│                                                     │
│              [+1 biến]                             │
│                                                     │
│  [Tiếp theo →]  (disabled cho đến khi đủ số biến)  │
└─────────────────────────────────────────────────────┘
```

- Nút [+1 biến] có haptic feedback (rung nhẹ) mỗi lần bấm.
- Progress bar đổi màu khi hoàn thành.
- Nút [Tiếp theo] chỉ enable sau khi `count >= quota`.
- Hiển thị note nhỏ: `"Chế độ của bạn: [Ăn chay / Chưa ăn chay] — [chỉnh sửa]"`.

---

## Schema Notes

```prisma
// identity module — User Profile
model UserProfile {
  // ... existing fields ...
  isVegetarian            Boolean?  // null = chưa set
  vegetarianUpdatedAt     DateTime? // để track khi nào user thay đổi
}

// vows-merit module
model HeartIncenseSession {
  id                String   @id @default(cuid())
  userId            String
  status            HeartIncenseSessionStatus
  tinhKhauQuota     Int      // 7 hoặc 13, set lúc tạo session
  tinhKhauCount     Int      @default(0)
  startedAt         DateTime @default(now())
  completedAt       DateTime?

  user              User     @relation(fields: [userId], references: [id])
}

enum HeartIncenseSessionStatus {
  TINH_KHAU_PENDING
  TINH_KHAU_COMPLETE
  ACTIVE
  COMPLETED
  ABANDONED
}
```

### Tại sao lưu `tinhKhauQuota` vào session?

Nếu user thay đổi `isVegetarian` trong Profile giữa chừng, quota của session hiện tại không thay đổi — tránh race condition. Quota được **freeze lúc tạo session**.

---

## Audit

| Action | Trigger |
|---|---|
| `heart-incense.tinh-khau.started` | Session được tạo |
| `heart-incense.tinh-khau.incremented` | User bấm [+1 biến] |
| `heart-incense.tinh-khau.completed` | Đủ quota |
| `heart-incense.proceeded` | User bấm [Tiếp theo] |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `isVegetarian` chưa set | `diet_preference_not_set` | 422 |
| Cố proceed khi chưa đủ biến | `tinh_khau_incomplete` | 409 |
| Session không thuộc actor | `forbidden` | 403 |

---

## Related

- [schedule-altar-lamp-reminder.md](./schedule-altar-lamp-reminder.md) — Nghi thức bàn thờ thật
- [validate-altar-oil-and-water.md](./validate-altar-oil-and-water.md) — Validation khác tại bàn thờ
- [onboarding-diet-scanner.md](../../wisdom-qa/USE_CASES/onboarding-diet-scanner.md) — Diet preference onboarding flow
