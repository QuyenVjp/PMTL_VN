# Theo Dõi Đại Nguyện Hoằng Pháp — Propagation Vow Goal Tracker

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh (Nguồn Phase 30)
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

Phát đại nguyện "sẽ giới thiệu Phật Pháp cho X người trong Y thời gian" là một trong những lời nguyện mạnh nhất để xin Bồ Tát gia hộ chữa bệnh hiểm nghèo hoặc giải đại nạn. Hệ thống phải track tiến độ thực tế (qua referral link), tự động cập nhật số người đã độ, và cảnh báo khi sắp đến hạn mà chưa đạt mục tiêu — vì thất nguyện với Bồ Tát là nghiệp nặng.

---

## Owner module

`vows-merit` — VowService / PropagationGoalTracker
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — phát nguyện hoằng pháp, chia sẻ referral link
- `new_member` — người được giới thiệu, đăng ký/tải tài liệu qua link
- `system` — tự động cập nhật `currentCount`, gửi notification khi sắp deadline

---

## Trigger

Khi user tạo Vow với `vowType = PROPAGATION_VOW`.

---

## Business Rules

| Điều kiện | Hành động |
|---|---|
| Vow được tạo với `vowType = PROPAGATION_VOW` | ✅ Sinh referral link + PropagationVowRecord |
| Người mới đăng ký qua referral link | ✅ `currentCount += 1` tự động |
| Người mới tải tài liệu qua referral link (guest) | ✅ `currentCount += 1` (không cần đăng ký) |
| `deadline - today <= 7 ngày` VÀ `currentCount < targetCount` | ⚠️ Notification khẩn cấp |
| `deadline` đã qua VÀ `currentCount < targetCount` | ❌ Vow → `FAILED` status + penalty notification |
| `currentCount >= targetCount` | ✅ Vow → `FULFILLED` + celebration notification |

---

## Input Contract

```typescript
interface CreatePropagationVowDto {
  vowType:           'PROPAGATION_VOW'
  targetPeopleCount: number   // số người cam kết độ
  deadline:          string   // ISO date
  motivation?:       string   // lý do phát nguyện (bệnh, đại nạn, etc.)
}

interface PropagationVowRecord {
  id:                string
  userId:            string
  targetPeopleCount: number
  currentCount:      number   // auto-incremented
  deadline:          Date
  referralToken:     string   // unique token cho referral link
  status:            'ACTIVE' | 'FULFILLED' | 'FAILED'
}
```

---

## Write Path

```
POST /api/vows-merit/vows/create

1. Validate vowType == 'PROPAGATION_VOW'
2. Validate targetPeopleCount > 0
3. Validate deadline is in the future
4. Generate referralToken = nanoid(12)
5. Insert PropagationVowRecord with currentCount = 0
6. Return { vowId, referralLink: `/join?ref=${referralToken}` }

--- Khi có người mới theo referral link ---
POST /api/identity/register OR GET /api/content/download (with ?ref=token)

1. Lookup PropagationVowRecord by referralToken
2. If found AND status == 'ACTIVE':
   → INCREMENT currentCount
   → If currentCount >= targetCount: update status = 'FULFILLED'
   → Log PropagationEvent { vowId, newUserId, eventType }

--- Cron job (chạy hàng ngày) ---
1. Find all ACTIVE PropagationVow where deadline - today <= 7 days
2. For each: check if currentCount < targetCount
3. Send push notification warning
4. Find all ACTIVE PropagationVow where deadline < today
5. Update status = 'FAILED', send failure notification
```

---

## FE Behavior

### Dashboard Vow Hoằng Pháp:

```
┌──────────────────────────────────────────────────────────┐
│ 📢 Đại Nguyện Hoằng Pháp                          [Chi tiết]│
│──────────────────────────────────────────────────────────│
│ Mục tiêu: 10 người   Đã độ: 3 người   Còn: 7           │
│ ████░░░░░░░░░░░░░░░░░  30%                              │
│ Hạn: 30/06/2026                                          │
│                                                          │
│ Referral Link của bạn:                                   │
│ [https://pmtl.vn/join?ref=abc123xyz]  [📋 Sao chép]      │
│                                                          │
│     [📤 Chia Sẻ Link Hoằng Pháp]                         │
└──────────────────────────────────────────────────────────┘
```

### Notification 7 ngày trước deadline:

```
⚠️ NHẮC NHỞ ĐẠI NGUYỆN

Bạn đã thề với Bồ Tát sẽ độ 10 người
nhưng hiện tại mới đạt 3/10.

Còn 7 ngày. Hãy lập tức chia sẻ link
hoằng pháp để hoàn thành lời nguyện!

[Mở App Ngay]
```

---

## Schema Notes

```prisma
model PropagationVowRecord {
  id                String   @id @default(cuid())
  userId            String
  targetPeopleCount Int
  currentCount      Int      @default(0)
  deadline          DateTime
  referralToken     String   @unique
  status            PropagationVowStatus @default(ACTIVE)
  motivation        String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  propagationEvents PropagationEvent[]
}

model PropagationEvent {
  id               String   @id @default(cuid())
  vowId            String
  newUserId        String?  // null nếu guest download
  eventType        String   // 'REGISTRATION' | 'DOWNLOAD'
  createdAt        DateTime @default(now())
}

enum PropagationVowStatus {
  ACTIVE
  FULFILLED
  FAILED
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `vow.propagation.created` | Tạo Đại Nguyện Hoằng Pháp |
| `vow.propagation.count_incremented` | Có người theo referral link |
| `vow.propagation.fulfilled` | Đạt mục tiêu |
| `vow.propagation.failed` | Hết deadline chưa đạt |
| `vow.propagation.deadline_warning_sent` | Cron job gửi cảnh báo 7 ngày |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| `targetPeopleCount <= 0` | `propagation_target_invalid` | 400 |
| `deadline` trong quá khứ | `propagation_deadline_past` | 400 |

---

## Notes for AI/codegen

- `referralToken` phải unique và không thể đoán — dùng `nanoid(12)` minimum
- Guest download (không đăng ký) vẫn tính — chỉ cần track qua IP+token combination (đơn giản) hoặc session
- Referral link phải hoạt động trên cả web và app (universal link)
- `motivation` field quan trọng cho context: "bệnh ung thư", "đại nạn 369" → ảnh hưởng mức độ urgency notification
- Phase 2+: có thể tích hợp với social share APIs (Zalo, Facebook)

---

## Related

- [create-vow.md](./create-vow.md) — luồng tạo vow cơ bản
- [broken-vow-penalty-engine.md](./broken-vow-penalty-engine.md) — xử lý thất nguyện
- [merit-foundation-dependency-guard.md](./merit-foundation-dependency-guard.md) — merit từ việc độ người
