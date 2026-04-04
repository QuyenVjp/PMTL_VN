# Ràng Buộc Tư Thế và Góc Độ Thắp Nhang — Incense Posture & Angle Constraint

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 858)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi thắp nhang và bái lạy, nhang phải được dựng **thẳng đứng (upright)**. Tuyệt đối cấm việc cầm nhang mà **chĩa thẳng đầu nhang đang cháy vào mặt tượng Bồ Tát** — đây là hành động cực kỳ bất kính, tương đương việc chỉ tay vào mặt người bề trên. Cảnh báo phải hiển thị nổi bật đỏ trong mọi hướng dẫn thắp nhang.

---

## Owner module

`vows-merit` — IncenseSession / AltarTutorial
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — mở flow thắp nhang hoặc xem hướng dẫn lập Phật đài
- `system` — hiển thị cảnh báo đỏ bắt buộc trong pre-flight checklist và tutorial

---

## Trigger

1. User mở màn hình **[Bắt đầu Thắp Nhang / Khởi tạo IncenseSession]**
2. User mở **hướng dẫn lập bàn thờ / Altar Setup Tutorial**
3. User xem **3D Tutorial / AR guidance** (nếu có Phase 2+)

---

## Business Rules

| Tư thế nhang | Quy tắc |
|---|---|
| Dựng thẳng đứng, giơ cao qua trán | ✅ CORRECT |
| Cầm nghiêng nhưng không chĩa vào tượng | ⚠️ ACCEPTABLE nhưng không lý tưởng |
| Chĩa đầu nhang đang cháy về phía tượng | ❌ STRICTLY FORBIDDEN — cực kỳ bất kính |
| Cầm nằm ngang khi di chuyển | ❌ NOT RECOMMENDED |

---

## Write Path

Không có write path riêng — đây là **UI enforcement rule**, không tạo model mới.

Khi khởi tạo `IncenseSession`:

```
POST /api/vows-merit/incense-sessions
──────────────────────────────────────
Body: { altarId, incenseCount, postureAcknowledged: boolean }

1. Validate postureAcknowledged = true.
   - Nếu false → HTTP 422:
     { error: "posture_not_acknowledged", message: "Vui lòng xác nhận quy tắc tư thế thắp nhang trước khi bắt đầu." }
2. Insert IncenseSession.
3. Return sessionId.
```

---

## FE Behavior

### Pre-flight Checklist trong IncenseSession Init

```
┌──────────────────────────────────────────────────────────┐
│  🪔  Chuẩn Bị Thắp Nhang                                │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  ⚠️  QUY TẮC TƯ THẾ — BẮT BUỘC ĐỌC:                  │
│                                                          │
│  • Giữ nhang DỰNG THẲNG ĐỨNG, giơ cao qua trán.      │
│                                                          │
│  🔴 TUYỆT ĐỐI KHÔNG chĩa đầu nhang đang cháy về      │
│     phía tượng Bồ Tát — đây là hành động cực kỳ       │
│     bất kính.                                          │
│                                                          │
│  [_] Tôi đã đọc và hiểu quy tắc tư thế thắp nhang.   │
│                                                          │
│  [Bắt Đầu Thắp Nhang]   ← enable khi đã tick          │
└──────────────────────────────────────────────────────────┘
```

### Trong Altar Setup Tutorial

Hiển thị callout đỏ cố định (non-dismissible) trên step "Thắp Nhang":

```
🔴  CẢNH BÁO QUAN TRỌNG
Giữ nhang dựng THẲNG ĐỨNG cao qua trán khi bái lạy.
Tuyệt đối KHÔNG chĩa đầu nhang đang cháy về phía
tượng Bồ Tát — dù vô ý cũng tạo nghiệp bất kính.
```

---

## Schema Notes

Bổ sung `postureAcknowledged` vào `IncenseSession` (model mới):

```prisma
model IncenseSession {
  id                    String   @id @default(cuid())
  userId                String
  altarId               String?
  incenseCount          Int
  postureAcknowledged   Boolean
  startedAt             DateTime @default(now())
  completedAt           DateTime?

  user                  User     @relation(fields: [userId], references: [id])
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `incense-session.started` | Session khởi tạo với posture acknowledged |
| `incense-session.posture-rejected` | `postureAcknowledged = false` bị reject |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `postureAcknowledged` = false | `posture_not_acknowledged` | 422 |
| Chưa đăng nhập | `unauthorized` | 401 |

---

## Related

- [altar-incense-count-calculator.md](./altar-incense-count-calculator.md) — Số lượng nhang theo cấu hình bàn thờ
- [altar-profile-spatial-validation.md](./altar-profile-spatial-validation.md) — Spatial validation bàn thờ
