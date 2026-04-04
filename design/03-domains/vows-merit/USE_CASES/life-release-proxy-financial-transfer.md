# Giao Thức Chuyển Giao Tài Chính Phóng Sinh Tịnh Tài — Life Release Proxy Financial Transfer Protocol

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn 348, 810)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Khi dùng tiền của chính mình để mua cá phóng sinh giúp người nhà, nếu không thực hiện nghi thức chuyển giao tịnh tài trước khi đi, hoặc ra đến hồ lại vô tình nhắc tên mình, toàn bộ công đức sẽ chạy ngược về người bỏ tiền thay vì về người thụ hưởng. Hệ thống phải hướng dẫn hai bước khóa chặt: tại nhà trước khi đi, và tại hồ khi thực hiện.

---

## Owner module

`vows-merit` — LifeReleaseEventService / ProxyFinancialTransferGuard
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — người thực hiện phóng sinh thay người nhà, bỏ tiền túi riêng
- `system` — hiển thị 2-step protocol, bật "chế độ im lặng" khi đến hồ

---

## Trigger

Khi user tạo `LifeReleaseEvent` với:
- `isProxy = true` (phóng sinh cho người khác)
- `fundingSource = OWN_MONEY` (dùng tiền của mình)

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| `isProxy = false` | ✅ ALLOWED — quy trình thường, không cần transfer protocol |
| `isProxy = true` VÀ `fundingSource = RECIPIENT_MONEY` | ✅ ALLOWED — không cần transfer |
| `isProxy = true` VÀ `fundingSource = OWN_MONEY` | ❌ BLOCK until 2-step protocol completed |
| Step 1 (tại nhà) chưa confirm | ❌ Không cho sang Step 2 |
| Step 2 (tại hồ) chưa confirm | ❌ Không cho log "Đã Phóng Sinh Xong" |

---

## Input Contract

```typescript
interface CreateLifeReleaseEventDto {
  recipientName:       string
  isProxy:             boolean
  fundingSource:       'OWN_MONEY' | 'RECIPIENT_MONEY' | 'DONATED'
  homePledgeCompleted: boolean   // Step 1 gate
  lakeSilenceModeAck:  boolean   // Step 2 gate
  // ... other fields
}

enum FundingSource {
  OWN_MONEY       // người niệm bỏ tiền túi
  RECIPIENT_MONEY // tiền của người thụ hưởng
  DONATED         // tiền cúng dường từ cộng đồng
}
```

---

## Write Path

```
POST /api/vows-merit/life-release/create

1. If isProxy == false OR fundingSource != OWN_MONEY:
   → Continue normal flow

2. If isProxy == true AND fundingSource == OWN_MONEY:
   a. Validate homePledgeCompleted == true
      → If false: throw 400 { error: 'home_pledge_required' }
   b. Validate lakeSilenceModeAck == true
      → If false: throw 400 { error: 'lake_silence_mode_required' }
   c. Insert LifeReleaseEvent with proxyTransferProtocolCompleted = true
```

---

## FE Behavior

### Step 1 — Tại Nhà (trước khi đi)

```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 Bước 1/2 — Khấn Chuyển Giao Tịnh Tài (Tại Nhà)          │
│─────────────────────────────────────────────────────────────│
│ Bạn đang dùng tiền của mình để phóng sinh cho:              │
│                 [TÊN NGƯỜI NHẬN]                             │
│                                                             │
│ Trước khi ra khỏi nhà, hãy khấn:                            │
│ "Kính bạch Bồ Tát, con xin phép chuyển số tiền             │
│  này thành tiền của [TÊN NGƯỜI NHẬN] để công               │
│  đức thuộc về họ trọn vẹn."                                 │
│                                                             │
│ [ ] Tôi đã đọc lời khấn chuyển giao tịnh tài               │
│                                                             │
│                              [Xác Nhận — Tiếp Tục]         │
└─────────────────────────────────────────────────────────────┘
```

### Step 2 — Tại Hồ (chế độ im lặng)

```
┌─────────────────────────────────────────────────────────────┐
│ 🔕 Bước 2/2 — Chế Độ Im Lặng Tại Hồ                        │
│─────────────────────────────────────────────────────────────│
│                                                             │
│          ╔══════════════════════════════╗                   │
│          ║   PHÓNG SINH CHO:            ║                   │
│          ║   [TÊN NGƯỜI NHẬN] — TO ĐẬM  ║                   │
│          ╚══════════════════════════════╝                   │
│                                                             │
│  🚫 CẤM KỴ TUYỆT ĐỐI:                                      │
│  Không được nhắc đến tên của bạn tại đây.                   │
│  Chỉ đọc tên [TÊN NGƯỜI NHẬN] để công đức về họ.           │
│                                                             │
│  Tên người thực hiện: ████████ (ẩn)                         │
│                                                             │
│ [ ] Tôi xác nhận chỉ đọc tên người nhận tại hồ             │
│                                                             │
│                          [Hoàn Thành Phóng Sinh]           │
└─────────────────────────────────────────────────────────────┘
```

- Trong Step 2: tên user bị ẩn hoàn toàn (masked), hiển thị nổi bật tên người thụ hưởng
- Nút [Hoàn Thành Phóng Sinh] chỉ active sau khi cả 2 checkbox được tick

---

## Schema Notes

```prisma
model LifeReleaseEvent {
  // ... existing fields ...
  fundingSource                 FundingSource   @default(OWN_MONEY)
  homePledgeCompleted           Boolean         @default(false)
  lakeSilenceModeAck            Boolean         @default(false)
  proxyTransferProtocolCompleted Boolean        @default(false)
  // Migration: ALTER TABLE "LifeReleaseEvent" ADD COLUMN "fundingSource" TEXT DEFAULT 'OWN_MONEY'
  //            ADD COLUMN "homePledgeCompleted" BOOLEAN DEFAULT FALSE
  //            ADD COLUMN "lakeSilenceModeAck" BOOLEAN DEFAULT FALSE
  //            ADD COLUMN "proxyTransferProtocolCompleted" BOOLEAN DEFAULT FALSE
}

enum FundingSource {
  OWN_MONEY
  RECIPIENT_MONEY
  DONATED
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `life_release.proxy.home_pledge_completed` | Step 1 confirmed |
| `life_release.proxy.lake_silence_ack` | Step 2 confirmed |
| `life_release.proxy.transfer_protocol_completed` | Cả 2 step hoàn thành |
| `life_release.proxy.home_pledge_blocked` | Cố submit mà chưa complete Step 1 |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| isProxy OWN_MONEY mà thiếu Step 1 | `home_pledge_required` | 400 |
| isProxy OWN_MONEY mà thiếu Step 2 | `lake_silence_mode_required` | 400 |

---

## Notes for AI/codegen

- Tên user phải được ẩn hoàn toàn trong Step 2 UI — không chỉ là nhỏ hơn
- `recipientName` phải được display TO ĐẬM (font-size lớn, contrast cao) trong chế độ hồ
- Rule chỉ kích hoạt khi `isProxy = true AND fundingSource = OWN_MONEY` — các trường hợp khác flow bình thường
- GPS integration (Phase 2+): Step 2 có thể yêu cầu user đang ở gần nguồn nước để activate

---

## Related

- [log-life-release.md](./log-life-release.md) — lifecycle phóng sinh cơ bản
- [validate-proxy-ecological-life-release.md](./validate-proxy-ecological-life-release.md) — các ràng buộc proxy khác
- [proxy-name-card-generator.md](./proxy-name-card-generator.md) — thẻ tên người thụ hưởng
