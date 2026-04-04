# Khóa Kích Hoạt Nghiệp Chướng Khẩn Cấp Bằng Lễ Phật — Heavy Karma Activation NNN Commitment Gate

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh — Cảnh Báo Mở Kích Nghiệp Chướng
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## Purpose

*Lễ Phật Đại Sám Hối Văn* là kinh văn với sức mạnh lớn nhất để xin lỗi và sám hối. Tuy nhiên, nó cũng có khả năng kích hoạt/mở các khoá tất cả **khối lượng lớn các nghiệp chướng** bị chứa kỳ cụm lại. Nếu user niệm quá nhiều (ví dụ 5 biến/ngày) mà không có khả năng "chi trả" bằng cách đốt NNN (tối thiểu 5 tấm/tuần), cái ván nợ đó sẽ "rơi xuống" ngay lập tức, gây bệnh nặng hoặc kiếp nạn.

File này bao gồm 3 cơ chế liên kết:
1. **Commitment Gate**: Chặn set quota > 3 nếu không cam kết đốt NNN
2. **Cascade Alert** (Phase 22 Logic 9): Cảnh báo khẩn cấp khi ratio Lễ Phật/NNN lệch
3. **Auto-Downgrade Lock** (Phase 23 Logic 3): Tự động hạ cấp phác đồ + khoá nếu balance không duy trì

---

## Owner module

`wisdom-qa` — DailyRecitationService / HeavyKarmaGatekeeper / KarmaActivationMonitor
[xem CONTRACTS.md](../CONTRACTS.md)

---

## Actors

- `member` — Người dùng muốn niệm Lễ Phật > 3 biến/ngày
- `system` — Check commitment, monitor weekly quota, auto-downgrade if fail

---

## Triggers

1. User cố thay đổi Daily Recitation: set *Lễ Phật Đại Sám Hối Văn* > 3 biến/ngày
2. Weekly cron `0 59 23 * * 0` (Chủ nhật 23:59) — scan weekly balance

---

## Business Rules — Commitment Gate

| Điều kiện | Hành động |
|---|---|
| User set Lễ Phật ≤ 3 biến/ngày | ✅ ALLOWED |
| User set Lễ Phật > 3 biến/ngày | ⚠️ Trigger commitment gate |
| Gate: Show red warning + demand explicit commitment | ✅ Require user type "TÔI CAM KẾT" |
| User refuse commitment | ✅ Decline request, revert to previous |
| User accept commitment | ✅ Save new quota + create MonthlyQuotaTracker |
| Monthly NNN target = 5 × weekly_heavy_recitations | ✅ Calculate |
| End of week: NNN burned < target | ⚠️ Auto-downgrade Lễ Phật back to 3/ngày |

## Business Rules — Cascade Alert (Phase 22 Logic 9)

| Điều kiện | Hành động |
|---|---|
| Weekly cron Sun 23:59 | ✅ Scan weekly stats |
| LH_burned < (TotalRepentance / 7) | 🚨 Activate emergency |
| LH_burned < 50% of required | 🔴 CRITICAL: auto-downgrade + notify |
| LH_burned 50-99% of required | 🟡 WARNING: notify only |
| LH_burned ≥ required | ✅ OK, no action |

## Business Rules — Auto-Downgrade Lock (Phase 23 Logic 3)

| Điều kiện | Hành động |
|---|---|
| user.dailyLePhat ≥ 5 AND weeklyLHBurned < 5 | 🚨 Activate downgrade |
| Auto-adjust daily task: lePhat = 1, locked = true | ✅ Apply |
| lockedUntil = now + 7 days | ✅ Set lock expiry |
| User cannot escalate Lễ Phật while locked | ❌ Block escalation API |
| User burns 7+ LH sheets next week | ✅ Unlock escalation |

---

## Input Contract

```typescript
// Commitment gate trigger
interface UpdateLePhatQuotaDto {
  dailyLePhatCount: number  // must be > 3 to trigger gate
  commitment?: string       // must equal "TÔI CAM KẾT" to proceed
}

// Weekly balance tracking
interface WeeklyKarmaBalance {
  userId: string
  weekEnding: Date
  totalRepentanceMantras: number  // Lễ Phật biến this week
  littleHouseBurned: number       // NNN sheets burned this week
  requiredRatio: number           // 1:7
  isBalanced: boolean
  imbalanceAmount?: number        // sheets short
  severityLevel: 'CRITICAL' | 'WARNING' | 'OK'
}

function assessBalance(stats: WeeklyKarmaBalance): 'CRITICAL' | 'WARNING' | 'OK' {
  const required = stats.totalRepentanceMantras / 7
  if (stats.littleHouseBurned < required * 0.5) return 'CRITICAL'
  if (stats.littleHouseBurned < required)       return 'WARNING'
  return 'OK'
}
```

---

## Write Path

```
PATCH /api/wisdom-qa/recitation/quota
1. If newCount > 3:
   a. Return 400 { code: 'commitment_required' } if commitment field absent
   b. Return 400 { code: 'commitment_required' } if commitment !== "TÔI CAM KẾT"
2. If commitment = "TÔI CAM KẾT":
   → Upsert DailyTaskConfig { lePhat: newCount }
   → Create MonthlyQuotaTracker { weeklyNNNTarget: 5 }
   → Audit: karma.commitment_confirmed

CRON Sun 23:59 → /api/wisdom-qa/recitation/weekly-balance-check
1. SELECT users WHERE dailyLePhat > 3
2. Per user: compute WeeklyKarmaBalance (last 7 days)
3. assessBalance(stats):
   - 'OK':       no action
   - 'WARNING':  push notification (warning level)
   - 'CRITICAL': push notification (emergency) + auto-downgrade
     → UPDATE DailyTaskConfig SET lePhat=1, locked=true, lockedUntil=now+7d
     → Audit: karma.imbalance_critical_downgrade

DELETE /api/wisdom-qa/recitation/quota/unlock (user-initiated)
1. Check weeklyLHBurned ≥ required for current week
2. If yes: remove lock, restore previous quota
3. If no: return 403 { code: 'balance_not_restored' }
```

---

## FE Behavior — Commitment Gate

```
User attempts to set Lễ Phật = 5 biến/ngày:

🔴 CẢNH BÁO NGHIỆP CHƯỚNG BÙNG PHÁT

Niệm 5 biến Lễ Phật/ngày sẽ kích hoạt
toàn bộ nghiệp chướng chứa cụm.

Bạn PHẢI đốt tối thiểu 5 tấm NNN/tuần
để "trả nợ" cho năng lượng này.

Nếu không đốt đủ → bệnh nặng/kiếp nạn.

─────────────────────────────────────────
Để tiếp tục, gõ: "TÔI CAM KẾT"

[                              ]

[Hủy]  [Xác Nhận Cam Kết]
(button disabled until exact match)
```

---

## FE Behavior — Cascade Alert + Auto-Downgrade

```
🚨 CẢNH BÁO TỐI CAO 🚨

TÌNH TRẠNG: Nghiệp Chướng Bùng Phát

─────────────────────────────────────────

Tuần này (3/28 - 4/3):

Lễ Phật Đại Sám Hối: 35 biến (5 biến/ngày)
Ngôi Nhà Nhỏ Đốt:    0 tấm ❌

─────────────────────────────────────────

⚡ VẤN ĐỀ:

Bạn đang sám hối số lượng lớn nhưng
KHÔNG có Ngôi Nhà Nhỏ để trả nợ.
Nghiệp chướng đã bị đánh thức!

─────────────────────────────────────────

✅ TỰ ĐỘNG ĐIỀU CHỈNH ĐÃ THỰC HIỆN:

Lễ Phật: 5 → 1 biến/ngày (ĐÃ KHOÁ)
Khoá đến: [ngày + 7 ngày]

Lý do khoá: Chưa đốt đủ NNN tuần này.
Để mở khoá: đốt ≥ 5 tấm NNN tuần tới.

─────────────────────────────────────────

🆘 HÀNH ĐỘNG KHẨN CẤP:

□ Đốt bổ sung GẤP ≥ 5 tấm NNN tuần tới
□ hoặc giảm Lễ Phật xuống ≤ 3 biến/ngày

[Chỉnh Sửa Thời Khóa]  [Bắt Đầu Đốt NNN]
```

---

## Schema Notes

```prisma
model MonthlyQuotaTracker {
  id              String    @id @default(cuid())
  userId          String
  month           Int
  year            Int
  dailyLePhat     Int
  weeklyNNNTarget Int       // 5 * dailyLePhat per commitment
  actualBurned    Int       @default(0)
  status          String    @default("ACTIVE") // ACTIVE | DOWNGRADED | RESTORED
  lockedUntil     DateTime?

  @@unique([userId, month, year])
  // Migration: CREATE TABLE "MonthlyQuotaTracker" (...)
}
```

---

## Audit

| Action | Trigger |
|---|---|
| `karma.commitment_gate_shown` | User sets Lễ Phật > 3 |
| `karma.commitment_confirmed` | User types "TÔI CAM KẾT" |
| `karma.quota_rejected` | User declines gate |
| `karma.weekly_scan_executed` | Sun 23:59 cron |
| `karma.balance_calculated` | Stats aggregated |
| `karma.imbalance_warning` | 50-99% LH vs required |
| `karma.imbalance_critical_downgrade` | <50% LH → auto-downgrade |
| `karma.emergency_alert_sent` | Notification dispatched |
| `karma.auto_downgrade_applied` | Config locked at 1/day |
| `karma.balance_restored` | LH quota met, lock removed |

---

## Errors

| Condition | Code | HTTP |
|---|---|---|
| quota > 3 without "TÔI CAM KẾT" | `commitment_required` | 400 |
| Escalation while plan locked | `plan_locked_karma_imbalance` | 403 |
| Unlock attempt when balance not met | `balance_not_restored` | 403 |

---

## Related

- [broken-vow-penalty-engine.md](../../vows-merit/USE_CASES/broken-vow-penalty-engine.md) — vow breach
- [non-fungible-repentance-rule.md](./non-fungible-repentance-rule.md) — Thất Phật substitution guard
- [recitation-economy-segregation.md](./recitation-economy-segregation.md) — daily vs NNN counter segregation
